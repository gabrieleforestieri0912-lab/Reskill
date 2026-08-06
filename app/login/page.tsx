"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const { status } = useSession()
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[oklch(13% 0.006 260)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[oklch(72%_0.06_240)] border-t-transparent animate-spin" />
          <p className="text-xs text-slate-600 font-mono">Caricamento in corso...</p>
        </div>
      </main>
    )
  }

  if (status === "authenticated") {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (mode === "register") {
      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || "Errore registrazione")
          setLoading(false)
          return
        }
      } catch {
        setError("Errore di connessione")
        setLoading(false)
        return
      }
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError("Email o password errate")
    } else {
      router.push("/")
      router.refresh()
    }
  }

  return (
    <main className="h-screen flex flex-col bg-[oklch(13% 0.006 260)] px-4 relative overflow-hidden selection:bg-[oklch(72% .06 240)]/30 selection:text-[oklch(98.5% .002 260)]">
      {/* Sfondo con gradienti multidirezionali */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(72%_0.06_240/0.07)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_80%_80%,oklch(72%_0.06_240/0.04)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_30%_20%_at_20%_20%,oklch(72%_0.06_240/0.03)_0%,transparent_40%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,oklch(60%_0.01_260/0.06)_0%,transparent_50%)] pointer-events-none" />

      {/* Back to home */}
      <div className="relative z-10 pt-5 shrink-0">
        <Link href="/" className="text-[12px] text-[oklch(72% .06 240)] hover:text-[oklch(98.5%_.002_260)] transition-colors inline-flex items-center gap-1.5">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M15 19l-7-7 7-7"/></svg>
          Torna alla home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center max-w-md mx-auto w-full relative z-10">
        <div className="w-full">
          {/* Header â€” nessuna icona, solo testo */}
          <div className="text-center mb-6">
            <h1 className="text-2xl text-[oklch(98.5%_.002_260)] tracking-tight mb-1.5">
              {mode === "login" ? "Bentornato" : "Crea il tuo account"}
            </h1>
            <p className="text-sm text-[oklch(60%_0.01_260)]">
              {mode === "login"
                ? "Accedi con le tue credenziali o con Google"
                : "Registrati per iniziare a usare Skillgrowth"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 mb-4">
            {mode === "register" && (
              <div className="group">
                <label className="block text-[12px] uppercase tracking-wider text-[oklch(60%_0.01_260)] mb-1.5">Nome</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[oklch(60%_0.01_260)] group-focus-within:text-[oklch(72%_0.06_240)] transition-colors" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Il tuo nome"
                    className="w-full pl-9 pr-4 py-2.5 bg-[oklch(13%_.006_260)]/70 border border-[oklch(98.5%_.002_260)]/10 text-sm text-[oklch(98.5%_.002_260)] placeholder:text-slate-600 focus:outline-none focus:border-[oklch(72%_0.06_240)]/40 focus:bg-[oklch(13%_.006_260)]/80 focus:shadow-[0_0_12px_-4px_oklch(72%_0.06_240/0.15)] transition-all"
                  />
                </div>
              </div>
            )}

            <div className="group">
              <label className="block text-[12px] uppercase tracking-wider text-[oklch(60%_0.01_260)] mb-1.5">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[oklch(60%_0.01_260)] group-focus-within:text-[oklch(72%_0.06_240)] transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@email.com"
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-[oklch(13%_.006_260)]/70 border border-[oklch(98.5%_.002_260)]/10 text-sm text-[oklch(98.5%_.002_260)] placeholder:text-slate-600 focus:outline-none focus:border-[oklch(72%_0.06_240)]/40 focus:bg-[oklch(13%_.006_260)]/80 focus:shadow-[0_0_12px_-4px_oklch(72%_0.06_240/0.15)] transition-all"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-[12px] uppercase tracking-wider text-[oklch(60%_0.01_260)] mb-1.5">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[oklch(60%_0.01_260)] group-focus-within:text-[oklch(72%_0.06_240)] transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Almeno 6 caratteri"
                  required
                  minLength={6}
                  className="w-full pl-9 pr-10 py-2.5 bg-[oklch(13%_.006_260)]/70 border border-[oklch(98.5%_.002_260)]/10 text-sm text-[oklch(98.5%_.002_260)] placeholder:text-slate-600 focus:outline-none focus:border-[oklch(72%_0.06_240)]/40 focus:bg-[oklch(13%_.006_260)]/80 focus:shadow-[0_0_12px_-4px_oklch(72%_0.06_240/0.15)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[oklch(60%_0.01_260)] hover:text-[oklch(98.5%_0.002_260)] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-[oklch(72%_.06_240)] bg-[oklch(13%_.006_260)]/10 border border-[oklch(13%_.006_260)]/20 px-3 py-2.5 flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[oklch(72%_0.06_240)] text-black text-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_oklch(72%_0.06_240/0.3)]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black animate-spin" />
                  Attendere...
                </>
              ) : mode === "login" ? (
                "Accedi"
              ) : (
                "Registrati"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-[1px] bg-[oklch(98.5%_.002_260)]/10" />
            <span className="text-[12px] text-[oklch(60%_0.01_260)] uppercase tracking-wider shrink-0">oppure</span>
            <div className="flex-1 h-[1px] bg-[oklch(98.5%_.002_260)]/10" />
          </div>

{/* Google Button */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-white/90 text-black text-sm font-medium transition-all active:scale-[0.98] shadow-[0_0_15px_-4px_rgba(255,255,255,0.15)]"
            >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Accedi con Google
          </button>

          {/* Toggle mode */}
          <p className="text-sm text-[oklch(60%_0.01_260)] text-center mt-4">
            {mode === "login" ? (
              <>
                Non hai un account?{" "}
                <button onClick={() => { setMode("register"); setError("") }} className="text-[oklch(72%_0.06_240)] hover:text-[oklch(98.5%_.002_260)] transition-colors">
                  Registrati
                </button>
              </>
            ) : (
              <>
                Hai giÃ  un account?{" "}
                <button onClick={() => { setMode("login"); setError("") }} className="text-[oklch(72%_0.06_240)] hover:text-[oklch(98.5%_.002_260)] transition-colors underline underline-offset-2 decoration-[oklch(72%_0.06_240)]/30 hover:decoration-white/30">
                  Accedi
                </button>
              </>
            )}
          </p>

          {/* Link utility */}
          <p className="text-xs text-slate-600 text-center mt-4">
            Utilizzando Skillgrowth accetti i{" "}
            <Link href="/terms" className="text-[oklch(60%_0.01_260)] hover:text-[oklch(98.5%_0.002_260)] underline underline-offset-2 transition-colors">Termini di Servizio</Link>{" "}
            e la{" "}
            <Link href="/privacy" className="text-[oklch(60%_0.01_260)] hover:text-[oklch(98.5%_0.002_260)] underline underline-offset-2 transition-colors">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </main>
  )
}

