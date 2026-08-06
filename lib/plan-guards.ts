import { getUserEmailOrNull } from "@/lib/auth-helper";
import { getBucketsByUserEmail } from "@/models/Bucket";
import { getSourcesByBucketIds } from "@/models/Source";
import { getUserByEmail } from "@/models/User";
import { getSubscriptionByUserId } from "@/models/UserSubscription";
import { getPlanById } from "@/lib/plans";

const CREDITS_PER_TYPE: Record<string, number> = {
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
 * Calcola i crediti effettivamente usati dall'utente, basandosi sulle fonti nei suoi bucket.
 * Un piano con N crediti/mese può generare Skill fino a esaurimento.
 * Restituisce un oggetto che indica se la generazione è consentita.
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

 const sub = await getSubscriptionByUserId(user.id);
 const planId = sub?.plan || "free";
 const plan = getPlanById(planId);

 const buckets = await getBucketsByUserEmail(userEmail);
 const bucketIds = buckets.map((b) => b.id);
 const sources = bucketIds.length > 0 ? await getSourcesByBucketIds(bucketIds) : [];

 let creditsUsed = 0;
 for (const s of sources) {
 const creditsForType = CREDITS_PER_TYPE[s.type] || 5;
 const sourceCredits = (s as any).credits_used || creditsForType;
 creditsUsed += sourceCredits;
 }

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
 * Limite orario di generazione Skill per piano.
 * Free ha un tetto basso (5/h) per evitare abusi; i piani a pagamento sono "illimitati"
 * nel senso di tetto molto alto (limitato dai crediti mensili, che sono enforced sopra).
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