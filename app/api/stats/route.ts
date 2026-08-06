import { getUserEmailOrNull } from "@/lib/auth-helper";
import { getBucketsByUserEmail } from "@/models/Bucket";
import { getSourcesByBucketIds } from "@/models/Source";
import { getUserByEmail } from "@/models/User";
import { getSubscriptionByUserId } from "@/models/UserSubscription";
import { getPlanById } from "@/lib/plans";
import { NextRequest, NextResponse } from "next/server";

const CREDITS_PER_TYPE: Record<string, number> = {
  youtube: 10,
  webpage: 3,
  pdf: 8,
  twitter: 5,
  reddit: 5,
};

export async function GET(req: NextRequest) {
  const info = await getUserEmailOrNull(req);
  const userEmail = info || "ospite";

  try {
    const buckets = await getBucketsByUserEmail(userEmail);
    const totalBuckets = buckets.length;
    const bucketIds = buckets.map((b) => b.id);

    const sources = bucketIds.length > 0 ? await getSourcesByBucketIds(bucketIds) : [];

    const totalSources = sources.length;

    const skillsGenerated = buckets.filter((b) => b.generated_skill).length;

    const sourcesByType: Record<string, number> = {};
    let totalCreditsUsed = 0;
    const creditsByType: Record<string, number> = {};

    for (const s of sources) {
      sourcesByType[s.type] = (sourcesByType[s.type] || 0) + 1;

      const creditsForType = CREDITS_PER_TYPE[s.type] || 5;
      const sourceCredits = (s as any).credits_used || creditsForType;
      totalCreditsUsed += sourceCredits;

      creditsByType[s.type] = (creditsByType[s.type] || 0) + sourceCredits;
    }

    const recentActivity: any[] = [];
    for (const b of buckets) {
      recentActivity.push({
        type: "bucket",
        id: b.id,
        name: b.name,
        date: b.updated_at || b.created_at,
      });
    }
    for (const s of sources) {
      const creditsForType = CREDITS_PER_TYPE[s.type] || 5;
      const sourceCredits = (s as any).credits_used || creditsForType;

      recentActivity.push({
        type: "source",
        id: s.id,
        name: s.title,
        date: s.created_at,
        sourceType: s.type,
        creditsUsed: sourceCredits,
      });
    }
    recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastActivity = recentActivity.slice(0, 30);

    let userId = "";
    const user = info ? await getUserByEmail(info) : null;
    if (user) userId = user.id;

    let subscription = null;
    if (userId) {
      subscription = await getSubscriptionByUserId(userId);
    }

    const planId = subscription?.plan || "free";
    const plan = getPlanById(planId);

    return NextResponse.json({
      totalBuckets,
      totalSources,
      skillsGenerated,
      sourcesByType,
      creditsByType,
      totalCreditsUsed,
      planCredits: plan?.credits || 100,
      creditsRemaining: Math.max(0, (plan?.credits || 100) - totalCreditsUsed),
      lastActivity,
      currentPlan: planId,
      usage: {
        buckets: totalBuckets,
        sources: totalSources,
      },
    });
  } catch (e: any) {
    console.error("Stats error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
