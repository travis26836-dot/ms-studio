import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard, Crown, Zap, ArrowRight, Loader2, ExternalLink,
  AlertTriangle, CheckCircle, Clock, XCircle, Receipt,
  TrendingUp, Calendar, Shield, RefreshCw,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { PRICING_PLANS, type PlanTier } from "@shared/subscriptionTypes";
import { UsageLimitIndicator } from "./UpgradePrompt";

interface BillingSettingsProps {
  user: any;
}

export default function BillingSettings({ user }: BillingSettingsProps) {
  const [, setLocation] = useLocation();
  const [canceling, setCanceling] = useState(false);
  const [resuming, setResuming] = useState(false);

  const currentPlan = (user?.plan as PlanTier) || "free";
  const planInfo = PRICING_PLANS[currentPlan];

  const subscriptionQuery = trpc.billing.subscription.useQuery();
  const usageQuery = trpc.billing.usage.useQuery();
  const paymentsQuery = trpc.billing.payments.useQuery();
  const createPortal = trpc.billing.createPortalSession.useMutation();
  const cancelSub = trpc.billing.cancelSubscription.useMutation();
  const resumeSub = trpc.billing.resumeSubscription.useMutation();

  const sub = subscriptionQuery.data;
  const usage = usageQuery.data;
  const payments = paymentsQuery.data || [];

  async function handleManageBilling() {
    try {
      const result = await createPortal.mutateAsync({});
      if (result.url) window.location.href = result.url;
    } catch (err: any) {
      toast.error(err.message || "Failed to open billing portal");
    }
  }

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel your subscription? You'll retain access until the end of your billing period.")) return;
    setCanceling(true);
    try {
      await cancelSub.mutateAsync({});
      toast.success("Subscription will be canceled at the end of your billing period");
      subscriptionQuery.refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel subscription");
    } finally {
      setCanceling(false);
    }
  }

  async function handleResume() {
    setResuming(true);
    try {
      await resumeSub.mutateAsync();
      toast.success("Subscription resumed successfully!");
      subscriptionQuery.refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to resume subscription");
    } finally {
      setResuming(false);
    }
  }

  const statusColors: Record<string, string> = {
    active: "text-green-500",
    trialing: "text-blue-500",
    past_due: "text-amber-500",
    canceled: "text-red-500",
    incomplete: "text-amber-500",
    paused: "text-muted-foreground",
  };

  const statusIcons: Record<string, any> = {
    active: CheckCircle,
    trialing: Clock,
    past_due: AlertTriangle,
    canceled: XCircle,
  };

  const StatusIcon = statusIcons[sub?.status || "active"] || CheckCircle;

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${planInfo.color}20` }}
              >
                <Crown className="w-5 h-5" style={{ color: planInfo.color }} />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground text-lg">{planInfo.name} Plan</h3>
                <p className="text-sm text-muted-foreground">{planInfo.tagline}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon className={`w-4 h-4 ${statusColors[sub?.status || "active"]}`} />
              <span className={`text-sm font-medium capitalize ${statusColors[sub?.status || "active"]}`}>
                {sub?.status || "active"}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sub?.cancelAtPeriodEnd && (
            <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-card-foreground">
                  Your subscription will be canceled on{" "}
                  <strong>{sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : "end of period"}</strong>.
                  You'll retain access until then.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={handleResume} disabled={resuming}>
                {resuming ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                Resume
              </Button>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Monthly Price</p>
              <p className="text-lg font-bold text-card-foreground">
                {planInfo.monthlyPrice === 0 ? "Free" : `$${(planInfo.monthlyPrice / 100).toFixed(2)}`}
              </p>
            </div>
            {sub?.currentPeriodEnd && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Next Billing</p>
                <p className="text-sm font-semibold text-card-foreground">
                  {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            )}
            {sub?.trialEnd && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Trial Ends</p>
                <p className="text-sm font-semibold text-card-foreground">
                  {new Date(sub.trialEnd).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {currentPlan === "free" ? (
              <Button onClick={() => setLocation("/pricing")}>
                <Zap className="w-4 h-4 mr-1" />
                Upgrade Plan
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setLocation("/pricing")}>
                  <ArrowRight className="w-4 h-4 mr-1" />
                  Change Plan
                </Button>
                <Button variant="outline" onClick={handleManageBilling}>
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Billing Portal
                </Button>
                {!sub?.cancelAtPeriodEnd && (
                  <Button variant="ghost" className="text-red-500 hover:text-red-600" onClick={handleCancel} disabled={canceling}>
                    {canceling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cancel Subscription"}
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage & Limits */}
      {usage && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-card-foreground">Usage This Month</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UsageLimitIndicator
                label="AI Generations"
                current={usage.usage.aiGenerations}
                limit={usage.limits.maxAiGenerationsPerMonth}
                color={planInfo.color}
              />
              <UsageLimitIndicator
                label="Social Publishes"
                current={usage.usage.publishes}
                limit={usage.limits.maxPublishesPerMonth}
                color={planInfo.color}
              />
              <UsageLimitIndicator
                label="Exports"
                current={usage.usage.exports}
                limit={usage.limits.maxExportsPerMonth}
                color={planInfo.color}
              />
              <UsageLimitIndicator
                label="Social Connections"
                current={usage.usage.socialConnections || 0}
                limit={usage.limits.maxSocialConnections}
                color={planInfo.color}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-card-foreground">Payment History</h3>
          </div>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No payment history yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {payments.map((payment: any) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      payment.status === "succeeded" ? "bg-green-500" :
                      payment.status === "failed" ? "bg-red-500" :
                      payment.status === "refunded" ? "bg-amber-500" :
                      "bg-muted-foreground"
                    }`} />
                    <div>
                      <p className="text-sm text-card-foreground">{payment.description || "Payment"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-card-foreground">
                      ${(payment.amount / 100).toFixed(2)} {payment.currency.toUpperCase()}
                    </span>
                    {payment.receiptUrl && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2"
                        onClick={() => window.open(payment.receiptUrl, "_blank")}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
