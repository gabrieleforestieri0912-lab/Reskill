export const runtime = "nodejs";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { getUserEmailOrNull } from "@/lib/auth-helper";
import { checkRateLimit } from "@/lib/rate-limit";
import { convertYouTubeToMarkdown } from "@/lib/youtube";

export async function POST(req: Request) {
  try {
    const userEmail = await getUserEmailOrNull(req);
    if (!userEmail) {
      return NextResponse.json({ error: "Autenticazione richiesta" }, { status: 401 });
    }

    if (!(await checkRateLimit(`ytmd:${userEmail}`, 10, 60 * 1000))) {
      return NextResponse.json(
        { error: "Troppe richieste. Riprova tra qualche secondo." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const url = body?.url;
    const maxVideos = Math.min(Math.max(Number(body?.maxVideos) || 30, 1), 100);

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL non valido" }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ error: "URL malformato" }, { status: 400 });
    }

    if (!/youtube\.com|youtu\.be/i.test(parsed.hostname)) {
      return NextResponse.json(
        { error: "L'URL deve essere un video, playlist o canale YouTube." },
        { status: 400 }
      );
    }

    const result = await convertYouTubeToMarkdown(url, maxVideos);

    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Errore sconosciuto";
    console.error("YouTube-to-markdown error:", error);
    return NextResponse.json(
      { error: "Errore durante la conversione: " + message },
      { status: 500 }
    );
  }
}
