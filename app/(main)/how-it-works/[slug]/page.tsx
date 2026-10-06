"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "@/translations";
import { getGuide, howItWorksGuides } from "@/lib/how-it-works";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";

export default function ComeFunzionaDetailPage() {
  const params = useParams();
  const raw = params?.slug;
  const slug = Array.isArray(raw) ? raw[0] : String(raw ?? "");
  const { locale } = useTranslation();
  const isEn = locale === "en";

  const guide = getGuide(slug);
  const idx = howItWorksGuides.findIndex((g) => g.slug === slug);

  if (!guide) {
    return (
      <main className="min-h-screen pt-[73px] bg-dark text-white">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">{isEn ? "Guide not found" : "Guida non trovata"}</h1>
          <Link href="/#howItWorks" className="text-cyan text-sm hover:underline">
            ← {isEn ? "Back to How it works" : "Torna a Come funziona"}
          </Link>
        </div>
      </main>
    );
  }

  const next = guide.nextSlug ? getGuide(guide.nextSlug) : undefined;
  const prev = idx > 0 ? howItWorksGuides[idx - 1] : undefined;

  return (
    <main className="min-h-screen pt-[73px] bg-dark text-white selection:bg-cyan/30">
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray mb-8">
          <Link href="/" className="hover:text-cyan transition-colors">Reskill</Link>
          <ChevronRight size={12} />
          <Link href="/#howItWorks" className="hover:text-cyan transition-colors">
            {isEn ? "How it works" : "Come funziona"}
          </Link>
          <ChevronRight size={12} />
          <span className="text-white">{isEn ? guide.title.en : guide.title.it}</span>
        </nav>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <span className="w-10 h-10 shrink-0 bg-[oklch(13%_.006_260)]/60 text-cyan border border-[oklch(72%_.06_240)]/20 flex items-center justify-center text-sm font-bold">
            {guide.num}
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-cyan mb-1">
              {isEn ? `Step ${guide.num} of 5` : `Passo ${guide.num} di 5`}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {isEn ? guide.title.en : guide.title.it}
            </h1>
            <p className="text-sm text-gray mt-2">
              {isEn ? guide.subtitle.en : guide.subtitle.it}
            </p>
          </div>
        </div>

        <p className="text-sm text-white/85 leading-relaxed mb-10 border-l-2 border-cyan/40 pl-4">
          {isEn ? guide.intro.en : guide.intro.it}
        </p>

        {/* Sections */}
        <div className="space-y-8">
          {guide.sections.map((s, i) => (
            <section key={i} className="bg-white/2 border border-white/8 p-5 md:p-6">
              <h2 className="text-base font-bold mb-3">
                {isEn ? s.heading.en : s.heading.it}
              </h2>
              <p className="text-sm text-gray leading-relaxed mb-3">
                {isEn ? s.body.en : s.body.it}
              </p>
              {s.bullets && (
                <ul className="space-y-2 mb-1">
                  {s.bullets.map((b, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-white/80">
                      <CheckCircle2 size={14} className="text-cyan shrink-0 mt-0.5" />
                      <span>{isEn ? b.en : b.it}</span>
                    </li>
                  ))}
                </ul>
              )}
              {s.code && (
                <pre className="mt-4 p-4 bg-black/40 border border-white/8 overflow-x-auto text-xs font-mono text-cyan/90 leading-relaxed">
                  {s.code}
                </pre>
              )}
            </section>
          ))}
        </div>

        {/* Checklist */}
        <section className="mt-8 bg-cyan/5 border border-cyan/20 p-5 md:p-6">
          <h2 className="text-sm font-bold mb-4 uppercase tracking-wider text-cyan">
            {isEn ? "Try it now" : "Provalo subito"}
          </h2>
          <ol className="space-y-2.5">
            {(isEn ? guide.checklist.map((c) => c.en) : guide.checklist.map((c) => c.it)).map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-white/85">
                <span className="w-6 h-6 shrink-0 border border-cyan/30 text-cyan text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              href="/tools"
              className="px-4 py-2.5 bg-cyan text-black text-xs font-bold hover:bg-[oklch(60%_0.08_240)] transition-all active:scale-95"
            >
              {isEn ? "Open Web Tools" : "Apri gli Strumenti web"}
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2.5 border border-white/15 text-xs font-bold text-white/80 hover:text-white hover:border-cyan/40 transition-all"
            >
              {isEn ? "Go to Workspace" : "Vai al Workspace"}
            </Link>
          </div>
        </section>

        {/* Prev / Next */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          {prev ? (
            <Link
              href={`/how-it-works/${prev.slug}`}
              className="p-4 border border-white/8 hover:border-cyan/30 transition-all group"
            >
              <span className="text-[11px] text-gray flex items-center gap-1 mb-1">
                <ArrowLeft size={11} /> {isEn ? "Previous" : "Precedente"}
              </span>
              <span className="text-sm font-bold group-hover:text-cyan transition-colors">
                {isEn ? prev.title.en : prev.title.it}
              </span>
            </Link>
          ) : <div />}
          {next && (
            <Link
              href={`/how-it-works/${next.slug}`}
              className="p-4 border border-cyan/25 bg-cyan/5 hover:border-cyan/50 transition-all group text-right"
            >
              <span className="text-[11px] text-cyan flex items-center gap-1 justify-end mb-1">
                {isEn ? "Next step" : "Passo successivo"} <ArrowRight size={11} />
              </span>
              <span className="text-sm font-bold group-hover:text-cyan transition-colors">
                {isEn ? next.title.en : next.title.it}
              </span>
            </Link>
          )}
        </div>

        {/* All steps */}
        <div className="mt-10 pt-6 border-t border-white/8">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray mb-3">
            {isEn ? "All steps" : "Tutti i passi"}
          </p>
          <div className="flex flex-wrap gap-2">
            {howItWorksGuides.map((g) => (
              <Link
                key={g.slug}
                href={`/how-it-works/${g.slug}`}
                className={`px-3 py-1.5 text-xs font-semibold border transition-all ${
                  g.slug === slug
                    ? "bg-cyan/15 text-cyan border-cyan/30"
                    : "text-gray border-white/10 hover:text-white hover:border-cyan/30"
                }`}
              >
                {g.num}. {isEn ? g.title.en : g.title.it}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
