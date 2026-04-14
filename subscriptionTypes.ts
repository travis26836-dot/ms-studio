// ═══════════════════════════════════════════════════════════════
// SUBSCRIPTION TYPES, PRICING TIERS & FEATURE GATING CONFIG
// ManuScript Studio — Stripe-Powered SaaS Billing
// ═══════════════════════════════════════════════════════════════

export type PlanTier = "free" | "pro" | "business";
export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing"
  | "incomplete"
  | "incomplete_expired"
  | "paused"
  | "unpaid";

// ─── Plan Feature Limits ─────────────────────────────────────
export interface PlanLimits {
  maxProjects: number;
  maxUploads: number;
  maxStorageMB: number;
  maxBrandKits: number;
  maxExportsPerMonth: number;
  maxAiGenerationsPerMonth: number;
  maxAiChatMessagesPerMonth: number;
  maxSocialConnections: number;
  maxPublishesPerMonth: number;
  maxFolders: number;
  canvasMaxWidth: number;
  canvasMaxHeight: number;
}

export interface PlanFeatures {
  aiAssistant: boolean;
  aiImageGeneration: boolean;
  aiLayoutSuggestions: boolean;
  aiCopyGeneration: boolean;
  aiDesignCritique: boolean;
  aiBrandVoice: boolean;
  socialMediaPublishing: boolean;
  socialMediaScheduling: boolean;
  advancedBrandKit: boolean;
  brandKitGradients: boolean;
  brandKitVoice: boolean;
  brandKitPatterns: boolean;
  premiumTemplates: boolean;
  premiumElements: boolean;
  customFonts: boolean;
  magicResize: boolean;
  backgroundRemoval: boolean;
  exportPDF: boolean;
  exportSVG: boolean;
  exportWebP: boolean;
  highResExport: boolean;
  watermarkFree: boolean;
  prioritySupport: boolean;
  teamCollaboration: boolean;
  customDomain: boolean;
  apiAccess: boolean;
  analytics: boolean;
  whiteLabel: boolean;
}

export interface PricingPlan {
  id: PlanTier;
  name: string;
  tagline: string;
  monthlyPrice: number;       // in cents
  yearlyPrice: number;        // in cents (per year)
  monthlyPriceId: string;     // Stripe price ID
  yearlyPriceId: string;      // Stripe price ID
  productId: string;          // Stripe product ID
  limits: PlanLimits;
  features: PlanFeatures;
  highlights: string[];       // Marketing bullet points
  badge?: string;             // e.g., "Most Popular"
  color: string;              // Brand color for the plan card
}

// ─── Feature Gate Check Result ───────────────────────────────
export interface FeatureGateResult {
  allowed: boolean;
  reason?: string;
  currentPlan: PlanTier;
  requiredPlan: PlanTier;
  currentUsage?: number;
  limit?: number;
}

// ─── Stripe Types ────────────────────────────────────────────
export interface StripeCheckoutInput {
  priceId: string;
  plan: PlanTier;
  billingCycle: "monthly" | "yearly";
  successUrl?: string;
  cancelUrl?: string;
}

export interface StripeBillingPortalInput {
  returnUrl?: string;
}

