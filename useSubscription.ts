import { useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import {
  PRICING_PLANS, getPlanLimits, getPlanFeatures,
  isFeatureAvailable, checkFeatureGate, checkLimitGate,
  type PlanTier, type PlanFeatures, type PlanLimits,
  type FeatureGateResult,
} from "@shared/subscriptionTypes";

// ═══════════════════════════════════════════════════════════════
// useSubscription — Central hook for subscription state & gating
// ═══════════════════════════════════════════════════════════════

export function useSubscription() {
  const { user, isAuthenticated } = useAuth();
  const plan: PlanTier = (user?.plan as PlanTier) || "free";

  const subscriptionQuery = trpc.billing.subscription.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 60_000, // Cache for 1 minute
    refetchOnWindowFocus: false,
  });

  const usageQuery = trpc.billing.usage.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const features = useMemo(() => getPlanFeatures(plan), [plan]);
  const limits = useMemo(() => getPlanLimits(plan), [plan]);
  const planInfo = useMemo(() => PRICING_PLANS[plan], [plan]);

  // Check if a feature is available
  function canUse(feature: keyof PlanFeatures): boolean {
    return isFeatureAvailable(plan, feature);
  }

  // Get full gate result for a feature
  function gateFeature(feature: keyof PlanFeatures): FeatureGateResult {
    return checkFeatureGate(plan, feature);
  }

  // Check if a usage limit allows more
  function canUseMore(limitKey: keyof PlanLimits, currentUsage: number): boolean {
    const limit = limits[limitKey];
    if (limit === -1) return true; // unlimited
    return currentUsage < limit;
  }

  // Get full gate result for a limit
  function gateLimit(limitKey: keyof PlanLimits, currentUsage: number): FeatureGateResult {
    return checkLimitGate(plan, limitKey, currentUsage);
  }

  // Quick checks for common features
  const isPro = plan === "pro" || plan === "business";
  const isBusiness = plan === "business";
  const isFree = plan === "free";

  return {
    // Plan info
    plan,
    planInfo,
    features,
    limits,
    isPro,
    isBusiness,
    isFree,

    // Subscription details
    subscription: subscriptionQuery.data,
    subscriptionLoading: subscriptionQuery.isLoading,

    // Usage
    usage: usageQuery.data?.usage,
    usageLoading: usageQuery.isLoading,

    // Gate functions
    canUse,
    gateFeature,
    canUseMore,
    gateLimit,

    // Refresh
    refetch: () => {
      subscriptionQuery.refetch();
      usageQuery.refetch();
    },
  };
}
