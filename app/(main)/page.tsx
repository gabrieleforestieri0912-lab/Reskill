/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
"use client";

import Image from "next/image";
import Link from "next/link";
import {
    FaYoutube, FaXTwitter, FaInstagram, FaRedditAlien, FaLinkedin, FaChrome, FaGithub, FaGear,
} from "react-icons/fa6";
import { SiOpenai, SiGooglegemini, SiPerplexity, SiMedium, SiSubstack, SiNotebooklm, SiClaude, SiN8N, SiZapier, SiMake, SiLangchain } from "react-icons/si";
import { useState, useEffect } from "react";
import { Bolt, Tag, Plug, Cable } from "lucide-react";
import { CursorIcon, CodexIcon, AntigravityIcon } from "@/components/ui/BrandIcons";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "@/translations";
import PricingSection from "@/components/sections/PricingSection";

const demoItems = [
    {
        id: "demo-yt",
        type: "youtube",
        platform: "YouTube",
        title: "Agentic Workflows: Build AI Agents in 2026",
        source: "Alex Developer · 124K views",
        date: "2 giorni fa",
        url: "https://youtube.com/watch?v=agentic-workflows-demo",
        bg: "bg-[oklch(13%_.006_260)]/30",
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
        id: "demo-ig",
        type: "instagram",
        platform: "Instagram",
        title: "AI Coding Setup Tour 2026",
        source: "@codewithstyle · 89K likes",
        date: "3 giorni fa",
        url: "https://instagram.com/p/ai-coding-setup",
        bg: "bg-[oklch(13%_.006_260)]/30",
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
**LLM Integration**: Local Ollama + Claude API hybrid

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
        id: "demo-x",
        type: "x",
        platform: "X",
        title: "Thread: 5 Prompt Engineering Lessons",
        source: "@techemystic · 2.4K likes",
        date: "1 settimana fa",
        url: "https://x.com/techemystic/status/prompt-engineering-thread",
        bg: "bg-[oklch(13%_.006_260)]/30",
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
        id: "demo-reddit",
        type: "reddit",
        platform: "Reddit",
        title: "I built a MCP server in 2 hours — here's how",
        source: "r/cursor · 342 upvotes",
        date: "5 giorni fa",
        url: "https://reddit.com/r/cursor/comments/mcp-server-guide",
        bg: "bg-[oklch(13%_.006_260)]/30",
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
        id: "demo-linkedin",
        type: "linkedin",
        platform: "LinkedIn",
        title: "How We Scaled AI Agents to Production",
        source: "Maria Rossi · 1.2K reactions",
        date: "4 giorni fa",
        url: "https://linkedin.com/posts/ai-agents-production",
        bg: "bg-blue-950/30",
        skill: `---
title: "How We Scaled AI Agents to Production"
source: linkedin
url: "https://linkedin.com/posts/ai-agents-production"
author: "Maria Rossi"
triggers:
 - "production AI"
 - "scaling agents"
 - "LLM deployment"
---

## Key Takeaways

1. Start with a single agent, then add orchestration as complexity grows
2. Use semantic caching to reduce LLM costs by 40%
3. Implement human-in-the-loop for all destructive operations
4. Monitor token usage per user to catch abuse early

## Architecture at Scale

\`\`\`
User → API Gateway → Agent Router → Specialized Agents
                                    → RAG Pipeline
                                    → Tool Executor
\`\`\`

## Lessons Learned

- **Observability first**: Without proper tracing, debugging agent chains is impossible
- **Rate limiting**: Always enforce per-user rate limits at the gateway level
- **Fallback models**: Have a cheaper/faster fallback for simple queries`,
    },
    {
        id: "demo-blog",
        type: "blog",
        platform: "Blog",
        title: "The Rise of MCP: Model Context Protocol Explained",
        source: "techblog.dev · 15 min read",
        date: "1 mese fa",
        url: "https://techblog.dev/mcp-protocol-guide",
        bg: "bg-[oklch(13%_.006_260)]/30",
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
        id: "demo-article",
        type: "article",
        platform: "Article",
        title: "The Future of AI-Assisted Development",
        source: "stackoverflow.blog · 12 min read",
        date: "2 settimane fa",
        url: "https://stackoverflow.blog/ai-assisted-dev",
        bg: "bg-teal-950/30",
        skill: `---
title: "The Future of AI-Assisted Development"
source: web
url: "https://stackoverflow.blog/ai-assisted-dev"
author: "Marco Bianchi"
triggers:
 - "AI development"
 - "future of coding"
 - "assistive AI"
---

## The Shift

We are moving from **autocomplete** to **autonomous agents**. The next 12 months will redefine what it means to write software.

## Three Trends

1. **Context-aware tools**: AI that understands your entire codebase, not just the open file
2. **Agentic workflows**: Multi-step tasks delegated to AI agents with tool access
3. **Skill ecosystems**: Reusable, shareable prompt templates (skills) for common tasks

## Implications

| Role | Impact |
|------|--------|
| Junior Dev | AI handles boilerplate, freeing time for learning |
| Senior Dev | Focus on architecture, code review, complex logic |
| Tech Lead | Agent orchestration, quality gates, skill authoring |`,
    },
    {
        id: "demo-essay",
        type: "essay",
        platform: "Essay",
        title: "Why Skills Will Replace Prompts",
        source: "medium.com/@aiden · 8 min read",
        date: "3 settimane fa",
        url: "https://medium.com/ai-thoughts/skills-over-prompts",
        bg: "bg-[oklch(13%_.006_260)]/30",
        skill: `---
title: "Why Skills Will Replace Prompts"
source: web
url: "https://medium.com/ai-thoughts/skills-over-prompts"
author: "Aiden Clarke"
triggers:
 - "skills vs prompts"
 - "prompt engineering"
 - "AI workflow"
---

## The Argument

Prompts are ephemeral. Skills are permanent. A skill is a structured, versioned, shareable unit of AI guidance that lives outside the chat window.

## Why Skills Win

1. **Version control**: Skills live in your repo, tracked by git
2. **Sharing**: A skill file can be shared with your team, published, or sold
3. **Composability**: Chain skills together for complex workflows
4. **Discoverability**: AI can auto-select relevant skills based on context

## Example

\`\`\`yaml
# skill: code-review
title: "Code Review with Architecture Focus"
triggers:
 - "pull request"
 - "code review"
 - "architecture"
---

Focus on:
1. Separation of concerns
2. Over-engineering vs under-engineering
3. Test coverage gaps
4. API design consistency
\`\`\`

> The prompt is the message. The skill is the memory.
`,
    },
    {
        id: "demo-newsletter",
        type: "newsletter",
        platform: "Newsletter",
        title: "AI Digest #42 — MCP, Agents, and the New Stack",
        source: "aistackweekly.com · 5.6K subscribers",
        date: "6 giorni fa",
        url: "https://aistackweekly.com/issues/42",
        bg: "bg-violet-950/30",
        skill: `---
title: "AI Digest #42 — MCP, Agents, and the New Stack"
source: web
url: "https://aistackweekly.com/issues/42"
author: "AI Stack Weekly"
triggers:
 - "newsletter digests"
 - "AI news"
 - "weekly roundup"
---

## This Week's Highlights

### 1. MCP Goes Mainstream

GitHub announced native MCP support in Copilot. Now any MCP server can be used directly from editor completions.

### 2. Agent Evaluation Framework

A new benchmark (AgentBench 2.0) evaluates agents on real-world coding tasks. Top scores: Claude 4.5 > GPT-5 > Gemini 3.

### 3. Tool of the Week

\`skillgrowth\` An open-source skill manager that syncs AI prompts across Cursor, Claude Code, and Windsurf. Supports MCP filesystem server for context-aware tool calls.

## Quick Links

- [MCP Specification v1.2 Released](https://modelcontextprotocol.io)
- [Skillgrowth GitHub](https://github.com/skillgrowth)
- [AgentBench 2.0 Results](https://agentbench.dev)`,
    },
];

