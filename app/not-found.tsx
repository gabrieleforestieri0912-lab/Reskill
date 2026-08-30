import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[oklch(13%_0.006_260)] p-8">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl font-bold text-[oklch(72%_.06_240)] mb-4">404</div>
        <h1 className="text-xl font-bold text-[oklch(98.5%_0.002_260)] mb-3">
          Pagina non trovata
        </h1>
        <p className="text-sm text-[oklch(60%_0.01_260)] mb-6 leading-relaxed">
          La pagina che stai cercando non esiste o è stata spostata.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[oklch(72%_.06_240)] text-[oklch(13%_.006_260)] font-bold text-sm hover:opacity-90 transition-opacity"
        >
          Torna alla Home
        </Link>
      </div>
    </div>
  )
}
