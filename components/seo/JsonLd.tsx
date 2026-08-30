const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://reskill.app";

export function OrganizationJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Reskill",
          url: SITE_URL,
          logo: `${SITE_URL}/reskill.png`,
          description: "Piattaforma AI che trasforma contenuti web in Skill Markdown strutturate per agenti AI.",
          sameAs: [
            "https://twitter.com/reskill_app",
            "https://github.com/reskill",
          ],
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            availableLanguage: ["Italian", "English"],
          },
        }),
      }}
    />
  );
}

export function SoftwareAppJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Reskill",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Chrome, Firefox, Edge, Web",
          url: SITE_URL,
          description: "Trasforma YouTube, Reddit, PDF e pagine web in Skill Markdown strutturate per agenti AI come Cursor, Claude e ChatGPT.",
          offers: [
            {
              "@type": "Offer",
              price: "0",
              priceCurrency: "EUR",
              name: "Free",
              description: "1 Bucket, 3 Fonti, 10 Crediti/mese",
            },
            {
              "@type": "Offer",
              price: "12",
              priceCurrency: "EUR",
              name: "Pro",
              description: "15 Bucket, 100 Fonti, 500 Crediti/mese",
            },
            {
              "@type": "Offer",
              price: "29",
              priceCurrency: "EUR",
              name: "Business",
              description: "50 Bucket, 500 Fonti, 1500 Crediti/mese",
            },
            {
              "@type": "Offer",
              price: "59",
              priceCurrency: "EUR",
              name: "Enterprise",
              description: "Bucket e Fonti illimitati, 5000 Crediti/mese",
            },
          ],
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            ratingCount: "150",
          },
        }),
      }}
    />
  );
}

export function WebSiteJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Reskill",
          url: SITE_URL,
          description: "Trasforma il Web in Skill Markdown per AI Agent",
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${SITE_URL}/dashboard?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        }),
      }}
    />
  );
}

export function FAQJsonLd() {
  const faqs = [
    {
      question: "Cos'è una Skill per AI agent?",
      answer: "Una Skill è un file Markdown con frontmatter YAML che contiene regole, trigger e best practice strutturate. Gli agenti AI (Cursor, Claude, ChatGPT) la usano come contesto per rispondere in modo più preciso e contestuale.",
    },
    {
      question: "Come funziona Reskill?",
      answer: "Reskill estrae il contenuto da YouTube, Reddit, Twitter/X, PDF e pagine web, lo converte in Markdown pulito e lo combina in una singola Skill strutturata usando l'AI. Puoi poi usare la Skill con Cursor, Claude, ChatGPT o qualsiasi altro agente AI.",
    },
    {
      question: "Quali piattaforme supporta Reskill?",
      answer: "YouTube (trascrizione), X/Twitter (post), Reddit (post + commenti), PDF, e qualsiasi pagina web. Supporta anche Instagram e Discord come fonti.",
    },
    {
      question: "Reskill è gratuito?",
      answer: "Sì, il piano Free offre 1 bucket, 3 fonti e 10 crediti mensili. I piani a pagamento (Pro €12/mese, Business €29/mese, Enterprise €59/mese) offrono più risorse e funzionalità avanzate.",
    },
    {
      question: "Come collego le Skill ai miei agenti AI?",
      answer: "Puoi collegare le Skill a Cursor (.cursorrules), Claude Projects, Custom GPTs, MCP Server, Windsurf, GitHub Copilot, o qualsiasi LLM che accetti file Markdown come contesto.",
    },
    {
      question: "I miei dati sono al sicuro?",
      answer: "Sì. I dati vengono elaborati lato server e salvati in Supabase (PostgreSQL). Non condividiamo né vendiamo i tuoi contenuti. Puoi eliminare bucket e fonti in qualsiasi momento.",
    },
    {
      question: "Come funziona l'estensione browser?",
      answer: "L'estensione Chrome/Edge/Firefox aggiunge un pulsante contestuale. Cliccando 'Trasforma in Markdown' su qualsiasi pagina, il contenuto viene pulito, convertito in Markdown e salvato nel tuo bucket.",
    },
    {
      question: "Posso usare Reskill con modelli AI locali?",
      answer: "Reskill utilizza modelli OpenAI via API (GPT-4o-mini, GPT-4.1, ecc.) per generare le Skill. Le Skill generate sono in Markdown universale, compatibili con qualsiasi LLM incluso modelli locali.",
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
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
        }),
      }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            item: item.url,
          })),
        }),
      }}
    />
  );
}
