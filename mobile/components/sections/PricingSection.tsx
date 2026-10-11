"use client"

import { type ReactNode } from "react"
import { pricingPlans } from "@/lib/site-data"
import { FaRocket, FaStar, FaBriefcase, FaBuilding, FaCheck } from "react-icons/fa6"

const planIcons: Record<string, ReactNode> = {
 free: <FaRocket className="w-5 h-5" />,
 pro: <FaStar className="w-5 h-5" />,
 business: <FaBriefcase className="w-5 h-5" />,
 enterprise: <FaBuilding className="w-5 h-5" />,
}

export default function PricingSection() {
 return (
 <section id="piani" className="py-24 px-6 relative">
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,oklch(60%_0.01_260/0.03)_0%,transparent_70%)] pointer-events-none" />
  <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-14">
                    <h2 className="text-3xl md:text-4xl font-bold text-[oklch(98.5%_.002_260)] mt-4 tracking-tight">
  Piani & Prezzi
  </h2>
<p className="text-base text-[oklch(60%_0.01_260)] mt-2 max-w-lg mx-auto">
  Paga solo per ciò che usi. Crediti consumati da ogni Skill generata con AI.
    </p>
    <p className="text-[13px] text-[oklch(60%_0.01_260)] mt-3">Pagina web: 1 credito · Video social: 2 crediti</p>
  </div>

  <div className="grid grid-cols-4 gap-6">
 {pricingPlans.map((plan) => {
 const isPopular = plan.id === "pro"
 return (
<div
  key={plan.id}
  className={`relative flex flex-col p-6 transition-all duration-300 group ${
  isPopular
  ? "bg-[oklch(13% .006 260)] border border-[oklch(72%_0.06_240)]/30"
  : "bg-[oklch(98.5%_.002_260)]/2 border border-[oklch(98.5%_.002_260)]/6"
  }`}
  >
{isPopular && (
   <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
   <span className="px-4 py-1.5 bg-[oklch(72%_0.06_240)] text-black text-[12px] font-extrabold uppercase tracking-widest flex items-center gap-1.5">
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    Più scelto
    </span>
   </div>
   )}

 <div className="flex items-center gap-2 mb-4">
 <div className="w-10 h-10 bg-[oklch(13% .006 260)]/60 border border-[oklch(72% .06 240)]/20 flex items-center justify-center text-[oklch(72%_0.06_240)] shrink-0 group-hover:scale-110 transition-transform duration-300">
 {planIcons[plan.id] || <FaRocket className="w-5 h-5" />}
 </div>
   <h3 className="font-bold text-lg text-[oklch(98.5%_.002_260)]">{plan.name}</h3>
   </div>

   <div className="flex items-baseline gap-0.5 mb-2">
  <span className="text-4xl font-extrabold text-[oklch(98.5%_.002_260)]">€{plan.price}</span>
  <span className="text-sm text-[oklch(60%_0.01_260)] ml-0.5">/mese</span>
 </div>

<div className="mb-5">
   <span className="text-base text-[oklch(98.5%_.002_260)] font-semibold">{plan.credits.toLocaleString()}</span>
   <span className="text-sm text-[oklch(60%_0.01_260)] ml-1">crediti / mese</span>
   </div>
   {plan.desc && <p className="text-[12px] text-[oklch(60%_0.01_260)] mb-4 leading-relaxed">{plan.desc}</p>}

  <div className="h-px bg-white/10 mb-4" />

  <ul className="space-y-1.5 flex-1 mb-6 text-[12px] leading-snug">
 {plan.features.map((f) => (
 <li key={f} className="flex items-center gap-2 text-[oklch(60%_0.01_260)]">
 <FaCheck className="w-3 h-3 text-[oklch(72%_0.06_240)] shrink-0" />
 {f}
 </li>
 ))}
 </ul>

<button
    className="w-full py-3 text-sm font-bold transition-all cursor-pointer active:scale-95 bg-[oklch(72%_0.06_240)] text-[oklch(13%_0.006_260)] hover:bg-[oklch(60%_0.08_240)]"
    >
    {plan.price === 0 ? "Inizia Gratis" : "Scegli"}
    </button>
 </div>
 )
 })}
 </div>

  <p className="text-center text-xs text-[oklch(60%_0.01_260)] mt-6">
                Pagamenti sicuri tramite Stripe. Cancella quando vuoi.
                </p>
                <p className="text-center text-xs text-[oklch(60%_0.01_260)] mt-2">
                Nessun abbonamento: i crediti pagati non scadono mai.
                </p>
 </div>
 </section>
 )
}
