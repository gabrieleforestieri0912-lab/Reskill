"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Unhandled error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[oklch(13%_0.006_260)] p-8">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-900/20 border border-red-800/30 flex items-center justify-center mx-auto mb-6">
          <span className="text-red-400 text-2xl font-bold">!</span>
        </div>
        <h1 className="text-xl font-bold text-[oklch(98.5%_0.002_260)] mb-3">
          Qualcosa è andato storto
        </h1>
        <p className="text-sm text-[oklch(60%_0.01_260)] mb-6 leading-relaxed">
          Si è verificato un errore imprevisto. Riprova o torna alla pagina precedente.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-[oklch(72%_.06_240)] text-[oklch(13%_.006_260)] font-bold text-sm hover:opacity-90 transition-opacity"
        >
          Riprova
        </button>
      </div>
    </div>
  )
}
