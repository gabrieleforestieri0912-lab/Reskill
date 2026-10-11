"use client"

import { useTranslation } from "@/translations"
import { faqs } from "@/lib/site-data"

export default function FaqSection() {
 const { t } = useTranslation()

 return (
 <section className="py-24 px-6 relative">
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,oklch(60%_0.01_260/0.03)_0%,transparent_70%)] pointer-events-none" />
 <div className="max-w-4xl mx-auto relative z-10">
 <div className="text-center mb-14">
 <span className="text-xs font-bold uppercase tracking-wider text-[oklch(72%_0.06_240)]/80 bg-[oklch(13% .006 260)]/40 px-4 py-2 border border-[oklch(72% .06 240)]/15">{t.faq.badge}</span>
 <h2 className="text-2xl md:text-3xl font-bold text-[oklch(98.5%_.002_260)] mt-2 tracking-tight">{t.faq.title}</h2>
 <p className="text-sm text-[oklch(60%_0.01_260)] mt-2 max-w-lg mx-auto">{t.faq.subtitle}</p>
 </div>

 <div className="max-w-2xl mx-auto space-y-3">
 {faqs.map((faq, i) => (
 <details key={i} className="group bg-[oklch(98.5%_.002_260)]/2 border border-[oklch(98.5%_.002_260)]/6 open:border-[oklch(72% .06 240)]/20 transition-all">
 <summary className="px-5 py-4 flex items-center justify-between cursor-pointer text-sm font-medium text-[oklch(98.5%_0.002_260)] group-open:text-[oklch(72%_0.06_240)] transition-colors list-none">
 {faq.q}
 <svg className="w-4 h-4 shrink-0 text-slate-600 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
 <path d="M19 9l-7 7-7-7" />
 </svg>
 </summary>
 <div className="px-5 pb-4 text-xs text-[oklch(60%_0.01_260)] leading-relaxed border-t border-[oklch(98.5%_.002_260)]/6 pt-3 mt-0">
 {faq.a}
 </div>
 </details>
 ))}
 </div>
 </div>
 </section>
 )
}

