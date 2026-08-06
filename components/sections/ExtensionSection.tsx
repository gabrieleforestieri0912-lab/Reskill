/* eslint-disable react/no-unescaped-entities */
"use client"

import { useTranslation } from "@/translations"
import { FaChrome, FaFirefox } from "react-icons/fa6"

const chromeSteps = [
 <>Scarica il file <code className="bg-[oklch(13%_.006_260)]/50 px-1.5 py-0.5 rounded text-[10px] text-[oklch(98.5%_.002_260)] border border-[oklch(98.5%_.002_260)]/6">skillgrowth-extension.zip</code> ed estrailo in una cartella locale.</>,
 <>Apri il browser e digita <code className="bg-[oklch(13%_.006_260)]/50 px-1.5 py-0.5 rounded text-[10px] text-[oklch(98.5%_.002_260)] border border-[oklch(98.5%_.002_260)]/6">chrome://extensions</code>.</>,
 <>Attiva <strong className="text-[oklch(98.5%_.002_260)] font-semibold">ModalitÃ  sviluppatore</strong> in alto a destra.</>,
 <>Clicca su <strong className="text-[oklch(98.5%_.002_260)] font-semibold">Carica estensione non pacchettizzata</strong>.</>,
 <>Seleziona la cartella col file <code className="bg-[oklch(13%_.006_260)]/50 px-1.5 py-0.5 rounded text-[10px] text-[oklch(98.5%_.002_260)] border border-[oklch(98.5%_.002_260)]/6">manifest.json</code>. Pronta all'uso!</>,
]

const firefoxSteps = [
 <>Scarica ed estrai la cartella dell'estensione dal link qui sopra.</>,
 <>Digita <code className="bg-[oklch(13%_.006_260)]/50 px-1.5 py-0.5 rounded text-[10px] text-[oklch(98.5%_.002_260)] border border-[oklch(98.5%_.002_260)]/6">about:debugging</code> nella barra.</>,
 <>Seleziona <strong className="text-[oklch(98.5%_.002_260)] font-semibold">Questo Firefox</strong> sulla sinistra.</>,
 <>Clicca su <strong className="text-[oklch(98.5%_.002_260)] font-semibold">Carica componente aggiuntivo temporaneo...</strong></>,
 <>Seleziona <code className="bg-[oklch(13%_.006_260)]/50 px-1.5 py-0.5 rounded text-[10px] text-[oklch(98.5%_.002_260)] border border-[oklch(98.5%_.002_260)]/6">manifest.json</code>. Fatto!</>,
]

const usageSteps = [
 <>Naviga su qualsiasi articolo, video YouTube o pagina web che vuoi archiviare.</>,
 <>Fai click destro su una sezione vuota della pagina.</>,
 <>Passa su <strong className="text-[oklch(98.5%_.002_260)] font-semibold">Skillgrowth</strong> â†’ <strong className="text-[oklch(72%_0.06_240)]">Trasforma in Markdown</strong>.</>,
 <>Il download del file <code className="bg-[oklch(13%_.006_260)]/50 px-1 py-0.5 rounded text-[10px] text-[oklch(98.5%_.002_260)] border border-[oklch(98.5%_.002_260)]/6">.md</code> pulito parte automaticamente.</>,
]

