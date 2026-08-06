"use client"

import { FaCircleArrowLeft, FaCircleArrowRight } from "react-icons/fa6"
import { useTranslation } from "@/translations"
import { sources, ais } from "@/lib/site-data"

export function SourcesScroller() {
 const { t } = useTranslation()

 return (
 <section className="py-20 overflow-hidden relative">
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,oklch(60%_0.01_260/0.03)_0%,transparent_70%)] pointer-events-none" />
 <div className="px-6 mb-10 max-w-5xl mx-auto relative z-10">
 <p className="text-xs font-bold uppercase tracking-wider text-cyan/80">{t.scrollers.sources_title}</p>
 <h3 className="text-lg font-bold text-white mt-1">{t.scrollers.sources_subtitle}</h3>
 </div>
 <div className="relative max-w-5xl mx-auto before:absolute before:inset-y-0 before:left-0 before:w-36 before:z-10 before:bg-linear-to-r before:from-[oklch(13% 0.006 260)] before:to-transparent after:absolute after:inset-y-0 after:right-0 after:w-36 after:z-10 after:bg-linear-to-l after:from-[oklch(13% 0.006 260)] after:to-transparent">
  <FaCircleArrowLeft className="absolute left-3 top-1/2 -translate-y-1/2 z-20 text-white text-xl  pointer-events-none" />
  <FaCircleArrowRight className="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-white text-xl  pointer-events-none" />
<div className="flex gap-0 animate-scroll-right items-center">
   {[...sources, ...sources].map((s, i) => (
   <div key={i} className="shrink-0 flex items-center gap-3 mr-14">
   <s.icon className="text-[oklab(60%_-0.00173648_-0.00984808/0.7)] text-3xl" />
   <span className="text-base text-[oklab(60%_-0.00173648_-0.00984808/0.7)] whitespace-nowrap">{s.name}</span>
   </div>
   ))}
  </div>
 </div>
 </section>
 )
}

export function DestinationsScroller() {
 const { t } = useTranslation()

 return (
 <section className="pb-24 overflow-hidden relative">
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,oklch(60%_0.01_260/0.03)_0%,transparent_70%)] pointer-events-none" />
 <div className="px-6 mb-10 max-w-5xl mx-auto text-right relative z-10">
 <p className="text-xs font-bold uppercase tracking-wider text-cyan/80">{t.scrollers.destinations_title}</p>
 <h3 className="text-lg font-bold text-white mt-1">{t.scrollers.destinations_subtitle}</h3>
 </div>
 <div className="relative max-w-5xl mx-auto before:absolute before:inset-y-0 before:left-0 before:w-36 before:z-10 before:bg-linear-to-r before:from-[oklch(13% 0.006 260)] before:to-transparent after:absolute after:inset-y-0 after:right-0 after:w-36 after:z-10 after:bg-linear-to-l after:from-[oklch(13% 0.006 260)] after:to-transparent">
  <FaCircleArrowLeft className="absolute left-3 top-1/2 -translate-y-1/2 z-20 text-white text-xl  pointer-events-none" />
  <FaCircleArrowRight className="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-white text-xl  pointer-events-none" />
<div className="flex gap-0 animate-scroll-left items-center">
   {[...ais, ...ais].map((a, i) => (
   <div key={i} className="shrink-0 flex items-center gap-3 mr-14">
   <a.icon className="text-[oklab(60%_-0.00173648_-0.00984808/0.7)] text-3xl" />
   <span className="text-base text-[oklab(60%_-0.00173648_-0.00984808/0.7)] whitespace-nowrap">{a.name}</span>
   </div>
   ))}
  </div>
 </div>
 </section>
 )
}

