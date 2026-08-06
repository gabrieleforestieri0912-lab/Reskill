"use client";

import Link from "next/link";
import { useTranslation } from "@/translations";
import { useState } from "react";

const codeExamples = {
  cursor: `{
  "mcpServers": {
    "skillgrowth": {
      "command": "npx",
      "args": [
        "-y",
        "@skillgrowth/mcp-server",
        "--token",
        "YOUR_SKILLGROWTH_TOKEN"
      ]
    }
  }
}`,
  claude: `{
  "mcpServers": {
    "skillgrowth": {
      "command": "npx",
      "args": [
        "-y",
        "@skillgrowth/mcp-server",
        "--token",
        "YOUR_SKILLGROWTH_TOKEN"
      ]
    }
  }
}`,
  windsurf: `{
  "mcpServers": {
    "skillgrowth": {
      "command": "npx",
      "args": [
        "-y",
        "@skillgrowth/mcp-server",
        "--token",
        "YOUR_SKILLGROWTH_TOKEN"
      ]
    }
  }
}`,
  docker: `docker run \\
  -e SKILLGROWTH_API_KEY=la_tua_chiave_api \\
  skillgrowth/mcp-server`,
  claude_code: `{
  "mcpServers": {
    "skillgrowth": {
      "command": "npx",
      "args": [
        "-y",
        "@skillgrowth/mcp-server",
        "--token",
        "YOUR_SKILLGROWTH_TOKEN"
      ]
    }
  }
}`,
};

const toolDefinitions = [
  {
    name: "list_buckets",
    description: "Elenca tutti i tuoi bucket Skillgrowth con i relativi metadati (nome, descrizione, numero di fonti).",
    input: "Nessun parametro richiesto",
    output: "Array di oggetti Bucket con id, name, description, sourceCount, createdAt",
    example: "L'agente chiede 'Quali bucket ho disponibili?' e il server restituisce l'elenco completo.",
  },
  {
    name: "search_sources",
    description: "Cerca fonti all'interno dei tuoi bucket usando una query testuale. Supporta filtri per bucket.",
    input: "query (stringa) — testo da cercare; bucketId (opzionale) — filtra per bucket specifico",
    output: "Array di oggetti Source con id, title, url, type, domain, date, bucketName, content",
    example: "L'agente cerca 'architettura React' e trova tutte le fonti pertinenti nei tuoi bucket.",
  },
  {
    name: "capture_webpage",
    description: "Cattura il contenuto di una pagina web e lo salva come nuova fonte in un bucket. Supporta YouTube, X, Reddit, PDF e pagine web generiche.",
    input: "url (stringa) — URL della pagina da catturare; bucketName (stringa) — nome del bucket di destinazione",
    output: "Oggetto Source con id, title, url, type, domain, date",
    example: "L'utente chiede 'Salva questo articolo nel bucket Architettura' e l'agente esegue capture_webpage.",
  },
];

const troubleshootingItems = [
  {
    problem: "npx non trovato",
    cause: "Node.js non è installato o non è nel PATH di sistema.",
    solution: "Installa Node.js (versione 18+) da nodejs.org. Verifica con `node --version` e `npx --version`.",
  },
  {
    problem: "Errore 'Invalid token'",
    cause: "Il token MCP non è valido o è scaduto.",
    solution: "Vai su Account > Connessioni Agenti AI e genera un nuovo token. Copialo esattamente senza spazi extra.",
  },
  {
    problem: "Nessun bucket trovato dal client MCP",
    cause: "Il server MCP è connesso ma non ci sono bucket visibili.",
    solution: "Assicurati di aver creato almeno un bucket nel workspace. Se il problema persiste, rigenera il token.",
  },
  {
    problem: "Cursor non riconosce il server MCP",
    cause: "File di configurazione in posizione errata o JSON malformato.",
    solution: "Verifica che il file sia in .cursor/mcp.json o in Cursor Settings > MCP. Controlla la validità del JSON con un validatore online.",
  },
  {
    problem: "Claude Desktop non trova il server",
    cause: "Il file claude_desktop_config.json non è nella posizione corretta.",
    solution: "Apri Claude Desktop > Settings > Developer > Edit Config. Incolla la configurazione e riavvia Claude Desktop.",
  },
  {
    problem: "Il server parte ma si blocca dopo pochi secondi",
    cause: "Timeout di connessione o rate limiting dell'API.",
    solution: "Verifica la tua connessione internet. Se usi un VPN, prova a disabilitarlo. Contatta il supporto se il problema persiste.",
  },
  {
    problem: "Docker: 'command not found'",
    cause: "Docker non è installato o il demone non è in esecuzione.",
    solution: "Installa Docker Desktop da docker.com. Assicurati che il demone sia in esecuzione (docker ps).",
  },
  {
    problem: "API Key vs Token: quale usare?",
    cause: "Confusione tra i due tipi di credenziali.",
    solution: "Usa il flag `--token` per il token MCP (generato dalla pagina Connessioni). Usa `-e SKILLGROWTH_API_KEY` per l'API key (generata dalla sezione API Keys della stessa pagina).",
  },
];