export default function ExtensionSection() {
 useTranslation()

 return (
 <section className="py-24 px-6 relative overflow-hidden">
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(60%_0.01_260/0.04)_0%,transparent_70%)] pointer-events-none" />
 <div className="max-w-5xl mx-auto relative z-10">
 <div className="text-center mb-14">
 <span className="text-xs font-bold uppercase tracking-wider text-[oklch(72%_0.06_240)]/80 bg-[oklch(13% .006 260)]/40 px-4 py-2 border border-[oklch(72% .06 240)]/15">
 Browser Integration
 </span>
 <h2 className="text-2xl md:text-4xl font-bold text-[oklch(98.5%_.002_260)] mt-4 tracking-tight">
 Estensione Browser
 </h2>
 <p className="text-sm text-[oklch(60%_0.01_260)] mt-2 max-w-lg mx-auto">
 Estrai e scarica all'istante il testo di qualsiasi pagina web direttamente in Markdown formattato. Rimuove menu, banner pubblicitari e script inutili in un solo click.
 </p>
 </div>

 <div className="grid md:grid-cols-3 gap-5 mb-20">
 <div className="p-6 bg-[oklch(98.5%_.002_260)]/2 border border-[oklch(98.5%_.002_260)]/6 hover:border-[oklch(72% .06 240)]/20 transition-all text-center group">
 <div className="w-10 h-10 bg-[oklch(13% .006 260)]/50 border border-[oklch(72% .06 240)]/15 text-[oklch(72%_0.06_240)] flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>
 </div>
 <h4 className="font-semibold text-sm text-[oklch(98.5%_.002_260)] mb-2">Un Solo Click Destro</h4>
 <p className="text-xs text-[oklch(60%_0.01_260)] leading-relaxed">Non c'Ã¨ bisogno di copiare e incollare manualmente. Fai click destro in un punto qualsiasi e ottieni il Markdown.</p>
 </div>
 <div className="p-6 bg-[oklch(98.5%_.002_260)]/2 border border-[oklch(98.5%_.002_260)]/6 hover:border-[oklch(72% .06 240)]/20 transition-all text-center group">
 <div className="w-10 h-10 bg-[oklch(13% .006 260)]/50 border border-[oklch(72% .06 240)]/15 text-[oklch(72%_0.06_240)] flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
 </div>
 <h4 className="font-semibold text-sm text-[oklch(98.5%_.002_260)] mb-2">Pulizia Intelligente</h4>
 <p className="text-xs text-[oklch(60%_0.01_260)] leading-relaxed">Il parser rimuove cookie wall, banner di spam, barre laterali e menu di navigazione per salvaguardare il testo reale.</p>
 </div>
 <div className="p-6 bg-[oklch(98.5%_.002_260)]/2 border border-[oklch(98.5%_.002_260)]/6 hover:border-[oklch(72% .06 240)]/20 transition-all text-center group">
 <div className="w-10 h-10 bg-[oklch(13% .006 260)]/50 border border-[oklch(72% .06 240)]/15 text-[oklch(72%_0.06_240)] flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
 </div>
 <h4 className="font-semibold text-sm text-[oklch(98.5%_.002_260)] mb-2">Pronto all'Ingestione</h4>
 <p className="text-xs text-[oklch(60%_0.01_260)] leading-relaxed">I file salvati sono in puro formato Markdown, ottimizzato per ridurre i token del 60% sui modelli AI.</p>
 </div>
 </div>

 <div className="grid md:grid-cols-2 gap-6 mb-8">
 <div className="p-6 bg-[oklch(98.5%_.002_260)]/2 border border-[oklch(98.5%_.002_260)]/6">
 <h3 className="text-sm font-semibold text-[oklch(98.5%_.002_260)] mb-6 flex items-center gap-3 border-b border-[oklch(98.5%_.002_260)]/6 pb-3">
 <FaChrome className="w-5 h-5 text-[oklch(98.5%_.002_260)]" />
 Chrome / Microsoft Edge
 </h3>
 <ol className="space-y-3.5 text-xs text-[oklch(60%_0.01_260)]">
 {chromeSteps.map((step, i) => (
 <li key={i} className="flex gap-2.5">
 <span className="font-bold text-[oklch(72%_0.06_240)] shrink-0">{i + 1}.</span>
 <div>{step}</div>
 </li>
 ))}
 </ol>
 </div>

 <div className="p-6 bg-[oklch(98.5%_.002_260)]/2 border border-[oklch(98.5%_.002_260)]/6">
 <h3 className="text-sm font-semibold text-[oklch(98.5%_.002_260)] mb-6 flex items-center gap-3 border-b border-[oklch(98.5%_.002_260)]/6 pb-3">
 <FaFirefox className="w-5 h-5 text-[oklch(72%_.06_240)]" />
 Mozilla Firefox
 </h3>
 <ol className="space-y-3.5 text-xs text-[oklch(60%_0.01_260)]">
 {firefoxSteps.map((step, i) => (
 <li key={i} className="flex gap-2.5">
 <span className="font-bold text-[oklch(72%_0.06_240)] shrink-0">{i + 1}.</span>
 <div>{step}</div>
 </li>
 ))}
 </ol>
 </div>
 </div>

 <div>
 <h3 className="text-sm font-semibold text-[oklch(98.5%_.002_260)] mb-5">Come Utilizzarla</h3>
 <ol className="space-y-3.5 text-xs text-[oklch(60%_0.01_260)]">
 {usageSteps.map((step, i) => (
 <li key={i} className="flex gap-3 items-start">
 <span className="w-6 h-6 bg-[oklch(13% .006 260)]/40 border border-[oklch(72% .06 240)]/15 text-[oklch(72%_0.06_240)] flex items-center justify-center text-[10px] shrink-0 font-bold">{i + 1}</span>
 <span>{step}</span>
 </li>
 ))}
 </ol>
 </div>
 </div>
 </section>
 )
}

