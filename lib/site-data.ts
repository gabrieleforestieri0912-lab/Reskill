import {
  FaYoutube, FaXTwitter, FaRedditAlien, FaFilePdf, FaGlobe,
  FaDiscord, FaBlog, FaBook, FaCode, FaRobot, FaComments,
  FaServer, FaWind, FaBrain, FaGithub, FaPlug, FaInstagram, FaLinkedin,
} from "react-icons/fa6";

export const demoItems = [
  {
    id: "demo-yt",
    type: "youtube",
    platform: "YouTube",
    title: "Agentic Workflows: Build AI Agents in 2026",
    source: "Alex Developer · 124K views",
    date: "2 giorni fa",
    bg: "bg-red-950/30",
    skill: `---
title: "Agentic Workflows: Build AI Agents in 2026"
source: youtube
url: "https://youtube.com/watch?v=agentic-workflows-demo"
author: "Alex Developer"
triggers:
  - "agentic workflow"
  - "AI agent architecture"
  - "LangGraph tutorial"
---

## 1. Core Architecture

Agentic workflows consist of three layers: **Orchestrator** (LangGraph / Semantic Kernel), **Tool Registry** (MCP / REST APIs), and **Memory Store** (vector DB / KV cache).

\`\`\`python
# Agent loop pseudocode
while task.pending:
    thought = llm.reason(state, tools)
    if thought.action == "tool_call":
        result = execute_tool(thought.tool)
        state.append(result)
    else:
        return thought.final_answer
\`\`\`

## 2. Key Principles

- **Stateful loops**: Agents maintain conversation state across turns
- **Tool-as-function**: Every capability is a registered tool with typed schema
- **Reflection cycles**: Agent critiques its own output before finalizing
- **Human-in-the-loop**: Critical actions require confirmation

## 3. Implementation Tips

| Pattern | When to Use | Example |
|---------|------------|---------|
| ReAct | Simple Q&A | Weather bot |
| Plan-Execute | Multi-step tasks | Code generation |
| Reflection | Quality-critical | Report writing |

## 4. Anti-Patterns to Avoid

- Giving too many tools (context loss)
- Missing error recovery in tool calls
- No timeout handling for external APIs
- Flat prompts instead of structured skill files`,
  },
  {
    id: "demo-x",
    type: "x",
    platform: "X / Twitter",
    title: "Thread: 5 Prompt Engineering Lessons",
    source: "@techemystic · 2.4K likes",
    date: "1 settimana fa",
    bg: "bg-sky-950/30",
    skill: `---
title: "5 Prompt Engineering Lessons from Production"
source: twitter
url: "https://x.com/techemystic/status/prompt-engineering-thread"
author: "@techemystic"
triggers:
  - "prompt engineering"
  - "LLM optimization"
  - "prompt patterns"
---

## Lesson 1: Be Specific, Not Verbose

Bad: "Write code for a login page"
Good: "Write a React login form with email/password validation. Use zod for schema, tailwind for styling. Show inline errors."

## Lesson 2: Role + Context + Output Format

\`\`\`
You are a senior frontend architect.
Context: Next.js 16 app router, server components.
Output: Provide only the component code, no explanation.
\`\`\`

## Lesson 3: Chain of Thought

Always ask the model to reason step-by-step before answering. This reduces hallucinations by ~40%.

## Lesson 4: Few-Shot Examples

Include 2-3 examples of desired output. Format matters more than quantity.

## Lesson 5: Iterative Refinement

Start broad, then narrow constraints. First pass: general architecture. Second pass: specific implementation details.`,
  },
  {
    id: "demo-ig",
    type: "instagram",
    platform: "Instagram",
    title: "AI Coding Setup Tour 2026",
    source: "@codewithstyle · 89K likes",
    date: "3 giorni fa",
    bg: "bg-pink-950/30",
    skill: `---
title: "AI Coding Setup Tour 2026"
source: instagram
url: "https://instagram.com/p/ai-coding-setup"
author: "@codewithstyle"
triggers:
  - "coding setup"
  - "developer tools"
  - "AI workflow"
---

## Setup Overview

**Editor**: Cursor with Vim keybindings
**Theme**: Catppuccin Mocha (cyan accent)
**Terminal**: Warp with AI suggestions
**LLM Integration**: OpenAI API (GPT-4o-mini / GPT-4.1)

## Extension Stack

| Tool | Purpose |
|------|---------|
| Continue.dev | Inline AI completions |
| GitHub Copilot | Pair programming |
| MCP Server | Context-aware tool calls |
| Claude Projects | Long-form architecture |

## Productivity Tips

1. Use .cursorrules per project (not global)
2. Keep a "context.md" with architecture decisions
3. Sync skills via MCP filesystem server
4. Run local models for quick completions, cloud for complex reasoning`,
  },
  {
    id: "demo-article",
    type: "article",
    platform: "Blog",
    title: "The Rise of MCP: Model Context Protocol Explained",
    source: "techblog.dev · 15 min read",
    date: "1 mese fa",
    bg: "bg-emerald-950/30",
    skill: `---
title: "The Rise of MCP: Model Context Protocol Explained"
source: web
url: "https://techblog.dev/mcp-protocol-guide"
author: "Sarah Chen"
triggers:
  - "MCP"
  - "Model Context Protocol"
  - "AI tool integration"
---

## What is MCP?

MCP (Model Context Protocol) is an open standard that allows AI models to discover and call tools dynamically. Think of it as "USB-C for AI" — a universal protocol to connect models with external capabilities.

## Architecture

\`\`\`
┌──────────────┐     ┌──────────────┐
│   AI Model    │────▶│  MCP Client   │
│  (Claude/LLM) │     │  (Cursor IDE) │
└──────────────┘     └──────┬───────┘
                            │
                    ┌───────▼───────┐
                    │   MCP Server  │
                    │  (filesystem) │
                    └───────────────┘
\`\`\`

## Key Benefits

- **Dynamic discovery**: Models discover available tools at runtime
- **Typed schemas**: Every tool declares input/output types
- **Security**: Servers run in sandboxed environments
- **Language agnostic**: Works with any language via stdio/SSE

## Getting Started

\`\`\`json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./skills"]
    }
  }
}
\`\`\`
`,
  },
  {
    id: "demo-reddit",
    type: "reddit",
    platform: "Reddit",
    title: "I built a MCP server in 2 hours — here's how",
    source: "r/cursor · 342 upvotes",
    date: "5 giorni fa",
    bg: "bg-orange-950/30",
    skill: `---
title: "I built a MCP server in 2 hours — here's how"
source: reddit
url: "https://reddit.com/r/cursor/comments/mcp-server-guide"
author: "u/dev_journey"
triggers:
  - "MCP server"
  - "cursor customization"
  - "tool building"
---

## Step-by-Step MCP Server

### 1. Initialize

\`\`\`bash
mkdir my-mcp-server && cd my-mcp-server
npm init -y
npm install @modelcontextprotocol/sdk zod
\`\`\`

### 2. Create Tool

\`\`\`typescript
import { Server } from "@modelcontextprotocol/sdk";

const server = new Server({
  name: "code-reviewer",
  version: "1.0.0",
});

server.tool("review_code", {
  code: z.string(),
  language: z.string().optional(),
}, async ({ code }) => {
  const issues = await analyzeCode(code);
  return { content: [{ type: "text", text: JSON.stringify(issues) }] };
});
\`\`\`

### 3. Configure in Cursor

Add to \`.cursor/mcp.json\` and restart. The tool appears automatically in AI completions.`,
  },
  {
    id: "demo-pdf",
    type: "pdf",
    platform: "PDF",
    title: "AI Agents: Technical Report 2026",
    source: "Research Paper · 24 pagine",
    date: "2 mesi fa",
    bg: "bg-rose-950/30",
    skill: `---
title: "AI Agents: Technical Report 2026"
source: pdf
url: "https://research.org/ai-agents-2026.pdf"
author: "Anthropic Research"
triggers:
  - "AI agents"
  - "technical report"
  - "agent evaluation"
---

## Executive Summary

Large language models are increasingly used as autonomous agents. This report evaluates 12 agent architectures across 8 benchmarks.

## Key Findings

1. **Tool-use agents outperform**: Agents with 5-10 tools score 34% higher on complex tasks
2. **Reflection improves accuracy**: Self-critique loops reduce errors by 28%
3. **Memory matters**: Agents with persistent memory retain context 3x longer
4. **Smaller models + tools > big models alone**: 7B + tools beats 70B without

## Recommended Architecture

\`\`\`
Agent = Orchestrator (router)
       + Tool Registry (typed tools)
       + Memory Store (vector + KV)
       + Reflection Loop (self-critique)
\`\`\`

## Evaluation Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| Task Success | % of tasks completed correctly | >80% |
| Token Efficiency | avg tokens per task | <4000 |
| Hallucination Rate | false statements per task | <5% |`,
  },
];

