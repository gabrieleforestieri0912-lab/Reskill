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
import Marquee from "@/components/Marquee";

const demoItems = [
    {
        id: "demo-yt",
        type: "youtube",
        platform: "YouTube",
        title: "Agentic Workflows: Build AI Agents in 2026",
        source: "Alex Developer · 124K views",
        date: "2 giorni fa",
        url: "https://www.youtube.com/watch?v=uhJJgc-0iTQ",
        logo: "https://www.google.com/s2/favicons?domain=youtube.com&sz=128",
        thumbnail: "https://i.ytimg.com/vi/uhJJgc-0iTQ/hqdefault.jpg",
        excerpt: "Come progettare agenti AI con orchestratori, tool registry e memoria: pattern ReAct, Plan-Execute e reflection.",
        stats: "24 min · 124K visualizzazioni",
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
- Flat prompts instead of structured skill files

## 5. From Video to Skill

When this transcript becomes a Skill, keep one rule per bullet and attach a trigger to each pattern:

\`\`\`yaml
triggers:
  - "user asks for agent architecture"
  - "multi-step coding task"
  - "tool-calling loop"
\`\`\`

> Timestamped segments (every ~30s) let the AI cite the exact moment a concept was explained.

## Full Transcript Structure

A 24-minute technical talk like this one typically breaks down into reusable chapters — each one a candidate sub-skill:

| Timestamp | Chapter | Reusable pattern |
|-----------|---------|------------------|
| 00:00–03:30 | Why agents, why now | The "batch vs interactive" framing for stakeholders |
| 03:30–09:00 | Orchestrator design | State-machine loop you can copy into any project |
| 09:00–15:30 | Tool registry | Zod-schema pattern for typed tool definitions |
| 15:30–20:00 | Memory strategies | Vector vs KV trade-off table for your own docs |
| 20:00–24:00 | Live demo + Q&A | Failure cases worth turning into anti-patterns |

## Turning Chapters into Triggers

One video, many Skills: split by chapter instead of saving one giant file.

\`\`\`yaml
# skill: agent-orchestrator-loop
triggers:
  - "designing an agent loop"
  - "LangGraph vs Semantic Kernel"
  - "state machine for LLM tools"
\`\`\`

\`\`\`yaml
# skill: tool-registry-patterns
triggers:
  - "registering tools for an agent"
  - "typed tool schemas with Zod"
  - "MCP tool definitions"
\`\`\`

> Rule of thumb: if a chapter answers a question you get asked twice, it deserves its own Skill file.`
    },
    {
        id: "demo-ig",
        type: "instagram",
        platform: "Instagram",
        title: "AI Coding Setup Tour 2026",
        source: "@codewithstyle · 89K likes",
        date: "3 giorni fa",
        url: "https://instagram.com/p/ai-coding-setup",
        logo: "https://www.google.com/s2/favicons?domain=instagram.com&sz=128",
        excerpt: "Tour del setup 2026: Cursor con Vim, Warp, MCP filesystem e la stack di estensioni per pair-programming con l'AI.",
        stats: "Reel · 89K mi piace",
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
4. Run local models for quick completions, cloud for complex reasoning

## Replicating This Setup

| Step | Action |
|------|--------|
| 1 | Install Cursor + MCP filesystem server pointing at your skills folder |
| 2 | Add one \`.cursorrules\` file per project, not global |
| 3 | Save this post as a Skill so the AI remembers the stack |

> Visual posts like this one are a goldmine for tooling decisions: extract the table above, not the video frames.

## Editor Configuration

The core of the setup is a tuned \`settings.json\` — Vim motions everywhere, format-on-save, and AI completions that stay out of the way until summoned:

\`\`\`json
{
  "vim.useSystemClipboard": true,
  "editor.formatOnSave": true,
  "editor.tabSize": 2,
  "cursor.cpp.disabledLanguages": ["markdown"],
  "files.associations": { ".cursorrules": "markdown" }
}
\`\`\`

Keybindings worth stealing:

| Keys | Action | Why it matters |
|------|--------|----------------|
| \`Cmd+K\` | Inline AI edit | Change code without leaving the line |
| \`Cmd+L\` | Chat with codebase | Ask about the whole repo, not one file |
| \`Cmd+Shift+L\` | Add selection to chat | Precise context, fewer wasted tokens |
| \`gd\` (Vim) | Go to definition | Muscle memory beats the mouse |

## Terminal and Shell

Warp with AI suggestions plus a minimal prompt that shows git branch and last-command status. Aliases that pay for themselves in a week:

\`\`\`bash
alias gs="git status -sb"
alias gcm="git commit -m"
alias dev="npm run dev"
alias sk="npx @reskill/mcp --search"
\`\`\`

## MCP Filesystem Wiring

Point the MCP server at the folder where your Skills live, so every agent sees the same library:

\`\`\`json
{
  "mcpServers": {
    "skills": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/you/.reskill/skills"]
    }
  }
}
\`\`\`

## The .cursorrules Template

\`\`\`markdown
# Project conventions (auto-loaded by Cursor)

- Stack: Next.js 16 App Router + Tailwind v4
- All server state via Server Components; client components need a reason
- Commit style: feat/fix/chore + short imperative message
- Never invent APIs: check /docs or ask before assuming an endpoint
\`\`\`

## The context.md Habit

One file per project, updated when architecture decisions are made:

\`\`\`markdown
# Context — checkout-service

- Decided 2026-09: Stripe PaymentIntents, no custom card forms
- Gotcha: webhooks must be idempotent (Stripe retries for 3 days)
- Owner: @codewithstyle — ask before touching pricing logic
\`\`\`

## Daily Workflow with AI

1. **Morning**: pull latest Skills into the agent ("what changed in my MCP skill?").
2. **Build**: inline edits for boilerplate, chat for architecture questions.
3. **Review**: paste the diff and ask for the three riskiest lines — then verify each one yourself.
4. **Evening**: save anything you explained twice into a Skill so you never type it again.

## Indicative Monthly Cost

| Item | Plan | Cost/month |
|------|------|------------|
| Cursor Pro | Individual | ~20 EUR |
| Warp | Free tier | 0 |
| AI API overflow | Pay-as-you-go | 5–15 EUR |
| Reskill Pro | 500 credits | 4.99 EUR |

> The whole stack costs less than one hour of freelance work — and this exact setup is what the reel walks through, timestamp by timestamp.`
    },
    {
        id: "demo-x",
        type: "x",
        platform: "X",
        title: "Thread: 5 Prompt Engineering Lessons",
        source: "@techemystic · 2.4K likes",
        date: "1 settimana fa",
        url: "https://x.com/techemystic/status/prompt-engineering-thread",
        logo: "https://www.google.com/s2/favicons?domain=x.com&sz=128",
        excerpt: "Cinque lezioni dalla produzione: specificità, ruolo + contesto + formato, chain-of-thought e few-shot.",
        stats: "18 post · 2.4K mi piace",
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

Start broad, then narrow constraints. First pass: general architecture. Second pass: specific implementation details.

## Thread Cheat-Sheet

| Lesson | One-liner to remember |
|--------|----------------------|
| Specificity | Constraints beat adjectives |
| Role + Context + Format | Three lines before every big task |
| Chain of Thought | "Reason step-by-step" first |
| Few-Shot | 2-3 examples > 10 vague ones |
| Refinement | Broad → narrow, never the reverse |

> Save threads like this as Skills: X posts disappear from memory, Markdown does not.

## Full 18-Post Breakdown

Long threads follow a hidden arc — hook, lessons, proof, CTA. Mapping it tells your AI which part to quote for each question:

| Posts | Role | What to extract |
|-------|------|-----------------|
| 1–2 | Hook + credibility | The opening line that earned 2.4K likes |
| 3–7 | Lessons 1–2 with examples | Bad-vs-good prompt pairs (copy verbatim) |
| 8–12 | Lessons 3–4 + data | The "40% fewer hallucinations" claim + context |
| 13–16 | Lesson 5 + war stories | Production anecdotes for stakeholder buy-in |
| 17–18 | CTA + replies | Best follow-up questions from the comments |

## Reply Goldmine

The most-liked replies often beat the thread itself:

- **@promptwitch**: "Role prompting fails without output format — always pair them." (412 likes)
- **@shipit_dev**: "We cut support tickets 18% by adding 2 examples to our bot prompt." (287 likes)
- **@techemystic (OP)**: "Biggest mistake: 500-word system prompts. Constraints > prose." (531 likes)

## Prompt Templates from the Thread

\`\`\`
ROLE: You are a {seniority} {domain} expert.
CONTEXT: {stack}, {constraints}, {audience}.
TASK: {one verb + one deliverable}.
FORMAT: {code only | table | max N bullets}.
THINK: Reason step-by-step before answering.
EXAMPLES: {2 pasted examples of great output}.
\`\`\`

> Fill the braces, paste into any model, and you have applied all five lessons at once.`
    },
    {
        id: "demo-reddit",
        type: "reddit",
        platform: "Reddit",
        title: "I built a MCP server in 2 hours — here's how",
        source: "r/cursor · 342 upvotes",
        date: "5 giorni fa",
        url: "https://reddit.com/r/cursor/comments/mcp-server-guide",
        logo: "https://www.google.com/s2/favicons?domain=reddit.com&sz=128",
        excerpt: "Guida passo-passo con i commenti top della community: init, tool review_code e configurazione in Cursor.",
        stats: "342 upvote · 89 commenti",
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

Add to \`.cursor/mcp.json\` and restart. The tool appears automatically in AI completions.

## Top Community Tips (from comments)

- **u/mcp_fan**: "Pin your SDK version — protocol 1.x changed the handshake twice this year."
- **u/dev_journey (OP)**: "Start with one read-only tool. Write tools only after the read path works."
- **u/cursor_power**: "Name tools like functions (\`review_code\`), not like endpoints — the model picks them better."

## Debugging Checklist

1. Run the server with \`npx -y mcp-inspector\` before wiring it into the IDE
2. Check stderr logs: most failures are Zod schema mismatches
3. Restart the MCP host after every config change

## Comment Highlights by Theme

| Theme | Verdict from the thread |
|-------|------------------------|
| Host choice | Cursor just works; Claude Desktop needs manual JSON edits |
| Transport | stdio for local, SSE the moment a teammate needs the same server |
| Auth | Bearer tokens via env, never hardcoded in mcp.json |
| Testing | mcp-inspector catches 90% of bugs before the IDE is involved |
| Versioning | Pin SDK + protocol version together or face handshake errors |

## Minimal Production Server

\`\`\`typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "docs-search", version: "1.0.0" });

server.tool(
  "search_docs",
  "Full-text search over the team's documentation",
  { query: z.string(), limit: z.number().default(5) },
  async ({ query, limit }) => ({
    content: [{ type: "text", text: JSON.stringify(await search(query, limit)) }],
  })
);

await server.connect(new StdioServerTransport());
\`\`\`

## What the Post Deliberately Skips

- **Resources vs tools**: use resources for readable context, tools for actions with side effects.
- **Sampling**: letting the server ask the model back is powerful — and a security boundary. Treat it as untrusted input.
- **Pagination**: cap every list tool (default 5–10) or the model drowns in JSON.`
    },
    {
        id: "demo-linkedin",
        type: "linkedin",
        platform: "LinkedIn",
        title: "How We Scaled AI Agents to Production",
        source: "Maria Rossi · 1.2K reactions",
        date: "4 giorni fa",
        url: "https://linkedin.com/posts/ai-agents-production",
        logo: "https://www.google.com/s2/favicons?domain=linkedin.com&sz=128",
        excerpt: "Semantic caching, human-in-the-loop e rate limiting: le lezioni di chi ha portato gli agenti in produzione.",
        stats: "1.2K reazioni · 214 commenti",
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
- **Fallback models**: Have a cheaper/faster fallback for simple queries

## Production Readiness Scorecard

| Area | Target | How to verify |
|------|--------|---------------|
| Cost per task | < $0.05 | Token usage dashboard per user |
| P95 latency | < 8s | Trace agent spans end-to-end |
| Human approval | 100% of destructive ops | Audit log of confirmations |
| Cache hit rate | > 40% | Semantic cache metrics |

> LinkedIn posts like this compress months of production pain into minutes: extract the scorecard, then ask your AI to grade your own stack against it.

## The Scaling Timeline

| Phase | Team size | Architecture | What breaks next |
|-------|-----------|--------------|------------------|
| Prototype | 1–2 | Single agent, one model | Costs spike on first real traffic |
| Pilot | 3–5 | Router + 3 specialists | No observability — debugging is guesswork |
| Growth | 5–15 | Cached tools, HITL gates | Stale context causes wrong actions |
| Scale | 15+ | Multi-region, fallbacks | Rate limits and noisy-neighbor tenants |

## Comment Section Wisdom (214 comments distilled)

- **On caching**: "Semantic cache paid for our entire infra team. 40% is conservative — we see 55%." (top reply, 198 likes)
- **On HITL**: "Approve-by-default with undo beats approve-everything. Operators fatigue in week two." (143 likes)
- **On evals**: "If you can't replay a failing trace, you don't have evals — you have vibes." (121 likes)
- **Maria (author) reply**: "Biggest regret: building the orchestrator before the tracing. Instrument first."

## Cost Model per 1K Tasks

| Setup | Tokens/task | Cost/1K tasks |
|-------|-------------|---------------|
| GPT-class, no cache | ~12K | ~$60 |
| Same + semantic cache | ~5K | ~$25 |
| Small model + tools + cache | ~4K | ~$4 |

> Numbers move fast, but the ordering never changes: cache first, downgrade model second, optimize prompts last.`
    },
    {
        id: "demo-blog",
        type: "blog",
        platform: "Blog",
        title: "The Rise of MCP: Model Context Protocol Explained",
        source: "techblog.dev · 15 min read",
        date: "1 mese fa",
        url: "https://techblog.dev/mcp-protocol-guide",
        logo: "https://www.google.com/s2/favicons?domain=techblog.dev&sz=128",
        excerpt: "MCP spiegato bene: architettura client-server, discovery dinamica, schemi tipizzati e setup filesystem.",
        stats: "15 min di lettura · 8 sezioni",
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

## FAQ from the Article

**Q: Is MCP tied to one vendor?**
No — it is an open standard. Any client (Cursor, Claude, Windsurf) can talk to any server over stdio or SSE.

**Q: Filesystem vs remote servers?**
Filesystem for personal skills on your machine; remote (SSE/HTTP) when a team shares one knowledge base.

## Try It in 5 Minutes

1. Save this article as a Skill with Reskill
2. Point an MCP filesystem server at the download folder
3. Ask your agent: "list my skills about MCP" — it will discover the file on its own

## Protocol Deep Dive

MCP separates three concerns that older plugin systems tangled together:

| Concern | MCP answer | Why it matters |
|---------|-----------|----------------|
| Discovery | Capability negotiation at connect | No hardcoded tool lists in prompts |
| Invocation | JSON-RPC 2.0 over stdio/SSE | Same contract, local or remote |
| Context | Resources (read) vs Tools (act) | The model knows what is safe to touch |

## Server Types Compared

| Type | Transport | Best for | Example |
|------|-----------|----------|---------|
| Filesystem | stdio | Personal skills on your machine | \`server-filesystem ./skills\` |
| Docs search | stdio/SSE | Team knowledge bases | Reskill MCP server |
| Browser control | SSE | E2E agents | Playwright MCP |
| Cloud APIs | Streamable HTTP | Multi-tenant SaaS | Hosted connectors |

## Security Notes Worth Saving

- Treat tool descriptions as attack surface: a malicious server can prompt-inject via them.
- Prefer read-only tools during evaluation; enable writes per-task, not per-session.
- Sampling (server → model callbacks) must be sandboxed like any user input.

## Glossary for the Team

- **Host**: the AI app (Cursor, Claude Desktop) that owns the model.
- **Client**: the MCP connection inside the host (one per server).
- **Server**: your code, exposing tools/resources/prompts.
- **Transport**: stdio for local processes, SSE or streamable HTTP for remote ones.`
    },
    {
        id: "demo-article",
        type: "article",
        platform: "Article",
        title: "The Future of AI-Assisted Development",
        source: "stackoverflow.blog · 12 min read",
        date: "2 settimane fa",
        url: "https://stackoverflow.blog/ai-assisted-dev",
        logo: "https://www.google.com/s2/favicons?domain=stackoverflow.blog&sz=128",
        excerpt: "Da autocomplete ad agenti autonomi: tre trend che ridefiniscono il mestiere dello sviluppatore.",
        stats: "12 min di lettura · 3 trend",
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
| Tech Lead | Agent orchestration, quality gates, skill authoring |

## What to Do Monday Morning

1. **Audit your context**: find the three prompts you paste most often — those are your first Skills.
2. **Version them**: move one prompt into a \`.md\` file in the repo and watch onboarding time drop.
3. **Measure**: track "time to first correct answer" before and after the Skill exists.

## Signals This Trend Is Real

- IDEs shipping native MCP support (tool discovery inside completions)
- Agent benchmarks (AgentBench 2.0) scoring tool-use, not just chat
- Teams hiring for "agent orchestration" instead of "prompt engineering"

## Junior vs Senior in the Agent Era

| Task | Old world | Agent-assisted |
|------|-----------|----------------|
| Boilerplate CRUD | Typed by hand | Generated, human reviews the edges |
| Debugging | Print statements | Agent bisects with tool calls, human confirms |
| Docs | Written last, rots first | Generated from the Skill, reviewed like code |
| Onboarding | Weeks of shadowing | "Read these 3 Skills, then ask the agent" |

## The Skill Flywheel

\`\`\`
Save what you read
      ↓
Compile Skills per topic
      ↓
Agents answer with YOUR context
      ↓
Better answers → more trust → more saving
\`\`\`

Each loop makes the next one cheaper: the first Skill takes an hour, the tenth takes ten minutes because patterns repeat.

## Counter-Arguments (Steelmanned)

- **"Skills go stale"**: true — which is why they live in git with owners and quarterly reviews, unlike chat history.
- **"The model already knows this"**: models know the average; Skills encode *your* stack, *your* customers, *your* edge cases.
- **"Too much process"**: start with one file. Process earns its keep at Skill #5, not before.`
    },
    {
        id: "demo-essay",
        type: "essay",
        platform: "Essay",
        title: "Why Skills Will Replace Prompts",
        source: "medium.com/@aiden · 8 min read",
        date: "3 settimane fa",
        url: "https://medium.com/ai-thoughts/skills-over-prompts",
        logo: "https://www.google.com/s2/favicons?domain=medium.com&sz=128",
        excerpt: "I prompt sono effimeri, le skill sono permanenti: versionamento, condivisione e componibilità.",
        stats: "8 min di lettura · 4.1K claps",
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

## Skill Starter Template

\`\`\`yaml
---
name: my-first-skill
description: When to load this knowledge
trigger: the exact user request that activates it
tags: [2-4 keywords]
version: 1.0.0
---

## Principles
## Rules (one action per bullet)
## Anti-patterns
## Example input → output
\`\`\`

## Migration Path: Prompts → Skills

1. Collect your 5 most-reused prompts
2. Group them by trigger (same trigger = same Skill)
3. Add one negative condition each ("do NOT use when…")
4. Store in git; review quarterly like code

## Anatomy of a Great Trigger

Triggers fail in two ways: too broad (fires everywhere) or too narrow (never fires). Aim for the middle:

| Bad trigger | Why it fails | Fixed trigger |
|-------------|--------------|---------------|
| "react" | Half your questions mention React | "React Server Component data fetching" |
| "code review" | Fires on any review | "Reviewing a PR that touches /payments" |
| "API" | Meaningless alone | "Designing a paginated REST endpoint" |

## Negative Triggers Are Underrated

Every Skill should say when NOT to load — it saves thousands of tokens per session:

\`\`\`yaml
trigger: "Postgres query optimization"
do_not_load_when:
  - "the query runs on SQLite"
  - "the table has fewer than 10k rows"
  - "the user asked for ORM-level help, not SQL"
\`\`\`

## Skill Library Layout That Scales

\`\`\`
.skills/
├── frontend/
│   ├── react-server-components.md
│   └── tailwind-theming.md
├── backend/
│   ├── postgres-indexing.md
│   └── stripe-webhooks.md
└── process/
    ├── code-review-checklist.md
    └── incident-postmortem.md
\`\`\`

> Folders mirror how developers already think (stack → topic), so the right Skill is one \`ls\` away even without AI search.`
    },
    {
        id: "demo-newsletter",
        type: "newsletter",
        platform: "Newsletter",
        title: "AI Digest #42 — MCP, Agents, and the New Stack",
        source: "aistackweekly.com · 5.6K subscribers",
        date: "6 giorni fa",
        url: "https://aistackweekly.com/issues/42",
        logo: "https://www.google.com/s2/favicons?domain=aistackweekly.com&sz=128",
        excerpt: "MCP su Copilot, AgentBench 2.0 e il tool della settimana: il digest essenziale in 5 minuti.",
        stats: "#42 · 5 min di lettura",
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

\`Reskill\` An open-source skill manager that syncs AI prompts across Cursor, Claude Code, and Windsurf. Supports MCP filesystem server for context-aware tool calls.

## Quick Links

- [MCP Specification v1.2 Released](https://modelcontextprotocol.io)
- [Reskill GitHub](https://github.com/Reskill)
- [AgentBench 2.0 Results](https://agentbench.dev)

## How to Work This Digest

- **Monday scan**: read only the bold one-liners (2 minutes)
- **Deep dive**: follow exactly one link per week and save it as a source
- **Compound**: after 4 issues, compile the saved links into one "Q3 AI landscape" Skill

## Issue #42 Annotated

**Story 1 — MCP goes mainstream.** GitHub's native Copilot support means MCP servers now run where developers already work. Action: if you maintain internal docs, expose them as an MCP resource this quarter — adoption cost is near zero.

**Story 2 — AgentBench 2.0.** New leaderboard on real-world coding tasks: Claude 4.5 leads, GPT-5 follows, Gemini 3 trails on multi-step tool use. Action: benchmark your own agent on 5 of your tickets before trusting vendor charts.

**Story 3 — Tool of the week: Reskill.** An open-source skill manager syncing prompts across Cursor, Claude Code and Windsurf via MCP filesystem. Action: try it on one bucket before building anything custom.

## Newsletter-to-Skill Pipeline

\`\`\`
Inbox (5 min skim)
  → star 1 link worth keeping
    → Reskill extract → bucket "AI landscape"
      → monthly: compile 4 issues → 1 evergreen Skill
\`\`\`

Twelve issues a year become three Skills that never expire — while everyone else's inbox just fills up.

## Past Issues Worth Retrieving

| Issue | Why it still matters |
|-------|---------------------|
| #38 — RAG is not dead | Chunking strategies that AgentBench later validated |
| #35 — Eval harnesses | The replay-trace pattern Maria's post also recommends |
| #31 — Small models win | Cost math that still holds after two model generations |`,
    },
    {
        id: "demo-github",
        type: "github",
        platform: "GitHub",
        title: "modelcontextprotocol / typescript-sdk",
        source: "github.com · ⭐ 4.8K stars",
        date: "aggiornato 1 giorno fa",
        url: "https://github.com/modelcontextprotocol/typescript-sdk",
        logo: "https://www.google.com/s2/favicons?domain=github.com&sz=128",
        excerpt: "Walkthrough del repo: struttura dei package, pattern Server/Client e come registrare tool tipizzati con Zod.",
        stats: "TypeScript · ⭐ 4.8K · MIT",
        bg: "bg-[oklch(13%_.006_260)]/30",
        skill: `---
title: "MCP TypeScript SDK: repository walkthrough"
source: github
url: "https://github.com/modelcontextprotocol/typescript-sdk"
author: "modelcontextprotocol"
triggers:
 - "MCP SDK"
 - "typescript-sdk structure"
 - "register MCP tool"
---

## Repository Map

\`\`\`
typescript-sdk/
├── src/
│   ├── server/          # McpServer, tool/resource registration
│   ├── client/          # Client, transport negotiation
│   └── types.ts         # Zod schemas for JSON-RPC messages
├── examples/           # minimal server + client
└── README.md           # protocol version matrix
\`\`\`

## Key Patterns

1. **Tools are functions with schemas**: every capability declares a Zod input schema, so the model can call it safely.
2. **Transports are pluggable**: stdio for local IDEs, SSE/streamable HTTP for remote servers.
3. **Version negotiation first**: client and server agree on a protocol version before any tool call.

## Registering a Tool

\`\`\`typescript
server.tool("search_docs", {
  query: z.string().describe("Full-text query"),
  limit: z.number().optional().default(5),
}, async ({ query, limit }) => {
  const hits = await docs.search(query, limit);
  return { content: [{ type: "text", text: JSON.stringify(hits) }] };
});
\`\`\`

## Review Checklist

- [ ] Every tool has a description the model can read
- [ ] Optional params carry defaults, required ones are minimal
- [ ] Errors return text content, never throw across the transport
- [ ] README documents the minimum protocol version

## Package Tour: What Lives Where

| Path | Contains | Read it when |
|------|----------|--------------|
| \`src/server/\` | McpServer, tool/resource/prompt registration | Adding a new capability |
| \`src/client/\` | Client + transport negotiation | Connecting programmatically |
| \`src/types.ts\` | Zod schemas for every message | Debugging handshake failures |
| \`src/shared/\` | URI templates, protocol utils | Implementing custom transports |
| \`examples/\` | Minimal server + client | First 15 minutes with the SDK |

## Transport Decision Guide

\`\`\`
Local IDE or CLI?
├── YES → StdioServerTransport (zero config, one process)
└── NO → Is the server shared across machines?
    ├── YES → Streamable HTTP (session-based, scales)
    └── Legacy only → SSE (deprecated, avoid for new code)
\`\`\`

## Error Handling That Survives Production

\`\`\`typescript
async ({ query }) => {
  try {
    const hits = await docs.search(query);
    if (hits.length === 0) {
      return { content: [{ type: "text", text: "No results. Try broader terms." }] };
    }
    return { content: [{ type: "text", text: JSON.stringify(hits) }] };
  } catch (err) {
    // Never leak stack traces to the model — log server-side instead
    console.error("search_docs failed", err);
    return { content: [{ type: "text", text: "Search unavailable, try again shortly." }] };
  }
}
\`\`\`

## Contribution Signals (from repo pulse)

- Most active area: client transports (HTTP streaming work)
- Good first issues are labeled and usually docs-shaped, not protocol-shaped
- Releases follow the spec version — check the README matrix before upgrading`,
    },
    {
        id: "demo-docs",
        type: "docs",
        platform: "Docs",
        title: "Next.js: Caching in the App Router",
        source: "nextjs.org/docs · Guida ufficiale",
        date: "aggiornata a Next.js 16",
        url: "https://nextjs.org/docs/app/building-your-application/caching",
        logo: "https://www.google.com/s2/favicons?domain=nextjs.org&sz=128",
        excerpt: "Request memoization, data cache, full route cache e router cache: i quattro livelli spiegati con esempi.",
        stats: "Guida ufficiale · 4 livelli di cache",
        bg: "bg-[oklch(13%_.006_260)]/30",
        skill: `---
title: "Next.js App Router caching mental model"
source: web
url: "https://nextjs.org/docs/app/building-your-application/caching"
author: "Vercel Docs"
triggers:
 - "Next.js caching"
 - "app router revalidation"
 - "fetch cache options"
---

## The Four Layers

| Layer | Scope | Opt-out |
|-------|-------|---------|
| Request memoization | Single render pass | N/A (React primitive) |
| Data cache | Persistent (server) | \`cache: 'no-store'\` |
| Full route cache | Build-time prerender | Dynamic APIs |
| Router cache | Client-side (30s) | \`router.refresh()\` |

## Fetch Recipes

\`\`\`typescript
// Cached (default): reused across requests
const data = await fetch("https://api…", { next: { revalidate: 60 } });

// Always fresh: skip every cache layer
const live = await fetch("https://api…", { cache: "no-store" });

// Tagged: revalidate many fetches at once after a mutation
const posts = await fetch("https://api…/posts", { next: { tags: ["posts"] } });
// later, in a Server Action:
import { revalidateTag } from "next/cache";
revalidateTag("posts");
\`\`\`

## Revalidation Rules

- **Time-based**: \`export const revalidate = 60\` per route segment.
- **On-demand**: \`revalidatePath("/blog")\` or \`revalidateTag("posts")\` after mutations.
- **Route handler wins**: a dynamic function (\`cookies()\`, \`headers()\`) opts the whole route out of static rendering.

## Request Memoization in Depth

During a single render pass, React deduplicates identical GET fetches automatically — even across components that never talk to each other:

\`\`\`typescript
// layout.tsx and page.tsx both call getUser() → ONE underlying request
async function getUser(id: string) {
  const res = await fetch(\`https://api…/users/\${id}\`);
  return res.json();
}
\`\`\`

Rules to remember:

- Only GET requests are memoized; POST/PUT always hit the network.
- Memoization lasts for one render pass, then it is gone — it is not a cache.
- Same URL + same options = same memoized result; different options = different entries.

## Data Cache Option Matrix

| Option | Behavior | Use when |
|--------|----------|----------|
| *(default)* | \`force-cache\`, persists after build | Static content, docs, marketing |
| \`cache: 'force-cache'\` | Explicit version of default | You want to be explicit in shared libs |
| \`cache: 'no-store'\` | Fresh on every request | Dashboards, carts, user-specific data |
| \`next: { revalidate: 60 }\` | Stale-while-revalidate, 60s | Feeds, listings, prices that drift slowly |
| \`next: { tags: [...] }\` | Manual invalidation group | Content edited from a CMS or admin panel |

## Static vs Dynamic Rendering

A route is static when every fetch in it is cacheable and no dynamic API is used. One dynamic call anywhere in the tree makes the whole route dynamic:

\`\`\`typescript
import { cookies, headers } from "next/headers";

// Any of these opts the route out of the Full Route Cache:
const token = (await cookies()).get("session");   // dynamic
const ua = (await headers()).get("user-agent");    // dynamic
\`\`\`

Route segment config cheat-sheet:

| Export | Values | Effect |
|--------|--------|--------|
| \`dynamic\` | \`'auto' \\| 'force-dynamic' \\| 'force-static' \\| 'error'\` | Override the automatic behavior |
| \`revalidate\` | \`false \\| 0 \\| number\` | Default revalidation for the segment |
| \`fetchCache\` | \`'auto' \\| 'force-cache' \\| 'only-cache' \\| ...\` | Default fetch caching for the segment |
| \`runtime\` | \`'nodejs' \\| 'edge'\` | Where the route executes |

## Router Cache and Navigation

The client-side Router Cache keeps visited route segments for ~30 seconds so back/forward feels instant:

- Links with prefetch (default in production) warm the cache on hover/viewport.
- \`router.refresh()\` re-fetches the current route and merges fresh Server Components.
- Prefetching can be tuned per link: \`<Link prefetch={false}>\` for rarely visited pages.

## Debugging Cache Issues

1. Inspect the \`x-nextjs-cache\` response header: HIT, MISS or STALE tells you which layer answered.
2. Add temporary logging inside the fetch wrapper to see how often it really runs.
3. Suspect the Data Cache when content updates "randomly late"; suspect memoization when a mutation seems ignored in the same render.
4. In development everything looks dynamic — always verify caching behavior in a production build.

## Decision Flowchart

\`\`\`
Is the data the same for every user?
├── YES → can it be stale for a minute?
│   ├── YES → fetch + revalidate: 60 (or tags)
│   └── NO  → static, default caching
└── NO  → is it per-request only?
    ├── YES → cache: 'no-store'
    └── NO  → tags + on-demand revalidation
\`\`\`

## Anti-Patterns

- Caching user-specific data with a shared key
- Using \`router.refresh()\` in a loop instead of keying the mutation
- Mixing \`force-cache\` with auth headers on the same fetch
- Calling \`revalidatePath\` inside render instead of in a Server Action
- Assuming dev-mode behavior matches production caching

## Quick Reference Card

| Goal | Do this |
|------|---------|
| Blog post, rarely changes | Default fetch, static route |
| Product listing, updates hourly | \`revalidate: 3600\` |
| User dashboard | \`cache: 'no-store'\` |
| CMS content with "publish" button | \`tags: ["cms"]\` + \`revalidateTag\` |
| A/B test per visitor | \`cookies()\` → route becomes dynamic |`,
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
    { q: "Come viene estratto il contenuto da YouTube?", a: "Reskill utilizza la libreria youtube-transcript per scaricare la trascrizione automatica dei video. Se la trascrizione non è disponibile, estrae la descrizione e i metadati del video tramite l'API oEmbed di YouTube." },
    { q: "I miei dati sono al sicuro?", a: "Assolutamente sì. I dati vengono elaborati lato server e salvati in MongoDB. Non condividiamo né vendiamo i tuoi contenuti. Puoi eliminare bucket e fonti in qualsiasi momento." },
    { q: "Quali formati di AI supportate?", a: "Supportiamo Cursor (.cursorrules), Claude AI Projects, Custom GPTs (ChatGPT), MCP Server (Model Context Protocol), Windsurf, GitHub Copilot e qualsiasi LLM che accetti file Markdown come contesto." },
    { q: "Devo avere un account per usare Reskill?", a: "Sì, è necessario un account gratuito con Google OAuth per salvare bucket, fonti e generare Skill. La registrazione richiede meno di 30 secondi." },
    { q: "Cosa succede se supero i limiti del piano Free?", a: "Il piano Free ti permette 1 bucket e 3 fonti totali. Se raggiungi il limite, ti invitiamo a fare upgrade al piano Pro (€4,99/mese, €49,90/anno) per 15 bucket e 100 fonti, o Business (€9,99/mese, €99,90/anno) per 50 bucket e 500 fonti." },
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

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.a,
            },
        })),
    };

    const orgSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Reskill",
        url: "https://reskill.app",
        logo: "https://reskill.app/reskill.png",
        description: "Piattaforma AI che trasforma contenuti web in Skill Markdown strutturate per agenti AI.",
    };

    const softwareSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Reskill",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Chrome, Firefox, Edge, Web",
        url: "https://reskill.app",
        description: "Trasforma YouTube, Reddit, PDF e pagine web in Skill Markdown per agenti AI.",
        offers: [
            { "@type": "Offer", price: "0", priceCurrency: "EUR", name: "Free" },
            { "@type": "Offer", price: "4.99", priceCurrency: "EUR", name: "Pro Mensile" },
            { "@type": "Offer", price: "49.90", priceCurrency: "EUR", name: "Pro Annuale" },
            { "@type": "Offer", price: "9.99", priceCurrency: "EUR", name: "Business Mensile" },
            { "@type": "Offer", price: "99.90", priceCurrency: "EUR", name: "Business Annuale" },
        ],
    };

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

            {/* Structured Data for SEO/GEO/AEO */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />

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
                        <Marquee>
                            {sources.map((s, i) => (
                                <div key={i} className="shrink-0 flex items-center gap-3 mr-14">
                                    <s.icon className="text-[oklab(60%_-0.00173648_-0.00984808/0.7)] text-2xl" />
                                    <span className="text-sm text-[oklab(60%_-0.00173648_-0.00984808/0.7)] whitespace-nowrap">{s.name}</span>
                                </div>
                            ))}
                        </Marquee>
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
                        <Marquee reverse>
                            {ais.map((a, i) => (
                                <div key={i} className="shrink-0 flex items-center gap-3 mr-14">
                                    <a.icon className="text-[oklab(60%_-0.00173648_-0.00984808/0.7)] text-2xl" />
                                    <span className="text-sm text-[oklab(60%_-0.00173648_-0.00984808/0.7)] whitespace-nowrap">{a.name}</span>
                                </div>
                            ))}
                        </Marquee>
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
                                {"thumbnail" in item && (item as { thumbnail?: string }).thumbnail && (
                                    <div className="relative w-full aspect-video overflow-hidden border border-white/10 mb-3 bg-black/40">
                                        <img
                                            src={(item as { thumbnail: string }).thumbnail}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                        <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/70 backdrop-blur text-[10px] font-bold uppercase text-white tracking-wider border border-white/15">{item.platform}</span>
                                    </div>
                                )}
                                <div className="flex gap-3 items-start">
                                    {/* Logo originale della fonte */}
                                    <div className="shrink-0 w-11 h-11 overflow-hidden border border-white/10 bg-white flex items-center justify-center">
                                        {"logo" in item && (item as { logo?: string }).logo ? (
                                            <img
                                                src={(item as { logo: string }).logo}
                                                alt={`Logo ${item.platform}`}
                                                className="w-7 h-7 object-contain"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <span className="text-sm font-bold text-slate-800">{item.platform.charAt(0)}</span>
                                        )}
                                    </div>
                                    {/* Meta */}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-white leading-snug">{item.title}</div>
                                        <div className="text-xs text-gray mt-1 truncate">{item.source}</div>
                                        {"excerpt" in item && (item as { excerpt?: string }).excerpt && (
                                            <p className="text-[11px] text-gray/80 mt-1.5 leading-relaxed line-clamp-2">{(item as { excerpt: string }).excerpt}</p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2">
                                            <span className="px-2 py-0.5 bg-slate-800 text-[12px] font-bold uppercase text-gray tracking-wider">{item.platform}</span>
                                            {"stats" in item && (item as { stats?: string }).stats && (
                                                <span className="text-[11px] text-cyan/80 font-medium">{(item as { stats: string }).stats}</span>
                                            )}
                                            {item.date && <span className="text-[12px] text-gray">· {item.date}</span>}
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
                            <div className="px-5 pt-4 pb-2 border-b border-white/5 flex items-center gap-3">
                                {(() => {
                                    const active = demoItems.find(d => d.id === activeDemo);
                                    const logo = active && "logo" in active ? (active as { logo?: string }).logo : undefined;
                                    return logo ? (
                                        <span className="w-10 h-10 shrink-0 bg-white border border-white/10 flex items-center justify-center">
                                            <img src={logo} alt={`Logo ${active?.platform}`} className="w-6 h-6 object-contain" loading="lazy" />
                                        </span>
                                    ) : null;
                                })()}
                                <div className="min-w-0">
                                    <h3 className="text-base font-bold text-white">{demoItems.find(d => d.id === activeDemo)?.title}</h3>
                                    <p className="text-[12px] text-gray mt-0.5">{demoItems.find(d => d.id === activeDemo)?.source}</p>
                                </div>
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
                            { num: "1", slug: "ingestione-fonti", title: t.how.step1_title, desc: t.how.step1_desc },
                            { num: "2", slug: "pulizia-ai", title: t.how.step2_title, desc: t.how.step2_desc },
                            { num: "3", slug: "compilazione-skill", title: t.how.step3_title, desc: t.how.step3_desc },
                            { num: "4", slug: "connessione-mcp", title: t.how.step4_title, desc: t.how.step4_desc },
                            { num: "5", slug: "lavora-con-ai", title: t.how.step5_title, desc: t.how.step5_desc },
                        ].map((step, i) => {
                            const spans = [
                                "col-span-2 row-span-1",   // step 1
                                "col-span-1 row-span-1",   // step 2
                                "col-span-1 row-span-1",   // step 3
                                "col-span-1 row-span-2",   // step 4
                                "col-span-3 row-span-1",   // step 5
                            ];
                            return (
                                <Link key={step.num} href={`/how-it-works/${step.slug}`} className={`${spans[i]} p-5 bg-white/2 border border-white/6 relative group hover:border-cyan/30 transition-all block`}>
                                    <span className="w-7 h-7 bg-[oklch(13% .006 260)]/60 text-cyan border border-[oklch(72% .06 240)]/20 flex items-center justify-center text-xs font-bold mb-4 group-hover:scale-105 transition-transform">{step.num}</span>
                                    <h4 className="font-bold text-white text-sm mb-2 group-hover:text-cyan transition-colors">{step.title}</h4>
                                    <p className="text-xs text-gray leading-relaxed line-clamp-4">{step.desc}</p>
                                    <span className="inline-flex items-center gap-1 mt-3 text-[11px] font-bold text-cyan/80 group-hover:text-cyan group-hover:gap-2 transition-all">
                                        Approfondisci
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                                    </span>
                                </Link>
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
                                    Collega il server MCP di Reskill a Claude Code, Cursor, Codex o Antigravity. I tuoi agenti possono cercare e consultare le fonti salvate mentre lavorano.
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
                            <Marquee reverse>
                                {ais.map((a, i) => (
                                    <div key={i} className="shrink-0 flex items-center gap-3 mr-14">
                                        <a.icon className="w-5 h-5 text-cyan/60" />
                                        <span className="text-sm whitespace-nowrap text-gray/80">{a.name}</span>
                                    </div>
                                ))}
                            </Marquee>
                        </div>
                    </div>
            </section>

            {/* Extension Section */}
            <section id="estensione" className="py-24 px-6 relative overflow-hidden scroll-mt-20">
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

                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                        <a
                            href="https://chromewebstore.google.com/detail/Reskill"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-cyan text-black font-bold text-sm transition-all hover:bg-[oklch(60%_0.08_240)] active:scale-95 inline-flex items-center justify-center gap-2"
                        >
                            <FaChrome className="w-4 h-4" />
                            Aggiungi a Chrome
                        </a>
                        <Link
                            href="/tools"
                            className="px-6 py-3 border border-white/15 text-white/85 font-semibold text-sm transition-all inline-flex items-center justify-center gap-2 hover:border-cyan/40 hover:text-white"
                        >
                            Usa dal web, senza estensione
                        </Link>
                    </div>
                    <p className="text-center text-xs text-gray mt-4 max-w-md mx-auto">
                        Gli Strumenti web replicano tutte le funzioni dell'estensione: Link → Markdown, YouTube → Markdown e pulizia HTML.
                    </p>
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
                                Collega il server MCP di Reskill a Claude, Cursor o Codex: i tuoi agenti potranno accedere alle fonti salvate e catturare pagine web pubbliche come Markdown pulito per il task corrente.
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
                                Quando un agente cerca o naviga sul web, può catturare pagine pubbliche utili come Markdown pulito e sincronizzare tutto nel tuo account Reskill.
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
                                            <span>Trascina il file <code className="bg-[oklch(13%_0.006_260)] px-1 py-0.5 rounded text-white">mcp-setup-guide.md</code> salvato da Reskill.</span>
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

