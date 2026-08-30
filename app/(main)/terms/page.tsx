"use client";

import { useTranslation } from "@/translations";

export default function TermsPage() {
 const { t } = useTranslation();

 const sections = [
 { title: t.terms.section1_title, text: t.terms.section1_text },
 { title: t.terms.section2_title, text: t.terms.section2_text },
 { title: t.terms.section3_title, text: t.terms.section3_text },
 { title: t.terms.section4_title, text: t.terms.section4_text },
 { title: t.terms.section5_title, text: t.terms.section5_text },
 { title: t.terms.section6_title, text: t.terms.section6_text },
 { title: t.terms.section7_title, text: t.terms.section7_text },
 { title: t.terms.section8_title, text: t.terms.section8_text },
 { title: t.terms.section9_title, text: t.terms.section9_text },
 ];

 return (
 <div className="min-h-screen bg-[oklch(13% 0.006 260)] text-[oklch(98.5%_0.002_260)] pt-24 pb-20 px-6">
 <div className="max-w-3xl mx-auto">
 <div className="mb-10">
 <h1 className="text-3xl font-bold text-white">{t.terms.title}</h1>
 <p className="text-xs text-[oklch(60%_0.01_260)] mt-2">{t.terms.last_update}</p>
 </div>

 <div className="space-y-8">
 <p className="text-sm text-[oklch(60%_0.01_260)] leading-relaxed">{t.terms.intro}</p>

 {sections.map((s, i) => (
 <div key={i}>
 <h2 className="text-base font-bold text-white mb-2">{s.title}</h2>
 <p className="text-sm text-[oklch(60%_0.01_260)] leading-relaxed">
 {s.text}
 {(i === sections.length - 1) && (
 <a href="mailto:support@reskill.app" className="text-[oklch(72% 0.06 240)] hover:underline ml-1">
 support@reskill.app
 </a>
 )}
 </p>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}
