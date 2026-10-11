import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://reskill.app";

export const metadata: Metadata = {
  title: "FAQ — Domande Frequenti su Reskill",
  description: "Risposte alle domande più comuni su Reskill: come funziona, prezzi, sicurezza, compatibilità con AI agent, estensione browser e molto altro.",
  alternates: { canonical: `${SITE_URL}/faq` },
  openGraph: {
    title: "FAQ — Reskill",
    description: "Risposte alle domande più comuni su Reskill.",
    url: `${SITE_URL}/faq`,
  },
};

const faqs = [
  {
    question: "Cos'è Reskill?",
    answer: "Reskill è una piattaforma AI che trasforma contenuti web (YouTube, Reddit, X/Twitter, PDF, pagine web) in file Markdown strutturati chiamate 'Skill'. Queste Skill servono come contesto ottimizzato per agenti AI come Cursor, Claude, ChatGPT e MCP server.",
  },
  {
    question: "Come funziona Reskill?",
    answer: "1) Crea un Bucket (raccolta di conoscenze). 2) Aggiungi link di YouTube, Reddit, Twitter, PDF o articoli web. 3) Reskill estrae e pulisce il contenuto. 4) L'AI combina tutto in una singola Skill Markdown strutturata con frontmatter YAML, regole, pattern ed esempi.",
  },
  {
    question: "Cos'è una Skill per AI agent?",
    answer: "Una Skill è un file Markdown con frontmatter YAML che contiene regole, trigger e best practice strutturate. Gli agenti AI la usano come contesto per rispondere in modo più preciso e contestuale. Le Skill includono: Principi Fondamentali, Regole, Pattern, Cosa NON Fare, Esempi Pratici.",
  },
  {
    question: "Quali piattaforme supporta Reskill?",
    answer: "YouTube (trascrizione automatica), X/Twitter (post e thread), Reddit (post + top 10 commenti), PDF (estrazione testo), e qualsiasi pagina web (tramite Readability + Turndown). Supporta anche Instagram e Discord come fonti.",
  },
  {
    question: "Con quali AI funziona Reskill?",
    answer: "Cursor (.cursorrules), Claude AI Projects, Custom GPTs (ChatGPT), MCP Server (Model Context Protocol), Windsurf, GitHub Copilot, e qualsiasi LLM che accetti file Markdown come contesto. Le Skill sono universali.",
  },
  {
    question: "Reskill è gratuito?",
    answer: "Sì! Il piano Free offre 1 bucket, 3 fonti e 10 crediti mensili. I piani a pagamento: Pro (€12/mese) con 15 bucket e 100 fonti, Business (€29/mese) con 50 bucket e 500 fonti, Enterprise (€59/mese) con risorse illimitate.",
  },
  {
    question: "Cosa sono i crediti?",
    answer: "I crediti sono la valuta di Reskill. Ogni tipo di fonte costa crediti diversi: YouTube=10, PDF=8, X/Twitter=5, Reddit=5, Pagina web=3. I crediti si ripristinano automaticamente ogni mese.",
  },
  {
    question: "Come collego le Skill a Cursor?",
    answer: "Copia il contenuto della Skill generata e incollalo nel file .cursorrules alla radice del tuo progetto Cursor. Cursor applicherà automaticamente queste istruzioni ad ogni query AI.",
  },
  {
    question: "Come collego le Skill a Claude?",
    answer: "Scarica il file .md della Skill e caricalo nella sezione 'Project Files' o 'Knowledge' di Claude Projects. L'AI interrogherà questo documento ogni volta che ne ha bisogno.",
  },
  {
    question: "Cos'è il MCP Server?",
    answer: "MCP (Model Context Protocol) è un protocollo aperto che permette agli AI di scoprire e usare strumenti dinamicamente. Reskill espone le tue Skill come strumenti MCP accessibili da qualsiasi agente compatibile (Cursor, Claude, Windsurf).",
  },
  {
    question: "Come funziona l'estensione browser?",
    answer: "L'estensione Chrome/Edge/Firefox aggiunge un pulsante contestuale 'Trasforma in Markdown'. Cliccandolo su qualsiasi pagina, il contenuto viene pulito da ads e rumore, convertito in Markdown e salvato direttamente nel tuo bucket Reskill.",
  },
  {
    question: "I miei dati sono al sicuro?",
    answer: "Sì. I dati vengono elaborati lato server e salvati in Supabase (PostgreSQL). Non condividiamo né vendiamo i tuoi contenuti. Puoi eliminare bucket e fonti in qualsiasi momento. Leggi la nostra Privacy Policy per dettagli completi.",
  },
  {
    question: "Posso usare Reskill con modelli AI locali?",
    answer: "Reskill utilizza modelli OpenAI via API per generare le Skill. Tuttavia, le Skill generate sono in Markdown universale, compatibili con qualsiasi LLM inclusi modelli locali come Llama, Mistral, o Phi.",
  },
  {
    question: "Come cambio piano o disdico l'abbonamento?",
    answer: "Vai su Account > Abbonamento per gestire il tuo piano. Puoi fare upgrade in qualsiasi momento. Per disdire, usa il Portale Clienti Stripe integrato. La disdetta è effettiva alla fine del periodo di fatturazione corrente.",
  },
  {
    question: "Come contatto il supporto?",
    answer: "Puoi inviare feedback direttamente dall'app dalla pagina Feedback. Per supporto tecnico, scrivi a support@reskill.app. I piani Pro e Business includono supporto prioritario.",
  },
];

export default function FAQPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "FAQ", item: `${SITE_URL}/faq` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <Navbar />

      <main className="min-h-screen bg-[oklch(13%_0.006_260)] pt-[73px]">
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-[oklch(72%_0.06_240)]/80 bg-[oklch(13%_.006_260)]/40 px-4 py-2 border border-[oklch(72%_.06_240)]/15">
                FAQ
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-[oklch(98.5%_.002_260)] mt-4 tracking-tight">
                Domande Frequenti
              </h1>
              <p className="text-sm text-[oklch(60%_0.01_260)] mt-3 max-w-lg mx-auto">
                Tutto quello che devi sapere su Reskill, le Skill AI e come iniziare.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group bg-[oklch(98.5%_.002_260)]/2 border border-[oklch(98.5%_.002_260)]/6 open:border-[oklch(72%_.06_240)]/20 transition-all"
                >
                  <summary className="px-6 py-5 flex items-center justify-between cursor-pointer text-sm font-medium text-[oklch(98.5%_.002_260)] group-open:text-[oklch(72%_0.06_240)] transition-colors list-none">
                    {faq.question}
                    <svg className="w-4 h-4 shrink-0 text-slate-600 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-5 text-xs text-[oklch(60%_0.01_260)] leading-relaxed border-t border-[oklch(98.5%_.002_260)]/6 pt-4 mt-0">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>

            <div className="text-center mt-14">
              <p className="text-xs text-[oklch(60%_0.01_260)] mb-4">Non trovi la risposta che cercavi?</p>
              <Link
                href="/feedback"
                className="inline-block px-6 py-3 bg-[oklch(72%_.06_240)] text-[oklch(13%_.006_260)] font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Contattaci
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
