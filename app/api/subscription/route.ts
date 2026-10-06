export const runtime = 'nodejs';
import { auth } from "@/app/auth";
import { getSubscriptionByUserId } from "@/models/UserSubscription";
import { PLANS, getPlanById } from "@/lib/plans";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ plan: "free", status: "unauthenticated", planDetails: PLANS.free });
  }

  try {
    const sub = await getSubscriptionByUserId(userId);

    if (!sub) {
      return NextResponse.json({ plan: "free", status: "active", planDetails: PLANS.free });
    }

    const planDetails = getPlanById(sub.plan);

    return NextResponse.json({
      plan: sub.plan,
      status: sub.status,
      stripeCustomerId: sub.stripe_customer_id,
      stripeSubscriptionId: sub.stripe_subscription_id,
      currentPeriodEnd: sub.stripe_current_period_end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      planDetails,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Errore sconosciuto" },
      { status: 500 }
    );
  }
}
