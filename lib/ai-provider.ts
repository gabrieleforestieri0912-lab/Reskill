import { createOpenAI } from "@ai-sdk/openai";

/**
 * Provider AI unico: Xkiro (OpenAI-compatible).
 *
 * La chiave vera verrà fornita in futuro via env:
 *   XKIRO_API_KEY=...
 *   XKIRO_BASE_URL=https://api.xkiro.ai/v1   (default)
 *   XKIRO_MODEL=xkiro-default                (default)
 *
 * Tutti gli altri provider/modelli precedenti (GPT-4o, GPT-4.1, ecc.)
 * sono stati rimossi: esiste un solo provider e un solo modello.
 */

const XKIRO_BASE_URL =
  process.env.XKIRO_BASE_URL || "https://api.xkiro.ai/v1";

export const XKIRO_MODEL =
  process.env.XKIRO_MODEL || "xkiro-default";

export const AI_PROVIDER_ID = "xkiro" as const;

export function getXkiroApiKey(): string | null {
  return (
    process.env.XKIRO_API_KEY ||
    // retro-compat: se esiste ancora OPENAI_API_KEY usala come fallback temporaneo
    process.env.OPENAI_API_KEY ||
    null
  );
}

export function isXkiroConfigured(): boolean {
  return !!getXkiroApiKey();
}

/**
 * Ritorna un client OpenAI-compatible puntato a Xkiro,
 * utilizzabile con `streamText({ model: xkiro(modelName) })` di `ai`.
 */
export function createXkiroClient() {
  const apiKey = getXkiroApiKey();
  if (!apiKey) {
    throw new Error(
      "Chiave API Xkiro non configurata. Imposta XKIRO_API_KEY nelle variabili d'ambiente."
    );
  }
  return createOpenAI({ apiKey, baseURL: XKIRO_BASE_URL });
}

/** Nome modello unico da usare in tutta l'app. */
export function getXkiroModelName(): string {
  return XKIRO_MODEL;
}
