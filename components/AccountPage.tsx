"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/translations"
import {
  User, CreditCard, Zap, Plug,
  ChevronLeft, Settings, ArrowUpRight,
  FolderOpen, FileText, Sparkles,
} from "lucide-react"

interface Stats {
  totalBuckets: number
  totalSources: number
  skillsGenerated: number
  totalCreditsUsed: number
  planCredits: number
  creditsRemaining: number
  currentPlan: string
}

export default function AccountPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const { t, locale, setLocale } = useTranslation()
  const a = t.account

  const [stats, setStats] = useState<Stats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  const [nameValue, setNameValue] = useState("")
  const [editingName, setEditingName] = useState(false)
  const [nameSaving, setNameSaving] = useState(false)

  const [autoRecharge, setAutoRecharge] = useState(false)
  const [rechargeSaved, setRechargeSaved] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats")
        if (res.ok) setStats(await res.json())
      } catch (e) {
        console.error(e)
      } finally {
        setStatsLoading(false)
      }
    }
    fetchStats()

    const savedRecharge = localStorage.getItem("sg_auto_recharge")
    if (savedRecharge) {
      try {
        const cfg = JSON.parse(savedRecharge)
        setAutoRecharge(cfg.enabled || false)
      } catch {}
    }
  }, [])

  useEffect(() => {
    if (session?.user?.name) setNameValue(session.user.name)
  }, [session])

  const handleSaveName = async () => {
    if (!nameValue.trim() || nameSaving) return
    setNameSaving(true)
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameValue.trim() }),
      })
      if (res.ok) {
        await update({ name: nameValue.trim() })
        setEditingName(false)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setNameSaving(false)
    }
  }

  const handleSaveRecharge = () => {
    localStorage.setItem(
      "sg_auto_recharge",
      JSON.stringify({ enabled: autoRecharge, plan: stats?.currentPlan || "free" })
    )
    setRechargeSaved(true)
    setTimeout(() => setRechargeSaved(false), 2000)
  }

  const creditsUsed = stats?.totalCreditsUsed || 0
  const creditsTotal = stats?.planCredits || 500
  const creditsRemaining = creditsTotal - creditsUsed
  const creditsPct = Math.min((creditsUsed / creditsTotal) * 100, 100)
  const creditsColor =
    creditsPct > 80 ? "bg-red-500" : creditsPct > 50 ? "bg-yellow-500" : "bg-cyan"

  const allPlans = [
    { id: "free", name: "Free", price: "0", credits: 10, features: ["1 bucket", "3 fonti", "Community support"] },
    { id: "pro", name: "Pro", price: "12", credits: 500, features: ["15 bucket", "100 fonti", "Supporto prioritario"] },
    { id: "business", name: "Business", price: "29", credits: 1500, features: ["50 bucket", "500 fonti", "1.500 crediti/mese", "MCP Server"] },
    { id: "enterprise", name: "Enterprise", price: "59", credits: 5000, features: ["Bucket illimitati", "Fonti illimitate", "Assistenza dedicata"] },
  ] as const

  const currentPlanData =
    allPlans.find((p) => p.id === (stats?.currentPlan || "free")) ?? allPlans[0]

  const userInitial =
    (session?.user?.name?.[0] || session?.user?.email?.[0] || "?").toUpperCase()

  const statCards = [
    { label: a.stats_buckets, value: stats?.totalBuckets ?? 0, icon: FolderOpen },
    { label: a.stats_sources, value: stats?.totalSources ?? 0, icon: FileText },
    { label: a.stats_skills, value: stats?.skillsGenerated ?? 0, icon: Sparkles },
  ]

  return (
    <main className="min-h-screen pt-[73px] bg-dark text-white selection:bg-cyan/30">
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-start gap-4 mb-10">
          <button
            onClick={() => router.push("/feed")}
            className="mt-1 w-9 h-9 bg-white/5 border border-white/10 flex items-center justify-center text-gray hover:text-white hover:border-cyan/30 transition-all shrink-0"
            aria-label="Back"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex-1 flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 bg-cyan/10 border border-cyan/25 flex items-center justify-center text-cyan text-xl font-bold shrink-0">
              {userInitial}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight">
                  {a.title}
                </h1>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-cyan/15 text-cyan border border-cyan/25">
                  {currentPlanData.name}
                </span>
              </div>
              <p className="text-xs text-gray mt-1 truncate">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {/* Profilo */}
          <section className="bg-white/2 border border-white/8 hover:border-cyan/15 transition-colors p-5 md:p-6">
            <h2 className="text-sm font-bold mb-5 flex items-center gap-2">
              <span className="w-7 h-7 bg-dark/80 border border-cyan/20 flex items-center justify-center text-cyan">
                <User size={14} />
              </span>
              {a.profile}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray block mb-1.5">{a.name}</label>
                <input
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  readOnly={!editingName}
                  className={`w-full bg-dark/60 border px-3 py-2.5 text-xs font-mono transition-colors focus:outline-none ${
                    editingName
                      ? "border-cyan/50 text-white focus:border-cyan/70"
                      : "border-white/10 text-gray"
                  }`}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray block mb-1.5">{a.email}</label>
                <input
                  type="email"
                  value={session?.user?.email || ""}
                  readOnly
                  className="w-full bg-dark/60 border border-white/10 px-3 py-2.5 text-xs text-gray font-mono"
                />
              </div>
              <div className="flex items-center gap-1.5">
                {editingName ? (
                  <>
                    <button
                      onClick={handleSaveName}
                      disabled={nameSaving}
                      className="px-3 py-2.5 border border-cyan/30 text-cyan text-xs font-bold transition-all hover:bg-cyan hover:text-black hover:border-cyan active:scale-95 disabled:opacity-50"
                    >
                      {nameSaving ? a.saving : a.save}
                    </button>
                    <button
                      onClick={() => { setEditingName(false); setNameValue(session?.user?.name || "") }}
                      className="px-3 py-2.5 border border-white/10 text-gray hover:text-white hover:border-white/20 text-xs transition-all"
                    >
                      {a.cancel}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditingName(true)}
                    className="px-3 py-2.5 border border-cyan/30 text-cyan text-xs font-bold transition-all hover:bg-cyan hover:text-black hover:border-cyan active:scale-95"
                  >
                    {a.edit}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-white/8 flex items-center gap-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray">{a.language}</label>
              <div className="flex items-center bg-dark/60 border border-cyan/15 p-0.5 w-fit">
                {(["it", "en"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLocale(lang)}
                    className={`px-3 py-1 text-xs font-bold transition-all uppercase tracking-wider ${
                      locale === lang
                        ? "bg-cyan/20 text-cyan"
                        : "text-gray hover:text-white"
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Crediti + Statistiche */}
          <section className="bg-white/2 border border-white/8 hover:border-cyan/15 transition-colors p-5 md:p-6">
            <h2 className="text-sm font-bold mb-5 flex items-center gap-2">
              <span className="w-7 h-7 bg-dark/80 border border-cyan/20 flex items-center justify-center text-cyan">
                <CreditCard size={14} />
              </span>
              {a.credits}
            </h2>

            <div className="mb-5 p-4 bg-dark/50 border border-cyan/10">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-gray">{creditsUsed.toLocaleString()} {a.credits_used}</span>
                <span className="text-cyan font-semibold">{creditsTotal.toLocaleString()} {a.credits_total}</span>
              </div>
              <div className="h-2 bg-dark/80 border border-white/5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${creditsColor}`}
                  style={{ width: `${creditsPct}%` }}
                />
              </div>
              <p className="text-xs text-gray mt-2">
                {creditsRemaining >= 0
                  ? a.credits_remaining(creditsRemaining.toLocaleString())
                  : a.credits_overflow}
              </p>
            </div>

            {statsLoading ? (
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-dark/40 border border-cyan/10 p-4 flex items-center gap-3 animate-pulse">
                    <div className="w-9 h-9 bg-dark shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-5 w-8 bg-dark" />
                      <div className="h-3 w-14 bg-dark" />
                    </div>
                  </div>
                ))}
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {statCards.map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="bg-dark/40 border border-cyan/15 p-4 flex items-center gap-3 group hover:border-cyan/30 transition-colors"
                  >
                    <div className="w-9 h-9 bg-dark border border-cyan/20 flex items-center justify-center text-cyan group-hover:scale-105 transition-transform">
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white">{value}</p>
                      <p className="text-[11px] text-gray uppercase tracking-wider">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          {/* Piani */}
          <section className="bg-white/2 border border-white/8 hover:border-cyan/15 transition-colors p-5 md:p-6">
            <h2 className="text-sm font-bold mb-5 flex items-center gap-2">
              <span className="w-7 h-7 bg-dark/80 border border-cyan/20 flex items-center justify-center text-cyan">
                <Zap size={14} />
              </span>
              {a.plans}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allPlans.map((plan) => {
                const isCurrent = (stats?.currentPlan || "free") === plan.id
                return (
                  <div
                    key={plan.id}
                    className={`relative p-4 transition-all ${
                      isCurrent
                        ? "bg-cyan/5 border border-cyan/35"
                        : "bg-dark/40 border border-white/8 hover:border-cyan/20"
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider text-cyan bg-cyan/15 border border-cyan/25 px-1.5 py-0.5">
                        {a.plans_attuale}
                      </span>
                    )}
                    <div className="flex items-center justify-between mb-1.5 pr-16">
                      <h3 className={`font-bold text-sm ${isCurrent ? "text-cyan" : "text-white"}`}>
                        {plan.name}
                      </h3>
                      <span className="text-xs text-gray">
                        {plan.price === "0" ? a.plans_free_price : a.plans_per_month(plan.price)}
                      </span>
                    </div>
                    <p className="text-xs text-gray mb-2">{a.plans_credits_per_month(plan.credits)}</p>
                    <ul className="space-y-1">
                      {plan.features.map((f, i) => (
                        <li key={i} className="text-xs text-gray flex items-start gap-2">
                          <span className="text-cyan mt-0.5">·</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>

            <button
              onClick={() => router.push("/#piani")}
              className="w-full mt-4 py-2.5 border border-cyan/30 text-cyan text-xs font-bold transition-all flex items-center justify-center gap-2 hover:bg-cyan hover:text-black hover:border-cyan active:scale-95"
            >
              {a.plans_view_details}
              <ArrowUpRight size={12} />
            </button>
          </section>

          {/* Ricarica + Connessioni */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <section className="bg-white/2 border border-white/8 hover:border-cyan/15 transition-colors p-5 md:p-6 flex flex-col">
              <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-dark/80 border border-cyan/20 flex items-center justify-center text-cyan">
                  <Settings size={14} />
                </span>
                {a.recharge_title}
              </h2>

              <div className="space-y-3 flex-1 flex flex-col">
                <div className="bg-dark/40 border border-cyan/10 p-3">
                  <p className="text-[11px] text-gray uppercase tracking-wider font-bold mb-1">
                    {a.recharge_plan_label(currentPlanData.name)}
                  </p>
                  <p className="text-xs text-white leading-relaxed">
                    {a.recharge_desc(currentPlanData.credits.toLocaleString(locale === "en" ? "en-US" : "it-IT"))}
                  </p>
                  <p className="text-[11px] text-gray mt-1.5">
                    {a.recharge_price_note(currentPlanData.price)}
                  </p>
                </div>

                <label className="flex items-center justify-between cursor-pointer p-3 bg-dark/40 border border-white/8 hover:border-cyan/20 transition-colors">
                  <span className="text-xs text-white">{a.recharge_toggle_label}</span>
                  <input
                    type="checkbox"
                    checked={autoRecharge}
                    onChange={(e) => setAutoRecharge(e.target.checked)}
                    className="accent-cyan w-4 h-4 cursor-pointer"
                  />
                </label>

                <button
                  onClick={handleSaveRecharge}
                  className={`w-full py-2.5 text-xs font-bold transition-all mt-auto ${
                    autoRecharge
                      ? "border border-cyan/30 text-cyan hover:bg-cyan hover:text-black hover:border-cyan active:scale-95"
                      : "border border-white/10 text-gray hover:text-white hover:border-white/20"
                  }`}
                >
                  {rechargeSaved ? a.recharge_saved : a.recharge_save}
                </button>
              </div>
            </section>

            <section className="bg-white/2 border border-white/8 hover:border-cyan/15 transition-colors p-5 md:p-6 flex flex-col">
              <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-dark/80 border border-cyan/20 flex items-center justify-center text-cyan">
                  <Plug size={14} />
                </span>
                {a.connections_title}
              </h2>

              <p className="text-xs text-gray leading-relaxed flex-1">
                {a.connections_desc}
              </p>

              <button
                onClick={() => router.push("/account/connections")}
                className="w-full mt-4 py-2.5 border border-cyan/30 text-cyan text-xs font-bold transition-all flex items-center justify-center gap-2 hover:bg-cyan hover:text-black hover:border-cyan active:scale-95"
              >
                {a.connections_cta}
                <ArrowUpRight size={12} />
              </button>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
