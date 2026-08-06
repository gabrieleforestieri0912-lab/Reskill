"use client"

import { useState } from "react"
import { useTranslation } from "@/translations"
import { demoItems } from "@/lib/site-data"
import { FaYoutube, FaXTwitter, FaInstagram, FaRedditAlien, FaFilePdf, FaGlobe } from "react-icons/fa6"

export default function DemoSection() {
 const { t } = useTranslation()
 const [activeDemo, setActiveDemo] = useState("demo-yt")
 const [output, setOutput] = useState("")

 const activeItem = demoItems.find(d => d.id === activeDemo)

 return (
 <section id="demo" className="py-24 px-6 max-w-6xl mx-auto scroll-mt-20">
 <div className="text-center mb-14">
 <span className="text-xs font-bold uppercase tracking-wider text-[oklch(72%_0.06_240)]/80 bg-[oklch(13% .006 260)]/40 px-4 py-2 border border-[oklch(72% .06 240)]/15">
 {t.demo.badge}
 </span>
 <h2 className="text-2xl md:text-4xl font-bold text-[oklch(98.5%_.002_260)] mt-4 tracking-tight">
 {t.demo.title}
 </h2>
 <p className="text-sm text-[oklch(60%_0.01_260)] mt-2 max-w-lg mx-auto">
 {t.demo.subtitle}
 </p>
 </div>

 <div className="grid lg:grid-cols-12 gap-6 items-stretch">
 <div className="lg:col-span-4 space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
 {demoItems.map((item) => (
 <button
 key={item.id}
 onClick={() => { setActiveDemo(item.id); setOutput("") }}
 className={`w-full text-left p-3.5 border transition-all ${
 activeDemo === item.id
 ? "bg-[oklch(98.5%_.002_260)]/4 border-[oklch(60%_0.06_240)]/25"
 : "bg-transparent border-[oklch(98.5%_.002_260)]/6 hover:bg-[oklch(98.5%_.002_260)]/2 hover:border-[oklch(98.5%_.002_260)]/10"
 }`}
 >
 <div className="flex gap-3 items-start">
 <div className={`shrink-0 w-12 h-12 overflow-hidden border ${activeDemo === item.id ? "border-[oklch(72% .06 240)]/30" : "border-[oklch(98.5%_.002_260)]/6"} flex items-center justify-center text-xl ${item.bg}`}>
 {item.type === "youtube" && <FaYoutube className="w-5 h-5 text-[oklch(72%_.06_240)]" />}
 {item.type === "x" && <FaXTwitter className="w-5 h-5 text-[oklch(72%_.06_240)]" />}
 {item.type === "instagram" && <FaInstagram className="w-5 h-5 text-[oklch(72%_.06_240)]" />}
 {item.type === "article" && <FaGlobe className="w-5 h-5 text-[oklch(72%_.06_240)]" />}
 {item.type === "reddit" && <FaRedditAlien className="w-5 h-5 text-[oklch(72%_.06_240)]" />}
 {item.type === "pdf" && <FaFilePdf className="w-5 h-5 text-[oklch(72%_.06_240)]" />}
 </div>
 <div className="flex-1 min-w-0">
 <div className="text-xs font-bold text-[oklch(98.5%_.002_260)] truncate">{item.title}</div>
 <div className="text-[12px] text-[oklch(60%_0.01_260)] mt-0.5 truncate">{item.source}</div>
 <div className="flex items-center gap-2 mt-1.5">
 <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[8px] font-bold uppercase text-[oklch(60%_0.01_260)] tracking-wider">{item.platform}</span>
 {item.date && <span className="text-[8px] text-slate-600">{item.date}</span>}
 </div>
 </div>
 </div>
 </button>
 ))}
 </div>

 <div className="lg:col-span-8 bg-[oklch(98.5%_.002_260)]/2 border border-[oklch(98.5%_.002_260)]/8 overflow-hidden flex flex-col min-h-[500px]">
 <div className="px-4 py-3 bg-[oklch(13%_.006_260)]/40 border-b border-[oklch(98.5%_.002_260)]/6 flex justify-between items-center text-xs">
 <div className="flex items-center gap-1.5">
 <span className="w-2 h-2 bg-[oklch(98.5%_.002_260)]/10"></span>
 <span className="w-2 h-2 bg-[oklch(98.5%_.002_260)]/10"></span>
 <span className="w-2 h-2 bg-[oklch(98.5%_.002_260)]/10"></span>
 </div>
 <span className="text-[12px] font-mono text-[oklch(60%_0.01_260)]">skill_{activeItem?.type}.md</span>
 <button
 onClick={() => navigator.clipboard.writeText(activeItem?.skill || "")}
 className="text-[12px] text-[oklch(60%_0.01_260)] hover:text-[oklch(72%_0.06_240)] transition-colors flex items-center gap-1"
 >
 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
 {t.demo.copy}
 </button>
 </div>

 <div className="p-5 flex-1 font-mono text-xs overflow-y-auto bg-[oklch(13%_.006_260)]/30 leading-relaxed max-h-[500px] select-text">
 {output ? (
 <pre className="whitespace-pre-wrap text-[oklch(98.5% .002 260)]">{output}</pre>
 ) : (
 <pre className="whitespace-pre-wrap text-[oklch(98.5% .002 260)]">{activeItem?.skill}</pre>
 )}
 </div>
 </div>
 </div>
 </section>
 )
}

