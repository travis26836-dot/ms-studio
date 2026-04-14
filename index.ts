import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // ─── Stripe Webhook (must be before body parser for raw body) ───
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn("[Stripe] STRIPE_WEBHOOK_SECRET not set");
      return res.status(400).json({ error: "Webhook secret not configured" });
    }
    try {
      const { constructWebhookEvent, getPlanFromPriceId } = await import("../stripe");
      const event = constructWebhookEvent(req.body, sig, webhookSecret);
      const dbModule = await import("../db");

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as any;
          const userId = parseInt(session.metadata?.userId || "0");
          const plan = session.metadata?.plan || "pro";
          const customerId = session.customer as string;
          if (userId) {
            await dbModule.updateUserPlan(userId, plan, customerId);
            const subId = session.subscription as string;
            if (subId) {
              await dbModule.upsertSubscriptionByStripeCustomer(customerId, {
                userId,
                stripeSubscriptionId: subId,
                plan: plan as any,
                status: "active",
              });
            }
            await dbModule.logActivity({
              userId,
              type: "profile_updated",
              description: `Subscribed to ${plan} plan`,
            });
          }
          break;
        }
        case "customer.subscription.updated": {
          const sub = event.data.object as any;
          const customerId = sub.customer as string;
          const priceId = sub.items?.data?.[0]?.price?.id || "";
          const plan = getPlanFromPriceId(priceId);
          const user = await dbModule.getUserByStripeCustomerId(customerId);
          if (user) {
            await dbModule.updateUserPlan(user.id, plan);
          }
          await dbModule.upsertSubscriptionByStripeCustomer(customerId, {
            userId: user?.id || 0,
            stripeSubscriptionId: sub.id,
            stripePriceId: priceId,
            plan: plan as any,
            status: sub.status as any,
            currentPeriodStart: sub.current_period_start ? new Date(sub.current_period_start * 1000) : undefined,
            currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : undefined,
            cancelAtPeriodEnd: sub.cancel_at_period_end || false,
            canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : undefined,
          });
          break;
        }
        case "customer.subscription.deleted": {
          const sub = event.data.object as any;
          const customerId = sub.customer as string;
          const user = await dbModule.getUserByStripeCustomerId(customerId);
          if (user) {
            await dbModule.updateUserPlan(user.id, "free");
          }
          await dbModule.upsertSubscriptionByStripeCustomer(customerId, {
            userId: user?.id || 0,
            plan: "free" as any,
            status: "canceled" as any,
            canceledAt: new Date(),
          });
          break;
        }
        case "invoice.payment_succeeded": {
          const invoice = event.data.object as any;
          const customerId = invoice.customer as string;
          const user = await dbModule.getUserByStripeCustomerId(customerId);
          if (user) {
            await dbModule.createPayment({
              userId: user.id,
              stripeInvoiceId: invoice.id,
              stripePaymentIntentId: invoice.payment_intent as string || undefined,
              amount: invoice.amount_paid || 0,
              currency: invoice.currency || "usd",
              status: "succeeded" as any,
              description: `Invoice ${invoice.number || invoice.id}`,
              receiptUrl: invoice.hosted_invoice_url || undefined,
            });
          }
          break;
        }
        case "invoice.payment_failed": {
          const invoice = event.data.object as any;
          const customerId = invoice.customer as string;
          const user = await dbModule.getUserByStripeCustomerId(customerId);
          if (user) {
            await dbModule.createPayment({
              userId: user.id,
              stripeInvoiceId: invoice.id,
              amount: invoice.amount_due || 0,
              currency: invoice.currency || "usd",
              status: "failed" as any,
              description: `Failed payment for invoice ${invoice.number || invoice.id}`,
            });
          }
          break;
        }
        default:
          console.log(`[Stripe] Unhandled event type: ${event.type}`);
      }
      return res.json({ received: true });
    } catch (err: any) {
      console.error("[Stripe] Webhook error:", err.message);
      return res.status(400).json({ error: err.message });
    }
  });

  // File upload endpoint (accepts base64 body)
  app.post("/api/upload", async (req, res) => {
    try {
      const { data, filename, mimeType } = req.body;
      if (!data || !filename) {
        return res.status(400).json({ error: "Missing data or filename" });
      }
      const buffer = Buffer.from(data, "base64");
      const ext = filename.split(".").pop() || "png";
      const key = `uploads/${nanoid()}.${ext}`;
      const { url } = await storagePut(key, buffer, mimeType || `image/${ext}`);
      return res.json({ url, key, filename });
    } catch (error: any) {
      console.error("[Upload] Failed:", error);
      return res.status(500).json({ error: error.message || "Upload failed" });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
