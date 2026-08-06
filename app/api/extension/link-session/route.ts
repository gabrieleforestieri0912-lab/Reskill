import { auth } from "@/app/auth";
import { createExtensionToken } from "@/lib/verify-codes";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-extension-token",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

/**
 * GET — chiamato dal content script iniettato su skillgrowth.app.
 * Il content script ha accesso ai cookie di sessione, quindi può
 * recuperare la sessione Next-Auth e creare un token per l'estensione.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ verified: false });
    }

    if (!session.user.email) {
      return NextResponse.json({ verified: false });
    }

    const { data: existing } = await supabase
      .from("extension_tokens")
      .select("token")
      .eq("email", session.user.email.toLowerCase())
      .limit(1)
      .maybeSingle();

    if (existing?.token) {
      return NextResponse.json({
        verified: true,
        token: existing.token,
        email: session.user.email,
        name: session.user.name,
      });
    }

    const token = await createExtensionToken(session.user.email);

    return NextResponse.json({
      verified: true,
      token,
      email: session.user.email,
      name: session.user.name,
    });
  } catch {
    return NextResponse.json({ verified: false });
  }
}

/**
 * POST — chiamato dall'extension page direttamente (senza cookie).
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ verified: false });
    }

    const { data: existing } = await supabase
      .from("extension_tokens")
      .select("token")
      .eq("email", session.user.email.toLowerCase())
      .limit(1)
      .maybeSingle();

    if (existing?.token) {
      return NextResponse.json({
        verified: true,
        token: existing.token,
        email: session.user.email,
        name: session.user.name,
      });
    }

    const token = await createExtensionToken(session.user.email);

    return NextResponse.json({
      verified: true,
      token,
      email: session.user.email,
      name: session.user.name,
    });
  } catch {
    return NextResponse.json({ verified: false });
  }
}
