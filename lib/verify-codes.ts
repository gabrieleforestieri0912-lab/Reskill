import { randomUUID } from "node:crypto";
import { supabase } from "@/lib/supabase";

const devCodes = new Map<string, { code: string; expiresAt: number }>();
const devTokens = new Map<string, { email: string; expiresAt: number }>();

const TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function storeCode(email: string, code: string) {
  const key = email.toLowerCase();
  devCodes.set(key, { code, expiresAt: Date.now() + 60 * 1000 });

  try {
    await supabase.from("verification_codes").insert({
      email: key,
      code,
      expires_at: new Date(Date.now() + 60 * 1000).toISOString(),
    });
  } catch {
    // fallback: in-memory store works
  }
}

export async function verifyCode(email: string, code: string): Promise<boolean> {
  const key = email.toLowerCase();

  const dev = devCodes.get(key);
  if (dev && dev.code === code && Date.now() < dev.expiresAt) {
    devCodes.delete(key);
    return true;
  }

  try {
    const { data } = await supabase
      .from("verification_codes")
      .select("*")
      .eq("email", key)
      .eq("code", code)
      .eq("used", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) return false;

    await supabase
      .from("verification_codes")
      .update({ used: true })
      .eq("id", data.id);
  } catch {
    return false;
  }

  return true;
}

export async function createExtensionToken(email: string): Promise<string> {
  const token = randomUUID();
  const key = email.toLowerCase();
  const expiresAt = Date.now() + TOKEN_EXPIRY_MS;

  devTokens.set(token, { email: key, expiresAt });

  try {
    await supabase.from("extension_tokens").insert({
      token,
      email: key,
      expires_at: new Date(expiresAt).toISOString(),
    });
  } catch {
    // fallback: in-memory store works
  }

  return token;
}

export async function getEmailFromToken(token: string): Promise<string | null> {
  const dev = devTokens.get(token);
  if (dev) {
    if (Date.now() > dev.expiresAt) {
      devTokens.delete(token);
      return null;
    }
    return dev.email;
  }

  try {
    const { data } = await supabase
      .from("extension_tokens")
      .select("email, expires_at")
      .eq("token", token)
      .maybeSingle();

    if (!data?.email) return null;

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      await supabase.from("extension_tokens").delete().eq("token", token);
      return null;
    }

    return data.email;
  } catch {
    return null;
  }
}

export async function deleteExtensionToken(token: string) {
  devTokens.delete(token);

  try {
    await supabase.from("extension_tokens").delete().eq("token", token);
  } catch {
    // fallback: already deleted from memory
  }
}
