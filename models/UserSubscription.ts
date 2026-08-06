import { supabase } from "@/lib/supabase";

export interface IUserSubscription {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  stripe_current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export async function getSubscriptionByUserId(userId: string) {
  const { data } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data as IUserSubscription | null;
}

export async function getSubscriptionByStripeId(stripeSubscriptionId: string) {
  const { data } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .maybeSingle();
  return data as IUserSubscription | null;
}

export async function upsertSubscription(
  data: Record<string, unknown>,
  conflictField: string
) {
  const { data: sub } = await supabase
    .from("user_subscriptions")
    .upsert(data, { onConflict: conflictField })
    .select()
    .single();
  return sub as IUserSubscription | null;
}

export async function updateSubscription(
  matchField: string,
  matchValue: string,
  updates: Record<string, unknown>
) {
  const { data: sub } = await supabase
    .from("user_subscriptions")
    .update(updates)
    .eq(matchField, matchValue)
    .select()
    .single();
  return sub as IUserSubscription | null;
}
