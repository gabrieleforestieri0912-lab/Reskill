import { NextResponse } from "next/server";
import { Resend } from "resend";
import { storeCode } from "@/lib/verify-codes";
import { checkRateLimit } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const isDev = process.env.NODE_ENV !== "production";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Email non valida" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`send-code:${ip}`, 5, 60_000)) {
      return NextResponse.json({ error: "Troppe richieste. Riprova tra un minuto." }, { status: 429 });
    }
    if (!checkRateLimit(`send-code-email:${email.toLowerCase()}`, 3, 600_000)) {
      return NextResponse.json({ error: "Troppi codici inviati a questa email. Riprova tra 10 minuti." }, { status: 429 });
    }

    const code = generateCode();
    await storeCode(email.trim(), code);

    const from = process.env.SMTP_FROM || "Skillgrowth <noreply@skillgrowth.app>";

    console.log(`[EMAIL] Codice di verifica per ${email.trim()}: ${code}`);

    try {
      await resend.emails.send({
        from,
        to: email.trim(),
        subject: "Codice di verifica Skillgrowth",
        text: `Il tuo codice di verifica Skillgrowth è: ${code}\n\nIl codice è valido per 1 minuto.\n\nSe non hai richiesto questo codice, ignora questa email.`,
        html: `
          <div style="font-family: 'JetBrains Mono', ui-monospace, monospace; background:oklch(13% 0.006 260); color:oklch(98.5% 0.002 260); padding:32px; max-width:480px; margin:0 auto; border-radius:12px; border:1px solid rgba(77,138,150,0.2);">
            <h1 style="font-size:18px;color:oklch(98.5% 0.002 260);margin:0 0 4px;">Skillgrowth</h1>
            <p style="font-size:12px;color:oklch(60% 0.01 260);margin:0 0 20px;">Codice di verifica estensione browser</p>
            <div style="background:oklch(13% 0.006 260);border:1px solid rgba(77,138,150,0.25);border-radius:10px;padding:16px;text-align:center;">
              <p style="font-size:11px;color:oklch(60% 0.01 260);margin:0 0 8px;">Il tuo codice di verifica:</p>
              <p style="font-size:28px;font-weight:700;letter-spacing:8px;color:oklch(98.5% 0.002 260);margin:0;font-family:'JetBrains Mono',ui-monospace,monospace;">${code}</p>
            </div>
            <p style="font-size:10px;color:oklch(60% 0.01 260);margin-top:16px;">Codice valido per 1 minuto. Se non hai richiesto questo codice, ignora questa email.</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("[EMAIL] Resend non disponibile, usa il codice stampato sopra.");
    }

    return NextResponse.json({
      sent: true,
      message: "Codice inviato all'email",
      ...(isDev && { devCode: code }),
    });
  } catch (err) {
    console.error("send-code error:", err);
    return NextResponse.json({
      error: isDev
        ? `Errore nell'invio dell'email (Resend). Controlla il terminale per il codice.`
        : "Errore nell'invio dell'email",
    }, { status: 500 });
  }
}
