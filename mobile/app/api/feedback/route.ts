export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { createFeedback } from "@/models/Feedback";
import { checkRateLimit } from "@/lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!await checkRateLimit(`feedback:${ip}`, 3, 60 * 1000)) {
      return NextResponse.json(
        { error: "Troppe richieste. Riprova tra qualche secondo." },
        { status: 429 }
      );
    }

    const { name, email, type, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Tutti i campi obbligatori sono richiesti" }, { status: 400 });
    }

    if (typeof name !== "string" || name.length > 100) {
      return NextResponse.json({ error: "Nome non valido" }, { status: 400 });
    }

    if (typeof email !== "string" || !EMAIL_REGEX.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Email non valida" }, { status: 400 });
    }

    if (typeof message !== "string" || message.length < 10 || message.length > 2000) {
      return NextResponse.json({ error: "Il messaggio deve essere tra 10 e 2000 caratteri" }, { status: 400 });
    }

    const validTypes = ["bug", "feature", "feedback", "other"];
    if (type && !validTypes.includes(type)) {
      return NextResponse.json({ error: "Tipo non valido" }, { status: 400 });
    }

    await createFeedback({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      type: type || "other",
      message: message.trim(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Errore durante l'invio del feedback" }, { status: 500 });
  }
}
