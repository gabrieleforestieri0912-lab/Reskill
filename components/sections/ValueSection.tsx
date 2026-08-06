/* eslint-disable react/no-unescaped-entities */
"use client"

import { useState, type ReactNode } from "react"
import { useTranslation } from "@/translations"
import { Bolt, Tag, Plug } from "lucide-react"

const valuePoints: { icon: ReactNode; key: string }[] = [
 { icon: <Bolt size={14} />, key: "point1" },
 { icon: <Tag size={14} />, key: "point2" },
 { icon: <Plug size={14} />, key: "point3" },
]

export default function ValueSection() {
 const { t } = useTranslation()
 const [activeTab, setActiveTab] = useState("cursor")

 return (
 <section className="py-24 px-6 max-w-5xl mx-auto">
 <div className="grid md:grid-cols-2 gap-14 items-center">
 <div>
 <h2 className="text-3xl font-extrabold text-white tracking-tight mb-6">
 {t.value.title}
 </h2>
 <p className="text-sm text-gray leading-relaxed mb-8">
 {t.value.subtitle}
 </p>

 <div className="space-y-5">
 {valuePoints.map((p) => (
 <div key={p.key} className="flex items-start gap-4">
 <span className="w-7 h-7 bg-[oklch(13% .006 260)]/50 border border-[oklch(72% .06 240)]/15 text-cyan flex items-center justify-center text-[12px] shrink-0">{p.icon}</span>
 <div>
 <h4 className="font-bold text-white text-sm">{t.value[`${p.key}_title` as keyof typeof t.value] as string}</h4>
 <p className="text-xs text-gray mt-0.5 leading-relaxed">{t.value[`${p.key}_desc` as keyof typeof t.value] as string}</p>
 </div>
 </div>
 ))}
 </div>
 </div>

 <div className="p-6 bg-white/2 border border-white/8 flex flex-col">
 <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-5">
 <Plug size={14} /> {t.value.integration_title}
 </h3>

 <div className="flex border-b border-white/6 mb-4 text-xs">
 {["cursor", "claude", "gpts"].map((tab) => (
 <button
 key={tab}
 onClick={() => setActiveTab(tab)}
 className={`pb-2 px-3 border-b-2 font-medium transition-all ${
 activeTab === tab
 ? "border-[oklch(60%_0.06_240)] text-cyan"
 : "border-transparent text-gray hover:text-white"
 }`}
 >
 {tab === "cursor" ? "Cursor (.cursorrules)" : tab === "claude" ? "Claude Projects" : "Custom GPTs"}
 </button>
 ))}
 </div>

 <div className="p-4 bg-[oklch(13%_.006_260)]/40 border border-white/6 font-mono text-[12px] leading-relaxed text-gray">
 {activeTab === "cursor" && (
 <>
 <span className="text-gray block mb-2">Aggiungi il file <code className="bg-[oklch(13%_0.006_260)] px-1 py-0.5 rounded text-white">.cursorrules</code> alla radice del tuo workspace:</span>
 <pre className="text-cyan">
{`# Convenzioni Architetturali del Progetto

[skill: nextjs-react19-core-skill]
- Utilizza React Server Components per il data fetching.
- Non aggiungere "use client" a meno che non vi sia stato.

[skill: agentic-ai-mcp-integration]
- In caso di errori complessi, esegui cicli di Reflection.
- Scrivi test sintetici prima di inviare le modifiche.`}
 </pre>
 </>
 )}
 {activeTab === "claude" && (
 <>
 <span className="text-gray block mb-2">Crea un Progetto Claude e carica il file compilato nella sezione Files:</span>
 <div className="space-y-2 mt-1">
 <div className="flex gap-2">
 <span className="text-cyan">1.</span>
 <span>Clicca su "Add Files" nella barra laterale destra del tuo progetto Claude.</span>
 </div>
 <div className="flex gap-2">
 <span className="text-cyan">2.</span>
 <span>Trascina il file <code className="bg-[oklch(13%_0.006_260)] px-1 py-0.5 rounded text-white">mcp-setup-guide.md</code> salvato da Skillgrowth.</span>
 </div>
 <div className="flex gap-2">
 <span className="text-cyan">3.</span>
 <span>L'AI leggerÃ  le definizioni YAML e attiverÃ  il contesto non appena interrogherai il modello.</span>
 </div>
 </div>
 </>
 )}
 {activeTab === "gpts" && (
 <>
 <span className="text-gray block mb-2">Importa le tue skill nella Knowledge Base del tuo GPT Personalizzato:</span>
 <div className="space-y-2 mt-1">
 <div className="flex gap-2">
 <span className="text-cyan">1.</span>
 <span>Vai in "Edit GPT" e clicca sulla scheda "Configure".</span>
 </div>
 <div className="flex gap-2">
 <span className="text-cyan">2.</span>
 <span>Scorri fino a "Knowledge" e clicca su "Upload files".</span>
 </div>
 <div className="flex gap-2">
 <span className="text-cyan">3.</span>
 <span>Carica il file della skill compilata. L'AI userÃ  le regole per formattare gli output di sviluppo.</span>
 </div>
 </div>
 </>
 )}
 </div>
 </div>
 </div>
 </section>
 )
}