const faqItems = [
  {
    q: "MCP funziona solo con Cursor, Claude e Windsurf?",
    a: "No. MCP è un protocollo aperto supportato da molti client: Continue.dev, Claude Code, GitHub Copilot, Zed, Visual Studio Code (con estensioni MCP), e qualsiasi tool che implementi il protocollo MCP.",
  },
  {
    q: "I dati dei miei bucket vengono inviati a server esterni?",
    a: "No. Il server MCP di Skillgrowth viene eseguito localmente sul tuo computer tramite npx o Docker. I dati vengono scambiati direttamente tra il client MCP (il tuo IDE) e il server locale. Le chiamate API a Skillgrowth avvengono solo per autenticare il token e recuperare i dati dei bucket.",
  },
  {
    q: "Posso usare MCP senza un account Skillgrowth?",
    a: "No. Devi avere un account Skillgrowth e almeno un bucket con delle fonti. Il server MCP autentica le richieste tramite il tuo token personale.",
  },
  {
    q: "Quanto costa il server MCP?",
    a: "Il server MCP è gratuito per tutti i piani, incluso Free. I limiti di utilizzo dipendono dal tuo piano (numero di bucket, fonti, richieste API).",
  },
  {
    q: "Il server MCP rallenta il mio IDE?",
    a: "No. Il server MCP viene eseguito come processo separato e pesa circa 30-50 MB di RAM. Non influisce sulle prestazioni del tuo IDE.",
  },
  {
    q: "Cosa succede se il mio token viene compromesso?",
    a: "Puoi revocare il token immediatamente dalla pagina Connessioni Agenti AI e generararne uno nuovo. I token hanno scadenza configurabile.",
  },
  {
    q: "Posso connettere più IDE allo stesso token?",
    a: "Sì, lo stesso token può essere usato su più client MCP contemporaneamente. Ogni client vedrà gli stessi bucket e fonti.",
  },
  {
    q: "MCP supporta strumenti personalizzati?",
    a: "Attualmente il server espone list_buckets, search_sources e capture_webpage. Se hai bisogno di strumenti aggiuntivi, contattaci.",
  },
];