const sources = [
    { icon: FaGithub, color: "text-[oklch(72%_0.06_240)]", name: "GitHub", desc: "Repository e code review" },
    { icon: FaYoutube, color: "text-[oklch(72%_0.06_240)]", name: "YouTube", desc: "Trascrizioni e caption da video" },
    { icon: FaInstagram, color: "text-[oklch(72%_0.06_240)]", name: "Instagram", desc: "Post e stories" },
    { icon: FaRedditAlien, color: "text-[oklch(72%_0.06_240)]", name: "Reddit", desc: "Post e commenti votati" },
    { icon: FaLinkedin, color: "text-[oklch(72%_0.06_240)]", name: "LinkedIn", desc: "Post e articoli professionali" },
    { icon: FaXTwitter, color: "text-[oklch(72%_0.06_240)]", name: "X", desc: "Thread e post completi" },
    { icon: SiMedium, color: "text-[oklch(72%_0.06_240)]", name: "Medium", desc: "Blog e articoli tecnici" },
    { icon: SiSubstack, color: "text-[oklch(72%_0.06_240)]", name: "Substack", desc: "Newsletter e approfondimenti" },
];

const ais = [
    { icon: CodexIcon, color: "text-[oklch(72%_0.06_240)]", name: "Codex", desc: "AI di OpenAI per codice" },
    { icon: AntigravityIcon, color: "text-[oklch(72%_0.06_240)]", name: "Antigravity", desc: "AI code assistant" },
    { icon: CursorIcon, color: "text-[oklch(72%_0.06_240)]", name: "Cursor", desc: "IDE con AI integrata" },
    { icon: SiOpenai, color: "text-[oklch(72%_0.06_240)]", name: "ChatGPT", desc: "Custom GPTs knowledge" },
    { icon: SiGooglegemini, color: "text-[oklch(72%_0.06_240)]", name: "Gemini", desc: "AI di Google" },
    { icon: SiPerplexity, color: "text-[oklch(72%_0.06_240)]", name: "Perplexity", desc: "AI search engine" },
    { icon: SiNotebooklm, color: "text-[oklch(72%_0.06_240)]", name: "NotebookLM", desc: "AI notebook di Google" },
    { icon: SiClaude, color: "text-[oklch(72%_0.06_240)]", name: "Claude Code", desc: "AI coding assistant" },
];

