import { getUserEmailOrNull } from "@/lib/auth-helper";
import { getSubscriptionByUserId } from "@/models/UserSubscription";
import { getUserByEmail } from "@/models/User";
import { getPlanById } from "@/lib/plans";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock");

export async function POST(req: Request) {
  const email = await getUserEmailOrNull(req);
  const user = email ? await getUserByEmail(email) : null;
  const userId = user?.id;
  const userEmail = user?.email;

  try {
    const { planId } = await req.json();
    const plan = getPlanById(planId || "pro");

    if (plan.id === "free") {
      return NextResponse.json({ url: null, message: "Sei già sul piano Free" });
    }

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith("sk_test_mock")) {
      return NextResponse.json({
        url: null,
        message: `Il ${plan.name} costa €${plan.price}/mese. Chiavi Stripe configurate ma non verificate.`,
        demo: true,
        plan: plan.id,
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    let customerId: string | undefined;
    if (userId) {
      const existing = await getSubscriptionByUserId(userId);
      if (existing) {
        customerId = existing.stripe_customer_id || undefined;
      }
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: customerId ? undefined : userEmail || undefined,
      customer: customerId || undefined,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Skillgrowth ${plan.name}`,
              description: `Piano ${plan.name} — ${plan.features.maxBuckets === -1 ? "bucket illimitati" : `${plan.features.maxBuckets} bucket`}, ${plan.features.maxSources === -1 ? "fonti illimitate" : `${plan.features.maxSources} fonti`}`,
            },
            unit_amount: plan.price * 100,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          planId: plan.id,
        },
      },
      metadata: {
        userId: userId || "anonymous",
        planId: plan.id,
      },
      success_url: `${appUrl}/dashboard?success=true&plan=${plan.id}`,
      cancel_url: `${appUrl}/dashboard?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      { error: "Errore durante la creazione del checkout Stripe" },
      { status: 500 }
    );
  }
}
