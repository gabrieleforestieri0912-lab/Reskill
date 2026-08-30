import { getUserByEmail } from "@/models/User";
import { getBucketsByUserEmail } from "@/models/Bucket";
import { getSubscriptionByUserId } from "@/models/UserSubscription";
import { getPlanById, hasReachedBucketLimit, hasReachedSourceLimit } from "@/lib/plans";

export async function enforceBucketLimit(userEmail: string): Promise<string | null> {
  const user = await getUserByEmail(userEmail);
  if (!user) return null;

  const sub = await getSubscriptionByUserId(user.id);
  const planId = sub?.plan || "free";
  const buckets = await getBucketsByUserEmail(userEmail);
  if (hasReachedBucketLimit(planId, buckets.length)) {
    const plan = getPlanById(planId);
    return `Hai raggiunto il limite di ${plan.features.maxBuckets} bucket per il piano ${plan.name}.`;
  }
  return null;
}

export async function enforceSourceLimit(userEmail: string): Promise<string | null> {
  const user = await getUserByEmail(userEmail);
  if (!user) return null;

  const sub = await getSubscriptionByUserId(user.id);
  const planId = sub?.plan || "free";
  const buckets = await getBucketsByUserEmail(userEmail);
  const totalSources = buckets.reduce((acc, b) => acc + (b.sources?.length || 0), 0);
  if (hasReachedSourceLimit(planId, totalSources)) {
    const plan = getPlanById(planId);
    return `Hai raggiunto il limite di ${plan.features.maxSources} fonti per il piano ${plan.name}.`;
  }
  return null;
}