const faqs = [
    { q: "Cos'è una Skill per AI agent?", a: "Una Skill è un file Markdown con frontmatter YAML che contiene regole, trigger e best practice strutturate. Gli agenti AI (Cursor, Claude, ChatGPT) la usano come contesto per rispondere in modo più preciso e contestuale." },
    { q: "Come viene estratto il contenuto da YouTube?", a: "Skillgrowth utilizza la libreria youtube-transcript per scaricare la trascrizione automatica dei video. Se la trascrizione non è disponibile, estrae la descrizione e i metadati del video tramite l'API oEmbed di YouTube." },
    { q: "I miei dati sono al sicuro?", a: "Assolutamente sì. I dati vengono elaborati lato server e salvati in MongoDB. Non condividiamo né vendiamo i tuoi contenuti. Puoi eliminare bucket e fonti in qualsiasi momento." },
    { q: "Quali formati di AI supportate?", a: "Supportiamo Cursor (.cursorrules), Claude AI Projects, Custom GPTs (ChatGPT), MCP Server (Model Context Protocol), Windsurf, GitHub Copilot e qualsiasi LLM che accetti file Markdown come contesto." },
    { q: "Devo avere un account per usare Skillgrowth?", a: "Sì, è necessario un account gratuito con Google OAuth per salvare bucket, fonti e generare Skill. La registrazione richiede meno di 30 secondi." },
    { q: "Cosa succede se supero i limiti del piano Free?", a: "Il piano Free ti permette 3 bucket e 10 fonti totali. Se raggiungi il limite, ti invitiamo a fare upgrade al piano Pro (€9/mese) per 10 bucket e 100 fonti, o Team (€29/mese) per risorse illimitate." },
    { q: "Come funziona l'estensione browser?", a: "L'estensione Chrome/Edge/Firefox aggiunge un pulsante contestuale. Cliccando 'Trasforma in Markdown' su qualsiasi pagina, il contenuto viene pulito da ads e rumore, convertito in Markdown e salvato direttamente nel tuo bucket." },
];

