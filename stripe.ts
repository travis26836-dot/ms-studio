// ═══════════════════════════════════════════════════════════════
// STRIPE INTEGRATION — ManuScript Studio
// Handles Stripe customer creation, checkout sessions, billing
// portal, subscription management, and webhook processing.
// ═══════════════════════════════════════════════════════════════

import Stripe from "stripe";
import type { PlanTier } from "@shared/subscriptionTypes";

// Initialize Stripe with the secret key from environment
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.warn("[Stripe] STRIPE_SECRET_KEY not set — billing features will be unavailable");
}

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2024-12-18.acacia" as any })
  : null;

// ─── Customer Management ─────────────────────────────────────

export async function getOrCreateStripeCustomer(
  userId: number,
  email: string | null,
  name: string | null,
  existingCustomerId?: string | null,
): Promise<string> {
  if (!stripe) throw new Error("Stripe is not configured");

  // If we already have a customer ID, verify it exists
  if (existingCustomerId) {
    try {
      const customer = await stripe.customers.retrieve(existingCustomerId);
      if (!customer.deleted) return existingCustomerId;
    } catch {
      // Customer doesn't exist, create a new one
    }
  }

  // Create a new Stripe customer
  const customer = await stripe.customers.create({
    email: email || undefined,
    name: name || undefined,
    metadata: {
      userId: userId.toString(),
      platform: "manuscript-studio",
    },
  });

  return customer.id;
}

// ─── Checkout Session ────────────────────────────────────────

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  plan: PlanTier,
  successUrl: string,
  cancelUrl: string,
  userId: number,
): Promise<string> {
  if (!stripe) throw new Error("Stripe is not configured");

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      metadata: {
        userId: userId.toString(),
        plan,
      },
    },
    metadata: {
      userId: userId.toString(),
      plan,
    },
    allow_promotion_codes: true,
    billing_address_collection: "auto",
  });

  return session.url || "";
}

// ─── Billing Portal ──────────────────────────────────────────

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string,
): Promise<string> {
  if (!stripe) throw new Error("Stripe is not configured");

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session.url;
}

// ─── Subscription Management ─────────────────────────────────

export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
  if (!stripe) return null;
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch {
    return null;
  }
}

export async function cancelSubscription(
  subscriptionId: string,
  cancelImmediately: boolean = false,
): Promise<Stripe.Subscription> {
  if (!stripe) throw new Error("Stripe is not configured");

  if (cancelImmediately) {
    return await stripe.subscriptions.cancel(subscriptionId);
  } else {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }
}

export async function resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  if (!stripe) throw new Error("Stripe is not configured");

  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string,
): Promise<Stripe.Subscription> {
  if (!stripe) throw new Error("Stripe is not configured");

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const itemId = subscription.items.data[0]?.id;

  if (!itemId) throw new Error("No subscription item found");

  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: itemId,
        price: newPriceId,
      },
    ],
    proration_behavior: "create_prorations",
  });
}

// ─── Invoice & Payment History ───────────────────────────────

export async function getCustomerInvoices(
  customerId: string,
  limit: number = 10,
): Promise<Stripe.Invoice[]> {
  if (!stripe) return [];

  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit,
  });

  return invoices.data;
}

export async function getUpcomingInvoice(customerId: string): Promise<Stripe.Invoice | null> {
  if (!stripe) return null;
  try {
    return await stripe.invoices.retrieveUpcoming({ customer: customerId });
  } catch {
    return null;
  }
}

// ─── Webhook Signature Verification ──────────────────────────

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string,
): Stripe.Event {
  if (!stripe) throw new Error("Stripe is not configured");
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

// ─── Price ID Mapping Helper ─────────────────────────────────

export function getPlanFromPriceId(priceId: string): PlanTier {
  // This maps Stripe price IDs to plan tiers
  // In production, these would be real Stripe price IDs
  const priceMap: Record<string, PlanTier> = {
    "price_pro_monthly": "pro",
    "price_pro_yearly": "pro",
    "price_business_monthly": "business",
    "price_business_yearly": "business",
  };

  // Also check environment-configured price IDs
  if (process.env.STRIPE_PRO_MONTHLY_PRICE_ID === priceId) return "pro";
  if (process.env.STRIPE_PRO_YEARLY_PRICE_ID === priceId) return "pro";
  if (process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID === priceId) return "business";
  if (process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID === priceId) return "business";

  return priceMap[priceId] || "free";
}

export function isStripeConfigured(): boolean {
  return stripe !== null;
}
