import { auth } from "@/app/auth";
import { getSubscriptionByUserId } from "@/models/UserSubscription";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock");

export async function POST() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  try {
    const sub = await getSubscriptionByUserId(userId);

    if (!sub?.stripe_customer_id) {
      return NextResponse.json({ url: null, message: "Nessun abbonamento attivo" });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${appUrl}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error("Portal Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
