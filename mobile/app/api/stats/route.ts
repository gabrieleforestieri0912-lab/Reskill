export const runtime = 'nodejs';
import { getUserEmailOrNull } from "@/lib/auth-helper";
import { getBucketsByUserEmail } from "@/models/Bucket";
import { getSourcesByBucketIds } from "@/models/Source";
import { getUserByEmail } from "@/models/User";
import { getSubscriptionByUserId, resetCreditsIfNeeded } from "@/models/UserSubscription";
import { getPlanById, PLANS } from "@/lib/plans";
import { NextRequest, NextResponse } from "next/server";

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

    // Conta fonti per tipo
    const sourcesByType: Record<string, number> = {};
    for (const s of sources) {
      sourcesByType[s.type] = (sourcesByType[s.type] || 0) + 1;
    }

    // Ottieni crediti dalla subscription (tracked)
    let userId = "";
    const user = info ? await getUserByEmail(info) : null;
    if (user) userId = user.id;

    let subscription = null;
    if (userId) {
      await resetCreditsIfNeeded(info!);
      subscription = await getSubscriptionByUserId(userId);
    }

    const planId = subscription?.plan || "free";
    const plan = getPlanById(planId);
    const totalCreditsUsed = subscription?.credits_used || 0;

    // Attività recente
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
      recentActivity.push({
        type: "source",
        id: s.id,
        name: s.title,
        date: s.created_at,
        sourceType: s.type,
      });
    }
    recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastActivity = recentActivity.slice(0, 30);

    return NextResponse.json({
      totalBuckets,
      totalSources,
      skillsGenerated,
      sourcesByType,
      totalCreditsUsed,
      planCredits: plan.credits,
      creditsRemaining: Math.max(0, plan.credits - totalCreditsUsed),
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