export const sources = [
 { icon: FaYoutube, name: "YouTube" },
 { icon: FaInstagram, name: "Instagram Reels" },
 { icon: FaXTwitter, name: "X" },
 { icon: FaRedditAlien, name: "Reddit" },
 { icon: FaFilePdf, name: "PDF" },
 { icon: FaGlobe, name: "Pagine Web" },
];

export const ais = [
  { icon: FaCode, name: "Cursor" },
  { icon: FaRobot, name: "Claude" },
  { icon: FaComments, name: "ChatGPT" },
  { icon: FaServer, name: "MCP Server" },
  { icon: FaWind, name: "Windsurf" },
  { icon: FaBrain, name: "OpenAI" },
  { icon: FaGithub, name: "Copilot" },
  { icon: FaPlug, name: "API" },
];

export const faqs = [
  { q: "Cos'è una Skill per AI agent?", a: "Una Skill è un file Markdown con frontmatter YAML che contiene regole, trigger e best practice strutturate. Gli agenti AI (Cursor, Claude, ChatGPT) la usano come contesto per rispondere in modo più preciso e contestuale." },
  { q: "Come viene estratto il contenuto da YouTube?", a: "Reskill utilizza la libreria youtube-transcript per scaricare la trascrizione automatica dei video. Se la trascrizione non è disponibile, estrae la descrizione e i metadati del video tramite l'API oEmbed di YouTube." },
  { q: "I miei dati sono al sicuro?", a: "Assolutamente sì. I dati vengono elaborati lato server e salvati in Supabase (PostgreSQL). Non condividiamo né vendiamo i tuoi contenuti. Puoi eliminare bucket e fonti in qualsiasi momento." },
  { q: "Quali formati di AI supportate?", a: "Supportiamo Cursor (.cursorrules), Claude AI Projects, Custom GPTs (ChatGPT), MCP Server (Model Context Protocol), Windsurf, GitHub Copilot e qualsiasi LLM che accetti file Markdown come contesto." },
  { q: "Devo avere un account per usare Reskill?", a: "Sì, è necessario un account gratuito con Google OAuth per salvare bucket, fonti e generare Skill. La registrazione richiede meno di 30 secondi." },
  { q: "Cosa succede se supero i limiti del piano Free?", a: "Il piano Free ti permette 1 bucket e 3 fonti totali. Se raggiungi il limite, ti invitiamo a fare upgrade al piano Pro (€12/mese) per 15 bucket e 100 fonti, o Business (€39/mese) per 50 bucket e 500 fonti." },
  { q: "Posso usare il mio modello AI locale?", a: "Al momento Reskill utilizza modelli OpenAI via API (GPT-4o-mini, GPT-4.1, ecc.) per generare le Skill. Seleziona il modello preferito dal dropdown nel workspace." },
  { q: "Come funziona l'estensione browser?", a: "L'estensione Chrome/Edge/Firefox aggiunge un pulsante contestuale. Cliccando 'Trasforma in Markdown' su qualsiasi pagina, il contenuto viene pulito da ads e rumore, convertito in Markdown e salvato direttamente nel tuo bucket." },
];

