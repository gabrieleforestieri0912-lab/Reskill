export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";
import { getUserEmailOrNull } from "@/lib/auth-helper";
import { checkRateLimit } from "@/lib/rate-limit";

export const maxDuration = 30;

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

const NOISE_SELECTORS = [
  "script", "style", "nav", "footer", "header", "aside", "noscript",
  "iframe", "svg", "form", ".cookie", ".popup", ".modal", ".ad",
  "[role='dialog']", "[aria-hidden='true']",
];

/**
 * Equivalente web della "pulizia intelligente" dell'estensione:
 * incolli HTML grezzo (o un frammento di pagina) e ricevi Markdown pulito.
 */
export async function POST(req: Request) {
  try {
    const userEmail = await getUserEmailOrNull(req);
    if (!userEmail) {
      return NextResponse.json({ error: "Autenticazione richiesta" }, { status: 401 });
    }

    const rateKey = `htmlmd:${userEmail}`;
    if (!await checkRateLimit(rateKey, 20, 60 * 1000)) {
      return NextResponse.json(
        { error: "Troppe richieste. Riprova tra qualche secondo." },
        { status: 429 }
      );
    }

    const { html, url } = await req.json();

    if (!html || typeof html !== "string" || html.trim().length < 20) {
      return NextResponse.json({ error: "Incolla un frammento HTML valido (almeno 20 caratteri)." }, { status: 400 });
    }
    if (html.length > 500_000) {
      return NextResponse.json({ error: "HTML troppo grande (max 500KB)." }, { status: 400 });
    }

    const baseUrl = (() => {
      try {
        return url && typeof url === "string" ? new URL(url).href : "https://reskill.app/pasted";
      } catch {
        return "https://reskill.app/pasted";
      }
    })();

    const dom = new JSDOM(html, { url: baseUrl });
    const doc = dom.window.document;

    for (const sel of NOISE_SELECTORS) {
      try {
        doc.querySelectorAll(sel).forEach((el: Element) => el.remove());
      } catch { /* selettore non valido per querySelectorAll, ignora */ }
    }

    let title = doc.querySelector("title")?.textContent?.trim() || "Contenuto incollato";
    let markdown = "";

    try {
      const reader = new Readability(dom.window.document);
      const article = reader.parse();
      if (article?.content) {
        title = article.title || title;
        markdown = turndownService.turndown(article.content);
      }
    } catch { /* fallback sotto */ }

    if (!markdown.trim()) {
      const paragraphs: string[] = [];
      doc.querySelectorAll("h1, h2, h3, p, li, pre, blockquote").forEach((el: Element) => {
        const text = el.textContent?.trim();
        if (text && text.length > 1) {
          const tag = el.tagName.toLowerCase();
          if (tag === "h1") paragraphs.push(`# ${text}`);
          else if (tag === "h2") paragraphs.push(`## ${text}`);
          else if (tag === "h3") paragraphs.push(`### ${text}`);
          else if (tag === "li") paragraphs.push(`- ${text}`);
          else if (tag === "pre") paragraphs.push(`\`\`\`\n${text}\n\`\`\``);
          else if (tag === "blockquote") paragraphs.push(`> ${text}`);
          else paragraphs.push(text);
        }
      });
      markdown = paragraphs.join("\n\n") || turndownService.turndown(doc.body?.innerHTML || html);
    }

    const date = new Date().toLocaleDateString("it-IT");
    const content =
      `# ${title}\n\n**Data Estrazione:** ${date}\n` +
      (url ? `**URL di riferimento:** ${url}\n` : "") +
      `\n## Contenuto Principale\n\n${markdown.trim()}\n`;

    return NextResponse.json({
      success: true,
      type: "pasted-html",
      title,
      url: url || null,
      domain: "pasted-html",
      date,
      content,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Errore sconosciuto";
    console.error("HTML-to-markdown error:", error);
    return NextResponse.json({ error: "Errore durante la pulizia: " + message }, { status: 500 });
  }
}
