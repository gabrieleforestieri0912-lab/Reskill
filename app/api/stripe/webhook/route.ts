export const runtime = 'nodejs';
import { upsertSubscription, updateSubscription } from "@/models/UserSubscription";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock");

function getPlanId(sub: Stripe.Subscription): string {
  return sub?.metadata?.planId || "pro";
}

async function resetUserCredits(userId: string) {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  await supabase
    .from("user_subscriptions")
    .update({
      credits_used: 0,
      credits_period_start: `${currentMonth}-01T00:00:00Z`,
      updated_at: now.toISOString(),
    })
    .eq("user_id", userId);
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") || "";

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured. Rejecting webhook.");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = checkoutSession.subscription as string;
        const customerId = checkoutSession.customer as string;
        const userId = checkoutSession.metadata?.userId;
        const planId = checkoutSession.metadata?.planId || "pro";

        if (!subscriptionId || !userId) break;

          const sub = await stripe.subscriptions.retrieve(subscriptionId) as any;
        const priceId = sub.items?.data?.[0]?.price?.id || "";

        await upsertSubscription(
          {
            user_id: userId,
            plan: planId,
            status: sub.status,
            credits_used: 0,
            credits_period_start: new Date().toISOString(),
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            stripe_price_id: priceId,
            stripe_current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            cancel_at_period_end: sub.cancel_at_period_end,
          },
          "user_id"
        );
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as any;
        const planId = getPlanId(sub);
        const priceId = sub.items?.data?.[0]?.price?.id || "";

        await updateSubscription("stripe_subscription_id", sub.id, {
          plan: planId,
          status: sub.status,
          stripe_price_id: priceId,
          stripe_current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const deletedSub = event.data.object as Stripe.Subscription;
        await updateSubscription("stripe_subscription_id", deletedSub.id, {
          plan: "free",
          status: "canceled",
          stripe_subscription_id: "",
          stripe_price_id: "",
          cancel_at_period_end: false,
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription as string;
        if (subscriptionId) {
const sub = await stripe.subscriptions.retrieve(subscriptionId) as any;

          const { data: subRecord } = await supabase
            .from("user_subscriptions")
            .select("user_id")
            .eq("stripe_subscription_id", subscriptionId)
            .maybeSingle();

          if (subRecord?.user_id) {
            await resetUserCredits(subRecord.user_id);
          }

          await updateSubscription("stripe_subscription_id", subscriptionId, {
            status: sub.status,
            stripe_current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