export const typewriterWords = ["YouTube", "X Post", "Reddit", "PDF", "Pagine Web", "Discord", "Blog", "Documentazione"]

export const pricingPlans = [
  {
    id: "free",
    credits: 10,
    price: 0,
    name: "Free",
    badge: null,
    desc: "Perfetto per fare le prime prove",
    features: [
      "1 Bucket",
      "3 Fonti",
      "10 Crediti / mese",
      "Estensione browser",
      "Export Markdown",
      "Trigger YAML",
      "Community support",
    ],
  },
  {
    id: "pro",
    credits: 500,
    price: 12,
    name: "Pro",
    badge: "Più scelto",
    desc: "Per chi usa Reskill con regolarità",
    features: [
      "15 Bucket",
      "100 Fonti",
      "500 Crediti / mese",
      "Estensione browser",
      "Export Markdown",
      "Trigger YAML avanzati",
      "Modelli AI premium",
      "MCP Server",
    ],
  },
  {
    id: "business",
    credits: 1500,
    price: 29,
    name: "Business",
    badge: null,
    desc: "Per chi ha bisogno di volumi elevati",
    features: [
      "50 Bucket",
      "500 Fonti",
      "1.500 Crediti / mese",
      "Estensione browser",
      "Export Markdown",
      "Trigger YAML avanzati",
      "Modelli AI premium",
      "MCP Server",
    ],
  },
  {
    id: "enterprise",
    credits: 5000,
    price: 59,
    name: "Enterprise",
    badge: null,
    desc: "Per chi vuole il massimo delle risorse",
    features: [
      "Bucket illimitati",
      "Fonti illimitate",
      "5.000 Crediti / mese",
      "Estensione browser",
      "Export Markdown",
      "Trigger YAML avanzati",
      "Modelli AI premium",
      "MCP Server",
    ],
  },
];
