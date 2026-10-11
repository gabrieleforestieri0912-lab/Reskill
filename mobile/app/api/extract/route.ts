export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { getUserEmailOrNull } from "@/lib/auth-helper";
import { checkRateLimit } from "@/lib/rate-limit";
import { extractUrl } from "@/lib/extract";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const userEmail = await getUserEmailOrNull(req);
    if (!userEmail) {
      return NextResponse.json({ error: "Autenticazione richiesta" }, { status: 401 });
    }

    const rateKey = `extract:${userEmail}`;
    if (!await checkRateLimit(rateKey, 20, 60 * 1000)) {
      return NextResponse.json(
        { error: "Troppe richieste di estrazione. Riprova tra qualche secondo." },
        { status: 429 }
      );
    }

    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL non valido" }, { status: 400 });
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "URL malformato" }, { status: 400 });
    }

    const result = await extractUrl(url);

    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Errore sconosciuto";
    console.error("Extraction error:", error);
    return NextResponse.json({ error: "Errore durante l'estrazione: " + message }, { status: 500 });
  }
}