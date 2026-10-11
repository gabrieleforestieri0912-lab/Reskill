export const runtime = 'nodejs';
import { getUserEmailOrNull } from "@/lib/auth-helper";
import { supabase } from "@/lib/supabase";
import { ensureTable, hashCredential, credentialPrefix } from "@/lib/credentials";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS mcp_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    key_prefix TEXT NOT NULL,
    name TEXT DEFAULT 'default',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    revoked BOOLEAN DEFAULT FALSE
  );
`;

export async function GET(req: NextRequest) {
  const email = await getUserEmailOrNull(req);
  if (!email) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  if (!(await ensureTable("mcp_tokens", CREATE_TABLE_SQL))) {
    return NextResponse.json({ tokens: [] });
  }

  const { data: tokens } = await supabase
    .from("mcp_tokens")
    .select("id, key_prefix, name, created_at, last_used_at, revoked")
    .eq("user_email", email)
    .order("created_at", { ascending: false });

  return NextResponse.json({ tokens: tokens || [] });
}

export async function POST(req: NextRequest) {
  const email = await getUserEmailOrNull(req);
  if (!email) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  if (!(await ensureTable("mcp_tokens", CREATE_TABLE_SQL))) {
    return NextResponse.json({ error: "Errore di sistema" }, { status: 500 });
  }

  const { name } = await req.json().catch(() => ({ name: "default" }));

  const rawToken = `sg_mcp_${crypto.randomBytes(24).toString("hex")}`;
  const keyHash = hashCredential(rawToken);
  const keyPrefix = credentialPrefix(rawToken);

  const { data: inserted, error } = await supabase
    .from("mcp_tokens")
    .insert({
      user_email: email,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      name: name || "default",
    })
    .select("id")
    .single();

  if (error || !inserted) {
    return NextResponse.json({ error: "Errore nella generazione del token" }, { status: 500 });
  }

  return NextResponse.json({
    id: inserted.id,
    token: rawToken,
    keyPrefix,
    message: "Token MCP generato. Copialo ora — non sarà più mostrato.",
  });
}

export async function DELETE(req: NextRequest) {
  const email = await getUserEmailOrNull(req);
  if (!email) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { id } = await req.json().catch(() => ({ id: "" }));
  if (!id) {
    return NextResponse.json({ error: "ID token mancante" }, { status: 400 });
  }

  await supabase
    .from("mcp_tokens")
    .update({ revoked: true })
    .eq("id", id)
    .eq("user_email", email);

  return NextResponse.json({ success: true });
}