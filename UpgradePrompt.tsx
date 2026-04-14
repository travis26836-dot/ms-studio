import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Crown, Zap, Lock, Sparkles, ArrowRight, X } from "lucide-react";
import { useLocation } from "wouter";
import { PRICING_PLANS, type PlanTier, type PlanFeatures } from "@shared/subscriptionTypes";

// ═══════════════════════════════════════════════════════════════
// UPGRADE PROMPT — Shown when a free user tries a gated feature
// ═══════════════════════════════════════════════════════════════

interface UpgradePromptProps {
  feature: string;
  requiredPlan?: PlanTier;
  currentPlan?: PlanTier;
  onClose?: () => void;
  variant?: "dialog" | "inline" | "banner" | "tooltip";
  open?: boolean;
}

export default function UpgradePrompt({
  feature,
  requiredPlan = "pro",
  currentPlan = "free",
  onClose,
  variant = "dialog",
  open = true,
}: UpgradePromptProps) {
  const [, setLocation] = useLocation();
  const plan = PRICING_PLANS[requiredPlan];

  function handleUpgrade() {
    setLocation("/pricing");
    onClose?.();
  }

  if (variant === "inline") {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-card-foreground mb-1">
                {feature} requires {plan.name}
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Upgrade to {plan.name} to unlock {feature.toLowerCase()} and more premium features.
              </p>
              <Button size="sm" onClick={handleUpgrade}>
                <Crown className="w-3 h-3 mr-1" />
                Upgrade to {plan.name}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "banner") {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg">
        <Zap className="w-4 h-4 text-primary flex-shrink-0" />
        <span className="text-sm text-card-foreground flex-1">
          <strong>{feature}</strong> is a {plan.name} feature.
        </span>
        <Button size="sm" variant="outline" className="flex-shrink-0" onClick={handleUpgrade}>
          Upgrade
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
        {onClose && (
          <Button size="sm" variant="ghost" className="flex-shrink-0 w-6 h-6 p-0" onClick={onClose}>
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  }

  if (variant === "tooltip") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="w-3 h-3" />
        <span>{plan.name} feature</span>
      </div>
    );
  }

  // Default: dialog
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose?.()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            Unlock {feature}
          </DialogTitle>
          <DialogDescription className="text-center">
            This feature is available on the {plan.name} plan and above.
            Upgrade now to unlock it and dozens of other premium features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4" style={{ color: plan.color }} />
              <span className="font-semibold text-card-foreground">{plan.name} Plan Includes:</span>
            </div>
            {plan.highlights.slice(0, 6).map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Zap className="w-3 h-3 flex-shrink-0" style={{ color: plan.color }} />
                <span className="text-card-foreground">{h}</span>
              </div>
            ))}
            <p className="text-xs text-muted-foreground mt-2">
              ...and {plan.highlights.length - 6} more features
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Maybe Later
          </Button>
          <Button className="flex-1" style={{ backgroundColor: plan.color }} onClick={handleUpgrade}>
            <Crown className="w-4 h-4 mr-1" />
            Upgrade Now
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-2">
          Starting at ${(plan.monthlyPrice / 100).toFixed(2)}/month. Cancel anytime.
        </p>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════
// FEATURE GATE WRAPPER — Wraps components with upgrade prompt
// ═══════════════════════════════════════════════════════════════

interface FeatureGateProps {
  feature: keyof PlanFeatures;
  featureLabel: string;
  userPlan: PlanTier;
  children: React.ReactNode;
  fallback?: "inline" | "banner" | "blur" | "hide";
}

export function FeatureGate({
  feature,
  featureLabel,
  userPlan,
  children,
  fallback = "inline",
}: FeatureGateProps) {
  const features = PRICING_PLANS[userPlan]?.features;
  const isAvailable = features?.[feature] === true;

  if (isAvailable) return <>{children}</>;

  // Find required plan
  const requiredPlan: PlanTier = PRICING_PLANS.pro.features[feature] ? "pro" : "business";

  if (fallback === "hide") return null;

  if (fallback === "blur") {
    return (
      <div className="relative">
        <div className="blur-sm pointer-events-none opacity-50">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <UpgradePrompt
            feature={featureLabel}
            requiredPlan={requiredPlan}
            currentPlan={userPlan}
            variant="inline"
          />
        </div>
      </div>
    );
  }

  if (fallback === "banner") {
    return (
      <UpgradePrompt
        feature={featureLabel}
        requiredPlan={requiredPlan}
        currentPlan={userPlan}
        variant="banner"
      />
    );
  }

  // Default: inline
  return (
    <UpgradePrompt
      feature={featureLabel}
      requiredPlan={requiredPlan}
      currentPlan={userPlan}
      variant="inline"
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// USAGE LIMIT INDICATOR — Shows usage vs limit
// ═══════════════════════════════════════════════════════════════

interface UsageLimitProps {
  label: string;
  current: number;
  limit: number; // -1 = unlimited
  color?: string;
}

export function UsageLimitIndicator({ label, current, limit, color = "#6366f1" }: UsageLimitProps) {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min((current / limit) * 100, 100);
  const isNearLimit = !isUnlimited && percentage >= 80;
  const isAtLimit = !isUnlimited && current >= limit;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-medium ${isAtLimit ? "text-red-500" : isNearLimit ? "text-amber-500" : "text-card-foreground"}`}>
          {current}{isUnlimited ? "" : ` / ${limit}`}
          {isUnlimited && <span className="text-muted-foreground ml-1">(unlimited)</span>}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${percentage}%`,
              backgroundColor: isAtLimit ? "#ef4444" : isNearLimit ? "#f59e0b" : color,
            }}
          />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PRO BADGE — Small badge to indicate premium features
// ═══════════════════════════════════════════════════════════════

interface ProBadgeProps {
  plan?: "pro" | "business";
  size?: "sm" | "md";
}

export function ProBadge({ plan = "pro", size = "sm" }: ProBadgeProps) {
  const color = plan === "business" ? "#f59e0b" : "#6366f1";
  const label = plan === "business" ? "BIZ" : "PRO";

  if (size === "sm") {
    return (
      <span
        className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1 py-0.5 rounded"
        style={{ backgroundColor: `${color}20`, color }}
      >
        <Crown className="w-2 h-2" />
        {label}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 rounded"
      style={{ backgroundColor: `${color}20`, color }}
    >
      <Crown className="w-3 h-3" />
      {label}
    </span>
  );
}
