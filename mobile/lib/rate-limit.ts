import { supabase } from "@/lib/supabase";

// In-memory cache for fast checks (resets on cold start, but Supabase is source of truth)
const rateMap = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateMap) {
    if (now > entry.resetAt) rateMap.delete(key);
  }
}, 60_000);

/**
 * Check rate limit with Supabase persistence.
 * Uses in-memory cache as fast path, Supabase as durable backing store.
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<boolean> {
  const now = Date.now();

  // Fast path: check in-memory cache
  const cached = rateMap.get(key);
  if (cached && now < cached.resetAt) {
    if (cached.count >= maxRequests) return false;
    cached.count++;
    return true;
  }

  // Slow path: check Supabase
  try {
    const windowStart = new Date(now - windowMs).toISOString();
    const { count } = await supabase
      .from("rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("key", key)
      .gte("created_at", windowStart);

    if ((count || 0) >= maxRequests) {
      rateMap.set(key, { count: count || 0, resetAt: now + windowMs });
      return false;
    }

    // Record this request
    await supabase.from("rate_limits").insert({ key, created_at: new Date(now).toISOString() });

    // Update in-memory cache
    rateMap.set(key, { count: (count || 0) + 1, resetAt: now + windowMs });
    return true;
  } catch {
    // If Supabase is unavailable, fall back to in-memory only
    if (!cached || now > cached.resetAt) {
      rateMap.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    if (cached.count >= maxRequests) return false;
    cached.count++;
    return true;
  }
}

/**
 * Synchronous check for cases where async is not possible.
 * Uses in-memory only — less durable but works in sync contexts.
 */
export function checkRateLimitSync(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) return false;

  entry.count++;
  return true;
}
