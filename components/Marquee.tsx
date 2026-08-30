"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

type MarqueeProps = {
  children: ReactNode
  reverse?: boolean
  speed?: number
  className?: string
}

export default function Marquee({
  children,
  reverse = false,
  speed = 40,
  className = "",
}: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [groupWidth, setGroupWidth] = useState(0)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const measure = () => {
      const w = track.scrollWidth / 2
      if (w > 0) setGroupWidth(w)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(track)
    const retry = setTimeout(measure, 500)
    return () => {
      ro.disconnect()
      clearTimeout(retry)
    }
  }, [children])

  useEffect(() => {
    if (groupWidth <= 0) return
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return

    let raf = 0
    let offset = 0
    let last = performance.now()

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      offset += speed * dt * (reverse ? 1 : -1)
      offset = offset % groupWidth
      if (offset < 0) offset += groupWidth

      const track = trackRef.current
      if (track) track.style.transform = `translate3d(${-offset}px, 0, 0)`
      raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [groupWidth, speed, reverse])

  return (
    <div
      ref={trackRef}
      className={`flex w-max items-center will-change-transform ${className}`}
      aria-hidden="true"
    >
      <div className="flex shrink-0 items-center">{children}</div>
      <div className="flex shrink-0 items-center">{children}</div>
    </div>
  )
}