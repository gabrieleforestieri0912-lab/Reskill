"use client"

import { useTranslation } from "@/translations"

export default function HowItWorksSection() {
 const { t } = useTranslation()

 return (
 <section className="py-24 px-6 relative">
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(60%_0.01_260/0.03)_0%,transparent_70%)] pointer-events-none" />
 <div className="max-w-5xl mx-auto relative z-10">
 <div className="text-center mb-16">
 <h2 className="text-2xl md:text-3xl font-bold text-[oklch(98.5%_.002_260)] tracking-tight">{t.how.title}</h2>
 <p className="text-sm text-[oklch(60%_0.01_260)] mt-2">{t.how.subtitle}</p>
 </div>

 <div className="grid md:grid-cols-4 gap-5 relative">
 <div className="p-5 bg-[oklch(98.5%_.002_260)]/2 border border-[oklch(98.5%_.002_260)]/6 relative">
 <span className="w-7 h-7 bg-[oklch(13% .006 260)]/60 text-[oklch(72%_0.06_240)] border border-[oklch(72% .06 240)]/20 flex items-center justify-center text-xs font-bold mb-4">1</span>
 <h4 className="font-bold text-[oklch(98.5%_0.002_260)] text-sm mb-2">{t.how.step1_title}</h4>
 <p className="text-xs text-[oklch(60%_0.01_260)] leading-relaxed">{t.how.step1_desc}</p>
 </div>
 <div className="p-5 bg-[oklch(98.5%_.002_260)]/2 border border-[oklch(98.5%_.002_260)]/6 relative">
 <span className="w-7 h-7 bg-[oklch(13% .006 260)]/60 text-[oklch(72%_0.06_240)] border border-[oklch(72% .06 240)]/20 flex items-center justify-center text-xs font-bold mb-4">2</span>
 <h4 className="font-bold text-[oklch(98.5%_0.002_260)] text-sm mb-2">{t.how.step2_title}</h4>
 <p className="text-xs text-[oklch(60%_0.01_260)] leading-relaxed">{t.how.step2_desc}</p>
 </div>
 <div className="p-5 bg-[oklch(98.5%_.002_260)]/2 border border-[oklch(98.5%_.002_260)]/6 relative">
 <span className="w-7 h-7 bg-[oklch(13% .006 260)]/60 text-[oklch(72%_0.06_240)] border border-[oklch(72% .06 240)]/20 flex items-center justify-center text-xs font-bold mb-4">3</span>
 <h4 className="font-bold text-[oklch(98.5%_0.002_260)] text-sm mb-2">{t.how.step3_title}</h4>
 <p className="text-xs text-[oklch(60%_0.01_260)] leading-relaxed">{t.how.step3_desc}</p>
 </div>
 <div className="p-5 bg-[oklch(98.5%_.002_260)]/2 border border-[oklch(98.5%_.002_260)]/6 relative">
 <span className="w-7 h-7 bg-[oklch(13% .006 260)]/60 text-[oklch(72%_0.06_240)] border border-[oklch(72% .06 240)]/20 flex items-center justify-center text-xs font-bold mb-4">4</span>
 <h4 className="font-bold text-[oklch(98.5%_0.002_260)] text-sm mb-2">{t.how.step4_title}</h4>
 <p className="text-xs text-[oklch(60%_0.01_260)] leading-relaxed">{t.how.step4_desc}</p>
 </div>
 </div>
 </div>
 </section>
 )
}

