export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { verifyCode, createExtensionToken } from "@/lib/verify-codes";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code || typeof email !== "string" || typeof code !== "string") {
      return NextResponse.json({ error: "Email e codice richiesti" }, { status: 400 });
    }

    if (await verifyCode(email.trim(), code.trim())) {
      const token = await createExtensionToken(email.trim());
      return NextResponse.json({ verified: true, token, message: "Verificato con successo" });
    }

    return NextResponse.json({ error: "Codice non valido o scaduto" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }
}
