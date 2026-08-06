export interface PlanFeatures {
  maxBuckets: number;
  maxSources: number;
  aiGeneration: boolean;
  prioritySupport: boolean;
  teamSharing: boolean;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  credits: number;
  currency: string;
  interval: string;
  stripePriceId: string | null;
  features: PlanFeatures;
}

export const PLANS: Record<string, Plan> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    credits: 10,
    currency: "EUR",
    interval: "month",
    stripePriceId: null,
    features: { maxBuckets: 1, maxSources: 3, aiGeneration: true, prioritySupport: false, teamSharing: false },
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 12,
    credits: 500,
    currency: "EUR",
    interval: "month",
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || "price_pro_mock",
    features: { maxBuckets: 15, maxSources: 100, aiGeneration: true, prioritySupport: true, teamSharing: false },
  },
  business: {
    id: "business",
    name: "Business",
    price: 29,
    credits: 1500,
    currency: "EUR",
    interval: "month",
    stripePriceId: process.env.STRIPE_BUSINESS_PRICE_ID || "price_business_mock",
    features: { maxBuckets: 50, maxSources: 500, aiGeneration: true, prioritySupport: true, teamSharing: true },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 59,
    credits: 5000,
    currency: "EUR",
    interval: "month",
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || "price_enterprise_mock",
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
