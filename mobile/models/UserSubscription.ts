import { supabase } from "@/lib/supabase";
import { getPlanById } from "@/lib/plans";

export interface IUserSubscription {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  credits_used: number;
  credits_period_start: string | null;
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

export async function getSubscriptionByEmail(userEmail: string) {
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("email", userEmail)
    .maybeSingle();
  if (!user) return null;
  return getSubscriptionByUserId(user.id);
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

/**
 * Incrementa i crediti usati per un utente.
 * Se il periodo mensile è scaduto, resetta i crediti prima di incrementare.
 */
export async function deductCredits(userEmail: string, amount: number): Promise<{ success: boolean; creditsUsed: number; creditsRemaining: number }> {
  const sub = await getSubscriptionByEmail(userEmail);
  if (!sub) return { success: true, creditsUsed: amount, creditsRemaining: 999 };

  const now = new Date();
  const periodStart = sub.credits_period_start ? new Date(sub.credits_period_start) : null;
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Se il periodo è cambiato, resetta i crediti
  let creditsUsed = sub.credits_used;
  if (!periodStart || periodStart.toISOString().slice(0, 7) !== currentMonth) {
    creditsUsed = 0;
    await supabase
      .from("user_subscriptions")
      .update({
        credits_used: 0,
        credits_period_start: `${currentMonth}-01T00:00:00Z`,
        updated_at: now.toISOString(),
      })
      .eq("user_id", sub.user_id);
  }

  const newCreditsUsed = creditsUsed + amount;
  await supabase
    .from("user_subscriptions")
    .update({
      credits_used: newCreditsUsed,
      updated_at: now.toISOString(),
    })
    .eq("user_id", sub.user_id);

  const plan = getPlanById(sub.plan || "free");
  const creditsRemaining = Math.max(0, plan.credits - newCreditsUsed);

  return { success: true, creditsUsed: newCreditsUsed, creditsRemaining };
}

/**
 * Rimborsa crediti quando una fonte viene eliminata.
 */
export async function refundCredits(userEmail: string, amount: number): Promise<{ success: boolean; creditsUsed: number; creditsRemaining: number }> {
  const sub = await getSubscriptionByEmail(userEmail);
  if (!sub) return { success: true, creditsUsed: 0, creditsRemaining: 999 };

  const now = new Date();
  const periodStart = sub.credits_period_start ? new Date(sub.credits_period_start) : null;
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  let creditsUsed = sub.credits_used;
  if (!periodStart || periodStart.toISOString().slice(0, 7) !== currentMonth) {
    creditsUsed = 0;
  }

  const newCreditsUsed = Math.max(0, creditsUsed - amount);
  await supabase
    .from("user_subscriptions")
    .update({
      credits_used: newCreditsUsed,
      updated_at: now.toISOString(),
    })
    .eq("user_id", sub.user_id);

  const plan = getPlanById(sub.plan || "free");
  const creditsRemaining = Math.max(0, plan.credits - newCreditsUsed);

  return { success: true, creditsUsed: newCreditsUsed, creditsRemaining };
}

/**
 * Resetta i crediti all'inizio di un nuovo periodo (chiamato dal webhook o al login).
 */
export async function resetCreditsIfNeeded(userEmail: string): Promise<void> {
  const sub = await getSubscriptionByEmail(userEmail);
  if (!sub) return;

  const now = new Date();
  const periodStart = sub.credits_period_start ? new Date(sub.credits_period_start) : null;
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  if (!periodStart || periodStart.toISOString().slice(0, 7) !== currentMonth) {
    await supabase
      .from("user_subscriptions")
      .update({
        credits_used: 0,
        credits_period_start: `${currentMonth}-01T00:00:00Z`,
        updated_at: now.toISOString(),
      })
      .eq("user_id", sub.user_id);
  }
}
