import { getUserByEmail } from "@/models/User";
import { getSubscriptionByUserId, resetCreditsIfNeeded } from "@/models/UserSubscription";
import { getPlanById } from "@/lib/plans";

export const CREDITS_PER_TYPE: Record<string, number> = {
  youtube: 10,
  webpage: 3,
  pdf: 8,
  twitter: 5,
  reddit: 5,
};

export interface PlanGuardResult {
  allowed: boolean;
  reason?: string;
  planId: string;
  planName: string;
  creditsUsed: number;
  creditsTotal: number;
  creditsRemaining: number;
}

/**
 * Verifica se l'utente può generare una Skill AI.
 * Controlla i crediti mensili tracked nella subscription.
 * Se il periodo è scaduto, resetta automaticamente i crediti.
 */
export async function checkGenerationAllowed(userEmail: string | null): Promise<PlanGuardResult> {
  const fallback: PlanGuardResult = {
    allowed: true,
    planId: "free",
    planName: "Free",
    creditsUsed: 0,
    creditsTotal: getPlanById("free").credits,
    creditsRemaining: getPlanById("free").credits,
  };

  if (!userEmail) return fallback;

  try {
    const user = await getUserByEmail(userEmail);
    if (!user) return fallback;

    // Resetta crediti se il periodo è scaduto
    await resetCreditsIfNeeded(userEmail);

    const sub = await getSubscriptionByUserId(user.id);
    const planId = sub?.plan || "free";
    const plan = getPlanById(planId);

    const creditsUsed = sub?.credits_used || 0;
    const creditsRemaining = Math.max(0, plan.credits - creditsUsed);

    if (creditsRemaining <= 0) {
      return {
        allowed: false,
        reason: `Hai esaurito i ${plan.credits} crediti del piano ${plan.name}. Effettua l'upgrade o attendi il rinnovo mensile.`,
        planId,
        planName: plan.name,
        creditsUsed,
        creditsTotal: plan.credits,
        creditsRemaining: 0,
      };
    }

    return {
      allowed: true,
      planId,
      planName: plan.name,
      creditsUsed,
      creditsTotal: plan.credits,
      creditsRemaining,
    };
  } catch (e) {
    console.error("checkGenerationAllowed error:", e);
    return fallback;
  }
}

/**
 * Ottieni lo stato dei crediti di un utente (per display).
 */
export async function getCreditStatus(userEmail: string | null): Promise<PlanGuardResult> {
  const fallback: PlanGuardResult = {
    allowed: true,
    planId: "free",
    planName: "Free",
    creditsUsed: 0,
    creditsTotal: getPlanById("free").credits,
    creditsRemaining: getPlanById("free").credits,
  };

  if (!userEmail) return fallback;

  try {
    const user = await getUserByEmail(userEmail);
    if (!user) return fallback;

    await resetCreditsIfNeeded(userEmail);

    const sub = await getSubscriptionByUserId(user.id);
    const planId = sub?.plan || "free";
    const plan = getPlanById(planId);

    const creditsUsed = sub?.credits_used || 0;
    const creditsRemaining = Math.max(0, plan.credits - creditsUsed);

    return {
      allowed: creditsRemaining > 0,
      planId,
      planName: plan.name,
      creditsUsed,
      creditsTotal: plan.credits,
      creditsRemaining,
    };
  } catch (e) {
    console.error("getCreditStatus error:", e);
    return fallback;
  }
}

/**
 * Limite orario di generazione Skill per piano.
 */
export const GENERATION_HOURLY_LIMIT: Record<string, number> = {
  free: 5,
  pro: 999,
  business: 999,
  enterprise: 999,
};

export function getHourlyLimit(planId: string): number {
  return GENERATION_HOURLY_LIMIT[planId] ?? GENERATION_HOURLY_LIMIT.free;
}
