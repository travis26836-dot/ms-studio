import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Check, X, Sparkles, Crown, Zap, ArrowLeft, Loader2,
  Shield, Star, Rocket, Building2, CreditCard, HelpCircle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { PRICING_PLANS, type PlanTier, type PlanFeatures } from "@shared/subscriptionTypes";

export default function PricingPage() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const currentPlan = (user?.plan as PlanTier) || "free";
  const subscriptionQuery = trpc.billing.subscription.useQuery(undefined, { enabled: isAuthenticated });
  const createCheckout = trpc.billing.createCheckout.useMutation();
  const createPortal = trpc.billing.createPortalSession.useMutation();

  const plans = Object.values(PRICING_PLANS);

  async function handleSubscribe(planId: PlanTier) {
    if (planId === "free") return;
    if (!isAuthenticated) {
      toast.error("Please sign in to subscribe");
      return;
    }
    setLoadingPlan(planId);
    try {
      const plan = PRICING_PLANS[planId];
      const priceId = billingCycle === "monthly" ? plan.monthlyPriceId : plan.yearlyPriceId;
      const result = await createCheckout.mutateAsync({
        priceId,
        plan: planId as "pro" | "business",
        billingCycle,
      });
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create checkout session");
    } finally {
      setLoadingPlan(null);
    }
  }

  async function handleManageBilling() {
    try {
      const result = await createPortal.mutateAsync({});
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to open billing portal");
    }
  }

  function formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }

  function getMonthlyEquivalent(yearlyPrice: number): string {
    return `$${(yearlyPrice / 100 / 12).toFixed(2)}`;
  }

  function getSavingsPercent(monthly: number, yearly: number): number {
    if (monthly === 0) return 0;
    const monthlyTotal = monthly * 12;
    return Math.round(((monthlyTotal - yearly) / monthlyTotal) * 100);
  }

  const planIcons: Record<string, any> = {
    free: Shield,
    pro: Rocket,
    business: Building2,
  };

  // Feature comparison table data
  const featureCategories = [
    {
      name: "Design Tools",
      features: [
        { label: "Basic design tools", key: null, free: true, pro: true, business: true },
        { label: "Magic resize", key: "magicResize" as keyof PlanFeatures, free: false, pro: true, business: true },
        { label: "Background removal", key: "backgroundRemoval" as keyof PlanFeatures, free: false, pro: true, business: true },
        { label: "Custom fonts", key: "customFonts" as keyof PlanFeatures, free: false, pro: true, business: true },
        { label: "Premium templates", key: "premiumTemplates" as keyof PlanFeatures, free: false, pro: true, business: true },
        { label: "Premium elements", key: "premiumElements" as keyof PlanFeatures, free: false, pro: true, business: true },
      ],
    },
    {
      name: "AI Features",
      features: [
        { label: "AI chat assistant", key: "aiAssistant" as keyof PlanFeatures, free: true, pro: true, business: true },
        { label: "AI image generation", key: "aiImageGeneration" as keyof PlanFeatures, free: false, pro: true, business: true },
        { label: "AI layout suggestions", key: "aiLayoutSuggestions" as keyof PlanFeatures, free: false, pro: true, business: true },
        { label: "AI copy generation", key: "aiCopyGeneration" as keyof PlanFeatures, free: false, pro: true, business: true },
        { label: "AI design critique", key: "aiDesignCritique" as keyof PlanFeatures, free: false, pro: true, business: true },
        { label: "AI brand voice", key: "aiBrandVoice" as keyof PlanFeatures, free: false, pro: false, business: true },
      ],
    },
    {
      name: "Brand Kit",
      features: [
        { label: "Basic brand kit (1)", key: null, free: true, pro: true, business: true },
        { label: "Advanced brand kit", key: "advancedBrandKit" as keyof PlanFeatures, free: false, pro: true, business: true },
        { label: "Gradients", key: "brandKitGradients" as keyof PlanFeatures, free: false, pro: true, business: true },
        { label: "Brand voice", key: "brandKitVoice" as keyof PlanFeatures, free: false, pro: false, business: true },
        { label: "Patterns", key: "brandKitPatterns" as keyof PlanFeatures, free: false, pro: true, business: true },
      ],
    },
    {
      name: "Social Media",
      features: [
        { label: "Social media publishing", key: "socialMediaPublishing" as keyof PlanFeatures, free: false, pro: true, business: true },
        { label: "Social media scheduling", key: "socialMediaScheduling" as keyof PlanFeatures, free: false, pro: false, business: true },
      ],
    },
    {
      name: "Export & Sharing",
      features: [
        { label: "PNG & JPG export", key: null, free: true, pro: true, business: true },
        { label: "PDF export", key: "exportPDF" as keyof PlanFeatures, free: false, pro: true, business: true },
        { label: "SVG export", key: "exportSVG" as keyof PlanFeatures, free: false, pro: true, business: true },
        { label: "WebP export", key: "exportWebP" as keyof PlanFeatures, free: false, pro: true, business: true },
        { label: "High-resolution export", key: "highResExport" as keyof PlanFeatures, free: false, pro: true, business: true },
        { label: "Watermark-free", key: "watermarkFree" as keyof PlanFeatures, free: false, pro: true, business: true },
        { label: "White-label exports", key: "whiteLabel" as keyof PlanFeatures, free: false, pro: false, business: true },
      ],
    },
    {
      name: "Business Features",
      features: [
        { label: "Team collaboration", key: "teamCollaboration" as keyof PlanFeatures, free: false, pro: false, business: true },
        { label: "Custom domain", key: "customDomain" as keyof PlanFeatures, free: false, pro: false, business: true },
        { label: "API access", key: "apiAccess" as keyof PlanFeatures, free: false, pro: false, business: true },
        { label: "Analytics", key: "analytics" as keyof PlanFeatures, free: false, pro: true, business: true },
        { label: "Priority support", key: "prioritySupport" as keyof PlanFeatures, free: false, pro: false, business: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold text-lg">ManuScript Studio</span>
            </div>
          </div>
          {isAuthenticated && currentPlan !== "free" && (
            <Button variant="outline" size="sm" onClick={handleManageBilling}>
              <CreditCard className="w-4 h-4 mr-1" />
              Manage Billing
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-57px)]">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-card-foreground mb-3">
              Choose Your Creative Plan
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Unlock the full power of ManuScript Studio. From basic design tools to a complete AI-powered creative suite.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className={`text-sm font-medium ${billingCycle === "monthly" ? "text-card-foreground" : "text-muted-foreground"}`}>
                Monthly
              </span>
              <Switch
                checked={billingCycle === "yearly"}
                onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
              />
              <span className={`text-sm font-medium ${billingCycle === "yearly" ? "text-card-foreground" : "text-muted-foreground"}`}>
                Yearly
              </span>
              {billingCycle === "yearly" && (
                <span className="text-xs font-semibold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                  Save up to {getSavingsPercent(PRICING_PLANS.business.monthlyPrice, PRICING_PLANS.business.yearlyPrice)}%
                </span>
              )}
            </div>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {plans.map((plan) => {
              const Icon = planIcons[plan.id] || Shield;
              const isCurrentPlan = currentPlan === plan.id;
              const isPopular = plan.badge === "Most Popular";
              const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
              const displayPrice = billingCycle === "yearly" && plan.yearlyPrice > 0
                ? getMonthlyEquivalent(plan.yearlyPrice)
                : formatPrice(plan.monthlyPrice);

              return (
                <Card
                  key={plan.id}
                  className={`relative overflow-hidden transition-all duration-200 ${
                    isPopular ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]" : "border-border"
                  } ${isCurrentPlan ? "ring-2 ring-primary/50" : ""}`}
                >
                  {plan.badge && (
                    <div
                      className="absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white rounded-bl-lg"
                      style={{ backgroundColor: plan.color }}
                    >
                      {plan.badge}
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${plan.color}20` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: plan.color }} />
                      </div>
                      <h3 className="text-xl font-bold text-card-foreground">{plan.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                  </CardHeader>
                  <CardContent>
                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-card-foreground">
                          {plan.monthlyPrice === 0 ? "$0" : displayPrice}
                        </span>
                        {plan.monthlyPrice > 0 && (
                          <span className="text-muted-foreground text-sm">/month</span>
                        )}
                      </div>
                      {billingCycle === "yearly" && plan.yearlyPrice > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatPrice(plan.yearlyPrice)} billed yearly
                        </p>
                      )}
                    </div>

                    {/* CTA Button */}
                    {isCurrentPlan ? (
                      <Button variant="outline" className="w-full mb-6" disabled>
                        <Check className="w-4 h-4 mr-1" />
                        Current Plan
                      </Button>
                    ) : plan.id === "free" ? (
                      <Button
                        variant="outline"
                        className="w-full mb-6"
                        onClick={() => setLocation("/")}
                      >
                        Get Started Free
                      </Button>
                    ) : (
                      <Button
                        className="w-full mb-6"
                        style={{ backgroundColor: plan.color }}
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={loadingPlan === plan.id}
                      >
                        {loadingPlan === plan.id ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4 mr-1" />
                        )}
                        {currentPlan === "free" ? "Upgrade" : "Switch"} to {plan.name}
                      </Button>
                    )}

                    {/* Highlights */}
                    <div className="space-y-2.5">
                      {plan.highlights.map((highlight, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: plan.color }} />
                          <span className="text-sm text-card-foreground">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Feature Comparison Table */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-card-foreground text-center mb-8">
              Detailed Feature Comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-card-foreground w-1/3">Feature</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">Free</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold" style={{ color: PRICING_PLANS.pro.color }}>Pro</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold" style={{ color: PRICING_PLANS.business.color }}>Business</th>
                  </tr>
                </thead>
                <tbody>
                  {featureCategories.map((category) => (
                    <>
                      <tr key={category.name} className="bg-muted/30">
                        <td colSpan={4} className="py-2 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          {category.name}
                        </td>
                      </tr>
                      {category.features.map((feature, i) => (
                        <tr key={`${category.name}-${i}`} className="border-b border-border/50">
                          <td className="py-2.5 px-4 text-sm text-card-foreground">{feature.label}</td>
                          <td className="py-2.5 px-4 text-center">
                            {feature.free ? (
                              <Check className="w-4 h-4 text-green-500 mx-auto" />
                            ) : (
                              <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            {feature.pro ? (
                              <Check className="w-4 h-4 mx-auto" style={{ color: PRICING_PLANS.pro.color }} />
                            ) : (
                              <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            {feature.business ? (
                              <Check className="w-4 h-4 mx-auto" style={{ color: PRICING_PLANS.business.color }} />
                            ) : (
                              <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </>
                  ))}
                  {/* Limits row */}
                  <tr className="bg-muted/30">
                    <td colSpan={4} className="py-2 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Usage Limits
                    </td>
                  </tr>
                  {[
                    { label: "Projects", free: "5", pro: "100", business: "Unlimited" },
                    { label: "Uploads", free: "20", pro: "500", business: "Unlimited" },
                    { label: "Storage", free: "100 MB", pro: "5 GB", business: "50 GB" },
                    { label: "Exports / month", free: "10", pro: "500", business: "Unlimited" },
                    { label: "AI generations / month", free: "5", pro: "100", business: "Unlimited" },
                    { label: "Social connections", free: "0", pro: "5", business: "Unlimited" },
                    { label: "Brand kits", free: "1", pro: "10", business: "Unlimited" },
                  ].map((row, i) => (
                    <tr key={`limit-${i}`} className="border-b border-border/50">
                      <td className="py-2.5 px-4 text-sm text-card-foreground">{row.label}</td>
                      <td className="py-2.5 px-4 text-center text-sm text-muted-foreground">{row.free}</td>
                      <td className="py-2.5 px-4 text-center text-sm" style={{ color: PRICING_PLANS.pro.color }}>{row.pro}</td>
                      <td className="py-2.5 px-4 text-center text-sm" style={{ color: PRICING_PLANS.business.color }}>{row.business}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl font-bold text-card-foreground text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: "Can I switch plans at any time?",
                  a: "Yes. You can upgrade or downgrade your plan at any time. When upgrading, you'll be charged a prorated amount for the remainder of your billing period. When downgrading, the change takes effect at the end of your current billing period.",
                },
                {
                  q: "What happens when I cancel?",
                  a: "When you cancel, you'll retain access to your paid features until the end of your current billing period. After that, your account will revert to the Free plan. Your projects and data are never deleted.",
                },
                {
                  q: "Is there a free trial?",
                  a: "The Free plan gives you access to basic design tools forever. When you upgrade, you can start creating with the full suite immediately. We don't currently offer a trial of paid plans, but you can cancel anytime.",
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept all major credit and debit cards (Visa, Mastercard, American Express) through our secure Stripe payment processing.",
                },
                {
                  q: "Do you offer refunds?",
                  a: "We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, contact our support team for a full refund.",
                },
              ].map((faq, i) => (
                <Card key={i} className="border-border">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-card-foreground mb-1">{faq.q}</h4>
                        <p className="text-sm text-muted-foreground">{faq.a}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
