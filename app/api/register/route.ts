import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail, createUser } from "@/models/User";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email e password obbligatorie" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password almeno 6 caratteri" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`register:${ip}`, 3, 300_000)) {
      return NextResponse.json({ error: "Troppe richieste. Riprova tra 5 minuti." }, { status: 429 });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Email già registrata" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await createUser({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name || "",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Errore durante la registrazione" }, { status: 500 });
  }
}