export interface SubscriptionInfo {
  plan: PlanTier;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

// ═══════════════════════════════════════════════════════════════
// PLAN DEFINITIONS — The actual pricing tiers
// ═══════════════════════════════════════════════════════════════

const FREE_FEATURES: PlanFeatures = {
  aiAssistant: true,            // Basic AI chat (limited)
  aiImageGeneration: false,
  aiLayoutSuggestions: false,
  aiCopyGeneration: false,
  aiDesignCritique: false,
  aiBrandVoice: false,
  socialMediaPublishing: false,
  socialMediaScheduling: false,
  advancedBrandKit: false,
  brandKitGradients: false,
  brandKitVoice: false,
  brandKitPatterns: false,
  premiumTemplates: false,
  premiumElements: false,
  customFonts: false,
  magicResize: false,
  backgroundRemoval: false,
  exportPDF: false,
  exportSVG: false,
  exportWebP: false,
  highResExport: false,
  watermarkFree: false,
  prioritySupport: false,
  teamCollaboration: false,
  customDomain: false,
  apiAccess: false,
  analytics: false,
  whiteLabel: false,
};

const PRO_FEATURES: PlanFeatures = {
  aiAssistant: true,
  aiImageGeneration: true,
  aiLayoutSuggestions: true,
  aiCopyGeneration: true,
  aiDesignCritique: true,
  aiBrandVoice: false,
  socialMediaPublishing: true,
  socialMediaScheduling: false,
  advancedBrandKit: true,
  brandKitGradients: true,
  brandKitVoice: false,
  brandKitPatterns: true,
  premiumTemplates: true,
  premiumElements: true,
  customFonts: true,
  magicResize: true,
  backgroundRemoval: true,
  exportPDF: true,
  exportSVG: true,
  exportWebP: true,
  highResExport: true,
  watermarkFree: true,
  prioritySupport: false,
  teamCollaboration: false,
  customDomain: false,
  apiAccess: false,
  analytics: true,
  whiteLabel: false,
};

const BUSINESS_FEATURES: PlanFeatures = {
  aiAssistant: true,
  aiImageGeneration: true,
  aiLayoutSuggestions: true,
  aiCopyGeneration: true,
  aiDesignCritique: true,
  aiBrandVoice: true,
  socialMediaPublishing: true,
  socialMediaScheduling: true,
  advancedBrandKit: true,
  brandKitGradients: true,
  brandKitVoice: true,
  brandKitPatterns: true,
  premiumTemplates: true,
  premiumElements: true,
  customFonts: true,
  magicResize: true,
  backgroundRemoval: true,
  exportPDF: true,
  exportSVG: true,
  exportWebP: true,
  highResExport: true,
  watermarkFree: true,
  prioritySupport: true,
  teamCollaboration: true,
  customDomain: true,
  apiAccess: true,
  analytics: true,
  whiteLabel: true,
};

export const PRICING_PLANS: Record<PlanTier, PricingPlan> = {
  free: {
    id: "free",
    name: "Free",
    tagline: "Get started with the basics",
    monthlyPrice: 0,
    yearlyPrice: 0,
    monthlyPriceId: "",
    yearlyPriceId: "",
    productId: "",
    limits: {
      maxProjects: 5,
      maxUploads: 20,
      maxStorageMB: 100,
      maxBrandKits: 1,
      maxExportsPerMonth: 10,
      maxAiGenerationsPerMonth: 5,
      maxAiChatMessagesPerMonth: 25,
      maxSocialConnections: 0,
      maxPublishesPerMonth: 0,
      maxFolders: 2,
      canvasMaxWidth: 2000,
      canvasMaxHeight: 2000,
    },
    features: FREE_FEATURES,
    highlights: [
      "5 design projects",
      "Basic design tools",
      "20 uploads (100 MB storage)",
      "10 exports per month",
      "5 AI generations per month",
      "Basic AI chat assistant",
      "Standard templates",
      "PNG & JPG export",
    ],
    color: "#6b7280",
  },
  pro: {
    id: "pro",
    name: "Pro",
    tagline: "Everything you need to create like a pro",
    monthlyPrice: 1299,   // $12.99/mo
    yearlyPrice: 9999,    // $99.99/yr ($8.33/mo)
    monthlyPriceId: "price_pro_monthly",     // Replace with real Stripe price IDs
    yearlyPriceId: "price_pro_yearly",
    productId: "prod_pro",
    limits: {
      maxProjects: 100,
      maxUploads: 500,
      maxStorageMB: 5000,
      maxBrandKits: 10,
      maxExportsPerMonth: 500,
      maxAiGenerationsPerMonth: 100,
      maxAiChatMessagesPerMonth: 500,
      maxSocialConnections: 5,
      maxPublishesPerMonth: 50,
      maxFolders: 50,
      canvasMaxWidth: 5000,
      canvasMaxHeight: 5000,
    },
    features: PRO_FEATURES,
    highlights: [
      "100 design projects",
      "All design tools unlocked",
      "500 uploads (5 GB storage)",
      "500 exports per month",
      "100 AI generations per month",
      "Full AI assistant (unlimited chat)",
      "Premium templates & elements",
      "Social media publishing (5 accounts)",
      "Advanced brand kit with gradients",
      "Magic resize & background removal",
      "PDF, SVG, WebP export",
      "High-resolution export",
      "No watermarks",
    ],
    badge: "Most Popular",
    color: "#6366f1",
  },
  business: {
    id: "business",
    name: "Business",
    tagline: "Scale your brand with the full creative suite",
    monthlyPrice: 2999,   // $29.99/mo
    yearlyPrice: 24999,   // $249.99/yr ($20.83/mo)
    monthlyPriceId: "price_business_monthly",
    yearlyPriceId: "price_business_yearly",
    productId: "prod_business",
    limits: {
      maxProjects: -1,     // unlimited
      maxUploads: -1,
      maxStorageMB: 50000,
      maxBrandKits: -1,
      maxExportsPerMonth: -1,
      maxAiGenerationsPerMonth: -1,
      maxAiChatMessagesPerMonth: -1,
      maxSocialConnections: -1,
      maxPublishesPerMonth: -1,
      maxFolders: -1,
      canvasMaxWidth: 10000,
      canvasMaxHeight: 10000,
    },
    features: BUSINESS_FEATURES,
    highlights: [
      "Unlimited projects",
      "Unlimited uploads (50 GB storage)",
      "Unlimited exports",
      "Unlimited AI generations",
      "Full AI suite with brand voice",
      "Unlimited social media accounts",
      "Social media scheduling",
      "Unlimited brand kits",
      "Team collaboration",
      "Custom domain",
      "API access",
      "White-label exports",
      "Priority support",
      "Advanced analytics",
    ],
    badge: "Best Value",
    color: "#f59e0b",
  },
};

// ─── Helper: Get plan limits for a user ──────────────────────
export function getPlanLimits(plan: PlanTier): PlanLimits {
  return PRICING_PLANS[plan]?.limits || PRICING_PLANS.free.limits;
}

export function getPlanFeatures(plan: PlanTier): PlanFeatures {
  return PRICING_PLANS[plan]?.features || PRICING_PLANS.free.features;
}

// ─── Helper: Check if a feature is available ─────────────────
export function isFeatureAvailable(plan: PlanTier, feature: keyof PlanFeatures): boolean {
  const features = getPlanFeatures(plan);
  return features[feature] === true;
}

// ─── Helper: Check if a limit is exceeded ────────────────────
export function isWithinLimit(plan: PlanTier, limitKey: keyof PlanLimits, currentUsage: number): boolean {
  const limits = getPlanLimits(plan);
  const limit = limits[limitKey];
  if (limit === -1) return true; // unlimited
  return currentUsage < limit;
}

// ─── Helper: Get the minimum plan required for a feature ─────
export function getRequiredPlan(feature: keyof PlanFeatures): PlanTier {
  if (PRICING_PLANS.free.features[feature]) return "free";
  if (PRICING_PLANS.pro.features[feature]) return "pro";
  return "business";
}

// ─── Feature gate check ──────────────────────────────────────
export function checkFeatureGate(
  plan: PlanTier,
  feature: keyof PlanFeatures,
): FeatureGateResult {
  const allowed = isFeatureAvailable(plan, feature);
  const requiredPlan = getRequiredPlan(feature);
  return {
    allowed,
    reason: allowed ? undefined : `This feature requires the ${PRICING_PLANS[requiredPlan].name} plan or higher.`,
    currentPlan: plan,
    requiredPlan,
  };
}

export function checkLimitGate(
  plan: PlanTier,
  limitKey: keyof PlanLimits,
  currentUsage: number,
): FeatureGateResult {
  const limits = getPlanLimits(plan);
  const limit = limits[limitKey];
  const allowed = limit === -1 || currentUsage < limit;
  const requiredPlan: PlanTier = limit === -1 ? plan :
    (PRICING_PLANS.pro.limits[limitKey] === -1 || currentUsage < PRICING_PLANS.pro.limits[limitKey]) ? "pro" : "business";
  return {
    allowed,
    reason: allowed ? undefined : `You've reached the ${PRICING_PLANS[plan].name} plan limit of ${limit}. Upgrade to continue.`,
    currentPlan: plan,
    requiredPlan,
    currentUsage,
    limit: limit === -1 ? undefined : limit,
  };
}
