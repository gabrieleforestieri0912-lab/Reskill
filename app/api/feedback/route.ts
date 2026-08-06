import { NextResponse } from "next/server";
import { createFeedback } from "@/models/Feedback";

export async function POST(req: Request) {
  try {
    const { name, email, type, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Tutti i campi obbligatori sono richiesti" }, { status: 400 });
    }

    await createFeedback({ name, email, type, message });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Errore durante l'invio del feedback" }, { status: 500 });
  }
}
