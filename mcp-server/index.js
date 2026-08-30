#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const args = process.argv.slice(2);

function argValue(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

const token = argValue("--token") || process.env.RESKILL_TOKEN;
const apiKey = process.env.RESKILL_API_KEY;
const apiUrl = (
  argValue("--api-url") ||
  process.env.RESKILL_API_URL ||
  "https://reskill.app"
).replace(/\/+$/, "");

const credential = token || apiKey;
if (!credential) {
  console.error(
    "Nessun token MCP (--token) o API key (RESKILL_API_KEY) fornito."
  );
  console.error("Esempio: npx @reskill/mcp-server --token sg_mcp_...");
  process.exit(1);
}

const server = new McpServer({ name: "reskill", version: "1.0.0" });

async function rpc(method, params = {}) {
  const res = await fetch(`${apiUrl}/api/mcp/rpc`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": credential,
    },
    body: JSON.stringify({ method, params }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    const msg = data && data.error ? data.error : `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

server.tool(
  "list_buckets",
  "Elenca tutti i bucket Reskill dell'utente con i relativi metadati (nome, descrizione, numero di fonti).",
  {},
  async () => {
    const buckets = await rpc("list_buckets");
    const text =
      buckets.length === 0
        ? "Nessun bucket trovato. Crea un bucket nel workspace Reskill per iniziare."
        : buckets
            .map(
              (b) =>
                `- ${b.name} (${b.sourceCount} fonti)\n  id: ${b.id}\n  descrizione: ${b.description}`
            )
            .join("\n");
    return { content: [{ type: "text", text }] };
  }
);

server.tool(
  "search_sources",
  "Cerca fonti all'interno dei bucket Reskill usando una query testuale. Supporta filtri per bucket.",
  {
    query: z
      .string()
      .describe("Testo da cercare nei titoli e nei contenuti delle fonti"),
    bucketId: z
      .string()
      .optional()
      .describe("ID del bucket in cui filtrare la ricerca"),
  },
  async ({ query, bucketId }) => {
    const sources = await rpc("search_sources", { query, bucketId });
    const text =
      sources.length === 0
        ? `Nessuna fonte trovata per "${query}".`
        : sources
            .map((s) => {
              const preview =
                (s.content || "").length > 300
                  ? s.content.slice(0, 300) + "\u2026"
                  : s.content;
              return `- [${s.type}] ${s.title}\n  url: ${s.url}\n  bucket: ${s.bucketName || ""}\n  ${preview}`;
            })
            .join("\n");
    return { content: [{ type: "text", text }] };
  }
);

server.tool(
  "capture_webpage",
  "Cattura il contenuto di una pagina web e lo salva come nuova fonte in un bucket. Supporta YouTube, X, Reddit, PDF e pagine web generiche.",
  {
    url: z.string().describe("URL della pagina da catturare"),
    bucketName: z.string().describe("Nome del bucket di destinazione"),
  },
  async ({ url, bucketName }) => {
    const source = await rpc("capture_webpage", { url, bucketName });
    return {
      content: [
        {
          type: "text",
          text: `Fonte salvata:\n- Titolo: ${source.title}\n- Tipo: ${source.type}\n- URL: ${source.url}\n- Bucket: ${bucketName}\n- ID: ${source.id}`,
        },
      ],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);