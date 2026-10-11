export const runtime = 'nodejs';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { getUserEmailOrNull } from "@/lib/auth-helper";
import { checkGenerationAllowed, getHourlyLimit } from "@/lib/plan-guards";
import { checkRateLimit } from "@/lib/rate-limit";

export const maxDuration = 60;

const SYSTEM_PROMPT = `Sei un AI Developer Expert specializzato nell'estrarre conoscenza strutturata da contenuti web e trasformarla in "Skill" Markdown per agenti AI.

STRUTTURA DELLA SKILL (rispetta sempre questo formato):
1. **Frontmatter YAML** (tra ---) con i campi:
   - name: identificativo unico (kebab-case)
   - description: frase che descrive quando usare questa skill
   - trigger: condizioni precise che attivano questa conoscenza nell'agente AI
   - tags: [3-5 parole chiave]
   - source: URL della fonte originale
   - version: 1.0.0

2. **Sezione "Principi Fondamentali"** — I concetti chiave da assimilare

3. **Sezione "Regole e Best Practice"** — Regole concrete, actionabili, con esempi

4. **Sezione "Pattern e Implementazione"** — Pattern di codice, configurazioni, templates (se applicabile)

5. **Sezione "Cosa NON Fare"** — Vincoli negativi, anti-pattern da evitare

6. **Sezione "Esempi Pratici"** — Esempi concreti di input/output o casi d'uso

REGOLE FONDAMENTALI:
- Scrivi solo Markdown valido, senza preamboli, senza commenti finali
- Sii concreto e specifico: ogni regola deve descrivere un'azione precisa
- I trigger devono essere matching conditions che un agente AI può valutare a runtime
- Includi sempre esempi di codice o configurazione quando pertinente
- Organizza il contenuto per livelli: base → intermedio → avanzato
- Non superare i 2000 token di output`;

const MODEL_MAP: Record<string, string> = {
  "gpt-4o-mini": "gpt-4o-mini",
  "gpt-4o": "gpt-4o",
  "gpt-4.1-nano": "gpt-4.1-nano",
  "gpt-4.1-mini": "gpt-4.1-mini",
  "gpt-4.1": "gpt-4.1",
};

export async function POST(req: Request) {
  try {
    const userEmail = await getUserEmailOrNull(req);

    const guard = await checkGenerationAllowed(userEmail);
    if (!guard.allowed) {
      return new Response(
        JSON.stringify({
          error: guard.reason,
          upgrade: true,
          creditsUsed: guard.creditsUsed,
          creditsTotal: guard.creditsTotal,
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const hourlyLimit = getHourlyLimit(guard.planId);
    const rateKey = `gen:${userEmail || "guest"}`;
    if (!await checkRateLimit(rateKey, hourlyLimit, 60 * 60 * 1000)) {
      return new Response(
        JSON.stringify({
          error: `Limite orario raggiunto per il piano ${guard.planName}. Riprova più tardi o effettua l'upgrade.`,
          upgrade: true,
          planId: guard.planId,
          hourlyLimit,
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    const { prompt, sourcesSummary, model: requestedModel } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "Chiave API OpenAI non configurata. Contatta l'amministratore.",
          upgrade: false,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const modelName = MODEL_MAP[requestedModel] || "gpt-4o-mini";

    const openai = createOpenAI({ apiKey });

    const result = await streamText({
      model: openai(modelName),
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Ecco le fonti estratte:\n\n${sourcesSummary}\n\nGenera una Skill Markdown unificata, coesa e professionale per l'argomento: "${prompt}".`,
        },
      ],
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    const errorMessage = error?.message || "Errore sconosciuto";
    const stream = new ReadableStream({
      async start(controller) {
        const message = `> **⚠️ Errore di generazione AI**\n\nSi è verificato un errore durante la generazione della skill: ${errorMessage}\n\nVerifica che la chiave API sia valida e che il modello selezionato sia disponibile.`;
        const words = message.split(" ");
        for (const word of words) {
          controller.enqueue(new TextEncoder().encode(word + " "));
          await new Promise((r) => setTimeout(r, 30));
        }
        controller.close();
      },
    });
    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}
