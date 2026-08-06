"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTranslation } from "@/translations"
import { typewriterWords } from "@/lib/site-data"
import { FaChrome } from "react-icons/fa6"

export default function HeroSection() {
 const { t } = useTranslation()
 const [wordIdx, setWordIdx] = useState(0)
 const [charIdx, setCharIdx] = useState(0)
 const [deleting, setDeleting] = useState(false)

 const words = typewriterWords

 useEffect(() => {
 const current = words[wordIdx]
 const timeout = setTimeout(() => {
 if (!deleting) {
 if (charIdx < current.length) {
 setCharIdx(charIdx + 1)
 } else {
 setTimeout(() => setDeleting(true), 1500)
 }
 } else {
 if (charIdx > 0) {
 setCharIdx(charIdx - 1)
 } else {
 setDeleting(false)
 setWordIdx((wordIdx + 1) % words.length)
 }
 }
 }, deleting ? 25 : 50)
 return () => clearTimeout(timeout)
 }, [charIdx, deleting, wordIdx, words])

 const displayText = words[wordIdx].slice(0, charIdx)

 return (
 <section className="pt-32 pb-24 px-6 relative">
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(60%_0.01_260/0.06)_0%,transparent_70%)] pointer-events-none" />
 <div className="max-w-5xl mx-auto text-center relative z-10">
 <h1 className="text-4xl md:text-6xl font-semibold mb-6 leading-tight tracking-tight text-[oklch(98.5%_.002_260)]">
 <span className="text-[oklch(98.5%_.002_260)]">Trasforma </span>
 <span className="text-[oklch(72%_0.06_240)]">
 {displayText}
 <span className="animate-blink ml-0.5 inline-block w-[3px] align-middle"></span>
 </span>
 <br />
 <span className="text-[oklch(98.5%_.002_260)]">in Skill per i tuoi Agenti AI</span>
 </h1>
 <p className="text-base md:text-lg text-[oklch(98.5%_.002_260)] max-w-2xl mx-auto mb-10 leading-relaxed">
 {t.hero.subtitle}
 </p>

<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
  <Link
    href="/feed"
   className="w-[300px] px-8 py-3.5 bg-[oklch(13% .006 260)] text-white font-bold text-sm border border-[oklch(72% .06 240)]/30 transition-all active:scale-95 inline-flex items-center justify-center gap-2.5 hover:bg-[oklch(72% .06 240)]"
   >
   <FaChrome className="w-4 h-4 text-white" />
   {t.hero.cta_extension}
   </Link>
   <a
   href="#demo"
   className="w-[300px] px-8 py-3.5 border border-[oklch(98.5%_.002_260)]/10 text-white/80 font-semibold text-sm transition-all inline-flex items-center justify-center hover:bg-[oklch(72% .06 240)]/20 hover:text-white"
   >
   {t.hero.cta_playground}
   </a>
   </div>
 </div>
 </section>
 )
}

