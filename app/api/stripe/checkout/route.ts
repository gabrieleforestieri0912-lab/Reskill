export const runtime = 'nodejs';
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
    const { planId, billing } = await req.json();
    const plan = getPlanById(planId || "pro");
    const cycle = billing === "annual" ? "annual" : "monthly";

    if (plan.id === "free") {
      return NextResponse.json({ url: null, message: "Sei già sul piano Free" });
    }

    const { getPlanPrice } = await import("@/lib/plans");
    const amount = getPlanPrice(plan, cycle);

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith("sk_test_mock")) {
      return NextResponse.json({
        url: null,
        message: `Il ${plan.name} costa €${amount}${cycle === "annual" ? "/anno" : "/mese"}. Chiavi Stripe configurate ma non verificate.`,
        demo: true,
        plan: plan.id,
        billing: cycle,
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

    // Se esistono Price ID Stripe dedicati, usali; altrimenti price_data dinamico.
    const stripePriceId =
      cycle === "annual" ? plan.stripeAnnualPriceId : plan.stripePriceId;
    const useStripePrice =
      !!stripePriceId && !stripePriceId.includes("_mock");

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: customerId ? undefined : userEmail || undefined,
      customer: customerId || undefined,
      line_items: useStripePrice
        ? [{ price: stripePriceId as string, quantity: 1 }]
        : [
            {
              price_data: {
                currency: "eur",
                product_data: {
                  name: `Reskill ${plan.name} ${cycle === "annual" ? "Annuale" : "Mensile"}`,
                  description: `Piano ${plan.name} ${cycle} — ${plan.features.maxBuckets === -1 ? "bucket illimitati" : `${plan.features.maxBuckets} bucket`}, ${plan.features.maxSources === -1 ? "fonti illimitate" : `${plan.features.maxSources} fonti`}`,
                },
                unit_amount: Math.round(amount * 100),
                recurring: { interval: cycle === "annual" ? "year" : "month" },
              },
              quantity: 1,
            },
          ],
      subscription_data: {
        metadata: {
          planId: plan.id,
          billing: cycle,
        },
      },
      metadata: {
        userId: userId || "anonymous",
        planId: plan.id,
        billing: cycle,
      },
      success_url: `${appUrl}/dashboard?success=true&plan=${plan.id}`,
      cancel_url: `${appUrl}/dashboard?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: unknown) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      { error: "Errore durante la creazione del checkout Stripe" },
      { status: 500 }
    );
  }
}
