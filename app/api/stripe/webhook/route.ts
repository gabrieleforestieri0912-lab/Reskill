import { upsertSubscription, updateSubscription } from "@/models/UserSubscription";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock");

function getPlanId(sub: any): string {
  return sub?.metadata?.planId || "pro";
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as any;
        const subscriptionId = checkoutSession.subscription;
        const customerId = checkoutSession.customer;
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
        const deletedSub = event.data.object as any;
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
        const subscriptionId = invoice.subscription;
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId) as any;
          await updateSubscription("stripe_subscription_id", subscriptionId, {
            status: sub.status,
            stripe_current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