export default function Home() {
    const { t } = useTranslation();
    const [activeDemo, setActiveDemo] = useState("demo-yt");
    const [viewMode, setViewMode] = useState<"preview" | "raw">("raw");
    const [output, setOutput] = useState("");
    const [activeTab, setActiveTab] = useState("cursor");
    const [openFaq, setOpenFaq] = useState(-1);
    const [wordIdx, setWordIdx] = useState(0);
    const [charIdx, setCharIdx] = useState(0);
    const [deleting, setDeleting] = useState(false);

    const words = ["YouTube", "X / Twitter", "Reddit", "PDF", "Pagine Web", "Discord", "Blog", "Documentazione"];

    useEffect(() => {
        const current = words[wordIdx];
        const timeout = setTimeout(() => {
            if (!deleting) {
                if (charIdx < current.length) {
                    setCharIdx(charIdx + 1);
                } else {
                    setTimeout(() => setDeleting(true), 1500);
                }
            } else {
                if (charIdx > 0) {
                    setCharIdx(charIdx - 1);
                } else {
                    setDeleting(false);
                    setWordIdx((wordIdx + 1) % words.length);
                }
            }
        }, deleting ? 25 : 50);
        return () => clearTimeout(timeout);
    }, [charIdx, deleting, wordIdx, words]);

    const displayText = words[wordIdx].slice(0, charIdx);

    return (
        <main className="min-h-screen bg-[oklch(13%_0.006_260)] text-white overflow-hidden selection:bg-cyan/30 selection:text-white relative"
style={{backgroundImage:`radial-gradient(ellipse 70% 40% at 50% 0%,oklch(72% 0.06 240/0.08) 0%,transparent 60%),radial-gradient(ellipse 40% 30% at 80% 40%,oklch(72% 0.06 240/0.04) 0%,transparent 50%),radial-gradient(ellipse 30% 40% at 20% 60%,oklch(72% 0.06 240/0.03) 0%,transparent 50%),radial-gradient(ellipse 60% 30% at 50% 100%,oklch(72% 0.06 240/0.05) 0%,transparent 50%)`}}>


            {/* Hero Section */}
            <section className="pt-32 pb-24 px-6 relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(72%_0.06_240/0.08)_0%,transparent_70%)] pointer-events-none" />
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <h1 className="text-[32px] md:text-[60px] font-semibold mb-6 leading-tight text-white">
                        <span className="text-white">Trasforma </span>
                        <span className="text-cyan">
                            {displayText}
                            <svg width="7" height="1.25em" viewBox="0 0 7 28" className="inline-block align-middle ml-px animate-blink">
                                <rect x="0" y="-22" width="3" height="65" rx="0" fill="currentColor" opacity="0.8" />
                            </svg>
                        </span>
                        <br />
                        <span className="text-white">in Skill per i tuoi Agenti AI</span>
                    </h1>
                    <p className="text-base md:text-lg text-gray max-w-2xl mx-auto mb-10 leading-relaxed [&_strong]:text-white">
                        <span dangerouslySetInnerHTML={{ __html: t.hero.subtitle }} />
                    </p>

                    {/* Source Platforms Scroller */}
                    <div className="mb-0 relative max-w-2xl mx-auto overflow-hidden mask-fade-x">
                        <div className="flex scroll-track scroll-track-right items-center">
                            {sources.map((s, i) => (
                                <div key={i} className="shrink-0 flex items-center gap-3 mr-14">
                                    <s.icon className="text-[oklab(60%_-0.00173648_-0.00984808/0.7)] text-2xl" />
                                    <span className="text-sm text-[oklab(60%_-0.00173648_-0.00984808/0.7)] whitespace-nowrap">{s.name}</span>
                                </div>
                            ))}
                            {sources.map((s, i) => (
                                <div key={`dup-${i}`} className="shrink-0 flex items-center gap-3 mr-14">
                                    <s.icon className="text-[oklab(60%_-0.00173648_-0.00984808/0.7)] text-2xl" />
                                    <span className="text-sm text-[oklab(60%_-0.00173648_-0.00984808/0.7)] whitespace-nowrap">{s.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Down arrow between scrollers */}
                    <div className="flex justify-center my-4 py-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50">
                            <line x1="12" y1="3" x2="12" y2="19" />
                            <polyline points="19 12 12 19 5 12" />
                        </svg>
                    </div>

                    {/* AI Platforms Scroller */}
<div className="mb-8 relative max-w-2xl mx-auto overflow-hidden mask-fade-x">
                        <div className="flex scroll-track scroll-track-left items-center">
                            {ais.map((a, i) => (
                                <div key={i} className="shrink-0 flex items-center gap-3 mr-14">
                                    <a.icon className="text-[oklab(60%_-0.00173648_-0.00984808/0.7)] text-2xl" />
                                    <span className="text-sm text-[oklab(60%_-0.00173648_-0.00984808/0.7)] whitespace-nowrap">{a.name}</span>
                                </div>
                            ))}
                            {ais.map((a, i) => (
                                <div key={`dup-${i}`} className="shrink-0 flex items-center gap-3 mr-14">
                                    <a.icon className="text-[oklab(60%_-0.00173648_-0.00984808/0.7)] text-2xl" />
                                    <span className="text-sm text-[oklab(60%_-0.00173648_-0.00984808/0.7)] whitespace-nowrap">{a.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

<div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch">
 <Link
                              href="/dashboard/files"
                              className="w-full sm:min-w-[350px] sm:w-auto px-6 py-2.5 bg-[oklch(13%_0.006_260)]/30 text-white font-bold text-sm border border-cyan/30 transition-all active:scale-95 inline-flex items-center justify-center gap-2.5 hover:bg-cyan"
                          >
                              <FaChrome className="w-4 h-4 text-white" />
                              {t.hero.cta_extension}
                          </Link>
                          <a
                              href="#demo"
                              className="w-full sm:min-w-[350px] sm:w-auto px-6 py-2.5 border border-white/10 text-white/80 font-semibold text-sm transition-all inline-flex items-center justify-center hover:bg-cyan/20 hover:text-white"
                          >
                              {t.hero.cta_playground}
                          </a>
                     </div>
                </div>
            </section>



            {/* Demo Section: Social Preview → Skill Output */}
            <section id="demo" className="py-24 px-6 max-w-5xl mx-auto scroll-mt-20">
                <div className="text-center mb-14">
                    <h2 className="text-2xl md:text-4xl font-bold text-white mt-4 tracking-tight">
                        {t.demo.title}
                    </h2>
                    <p className="text-sm text-gray mt-2 max-w-lg mx-auto">
                        {t.demo.subtitle}
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-6 items-stretch">
                    {/* Sidebar: Social Preview Cards */}
                    <div className="lg:col-span-4 space-y-2 max-h-[700px] overflow-y-auto pr-1 scrollbar-custom">
                        {demoItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => { setActiveDemo(item.id); setOutput(""); }}
                                className={`w-full text-left p-3.5 border transition-all ${activeDemo === item.id
                                    ? "bg-white/4 border-white/15"
                                    : "bg-transparent border-white/6 hover:bg-white/2 hover:border-white/10"
                                    }`}
                            >
                                <div className="flex gap-3 items-start">
                                    {/* Thumbnail / Avatar */}
                                    <div className="shrink-0 w-12 h-12 overflow-hidden border border-white/6 flex items-center justify-center text-xl">
                                        {item.type === "youtube" && <FaYoutube className="w-5 h-5 text-red-500" />}
                                        {item.type === "instagram" && <FaInstagram className="w-5 h-5 text-pink-500" />}
                                        {item.type === "x" && <FaXTwitter className="w-5 h-5 text-gray" />}
                                        {item.type === "reddit" && <FaRedditAlien className="w-5 h-5 text-orange-500" />}
                                        {item.type === "linkedin" && <FaLinkedin className="w-5 h-5 text-blue-500" />}
                                        {["blog", "article", "essay", "newsletter"].includes(item.type) && item.url && (
                                            <img
                                                src={`https://www.google.com/s2/favicons?domain=${new URL(item.url).hostname}&sz=48`}
                                                alt=""
                                                className="w-5 h-5"
                                                loading="lazy"
                                            />
                                        )}
                                    </div>
                                    {/* Meta */}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-white truncate">{item.title}</div>
                                        <div className="text-xs text-gray mt-1 truncate">{item.source}</div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="px-2 py-0.5 bg-slate-800 text-[12px] font-bold uppercase text-gray tracking-wider">{item.platform}</span>
                                            {item.date && <span className="text-[12px] text-gray">{item.date}</span>}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Container: Skill Output */}
                    <div className="lg:col-span-8 bg-white/2 border border-white/8 flex flex-col h-[700px]">
                        {/* Terminal header */}
                        <div className="px-4 py-2 bg-[oklch(13%_.006_260)]/40 border-b border-white/6 shrink-0 space-y-1.5">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-white/10"></span>
                                <span className="w-2 h-2 bg-white/10"></span>
                                <span className="w-2 h-2 bg-white/10"></span>
                                <span className="ml-2 text-[12px] font-mono text-gray">skill_{demoItems.find(d => d.id === activeDemo)?.type}.md</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setViewMode("preview")}
                                    className={`px-3 py-1 text-xs font-medium tracking-wider uppercase transition-colors ${viewMode === "preview" ? "bg-white/10 text-white" : "text-gray hover:text-white"}`}
                                >Preview</button>
                                <button
                                    onClick={() => setViewMode("raw")}
                                    className={`px-3 py-1 text-xs font-medium tracking-wider uppercase transition-colors ${viewMode === "raw" ? "bg-white/10 text-white" : "text-gray hover:text-white"}`}
                                >Raw</button>
                                <span className="w-px h-4 bg-white/6" />
                                <button
                                    onClick={() => navigator.clipboard.writeText(demoItems.find(d => d.id === activeDemo)?.skill || "")}
                                    className="text-xs text-gray hover:text-cyan transition-colors flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    {t.demo.copy}
                                </button>
                                {demoItems.find(d => d.id === activeDemo)?.url && (
                                    <>
                                        <span className="w-px h-4 bg-white/6" />
                                        <a
                                            href={demoItems.find(d => d.id === activeDemo)!.url!}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-gray hover:text-cyan transition-colors flex items-center gap-1"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            Risorsa
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto overscroll-contain">
                            {/* Skill Title */}
                            <div className="px-5 pt-4 pb-2 border-b border-white/5">
                                <h3 className="text-base font-bold text-white">{demoItems.find(d => d.id === activeDemo)?.title}</h3>
                                <p className="text-[12px] text-gray mt-0.5">{demoItems.find(d => d.id === activeDemo)?.source}</p>
                            </div>

                            {demoItems.find(d => d.id === activeDemo)?.type === 'youtube' && (
                                <div className="p-5 bg-[oklch(13%_.006_260)]/20 border-b border-white/5">
                                    <div className="relative w-full aspect-video overflow-hidden border border-white/10 bg-[oklch(13%_.006_260)] shadow-lg">
                                        <iframe
                                            key={activeDemo}
                                            src="https://www.youtube.com/embed/uhJJgc-0iTQ"
                                            title="YouTube video player"
                                            className="absolute top-0 left-0 w-full h-full border-0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        />
                                    </div>
                                </div>
                            )}
                            {demoItems.find(d => d.id === activeDemo)?.type === 'instagram' && (
                                <div className="p-5 bg-[oklch(13%_.006_260)]/20 border-b border-white/5 flex justify-center">
                                    <div className="w-full max-w-[400px] aspect-9/16 overflow-hidden border border-white/10 bg-[oklch(13%_.006_260)] shadow-lg">
                                            <iframe
                                                key={activeDemo}
                                                src="https://www.instagram.com/reel/DZ2eNVsptDb/embed/"
                                                title="Instagram Reel"
                                                className="w-full h-full border-0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            />
                                    </div>
                                </div>
                            )}
                            <div className={`p-5 ${viewMode === 'preview' ? 'text-sm leading-relaxed' : 'font-mono text-xs leading-relaxed'} select-text`}>
                                {output ? (
                                    <pre className="whitespace-pre-wrap text-white">{output}</pre>
                                ) : viewMode === 'preview' ? (
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <ReactMarkdown>{demoItems.find(d => d.id === activeDemo)?.skill?.replace(/^---[\s\S]*?---\s*/, '') || ''}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <pre className="whitespace-pre-wrap text-white">{demoItems.find(d => d.id === activeDemo)?.skill}</pre>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA text after demo */}
                <div className="text-center mt-8">
                    <p className="text-lg md:text-xl text-white max-w-2xl mx-auto leading-relaxed">
                        Pronto a trasformare il tuo modo di fare ricerca?<br />
                        <span className="text-cyan font-semibold">Inizia gratis — nessuna carta di credito.</span>
                    </p>
                </div>
            </section>

            {/* How It Works (Bento Grid) */}
            <section id="howItWorks" className="py-24 px-6 relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(60%_0.01_260/0.03)_0%,transparent_70%)] pointer-events-none" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{t.how.title}</h2>
                        <p className="text-sm text-gray mt-2">{t.how.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-4 gap-4 auto-rows-auto">
                        {[
                            { num: "1", title: t.how.step1_title, desc: t.how.step1_desc },
                            { num: "2", title: t.how.step2_title, desc: t.how.step2_desc },
                            { num: "3", title: t.how.step3_title, desc: t.how.step3_desc },
                            { num: "4", title: t.how.step4_title, desc: t.how.step4_desc },
                            { num: "5", title: t.how.step5_title, desc: t.how.step5_desc },
                        ].map((step, i) => {
                            const spans = [
                                "col-span-2 row-span-1",   // step 1
                                "col-span-1 row-span-1",   // step 2
                                "col-span-1 row-span-1",   // step 3
                                "col-span-1 row-span-2",   // step 4
                                "col-span-3 row-span-1",   // step 5
                            ];
                            return (
                                <div key={step.num} className={`${spans[i]} p-5 bg-white/2 border border-white/6 relative`}>
                                    <span className="w-7 h-7 bg-[oklch(13% .006 260)]/60 text-cyan border border-[oklch(72% .06 240)]/20 flex items-center justify-center text-xs font-bold mb-4">{step.num}</span>
                                    <h4 className="font-bold text-white text-sm mb-2">{step.title}</h4>
                                    <p className="text-xs text-gray leading-relaxed">{step.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Works With Section */}
            <section className="py-24 px-6 max-w-5xl mx-auto">
                <div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-4 text-center">
                            Funziona con le AI che già usi
                        </h2>
                        <p className="text-sm text-gray leading-relaxed mb-12 text-center">
                            Cattura una volta, poi riutilizza la stessa libreria di fonti via MCP, chat e automazioni.
                        </p>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="p-5 bg-white/2 border border-white/8">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan mb-2 block">Agenti AI di coding</span>
                                <div className="flex gap-2 mb-3">
                                    <SiClaude className="w-4 h-4 text-gray/60 shrink-0" title="Claude Code" />
                                    <CursorIcon size={16} className="text-gray/60 shrink-0" title="Cursor" />
                                    <CodexIcon size={16} className="text-gray/60 shrink-0" title="Codex" />
                                    <AntigravityIcon size={16} className="text-gray/60 shrink-0" title="Antigravity" />
                                </div>
                                <p className="text-xs text-gray leading-relaxed">
                                    Collega il server MCP di Skillgrowth a Claude Code, Cursor, Codex o Antigravity. I tuoi agenti possono cercare e consultare le fonti salvate mentre lavorano.
                                </p>
                            </div>
                            <div className="p-5 bg-white/2 border border-white/8">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan mb-2 block">Chat AI</span>
                                <div className="flex gap-2 mb-3">
                                    <SiClaude className="w-4 h-4 text-gray/60" title="Claude" />
                                    <SiOpenai className="w-4 h-4 text-gray/60" title="ChatGPT" />
                                    <SiGooglegemini className="w-4 h-4 text-gray/60" title="Gemini" />
                                    <SiNotebooklm className="w-4 h-4 text-gray/60" title="NotebookLM" />
                                </div>
                                <p className="text-xs text-gray leading-relaxed">
                                    Incolla o carica Markdown pulito dal tuo feed in Claude, ChatGPT, Gemini o NotebookLM quando una conversazione ha bisogno di contesto solido.
                                </p>
                            </div>
                            <div className="p-5 bg-white/2 border border-white/8">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan mb-2 block">Automazioni AI</span>
                                <div className="flex gap-2 mb-3">
                                    <SiN8N className="w-4 h-4 text-gray/60" title="n8n" />
                                    <SiZapier className="w-4 h-4 text-gray/60" title="Zapier" />
                                    <SiMake className="w-4 h-4 text-gray/60" title="Make" />
                                    <SiLangchain className="w-4 h-4 text-gray/60" title="LangChain" />
                                </div>
                                <p className="text-xs text-gray leading-relaxed">
                                    Lascia che n8n, Zapier, Make o LangChain prelevino contesto dalle tue fonti per workflow ripetibili di ricerca, riepilogo e creazione contenuti.
                                </p>
                            </div>
                        </div>

                        {/* AI scroller */}
                        <div className="mt-16 relative overflow-hidden mask-fade-x">
                            <div className="flex scroll-track scroll-track-left items-center">
                                {ais.map((a, i) => (
                                    <div key={i} className="shrink-0 flex items-center gap-3 mr-14">
                                        <a.icon className="w-5 h-5 text-cyan/60" />
                                        <span className="text-sm whitespace-nowrap text-gray/80">{a.name}</span>
                                    </div>
                                ))}
                                {ais.map((a, i) => (
                                    <div key={`dup-${i}`} className="shrink-0 flex items-center gap-3 mr-14">
                                        <a.icon className="w-5 h-5 text-cyan/60" />
                                        <span className="text-sm whitespace-nowrap text-gray/80">{a.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
            </section>

            {/* Extension Section */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(60%_0.01_260/0.04)_0%,transparent_70%)] pointer-events-none" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="text-center mb-14">
                        <h2 className="text-2xl md:text-4xl font-bold text-white mt-4 tracking-tight">
                            Estensione Browser
                        </h2>
                        <p className="text-sm text-gray mt-2 max-w-lg mx-auto">
                            Disponibile sul Chrome Web Store. Installa l'estensione e converti qualsiasi pagina web in Markdown pulito con un click — niente pubblicità, niente codice.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-5 mb-10">
                        <div className="p-6 bg-white/2 border border-white/6 hover:border-[oklch(72% .06 240)]/20 transition-all text-center group">
                            <div className="w-10 h-10 bg-[oklch(13% .006 260)]/50 border border-[oklch(72% .06 240)]/15 text-cyan flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                            </div>
                            <h4 className="font-semibold text-sm text-white mb-2">Un Solo Click Destro</h4>
                            <p className="text-xs text-gray leading-relaxed">Non c'è bisogno di copiare e incollare manualmente. Fai click destro in un punto qualsiasi e ottieni il Markdown.</p>
                        </div>
                        <div className="p-6 bg-white/2 border border-white/6 hover:border-[oklch(72% .06 240)]/20 transition-all text-center group">
                            <div className="w-10 h-10 bg-[oklch(13% .006 260)]/50 border border-[oklch(72% .06 240)]/15 text-cyan flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            </div>
                            <h4 className="font-semibold text-sm text-white mb-2">Pulizia Intelligente</h4>
                            <p className="text-xs text-gray leading-relaxed">Il parser rimuove cookie wall, banner di spam, barre laterali e menu di navigazione per salvaguardare il testo reale.</p>
                        </div>
                        <div className="p-6 bg-white/2 border border-white/6 hover:border-[oklch(72% .06 240)]/20 transition-all text-center group">
                            <div className="w-10 h-10 bg-[oklch(13% .006 260)]/50 border border-[oklch(72% .06 240)]/15 text-cyan flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                            </div>
                            <h4 className="font-semibold text-sm text-white mb-2">Pronto all'Ingestione</h4>
                            <p className="text-xs text-gray leading-relaxed">I file salvati sono in puro formato Markdown, ottimizzato per ridurre i token del 60% sui modelli AI.</p>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <a
                            href="https://chromewebstore.google.com/detail/skillgrowth"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-cyan text-black font-bold text-sm transition-all hover:bg-[oklch(60%_0.08_240)] active:scale-95 inline-flex items-center gap-2"
                        >
                            <FaChrome className="w-4 h-4" />
                            Aggiungi a Chrome
                        </a>
                    </div>
                </div>
            </section>

            {/* AI Agents Connection Section */}
            {/* AI Agents Connection Section */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(60%_0.01_260/0.03)_0%,transparent_70%)] pointer-events-none" />
                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="text-center mb-14">
                        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Connetti la tua libreria di fonti ai tuoi agenti.</h2>
                        <p className="text-sm text-gray mt-2 max-w-2xl mx-auto leading-relaxed">
                            Usa il nostro server MCP in Claude, Cursor e Codex per accedere alle fonti salvate e catturare nuovi contenuti dal web durante il lavoro.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-10">
                        <div className="p-6 bg-white/2 border border-white/8 flex flex-col">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan mb-3">Lascia che i tuoi agenti leggano e catturino fonti.</span>
                            <p className="text-xs text-gray leading-relaxed flex-1">
                                Collega il server MCP di Skillgrowth a Claude, Cursor o Codex: i tuoi agenti potranno accedere alle fonti salvate e catturare pagine web pubbliche come Markdown pulito per il task corrente.
                            </p>
                        </div>
                        <div className="p-6 bg-white/2 border border-white/8 flex flex-col">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan mb-3">Accedi a tutta la libreria</span>
                            <p className="text-xs text-gray leading-relaxed flex-1">
                                Chiedi al tuo agente di trovare o fare riferimento a fonti specifiche che hai salvato, così da usare il contesto giusto per il task.
                            </p>
                        </div>
                        <div className="p-6 bg-white/2 border border-white/8 flex flex-col">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan mb-3">Cattura nuove fonti dal web</span>
                            <p className="text-xs text-gray leading-relaxed flex-1">
                                Quando un agente cerca o naviga sul web, può catturare pagine pubbliche utili come Markdown pulito e sincronizzare tutto nel tuo account Skillgrowth.
                            </p>
                        </div>
                    </div>

                    {/* Instant Integration Card */}
                    <div className="p-6 bg-white/2 border border-white/8 flex flex-col mb-10">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-5">
                            <Plug size={14} /> {t.value.integration_title}
                        </h3>

                        {/* Sub-tabs */}
                        <div className="flex border-b border-white/6 mb-4 text-xs">
                            <button
                                onClick={() => setActiveTab("cursor")}
                                className={`pb-2 px-3 border-b-2 font-medium transition-all ${activeTab === "cursor"
                                    ? "border-[oklch(60%_0.06_240)] text-cyan"
                                    : "border-transparent text-gray hover:text-white"
                                    }`}
                            >
                                Cursor (.cursorrules)
                            </button>
                            <button
                                onClick={() => setActiveTab("claude")}
                                className={`pb-2 px-3 border-b-2 font-medium transition-all ${activeTab === "claude"
                                    ? "border-[oklch(60%_0.06_240)] text-cyan"
                                    : "border-transparent text-gray hover:text-white"
                                    }`}
                            >
                                Claude Projects
                            </button>
                            <button
                                onClick={() => setActiveTab("gpts")}
                                className={`pb-2 px-3 border-b-2 font-medium transition-all ${activeTab === "gpts"
                                    ? "border-[oklch(60%_0.06_240)] text-cyan"
                                    : "border-transparent text-gray hover:text-white"
                                    }`}
                            >
                                Custom GPTs
                            </button>
                        </div>

                        {/* Code Box */}
                        <div className="p-4 bg-[oklch(13%_.006_260)]/40 border border-white/6 font-mono text-[12px] leading-relaxed text-gray">
                            {activeTab === "cursor" && (
                                <>
                                    <span className="text-gray block mb-2">Aggiungi il file <code className="bg-[oklch(13%_0.006_260)] px-1 py-0.5 rounded text-white">.cursorrules</code> alla radice del tuo workspace:</span>
                                    <pre className="text-cyan">
                                        {`# Convenzioni Architetturali del Progetto

[skill: nextjs-react19-core-skill]
- Utilizza React Server Components per il data fetching.
- Non aggiungere "use client" a meno che non vi sia stato.

[skill: agentic-ai-mcp-integration]
- In caso di errori complessi, esegui cicli di Reflection.
- Scrivi test sintetici prima di inviare le modifiche.`}
                                    </pre>
                                </>
                            )}
                            {activeTab === "claude" && (
                                <>
                                    <span className="text-gray block mb-2">Crea un Progetto Claude e carica il file compilato nella sezione Files:</span>
                                    <div className="space-y-2 mt-1">
                                        <div className="flex gap-2">
                                            <span className="text-cyan">1.</span>
                                            <span>Clicca su "Add Files" nella barra laterale destra del tuo progetto Claude.</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-cyan">2.</span>
                                            <span>Trascina il file <code className="bg-[oklch(13%_0.006_260)] px-1 py-0.5 rounded text-white">mcp-setup-guide.md</code> salvato da Skillgrowth.</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-cyan">3.</span>
                                            <span>L'AI leggerà le definizioni YAML e attiverà il contesto non appena interrogherai il modello.</span>
                                        </div>
                                    </div>
                                </>
                            )}
                            {activeTab === "gpts" && (
                                <>
                                    <span className="text-gray block mb-2">Importa le tue skill nella Knowledge Base del tuo GPT Personalizzato:</span>
                                    <div className="space-y-2 mt-1">
                                        <div className="flex gap-2">
                                            <span className="text-cyan">1.</span>
                                            <span>Vai in "Edit GPT" e clicca sulla scheda "Configure".</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-cyan">2.</span>
                                            <span>Scorri fino a "Knowledge" e clicca su "Upload files".</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-cyan">3.</span>
                                            <span>Carica il file della skill compilata. L'AI userà le regole per formattare gli output di sviluppo.</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <Link
                            href="/account/connections"
                            className="px-6 py-3 bg-cyan text-black font-bold text-sm transition-all hover:bg-[oklch(60%_0.08_240)] active:scale-95 inline-flex items-center gap-2"
                        >
                            <FaGear className="w-4 h-4" />
                            Configura connessione
                        </Link>
                    </div>
                </div>
            </section>

            <PricingSection />

            <section className="py-24 px-6 relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,oklch(60%_0.01_260/0.03)_0%,transparent_70%)] pointer-events-none" />
                <div className="max-w-2xl mx-auto relative z-10">
                    <div className="text-center mb-14">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mt-2 tracking-tight">{t.faq.title}</h2>
                        <p className="text-sm text-gray mt-2 max-w-lg mx-auto">{t.faq.subtitle}</p>
                    </div>

                    <div className="flex flex-col gap-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className={`bg-white/2 border transition-all ${openFaq === i ? "border-[oklch(72% .06 240)]/20" : "border-white/6"}`}>
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                                    className="w-full px-5 py-4 flex items-center justify-between cursor-pointer text-sm font-medium text-white hover:text-cyan transition-colors list-none text-left"
                                >
                                    {faq.q}
                                    <svg className={`w-4 h-4 shrink-0 text-gray transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === i ? "max-h-[500px]" : "max-h-0"}`}
                                >
                                    <div className="px-5 pb-4 text-xs text-gray leading-relaxed border-t border-white/6 pt-3">
                                        {faq.a}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}

