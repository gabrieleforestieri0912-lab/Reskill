"use client";

import Link from "next/link";
import { useTranslation } from "@/translations";
import { howItWorksGuides } from "@/lib/how-it-works";
import { ArrowRight } from "lucide-react";

export default function ComeFunzionaIndexPage() {
  const { locale } = useTranslation();
  const isEn = locale === "en";

  return (
    <main className="min-h-screen pt-[73px] bg-dark text-white selection:bg-cyan/30">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <p className="text-[11px] font-bold uppercase tracking-widest text-cyan mb-2">
          {isEn ? "Guides" : "Guide"}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          {isEn ? "How Reskill works" : "Come funziona Reskill"}
        </h1>
        <p className="text-sm text-gray leading-relaxed mb-10 max-w-xl">
          {isEn
            ? "Five steps, five in-depth guides: from raw web pages to an AI that works with your knowledge."
            : "Cinque passi, cinque guide di approfondimento: dalla pagina web grezza all'AI che lavora con la tua conoscenza."}
        </p>

        <div className="space-y-4">
          {howItWorksGuides.map((g) => (
            <Link
              key={g.slug}
              href={`/how-it-works/${g.slug}`}
              className="flex items-center gap-4 p-5 bg-white/2 border border-white/8 hover:border-cyan/30 transition-all group"
            >
              <span className="w-9 h-9 shrink-0 bg-[oklch(13%_.006_260)]/60 text-cyan border border-[oklch(72%_.06_240)]/20 flex items-center justify-center text-sm font-bold group-hover:scale-105 transition-transform">
                {g.num}
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-sm group-hover:text-cyan transition-colors">
                  {isEn ? g.title.en : g.title.it}
                </h2>
                <p className="text-xs text-gray mt-1 leading-relaxed">
                  {isEn ? g.subtitle.en : g.subtitle.it}
                </p>
              </div>
              <ArrowRight size={16} className="text-gray group-hover:text-cyan group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
