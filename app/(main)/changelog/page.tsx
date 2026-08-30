"use client";

import { useTranslation } from "@/translations";

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  items: string[];
}

const changelog: ChangelogEntry[] = [
  {
    version: "0.1.0",
    date: "9 Maggio 2026",
    title: "Initial commit",
    items: [
      "Bootstrap progetto Next.js 16 con App Router, TypeScript e Tailwind CSS",
      "Configurazione Supabase per persistenza dati (bucket, fonti, skill, utenti)",
      "Struttura internazionalizzazione IT/EN con type-safe translations",
      "Setup base UI: tipografia JetBrains Mono, palette cyan scuro, scrollbar custom",
    ],
  },
  {
    version: "0.5.0",
    date: "10 Aprile 2025",
    title: "Alpha privata",
    items: [
      "Landing page con sezioni Hero, Fonti Supportate, Destinazioni Supportate, Demo, Come Funziona, Valore, Pricing, FAQ",
      "Demo live interattiva con 6 esempi di Skill generate (YouTube, X, Instagram, Blog, Reddit, PDF)",
      "Sistema di autenticazione Google OAuth tramite NextAuth",
      "Pricing section con tier Free, Pro, Business, Enterprise",
      "Pagina Privacy Policy e Termini di Servizio",
      "Integrazione Stripe Checkout per upgrade ai piani a pagamento",
      "Customer Portal Stripe per gestione autonoma dell'abbonamento",
    ],
  },
  {
    version: "0.9.0",
    date: "15 Maggio 2025",
    title: "Beta pubblica",
    items: [
      "Estrazione contenuti da YouTube (trascrizioni + metadati), X / Twitter, Reddit, PDF e pagine web",
      "Generazione Skill AI con modelli OpenAI multipli (GPT-4o-mini, GPT-4o, GPT-4.1)",
      "Trigger YAML nel frontmatter per indicare all'AI quando attivare la conoscenza",
      "Riduzione rumore token fino al 60% rispetto all'invio di HTML grezzo",
      "Pulizia automatica HTML (rimozione banner cookie, script, menu, ads)",
      "Bucket illimitati raggruppabili per argomento (es. React Rules, Architettura, MCP)",
      "Esportazione Skill in formato Markdown pronto per Cursor, Claude Projects, Custom GPTs",
    ],
  },
  {
    version: "1.0.0",
    date: "28 Giugno 2025",
    title: "Release stabile",
    items: [
      "Piani & Prezzi con 4 tier (Free, Pro, Business, Enterprise) e gestione abbonamento Stripe",
      "Pagina Account con gestione profilo, lingue, statistiche e ricarica automatica crediti",
      "Dashboard con workspace completo: bucket, fonti, generazione Skill AI, modelli selezionabili",
      "Estensione browser (Chrome/Edge/Firefox) con flusso di collegamento account via OTP email",
      "MCP Server per integrazione diretta con Cursor, Claude Desktop e Windsurf",
      "API REST documentata con autenticazione API Key (header Authorization Bearer)",
      "Gestione connessioni Agenti AI (MCP, API Key, CLI) dalla pagina dedicata",
      "Internazionalizzazione completa IT/EN con hook useTranslation",
      "Webhook Stripe per gestione automatica del ciclo di vita abbonamento",
      "Pagina Feedback con form tipizzato (suggerimento, bug, altro)",
    ],
  },
];

export default function ChangelogPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[oklch(13%_0.006_260)] text-[oklch(98.5%_0.002_260)] pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">{t.changelog.title}</h1>
          <p className="text-xs text-[oklch(60%_0.01_260)] mt-2">{t.changelog.last_update}</p>
        </div>

        <div className="space-y-12">
          <p className="text-sm text-[oklch(60%_0.01_260)] leading-relaxed">{t.changelog.intro}</p>

          <div className="space-y-10">
            {changelog.map((entry) => (
              <article key={entry.version} className="relative pl-6 border-l border-[oklch(72%_0.06_240)]/30">
                <span className="absolute -left-[5px] top-1 w-2.5 h-2.5 bg-[oklch(72%_0.06_240)] rounded-full shadow-[0_0_8px_rgba(110,180,200,0.5)]" />
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-cyan bg-cyan/10 border border-cyan/40 px-2 py-0.5">
                    v{entry.version}
                  </span>
                  <span className="text-xs text-gray">{entry.date}</span>
                </div>
                <h3 className="text-base font-bold text-white mb-3">{entry.title}</h3>
                <ul className="space-y-1.5">
                  {entry.items.map((item, i) => (
                    <li key={i} className="text-xs text-gray leading-relaxed flex gap-2">
                      <span className="text-cyan shrink-0 pt-[2px]">›</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
