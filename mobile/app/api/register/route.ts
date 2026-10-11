export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail, createUser } from "@/models/User";
import { checkRateLimit } from "@/lib/rate-limit";

function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password di almeno 8 caratteri";
  if (!/[A-Z]/.test(password)) return "Almeno una lettera maiuscola";
  if (!/[a-z]/.test(password)) return "Almeno una lettera minuscola";
  if (!/[0-9]/.test(password)) return "Almeno un numero";
  return null;
}

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email e password obbligatorie" }, { status: 400 });
    }

    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email non valida" }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!await checkRateLimit(`register:${ip}`, 3, 300_000)) {
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
      name: (typeof name === "string" ? name : "").slice(0, 100),
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Errore durante la registrazione";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
