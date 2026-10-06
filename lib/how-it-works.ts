export interface GuideSection {
  heading: { it: string; en: string };
  body: { it: string; en: string };
  bullets?: { it: string; en: string }[];
  code?: string;
  codeLang?: string;
}

export interface HowItWorksGuide {
  slug: string;
  num: string;
  title: { it: string; en: string };
  subtitle: { it: string; en: string };
  intro: { it: string; en: string };
  sections: GuideSection[];
  checklist: { it: string; en: string }[];
  nextSlug: string | null;
}

export const HOW_IT_WORKS_SLUGS = [
  "source-ingestion",
  "ai-cleanup",
  "skill-compilation",
  "mcp-connection",
  "work-with-ai",
] as const;

export const howItWorksGuides: HowItWorksGuide[] = [
  {
    slug: "source-ingestion",
    num: "1",
    title: { it: "Ingestione Fonti", en: "Source Ingestion" },
    subtitle: {
      it: "Salva video, PDF e articoli senza perdere nemmeno un dettaglio.",
      en: "Save videos, PDFs and articles without losing a single detail.",
    },
    intro: {
      it: "Tutto parte da qui: raccogli i contenuti che ti servono — un video YouTube, un thread su X, una discussione Reddit, un PDF o una pagina di documentazione — e Reskill li cattura per intero, preservando struttura, codice e formattazione originale.",
      en: "It all starts here: collect the content you need — a YouTube video, an X thread, a Reddit discussion, a PDF or a docs page — and Reskill captures it in full, preserving structure, code and original formatting.",
    },
    sections: [
      {
        heading: { it: "Da dove puoi importare", en: "Where you can import from" },
        body: {
          it: "Reskill supporta le fonti che usi ogni giorno. Ogni tipo di fonte ha un estrattore dedicato che ne preserva le peculiarità, invece di appiattire tutto in testo generico.",
          en: "Reskill supports the sources you use every day. Each source type has a dedicated extractor that preserves its peculiarities instead of flattening everything into generic text.",
        },
        bullets: [
          { it: "YouTube: trascrizione completa con timestamp, più titolo, canale e descrizione", en: "YouTube: full transcript with timestamps, plus title, channel and description" },
          { it: "X / Twitter: testo del post, autore, metriche e post citati", en: "X / Twitter: post text, author, metrics and quoted posts" },
          { it: "Reddit: post più i commenti migliori votati dalla community", en: "Reddit: post plus the community's top-voted comments" },
          { it: "PDF: testo estratto pagina per pagina, pronto da consultare", en: "PDF: text extracted page by page, ready to browse" },
          { it: "Pagine web: articolo ripulito con autore, data e contenuto principale", en: "Web pages: cleaned article with author, date and main content" },
        ],
      },
      {
        heading: { it: "Tre modi per salvare", en: "Three ways to save" },
        body: {
          it: "Scegli il flusso che preferisci: l'estensione browser con un clic destro su qualsiasi pagina, l'incollaggio diretto dell'URL nel workspace o nel feed, oppure gli strumenti web senza installare nulla.",
          en: "Choose the flow you prefer: the browser extension with a right-click on any page, pasting the URL directly into the workspace or feed, or the web tools with nothing to install.",
        },
        bullets: [
          { it: "Estensione: clic destro → Converti in Markdown, anche per playlist e canali YouTube", en: "Extension: right-click → Convert to Markdown, including YouTube playlists and channels" },
          { it: "Workspace e Feed: incolla l'URL e la fonte finisce nel bucket giusto", en: "Workspace and Feed: paste the URL and the source lands in the right bucket" },
          { it: "Strumenti web: gli stessi convertitori, usabili dal browser senza estensione", en: "Web tools: the same converters, usable from the browser with no extension" },
        ],
      },
      {
        heading: { it: "Organizza con i bucket", en: "Organize with buckets" },
        body: {
          it: "Le fonti vivono dentro i bucket: contenitori tematici come “Regole React”, “Ricerca MCP” o “Appunti marketing”. Un bucket ben organizzato è la base di una Skill di qualità, perché l'AI compilerà solo ciò che è pertinente.",
          en: "Sources live inside buckets: themed containers like “React Rules”, “MCP Research” or “Marketing Notes”. A well-organized bucket is the foundation of a quality Skill, because the AI compiles only what is relevant.",
        },
        code: `Bucket: "Architettura Agentica"
├── Video: Agentic Workflows (trascrizione)
├── Thread: 5 lezioni di prompt engineering
├── Articolo: The Rise of MCP
└── PDF: AI Agents Technical Report`,
        codeLang: "text",
      },
    ],
    checklist: [
      { it: "Installa l'estensione o apri gli Strumenti web", en: "Install the extension or open the Web Tools" },
      { it: "Crea un bucket per il tuo argomento", en: "Create a bucket for your topic" },
      { it: "Salva 3–5 fonti di qualità sullo stesso tema", en: "Save 3–5 quality sources on the same theme" },
    ],
    nextSlug: "ai-cleanup",
  },
  {
    slug: "ai-cleanup",
    num: "2",
    title: { it: "Pulizia AI (Stripping)", en: "AI Cleaning (Stripping)" },
    subtitle: {
      it: "Via banner, cookie wall e rumore: resta solo il contenuto vero.",
      en: "Goodbye banners, cookie walls and noise: only the real content remains.",
    },
    intro: {
      it: "Una pagina web grezza è piena di rumore: menu di navigazione, pubblicità, popup, script e footer infiniti. Se li mandi all'AI così come sono, sprechi migliaia di token e aumenti il rischio di risposte confuse. Lo stripping risolve il problema alla radice.",
      en: "A raw web page is full of noise: nav menus, ads, popups, scripts and endless footers. Sending them to the AI as-is wastes thousands of tokens and increases the risk of confused answers. Stripping solves the problem at the root.",
    },
    sections: [
      {
        heading: { it: "Cosa viene rimosso", en: "What gets removed" },
        body: {
          it: "Il parser analizza il DOM e tiene solo ciò che un lettore umano leggerebbe davvero. Tutto il resto — chrome del sito, elementi interattivi, codice di tracciamento — viene scartato prima ancora di arrivare al Markdown.",
          en: "The parser analyzes the DOM and keeps only what a human reader would actually read. Everything else — site chrome, interactive elements, tracking code — is discarded before it ever reaches the Markdown.",
        },
        bullets: [
          { it: "Banner cookie, popup newsletter e overlay pubblicitari", en: "Cookie banners, newsletter popups and ad overlays" },
          { it: "Menu, sidebar, footer e breadcrumb di navigazione", en: "Nav menus, sidebars, footers and breadcrumbs" },
          { it: "Script, stili inline, iframe e pixel di tracciamento", en: "Scripts, inline styles, iframes and tracking pixels" },
          { it: "Pulsanti social, form di commento e widget correlati", en: "Social buttons, comment forms and related widgets" },
        ],
      },
      {
        heading: { it: "Cosa viene preservato", en: "What is preserved" },
        body: {
          it: "Pulire non significa impoverire: titoli, gerarchia dei paragrafi, elenchi, tabelle, blocchi di codice con linguaggio, citazioni, link e immagini informative restano intatti, convertiti in Markdown fedele all'originale.",
          en: "Cleaning doesn't mean impoverishing: headings, paragraph hierarchy, lists, tables, code blocks with language, quotes, links and informative images stay intact, converted to Markdown faithful to the original.",
        },
        bullets: [
          { it: "Struttura dei titoli (H1–H3) per navigare il documento", en: "Heading structure (H1–H3) to navigate the document" },
          { it: "Blocchi di codice con syntax highlighting preservato", en: "Code blocks with preserved syntax highlighting" },
          { it: "Tabelle convertite in formato Markdown leggibile", en: "Tables converted to readable Markdown format" },
          { it: "Metadati: autore, data, fonte originale e data di estrazione", en: "Metadata: author, date, original source and extraction date" },
        ],
      },
      {
        heading: { it: "Il risultato: −60% di token", en: "The result: −60% tokens" },
        body: {
          it: "Un articolo medio passa da 8.000 a circa 3.000 token dopo la pulizia, con accuratezza superiore: l'AI ragiona su contenuto denso e pertinente invece di perdersi nel rumore. Meno token significa risposte più veloci, costi inferiori e meno allucinazioni.",
          en: "An average article goes from 8,000 to about 3,000 tokens after cleaning, with higher accuracy: the AI reasons over dense, relevant content instead of getting lost in noise. Fewer tokens means faster answers, lower costs and fewer hallucinations.",
        },
        code: `Prima:  HTML grezzo ........... ~8.200 token
Dopo:   Markdown pulito ........ ~3.100 token  (−62%)
Rumore rimosso: 34 banner · 12 script · 5 menu`,
        codeLang: "text",
      },
    ],
    checklist: [
      { it: "Confronta l'anteprima Markdown con la pagina originale", en: "Compare the Markdown preview with the original page" },
      { it: "Verifica che codice e tabelle siano intatti", en: "Check that code and tables are intact" },
      { it: "Scarica il .md o salvalo nel bucket", en: "Download the .md or save it to the bucket" },
    ],
    nextSlug: "skill-compilation",
  },
  {
    slug: "skill-compilation",
    num: "3",
    title: { it: "Compilazione Skill", en: "Skill Compilation" },
    subtitle: {
      it: "Le tue fonti diventano un file .md che l'AI sa usare.",
      en: "Your sources become an .md file the AI knows how to use.",
    },
    intro: {
      it: "Avere dieci fonti pulite è utile, ma è la compilazione a trasformarle in conoscenza operativa: l'AI legge tutte le fonti del bucket e le fonde in un'unica Skill strutturata, con regole, esempi e anti-pattern pronti all'uso.",
      en: "Having ten clean sources is useful, but compilation turns them into operational knowledge: the AI reads every source in the bucket and merges them into a single structured Skill with rules, examples and ready-to-use anti-patterns.",
    },
    sections: [
      {
        heading: { it: "Anatomia di una Skill", en: "Anatomy of a Skill" },
        body: {
          it: "Ogni Skill segue lo stesso scheletro, così qualsiasi modello sa dove trovare cosa. Il frontmatter YAML in testa dice all'AI quando attivarla; il corpo organizza la conoscenza dal generale al particolare.",
          en: "Every Skill follows the same skeleton, so any model knows where to find what. The YAML frontmatter at the top tells the AI when to activate it; the body organizes knowledge from general to specific.",
        },
        code: `---
name: react-best-practices
description: Regole per scrivere React moderno
trigger: codice React, componenti, hook
tags: [react, frontend, best-practices]
version: 1.0.0
---

## Principi Fondamentali
## Regole e Best Practice
## Pattern e Implementazione
## Cosa NON Fare
## Esempi Pratici`,
        codeLang: "yaml",
      },
      {
        heading: { it: "I trigger YAML: il vero superpotere", en: "YAML triggers: the real superpower" },
        body: {
          it: "I trigger sono condizioni che l'AI valuta a runtime: parole chiave, contesti, tipi di task. Quando scrivi “come gestisco lo stato in React?”, l'AI carica automaticamente la Skill giusta invece di rispondere in modo generico.",
          en: "Triggers are conditions the AI evaluates at runtime: keywords, contexts, task types. When you write “how do I manage state in React?”, the AI automatically loads the right Skill instead of answering generically.",
        },
        bullets: [
          { it: "Parole chiave che attivano la conoscenza (es. “pull request”, “code review”)", en: "Keywords that activate the knowledge (e.g. “pull request”, “code review”)" },
          { it: "Contesti d'uso: in quali situazioni la Skill è rilevante", en: "Usage contexts: in which situations the Skill is relevant" },
          { it: "Condizioni negative: quando la Skill NON va usata", en: "Negative conditions: when the Skill must NOT be used" },
        ],
      },
      {
        heading: { it: "Come generarla", en: "How to generate it" },
        body: {
          it: "Apri il bucket, verifica di avere almeno 2–3 fonti pertinenti e premi “Compila in SKILL.md”. Il provider Xkiro unifica i contenuti in pochi secondi; poi puoi modificare il testo nell'editor, vedere l'anteprima e scaricare il file finale.",
          en: "Open the bucket, make sure you have at least 2–3 relevant sources and press “Compile to SKILL.md”. The Xkiro provider merges the content in seconds; then you can edit the text in the editor, preview it and download the final file.",
        },
        bullets: [
          { it: "Editor live con salvataggio automatico sul bucket", en: "Live editor with automatic saving to the bucket" },
          { it: "Anteprima renderizzata per controllare la resa finale", en: "Rendered preview to check the final result" },
          { it: "Condivisione pubblica con link o download .md", en: "Public sharing via link or .md download" },
        ],
      },
    ],
    checklist: [
      { it: "Raccogli almeno 2–3 fonti pertinenti nel bucket", en: "Collect at least 2–3 relevant sources in the bucket" },
      { it: "Premi “Compila in SKILL.md” e attendi la generazione", en: "Press “Compile to SKILL.md” and wait for generation" },
      { it: "Rivedi trigger ed esempi, poi scarica o condividi", en: "Review triggers and examples, then download or share" },
    ],
    nextSlug: "mcp-connection",
  },
  {
    slug: "mcp-connection",
    num: "4",
    title: { it: "Connessione MCP", en: "MCP Connection" },
    subtitle: {
      it: "I tuoi bucket diventano strumenti degli agenti AI.",
      en: "Your buckets become tools for AI agents.",
    },
    intro: {
      it: "MCP (Model Context Protocol) è lo standard aperto che permette agli agenti AI di scoprire e usare strumenti in modo dinamico — una sorta di “USB-C per l'AI”. Il server MCP di Reskill espone i tuoi bucket come strumenti interrogabili da Cursor, Claude, Codex e qualsiasi client compatibile.",
      en: "MCP (Model Context Protocol) is the open standard that lets AI agents discover and use tools dynamically — a kind of “USB-C for AI”. Reskill's MCP server exposes your buckets as searchable tools for Cursor, Claude, Codex and any compatible client.",
    },
    sections: [
      {
        heading: { it: "Come funziona", en: "How it works" },
        body: {
          it: "Avvii il server MCP con le tue credenziali, lo colleghi all'IDE o all'agente, e da quel momento l'AI può cercare tra le tue fonti e catturare nuovi contenuti dal web mentre lavora — senza che tu copi e incolli nulla.",
          en: "You start the MCP server with your credentials, connect it to your IDE or agent, and from then on the AI can search your sources and capture new web content while working — without you copying and pasting anything.",
        },
        code: `{
  "mcpServers": {
    "reskill": {
      "command": "npx",
      "args": ["-y", "@reskill/mcp"],
      "env": { "RESKILL_API_KEY": "sk_live_..." }
    }
  }
}`,
        codeLang: "json",
      },
      {
        heading: { it: "Cosa può fare l'agente", en: "What the agent can do" },
        body: {
          it: "Una volta connesso, l'agente vede Reskill come un set di strumenti tipizzati: cerca una fonte per argomento, legge il contenuto pulito, salva nuove pagine nel bucket giusto — tutto dentro il flusso di lavoro corrente.",
          en: "Once connected, the agent sees Reskill as a set of typed tools: search a source by topic, read the cleaned content, save new pages to the right bucket — all inside the current workflow.",
        },
        bullets: [
          { it: "Ricerca semantica tra tutte le fonti salvate", en: "Semantic search across all saved sources" },
          { it: "Lettura del Markdown pulito di una fonte specifica", en: "Reading the cleaned Markdown of a specific source" },
          { it: "Salvataggio di nuove pagine web nei bucket", en: "Saving new web pages to buckets" },
          { it: "Elenco dei bucket e conteggio delle fonti", en: "Listing buckets and source counts" },
        ],
      },
      {
        heading: { it: "Dove si configura", en: "Where to configure it" },
        body: {
          it: "Trovi comandi pronti da copiare per Cursor, Claude Desktop, Codex e Windsurf nella pagina Connessioni dell'account e nella guida MCP. Genera una API key, incolla la configurazione nel tuo client e riavvialo: gli strumenti Reskill compaiono automaticamente.",
          en: "You'll find ready-to-copy commands for Cursor, Claude Desktop, Codex and Windsurf on the account Connections page and in the MCP guide. Generate an API key, paste the configuration into your client and restart it: the Reskill tools appear automatically.",
        },
        bullets: [
          { it: "Pagina Connessioni: API key, CLI e comandi per ogni client", en: "Connections page: API keys, CLI and commands for each client" },
          { it: "Guida MCP: configurazioni consigliate passo passo", en: "MCP guide: step-by-step recommended configurations" },
          { it: "Nessun vendor lock-in: funziona con qualsiasi client MCP", en: "No vendor lock-in: works with any MCP client" },
        ],
      },
    ],
    checklist: [
      { it: "Genera una API key dalla pagina Connessioni", en: "Generate an API key from the Connections page" },
      { it: "Incolla la configurazione nel tuo IDE e riavvialo", en: "Paste the configuration into your IDE and restart it" },
      { it: "Chiedi all'agente di cercare tra le tue fonti", en: "Ask the agent to search through your sources" },
    ],
    nextSlug: "work-with-ai",
  },
  {
    slug: "work-with-ai",
    num: "5",
    title: { it: "Lavora con la tua AI", en: "Work with your AI" },
    subtitle: {
      it: "Una libreria di Skill, pronta in ogni strumento che usi.",
      en: "A library of Skills, ready in every tool you use.",
    },
    intro: {
      it: "L'ultimo passo è il più semplice: usa le Skill ovunque lavori. Dal file .cursorrules di Cursor ai Project di Claude, dai Custom GPT di ChatGPT alle automazioni n8n — il Markdown di Reskill è universale e resta tuo per sempre.",
      en: "The last step is the easiest: use the Skills wherever you work. From Cursor's .cursorrules file to Claude Projects, from ChatGPT Custom GPTs to n8n automations — Reskill's Markdown is universal and stays yours forever.",
    },
    sections: [
      {
        heading: { it: "Dove usare le Skill", en: "Where to use the Skills" },
        body: {
          it: "Non esiste un unico modo giusto: ogni strumento ha il suo formato, ma tutti accettano Markdown. Scarica la Skill e caricala dove ti serve, oppure lasciala vivere nel bucket e raggiungila via MCP.",
          en: "There is no single right way: every tool has its format, but all accept Markdown. Download the Skill and load it where you need it, or leave it in the bucket and reach it via MCP.",
        },
        bullets: [
          { it: "Cursor / Windsurf: incolla nel file .cursorrules del progetto", en: "Cursor / Windsurf: paste into the project's .cursorrules file" },
          { it: "Claude Projects e Custom GPT: carica il .md nella Knowledge", en: "Claude Projects and Custom GPTs: upload the .md to the Knowledge" },
          { it: "Gemini / NotebookLM: importa come fonte della conversazione", en: "Gemini / NotebookLM: import as a conversation source" },
          { it: "n8n, Zapier, Make, LangChain: preleva contesto via API", en: "n8n, Zapier, Make, LangChain: fetch context via API" },
        ],
      },
      {
        heading: { it: "Il flusso quotidiano", en: "The daily flow" },
        body: {
          it: "Con il tempo i bucket diventano una seconda memoria: salvi ciò che leggi, compili Skill per gli argomenti ricorrenti e le tue AI rispondono con il tuo contesto invece di risposte generiche. Più usi Reskill, più ogni risposta migliora.",
          en: "Over time buckets become a second memory: you save what you read, compile Skills for recurring topics and your AIs answer with your context instead of generic replies. The more you use Reskill, the better every answer gets.",
        },
        bullets: [
          { it: "Salva mentre navighi con l'estensione o gli Strumenti web", en: "Save while browsing with the extension or Web Tools" },
          { it: "Compila una Skill quando un bucket raggiunge 3+ fonti", en: "Compile a Skill when a bucket reaches 3+ sources" },
          { it: "Riutilizza la stessa Skill in tutti i tuoi agenti", en: "Reuse the same Skill across all your agents" },
        ],
      },
      {
        heading: { it: "Le tue conoscenze restano tue", en: "Your knowledge stays yours" },
        body: {
          it: "Nessun lock-in: i file sono Markdown standard, esportabili in qualsiasi momento, eliminabili con un clic. Se cancelli l'account, i dati vengono rimossi — la tua libreria vive dove decidi tu.",
          en: "No lock-in: files are standard Markdown, exportable at any time, deletable with one click. If you delete your account, the data is removed — your library lives wherever you decide.",
        },
      },
    ],
    checklist: [
      { it: "Scarica la tua prima Skill in .md", en: "Download your first Skill as .md" },
      { it: "Caricala nel tuo agente AI preferito", en: "Load it into your favorite AI agent" },
      { it: "Continua a salvare fonti per farla crescere", en: "Keep saving sources to grow it" },
    ],
    nextSlug: null,
  },
];

export function getGuide(slug: string): HowItWorksGuide | undefined {
  return howItWorksGuides.find((g) => g.slug === slug);
}

export function getGuideTitle(slug: string, locale: string): string {
  const g = getGuide(slug);
  if (!g) return slug;
  return locale === "en" ? g.title.en : g.title.it;
}
