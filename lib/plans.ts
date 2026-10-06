export interface PlanFeatures {
  maxBuckets: number;
  maxSources: number;
  aiGeneration: boolean;
  prioritySupport: boolean;
  teamSharing: boolean;
}

export type BillingInterval = "monthly" | "annual";

export interface Plan {
  id: string;
  name: string;
  /** Prezzo mensile (EUR). Range 4.99 – 9.99 per i piani a pagamento. */
  price: number;
  /** Prezzo annuale scontato (EUR/anno, ~2 mesi gratis). */
  annualPrice: number;
  credits: number;
  currency: string;
  interval: string;
  stripePriceId: string | null;
  stripeAnnualPriceId: string | null;
  features: PlanFeatures;
}

/** Prezzo effettivo in base al ciclo di fatturazione. */
export function getPlanPrice(plan: Plan, billing: BillingInterval): number {
  return billing === "annual" ? plan.annualPrice : plan.price;
}

/** Intervallo Stripe in base al ciclo di fatturazione. */
export function getStripeInterval(billing: BillingInterval): "month" | "year" {
  return billing === "annual" ? "year" : "month";
}

export const PLANS: Record<string, Plan> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    annualPrice: 0,
    credits: 10,
    currency: "EUR",
    interval: "month",
    stripePriceId: null,
    stripeAnnualPriceId: null,
    features: { maxBuckets: 1, maxSources: 3, aiGeneration: true, prioritySupport: false, teamSharing: false },
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 4.99,
    annualPrice: 49.9,
    credits: 500,
    currency: "EUR",
    interval: "month",
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || "price_pro_mock",
    stripeAnnualPriceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || "price_pro_annual_mock",
    features: { maxBuckets: 15, maxSources: 100, aiGeneration: true, prioritySupport: true, teamSharing: false },
  },
  business: {
    id: "business",
    name: "Business",
    price: 9.99,
    annualPrice: 99.9,
    credits: 1500,
    currency: "EUR",
    interval: "month",
    stripePriceId: process.env.STRIPE_BUSINESS_PRICE_ID || "price_business_mock",
    stripeAnnualPriceId: process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID || "price_business_annual_mock",
    features: { maxBuckets: 50, maxSources: 500, aiGeneration: true, prioritySupport: true, teamSharing: true },
  },
  // Mantenuto per retro-compatibilità con abbonamenti esistenti,
  // ma non più mostrato nelle UI (range prezzi 4.99 – 9.99).
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 9.99,
    annualPrice: 99.9,
    credits: 5000,
    currency: "EUR",
    interval: "month",
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || "price_enterprise_mock",
    stripeAnnualPriceId: process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID || "price_enterprise_annual_mock",
    features: { maxBuckets: -1, maxSources: -1, aiGeneration: true, prioritySupport: true, teamSharing: true },
  },
};

export function getPlanById(id: string): Plan {
  return PLANS[id] || PLANS.free;
}

export function hasReachedBucketLimit(planId: string, currentCount: number): boolean {
  const plan = getPlanById(planId);
  if (plan.features.maxBuckets === -1) return false;
  return currentCount >= plan.features.maxBuckets;
}

export function hasReachedSourceLimit(planId: string, currentCount: number): boolean {
  const plan = getPlanById(planId);
  if (plan.features.maxSources === -1) return false;
  return currentCount >= plan.features.maxSources;
}