export default function McpPage() {
  const { t } = useTranslation();
  const [activeConfig, setActiveConfig] = useState<"cursor" | "claude" | "windsurf" | "docker" | "claude_code">("cursor");
  const [activeTab, setActiveTab] = useState<"config" | "troubleshooting" | "faq">("config");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeExamples[activeConfig]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[oklch(13% 0.006 260)] text-[oklch(98.5%_0.002_260)] pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-16">
          <span className="text-[12px] font-bold uppercase tracking-wider text-[oklch(72%_0.06_240)]/80 bg-[oklch(13%_0.006_260)]/40 px-3 py-1.5 border border-[oklch(60%_0.01_260)]/15">
            {t.mcp.badge}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-4 tracking-tight">
            {t.mcp.title}
          </h1>
          <p className="text-base text-[oklch(60%_0.01_260)] mt-3 max-w-2xl mx-auto leading-relaxed">
            {t.mcp.subtitle}
          </p>
        </div>

        {/* Architecture Diagram */}
        <section className="mb-20">
          <div className="p-8 bg-[oklch(13% 0.006 260)] border border-[oklch(60%_0.01_260)]/15">
            <h2 className="text-xl font-bold text-white mb-4"><span className="text-[oklch(72%_0.06_240)]">Cos'è</span> MCP?</h2>
            <p className="text-sm text-[oklch(60%_0.01_260)] leading-relaxed mb-6">{t.mcp.intro_text}</p>

            <div className="p-6 bg-black/40 border border-white/6 font-mono text-xs leading-relaxed overflow-x-auto mb-6">
              <pre className="text-[oklch(60%_0.01_260)]">
{`┌────────────────────────────────────────────────────────────────┐
│                      Il tuo Computer                          │
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐ │
│  │  AI Model     │───▶│  MCP Client  │───▶│  MCP Server      │ │
│  │  (Claude/     │    │  (Cursor /   │    │  Skillgrowth     │ │
│  │   GPT / LLM)  │    │   Windsurf)  │    │  (locale npx)    │ │
│  └──────────────┘    └──────────────┘    └────────┬─────────┘ │
│                                                    │           │
│                                          ┌─────────▼─────────┐ │
│                                          │  API Skillgrowth  │ │
│                                          │  (Cloud HTTPS)    │ │
│                                          └─────────┬─────────┘ │
│                                                    │           │
│                                          ┌─────────▼─────────┐ │
│                                          │  Tuoi Bucket &    │ │
│                                          │  Fonti (DB)       │ │
│                                          └───────────────────┘ │
└────────────────────────────────────────────────────────────────┘`}
              </pre>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-white/2 border border-white/6">
                <h4 className="font-semibold text-white mb-1.5">1. Il tuo IDE (Client MCP)</h4>
                <p className="text-[oklch(60%_0.01_260)] leading-relaxed">Cursor, Windsurf, Claude Desktop eseguono il server MCP come processo figlio. Scoprono i tool disponibili all'avvio tramite il protocollo MCP.</p>
              </div>
              <div className="p-4 bg-white/2 border border-white/6">
                <h4 className="font-semibold text-white mb-1.5">2. Server MCP (Locale)</h4>
                <p className="text-[oklch(60%_0.01_260)] leading-relaxed">npx esegue @skillgrowth/mcp-server in locale. Il server si autentica con il tuo token e interroga l'API Skillgrowth per conto tuo.</p>
              </div>
              <div className="p-4 bg-white/2 border border-white/6">
                <h4 className="font-semibold text-white mb-1.5">3. API Skillgrowth (Cloud)</h4>
                <p className="text-[oklch(60%_0.01_260)] leading-relaxed">L'API restituisce i dati dei tuoi bucket. Il server MCP li espone come tool strutturati con schemi tipizzati JSON Schema.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Prerequisiti */}
        <section className="mb-20">
          <h2 className="text-xl font-bold text-white mb-8 text-center"><span className="text-[oklch(72%_0.06_240)]">Prere</span>quisiti</h2>
          <div className="p-6 bg-[oklch(13% 0.006 260)] border border-white/6">
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <span className="w-7 h-7 bg-[oklch(13%_0.006_260)]/60 text-[oklch(72%_0.06_240)] border border-[oklch(60%_0.01_260)]/20 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <div>
                  <h4 className="font-semibold text-sm text-white mb-0.5">Account Skillgrowth</h4>
                  <p className="text-xs text-[oklch(60%_0.01_260)] leading-relaxed">Registrati su Skillgrowth e crea almeno un bucket con delle fonti. Il server MCP legge i tuoi bucket per esporli come tool.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <span className="w-7 h-7 bg-[oklch(13%_0.006_260)]/60 text-[oklch(72%_0.06_240)] border border-[oklch(60%_0.01_260)]/20 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <div>
                  <h4 className="font-semibold text-sm text-white mb-0.5">Token MCP</h4>
                  <p className="text-xs text-[oklch(60%_0.01_260)] leading-relaxed">Vai su <Link href="/account/connections" className="text-[oklch(72%_0.06_240)] underline underline-offset-2 hover:opacity-80">Account → Connessioni Agenti AI</Link> e genera il tuo token MCP. Copialo in un posto sicuro.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <span className="w-7 h-7 bg-[oklch(13%_0.006_260)]/60 text-[oklch(72%_0.06_240)] border border-[oklch(60%_0.01_260)]/20 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <div>
                  <h4 className="font-semibold text-sm text-white mb-0.5">Node.js 18+ (o Docker)</h4>
                  <p className="text-xs text-[oklch(60%_0.01_260)] leading-relaxed">Il server MCP viene eseguito tramite npx, che richiede <span className="text-[oklch(72%_0.06_240)]">Node.js 18</span> o superiore. In alternativa, puoi usare Docker. Verifica con <code className="bg-black/30 px-1.5 py-0.5 text-[oklch(72%_0.06_240)]">node --version</code>.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <span className="w-7 h-7 bg-[oklch(13%_0.006_260)]/60 text-[oklch(72%_0.06_240)] border border-[oklch(60%_0.01_260)]/20 flex items-center justify-center text-xs font-bold shrink-0">4</span>
                <div>
                  <h4 className="font-semibold text-sm text-white mb-0.5">Client MCP Supportato</h4>
                  <p className="text-xs text-[oklch(60%_0.01_260)] leading-relaxed">Assicurati di avere un client MCP compatibile: Cursor (versione 0.45+), Claude Desktop, Windsurf, o Claude Code.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works (con passaggi estesi) */}
        <section className="mb-20">
          <h2 className="text-xl font-bold text-white mb-8 text-center">Come <span className="text-[oklch(72%_0.06_240)]">Funziona</span></h2>
          <div className="grid md:grid-cols-3 gap-5">
            <div className="p-6 bg-white/2 border border-white/6">
              <span className="w-8 h-8 bg-[oklch(13%_0.006_260)]/60 text-[oklch(72%_0.06_240)] border border-[oklch(60%_0.01_260)]/20 flex items-center justify-center text-sm font-bold mb-4">1</span>
              <h4 className="font-semibold text-sm text-white mb-2">{t.mcp.step1_title}</h4>
              <p className="text-xs text-[oklch(60%_0.01_260)] leading-relaxed mb-3">{t.mcp.step1_desc}</p>
              <div className="bg-black/30 p-2.5 font-mono text-[11px] text-[oklch(60%_0.01_260)]">
                npx -y @skillgrowth/mcp-server --token YOUR_TOKEN
              </div>
            </div>
            <div className="p-6 bg-white/2 border border-white/6">
              <span className="w-8 h-8 bg-[oklch(13%_0.006_260)]/60 text-[oklch(72%_0.06_240)] border border-[oklch(60%_0.01_260)]/20 flex items-center justify-center text-sm font-bold mb-4">2</span>
              <h4 className="font-semibold text-sm text-white mb-2">{t.mcp.step2_title}</h4>
              <p className="text-xs text-[oklch(60%_0.01_260)] leading-relaxed mb-3">{t.mcp.step2_desc}</p>
              <div className="bg-black/30 p-2.5 font-mono text-[11px] text-[oklch(60%_0.01_260)]">
                Aggiungi la configurazione JSON al tuo IDE
              </div>
            </div>
            <div className="p-6 bg-white/2 border border-white/6">
              <span className="w-8 h-8 bg-[oklch(13%_0.006_260)]/60 text-[oklch(72%_0.06_240)] border border-[oklch(60%_0.01_260)]/20 flex items-center justify-center text-sm font-bold mb-4">3</span>
              <h4 className="font-semibold text-sm text-white mb-2">{t.mcp.step3_title}</h4>
              <p className="text-xs text-[oklch(60%_0.01_260)] leading-relaxed mb-3">{t.mcp.step3_desc}</p>
              <div className="bg-black/30 p-2.5 font-mono text-[11px] text-[oklch(60%_0.01_260)]">
                Esempio: "Cerca nei miei bucket informazioni su React hooks"
              </div>
            </div>
          </div>
        </section>

        {/* Guida all'installazione dettagliata */}
        <section className="mb-20">
          <h2 className="text-xl font-bold text-white mb-8 text-center">Guida all&apos;<span className="text-[oklch(72%_0.06_240)]">Installazione</span> Dettagliata</h2>

          <div className="p-6 bg-[oklch(13% 0.006 260)] border border-white/6">
            <h3 className="text-base font-bold text-white mb-4">1. Genera il tuo <span className="text-[oklch(72%_0.06_240)]">Token</span> MCP</h3>
            <p className="text-xs text-[oklch(60%_0.01_260)] leading-relaxed mb-4">
              Il token MCP è la tua chiave di autenticazione. Collega il tuo account Skillgrowth al server MCP locale.
            </p>
            <ol className="space-y-2 text-xs text-[oklch(60%_0.01_260)] list-decimal list-inside leading-relaxed">
              <li>Accedi a Skillgrowth e vai su <strong className="text-white">Account → Connessioni Agenti AI</strong></li>
              <li>Nella sezione <strong className="text-white">Server MCP</strong>, clicca su <strong className="text-white">Genera Token</strong></li>
              <li>Copia il token generato (inizia con <code className="bg-black/30 px-1 text-[oklch(72%_0.06_240)]">sg_mcp_</code>)</li>
              <li>Conservalo in un posto sicuro — non verrà mostrato di nuovo</li>
            </ol>
          </div>

          <div className="mt-5 p-6 bg-[oklch(13% 0.006 260)] border border-white/6">
            <h3 className="text-base font-bold text-white mb-4">2. Configura il tuo <span className="text-[oklch(72%_0.06_240)]">Client</span> MCP</h3>

            <div className="flex border-b border-white/6 mb-6 text-xs">
              {[
                { key: "cursor" as const, label: "Cursor" },
                { key: "claude" as const, label: "Claude Desktop" },
                { key: "windsurf" as const, label: "Windsurf" },
                { key: "claude_code" as const, label: "Claude Code" },
                { key: "docker" as const, label: "Docker" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveConfig(tab.key)}
                  className={`pb-2.5 px-4 border-b-2 font-medium transition-all ${
                    activeConfig === tab.key
                      ? "border-[oklch(60%_0.06_240)] text-[oklch(72%_0.06_240)]"
                      : "border-transparent text-[oklch(60%_0.01_260)] hover:text-[oklch(98.5%_0.002_260)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeConfig === "cursor" && (
              <div className="text-xs text-[oklch(60%_0.01_260)] leading-relaxed space-y-3">
                <p><strong className="text-[oklch(72%_0.06_240)]">Metodo 1 — Globale (consigliato):</strong></p>
                <ol className="list-decimal list-inside space-y-1.5">
                  <li>Apri <strong className="text-white">Cursor</strong></li>
                  <li>Vai su <strong className="text-white">Cursor Settings → MCP</strong> (o <code className="bg-black/30 px-1">Cmd+Shift+P</code> → &quot;MCP: Add Server&quot;)</li>
                  <li>Incolla la configurazione qui sotto nel file <code className="bg-black/30 px-1">.cursor/mcp.json</code> della tua home</li>
                  <li>Sostituisci <code className="bg-black/30 px-1 text-[oklch(72%_0.06_240)]">YOUR_SKILLGROWTH_TOKEN</code> con il tuo token</li>
                  <li>Riavvia Cursor per attivare il server MCP</li>
                </ol>
                <p className="mt-3"><strong className="text-[oklch(72%_0.06_240)]">Metodo 2 — Per progetto:</strong></p>
                <p>Crea un file <code className="bg-black/30 px-1">.cursor/mcp.json</code> nella radice del tuo progetto con la stessa configurazione.</p>
                <p className="mt-3">Dopo il riavvio, vedrai l&apos;icona MCP nella barra in basso di Cursor. Se è verde, il server è connesso.</p>
              </div>
            )}

            {activeConfig === "claude" && (
              <div className="text-xs text-[oklch(60%_0.01_260)] leading-relaxed space-y-3">
                <ol className="list-decimal list-inside space-y-1.5">
                  <li>Apri <strong className="text-white">Claude Desktop</strong></li>
                  <li>Vai su <strong className="text-white">Settings → Developer → Edit Config</strong></li>
                  <li>Si aprirà il file <code className="bg-black/30 px-1">claude_desktop_config.json</code></li>
                  <li>Aggiungi la configurazione qui sotto nell&apos;oggetto <code className="bg-black/30 px-1">mcpServers</code></li>
                  <li>Sostituisci <code className="bg-black/30 px-1 text-[oklch(72%_0.06_240)]">YOUR_SKILLGROWTH_TOKEN</code> con il tuo token</li>
                  <li>Salva il file e <strong className="text-white">riavvia completamente Claude Desktop</strong></li>
                </ol>
                <p className="mt-3">Vedrai l&apos;icona a forma di falce (<svg className="w-3.5 h-3.5 inline-block text-[oklch(72%_0.06_240)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>) nella finestra di chat quando i tool MCP sono attivi.</p>
              </div>
            )}

            {activeConfig === "windsurf" && (
              <div className="text-xs text-[oklch(60%_0.01_260)] leading-relaxed space-y-3">
                <ol className="list-decimal list-inside space-y-1.5">
                  <li>Apri <strong className="text-white">Windsurf</strong></li>
                  <li>Vai su <strong className="text-white">Settings → MCP Servers</strong></li>
                  <li>Clicca su <strong className="text-white">Add MCP Server</strong></li>
                  <li>Imposta il <strong className="text-white">Name</strong>: <code className="bg-black/30 px-1">skillgrowth</code></li>
                  <li>Imposta il <strong className="text-white">Command</strong>: <code className="bg-black/30 px-1">npx</code></li>
                  <li>Imposta gli <strong className="text-white">Arguments</strong>: <code className="bg-black/30 px-1">-y @skillgrowth/mcp-server --token YOUR_SKILLGROWTH_TOKEN</code></li>
                  <li>Clicca su <strong className="text-white">Save</strong> e riavvia Windsurf</li>
                </ol>
              </div>
            )}

            {activeConfig === "claude_code" && (
              <div className="text-xs text-[oklch(60%_0.01_260)] leading-relaxed space-y-3">
                <p><strong className="text-[oklch(72%_0.06_240)]">Claude Code</strong> (CLI di Anthropic) usa un file JSON globale per la configurazione MCP.</p>
                <ol className="list-decimal list-inside space-y-1.5">
                  <li>Apri il file <code className="bg-black/30 px-1">~/.claude/settings.json</code> (crealo se non esiste)</li>
                  <li>Aggiungi la configurazione qui sotto nell&apos;oggetto <code className="bg-black/30 px-1">mcpServers</code></li>
                  <li>Sostituisci <code className="bg-black/30 px-1 text-[oklch(72%_0.06_240)]">YOUR_SKILLGROWTH_TOKEN</code> con il tuo token</li>
                  <li>Riavvia il terminale e lancia <code className="bg-black/30 px-1">claude</code></li>
                </ol>
                <p className="mt-3">Claude Code caricherà automaticamente i tool all&apos;avvio. Puoi verificare con <code className="bg-black/30 px-1">/mcp</code> nella chat.</p>
              </div>
            )}

            {activeConfig === "docker" && (
              <div className="text-xs text-[oklch(60%_0.01_260)] leading-relaxed space-y-3">
                <p>Se preferisci Docker, puoi eseguire il server MCP in un container isolato:</p>
                <ol className="list-decimal list-inside space-y-1.5">
                  <li>Assicurati di avere <strong className="text-white">Docker Desktop</strong> installato e in esecuzione</li>
                  <li>Sostituisci <code className="bg-black/30 px-1 text-[oklch(72%_0.06_240)]">la_tua_chiave_api</code> con la tua API Key (non il token MCP)</li>
                  <li>Esegui il comando qui sopra nel terminale</li>
                </ol>
                <div className="mt-3 p-3 bg-[oklch(20%_0.006_260)] border border-[oklch(60%_0.01_260)]/15 text-[11px]">
                  <p className="text-[oklch(72%_0.06_240)] font-semibold mb-1 flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg> Differenza tra Token MCP e API Key</p>
                  <p className="text-[oklch(60%_0.01_260)]">Il <strong className="text-white">Token MCP</strong> (flag <code className="bg-black/30 px-1">--token</code>) si genera dalla sezione Server MCP in Connessioni. L&apos;<strong className="text-white">API Key</strong> (env <code className="bg-black/30 px-1">SKILLGROWTH_API_KEY</code>) si genera dalla sezione API Key nella stessa pagina. Docker richiede l&apos;API Key.</p>
                </div>
              </div>
            )}

            {/* Code Block */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[oklch(72%_0.06_240)]">Configurazione:</span>
                <button
                  onClick={handleCopy}
                  className="text-[12px] text-[oklch(60%_0.01_260)] hover:text-[oklch(72%_0.06_240)] transition-colors flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {copied ? "Copiato!" : "Copia"}
                </button>
              </div>
              <pre className="p-4 bg-black/60 border border-white/6 font-mono text-[12px] leading-relaxed text-[oklch(98.5%_0.002_260)] overflow-x-auto">
                {codeExamples[activeConfig]}
              </pre>
            </div>

            <p className="text-xs text-[oklch(60%_0.01_260)] mt-4 leading-relaxed">{t.mcp.code_explanation}</p>
          </div>
        </section>

        {/* Tool MCP Disponibili */}
        <section className="mb-20">
          <h2 className="text-xl font-bold text-white mb-8 text-center">Tool <span className="text-[oklch(72%_0.06_240)]">MCP</span> Disponibili</h2>
          <p className="text-sm text-[oklch(60%_0.01_260)] text-center mb-8 max-w-2xl mx-auto leading-relaxed">
            Una volta connesso, il server espone automaticamente questi <span className="text-[oklch(72%_0.06_240)]">tool</span> al tuo client MCP.
            L&apos;agente AI li scopre e li usa in base al <span className="text-[oklch(72%_0.06_240)]">contesto</span> della conversazione.
          </p>

          <div className="space-y-4">
            {toolDefinitions.map((tool, idx) => (
              <div key={tool.name} className="border border-white/6 bg-[oklch(13%_0.006_260)]">
                <div className="flex items-center gap-3 px-5 py-3.5 bg-white/[0.02] border-b border-white/6">
                  <span className="w-7 h-7 bg-[oklch(13%_0.006_260)]/60 text-[oklch(72%_0.06_240)] border border-[oklch(60%_0.01_260)]/20 flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</span>
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono">{tool.name}</h3>
                    <p className="text-xs text-[oklch(60%_0.01_260)]">{tool.description}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-px bg-white/6">
                  <div className="p-4 bg-[oklch(13%_0.006_260)]">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[oklch(72%_0.06_240)] mb-1.5">Input</h4>
                    <p className="text-xs text-[oklch(60%_0.01_260)] leading-relaxed">{tool.input}</p>
                  </div>
                  <div className="p-4 bg-[oklch(13%_0.006_260)]">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[oklch(72%_0.06_240)] mb-1.5">Output</h4>
                    <p className="text-xs text-[oklch(60%_0.01_260)] leading-relaxed">{tool.output}</p>
                  </div>
                  <div className="p-4 bg-[oklch(13%_0.006_260)]">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[oklch(72%_0.06_240)] mb-1.5">Esempio</h4>
                    <p className="text-xs text-[oklch(60%_0.01_260)] leading-relaxed">{tool.example}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Esempi di Utilizzo */}
        <section className="mb-20">
          <h2 className="text-xl font-bold text-white mb-8 text-center">Esempi di <span className="text-[oklch(72%_0.06_240)]">Utilizzo</span></h2>

          <div className="space-y-4">
            <div className="p-5 bg-white/2 border border-white/6">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-[oklch(72%_0.06_240)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                <h4 className="text-sm font-bold text-white">Ricerca contestuale nei bucket</h4>
              </div>
              <div className="bg-black/30 p-3 text-xs font-mono text-[oklch(60%_0.01_260)] mb-2">
                <span className="text-[oklch(72%_0.06_240)]">Utente:</span> &quot;Nel mio bucket di architettura React, trovi qualcosa sugli hook personalizzati?&quot;
              </div>
              <div className="bg-black/30 p-3 text-xs font-mono text-[oklch(60%_0.01_260)]">
                <span className="text-green-400">Agente:</span> Il tool <strong className="text-[oklch(72%_0.06_240)]">search_sources</strong> cerca nei bucket e restituisce le fonti pertinenti sull&apos;argomento.
              </div>
            </div>

            <div className="p-5 bg-white/2 border border-white/6">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-[oklch(72%_0.06_240)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                <h4 className="text-sm font-bold text-white">Cattura di una pagina web</h4>
              </div>
              <div className="bg-black/30 p-3 text-xs font-mono text-[oklch(60%_0.01_260)] mb-2">
                <span className="text-[oklch(72%_0.06_240)]">Utente:</span> &quot;Salva questo link https://example.com/guida-react nel bucket &apos;React Rules&apos;.&quot;
              </div>
              <div className="bg-black/30 p-3 text-xs font-mono text-[oklch(60%_0.01_260)]">
                <span className="text-green-400">Agente:</span> Il tool <strong className="text-[oklch(72%_0.06_240)]">capture_webpage</strong> estrae il contenuto pulito della pagina e lo salva come nuova fonte nel bucket specificato.
              </div>
            </div>

            <div className="p-5 bg-white/2 border border-white/6">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-[oklch(72%_0.06_240)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                <h4 className="text-sm font-bold text-white">Esplorazione bucket</h4>
              </div>
              <div className="bg-black/30 p-3 text-xs font-mono text-[oklch(60%_0.01_260)] mb-2">
                <span className="text-[oklch(72%_0.06_240)]">Utente:</span> &quot;Quali conoscenze hai disponibili per aiutarmi su questo progetto?&quot;
              </div>
              <div className="bg-black/30 p-3 text-xs font-mono text-[oklch(60%_0.01_260)]">
                <span className="text-green-400">Agente:</span> Il tool <strong className="text-[oklch(72%_0.06_240)]">list_buckets</strong> restituisce tutti i bucket. L&apos;agente può poi usare <strong className="text-[oklch(72%_0.06_240)]">search_sources</strong> per approfondire.
              </div>
            </div>
          </div>
        </section>

        {/* Vantaggi */}
        <section className="mb-20">
          <h2 className="text-xl font-bold text-white mb-8 text-center"><span className="text-[oklch(72%_0.06_240)]">Vantaggi</span> di MCP</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 bg-white/2 border border-white/6 hover:border-[oklch(60%_0.01_260)]/20 transition-all">
              <div className="w-9 h-9 bg-[oklch(13%_0.006_260)]/50 border border-[oklch(60%_0.01_260)]/15 text-[oklch(72%_0.06_240)] flex items-center justify-center mb-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h4 className="font-semibold text-sm text-white mb-1">{t.mcp.benefit1_title}</h4>
              <p className="text-xs text-[oklch(60%_0.01_260)] leading-relaxed">{t.mcp.benefit1_desc}</p>
            </div>
            <div className="p-5 bg-white/2 border border-white/6 hover:border-[oklch(60%_0.01_260)]/20 transition-all">
              <div className="w-9 h-9 bg-[oklch(13%_0.006_260)]/50 border border-[oklch(60%_0.01_260)]/15 text-[oklch(72%_0.06_240)] flex items-center justify-center mb-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h4 className="font-semibold text-sm text-white mb-1">{t.mcp.benefit2_title}</h4>
              <p className="text-xs text-[oklch(60%_0.01_260)] leading-relaxed">{t.mcp.benefit2_desc}</p>
            </div>
            <div className="p-5 bg-white/2 border border-white/6 hover:border-[oklch(60%_0.01_260)]/20 transition-all">
              <div className="w-9 h-9 bg-[oklch(13%_0.006_260)]/50 border border-[oklch(60%_0.01_260)]/15 text-[oklch(72%_0.06_240)] flex items-center justify-center mb-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h4 className="font-semibold text-sm text-white mb-1">{t.mcp.benefit3_title}</h4>
              <p className="text-xs text-[oklch(60%_0.01_260)] leading-relaxed">{t.mcp.benefit3_desc}</p>
            </div>
            <div className="p-5 bg-white/2 border border-white/6 hover:border-[oklch(60%_0.01_260)]/20 transition-all">
              <div className="w-9 h-9 bg-[oklch(13%_0.006_260)]/50 border border-[oklch(60%_0.01_260)]/15 text-[oklch(72%_0.06_240)] flex items-center justify-center mb-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              </div>
              <h4 className="font-semibold text-sm text-white mb-1">{t.mcp.benefit4_title}</h4>
              <p className="text-xs text-[oklch(60%_0.01_260)] leading-relaxed">{t.mcp.benefit4_desc}</p>
            </div>
          </div>
        </section>

        {/* Tab: Config / Troubleshooting / FAQ */}
        <section className="mb-20">
          <div className="flex border-b border-white/6 mb-8 text-sm">
            {[
              { key: "config" as const, label: "Risoluzione Problemi" },
              { key: "troubleshooting" as const, label: "Problemi Comuni" },
              { key: "faq" as const, label: "FAQ" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 px-5 border-b-2 font-medium transition-all ${
                  activeTab === tab.key
                    ? "border-[oklch(60%_0.06_240)] text-[oklch(72%_0.06_240)]"
                    : "border-transparent text-[oklch(60%_0.01_260)] hover:text-[oklch(98.5%_0.002_260)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "config" && (
            <div className="p-6 bg-[oklch(13% 0.006 260)] border border-white/6">
              <h3 className="text-base font-bold text-white mb-4">Verifica della <span className="text-[oklch(72%_0.06_240)]">Connessione</span></h3>
              <div className="space-y-4 text-xs text-[oklch(60%_0.01_260)] leading-relaxed">
                <div className="flex gap-3 items-start">
                  <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" /></svg>
                  <div>
                    <strong className="text-white">Cursor:</strong> Controlla l&apos;icona MCP in basso a destra. Dovrebbe essere <span className="text-green-400">verde</span>.
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" /></svg>
                  <div>
                    <strong className="text-white">Claude Desktop:</strong> Cerca l&apos;icona <svg className="w-3.5 h-3.5 inline-block text-[oklch(72%_0.06_240)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> nella finestra di chat. Cliccala per vedere i tool disponibili.
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" /></svg>
                  <div>
                    <strong className="text-white">Terminale (npx):</strong> Il server avviato mostra <span className="text-green-400">&quot;MCP server running on stdio&quot;</span>.
                  </div>
                </div>
              </div>

              <h3 className="text-base font-bold text-white mt-8 mb-4"><span className="text-[oklch(72%_0.06_240)]">Sicu</span>rezza</h3>
              <div className="space-y-3 text-xs text-[oklch(60%_0.01_260)] leading-relaxed">
                <div className="flex gap-3 items-start">
                <svg className="w-5 h-5 text-[oklch(72%_0.06_240)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  <div>
                    <strong className="text-white">Token personale:</strong> Il tuo token MCP è personale e non va condiviso. Chiunque abbia il token può leggere i tuoi bucket.
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                <svg className="w-5 h-5 text-[oklch(72%_0.06_240)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  <div>
                    <strong className="text-white">Esecuzione locale:</strong> Il server MCP gira sul tuo computer. I tuoi dati non transitano su server di terze parti.
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                <svg className="w-5 h-5 text-[oklch(72%_0.06_240)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  <div>
                    <strong className="text-white">Revoca:</strong> Puoi revocare il token in qualsiasi momento dalla pagina Connessioni. I client MCP connessi perderanno l&apos;accesso immediatamente.
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                <svg className="w-5 h-5 text-[oklch(72%_0.06_240)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  <div>
                    <strong className="text-white">Non committare il token:</strong> Non inserire il token MCP nei file di configurazione che fai commit su GitHub. Usa variabili d&apos;ambiente se possibile.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "troubleshooting" && (
            <div className="space-y-3">
              {troubleshootingItems.map((item) => (
                <details key={item.problem} className="group border border-white/6 bg-[oklch(13%_0.006_260)]">
                  <summary className="px-5 py-3.5 text-sm font-semibold text-white cursor-pointer hover:bg-white/[0.02] transition-colors flex items-center gap-2 list-none">
                    <svg className="w-4 h-4 text-[oklch(72%_0.06_240)] shrink-0 group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                    {item.problem}
                  </summary>
                  <div className="px-5 pb-4 text-xs text-[oklch(60%_0.01_260)] space-y-2 border-t border-white/6 pt-3">
                    <p><strong className="text-[oklch(72%_0.06_240)]">Causa:</strong> {item.cause}</p>
                    <p><strong className="text-[oklch(72%_0.06_240)]">Soluzione:</strong> {item.solution}</p>
                  </div>
                </details>
              ))}
            </div>
          )}

          {activeTab === "faq" && (
            <div className="space-y-3">
              {faqItems.map((item) => (
                <details key={item.q} className="group border border-white/6 bg-[oklch(13%_0.006_260)]">
                  <summary className="px-5 py-3.5 text-sm font-semibold text-white cursor-pointer hover:bg-white/[0.02] transition-colors flex items-center gap-2 list-none">
                    <svg className="w-4 h-4 text-[oklch(72%_0.06_240)] shrink-0 group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                    {item.q}
                  </summary>
                  <div className="px-5 pb-4 text-xs text-[oklch(60%_0.01_260)] leading-relaxed border-t border-white/6 pt-3">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>

        {/* CTA Finale */}
        <section className="text-center p-12 bg-[oklch(13% 0.006 260)] border border-[oklch(60%_0.01_260)]/15">
          <h2 className="text-2xl font-bold text-white mb-3"><span className="text-[oklch(72%_0.06_240)]">Pronto</span> a connettere le tue Skill?</h2>
          <p className="text-sm text-[oklch(60%_0.01_260)] mb-6 max-w-lg mx-auto leading-relaxed">{t.mcp.cta_subtitle}</p>
          <Link
            href="/login"
            className="inline-flex px-8 py-3.5 bg-[oklch(13%_0.006_260)] hover:bg-[oklch(72%_0.06_240)] text-[oklch(98.5%_0.002_260)] font-bold text-sm border border-[oklch(60%_0.01_260)]/30 transition-all active:scale-95"
          >
            {t.mcp.cta_button}
          </Link>
        </section>

      </div>
    </div>
  );
}
