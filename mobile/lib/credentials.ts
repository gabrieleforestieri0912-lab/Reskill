import crypto from "crypto";
import { supabase } from "@/lib/supabase";

export function hashCredential(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function credentialPrefix(raw: string, len = 12): string {
  return raw.substring(0, len);
}

/**
 * Ensures a table exists before reading/writing it.
 * Tries a direct query first (tables are created by database/schema.sql),
 * then falls back to the exec_sql RPC, and finally a last-resort query.
 */
export async function ensureTable(
  table: string,
  createSql: string
): Promise<boolean> {
  try {
    await supabase.from(table).select("id").limit(1);
    return true;
  } catch {
    // table may not exist — try to create it
  }

  try {
    const { error } = await supabase.rpc("exec_sql", { sql_text: createSql });
    if (error) return false;
  } catch {
    return false;
  }

  try {
    await supabase.from(table).select("id").limit(1);
    return true;
  } catch {
    return false;
  }
}

async function emailForCredential(
  table: "api_keys" | "mcp_tokens",
  raw: string
): Promise<string | null> {
  const keyHash = hashCredential(raw);
  const { data } = await supabase
    .from(table)
    .select("id, user_email")
    .eq("key_hash", keyHash)
    .eq("revoked", false)
    .maybeSingle();

  if (!data?.user_email) return null;

  void (async () => {
    try {
      await supabase
        .from(table)
        .update({ last_used_at: new Date().toISOString() })
        .eq("id", data.id);
    } catch {
      // last_used_at è best-effort, non bloccare l'autenticazione
    }
  })();

  return data.user_email;
}

/**
 * Resolves a bearer credential (MCP token `sg_mcp_...` or API key `sg_...`)
 * to the owning user's email, or null if the credential is invalid/revoked.
 */
export async function getEmailFromCredential(raw: string): Promise<string | null> {
  if (raw.startsWith("sg_mcp_")) {
    return emailForCredential("mcp_tokens", raw);
  }
  if (raw.startsWith("sg_")) {
    return emailForCredential("api_keys", raw);
  }
  return null;
}