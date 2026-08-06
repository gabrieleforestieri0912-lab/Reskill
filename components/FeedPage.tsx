"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Search, Loader2, ExternalLink, Trash2, Plus, X, Zap,
  Rss, Link2, FolderOpen,
} from "lucide-react"

interface SourceItem {
  id: string
  type: string
  title: string
  url: string
  domain: string
  date: string
  bucketId: string
  bucketName: string
  createdAt: string
  content?: string
  skillMarkdown?: string
}

interface Bucket {
  id: string
  name: string
  description: string
  sources: SourceItem[]
  generatedSkill?: string
  updatedAt: string
}

const typeAbbr: Record<string, string> = {
  youtube: "YT",
  twitter: "X",
  reddit: "RD",
  pdf: "PDF",
  web: "WEB",
}

const typeColors: Record<string, string> = {
  youtube: "bg-[rgba(255,0,0,0.15)]",
  twitter: "bg-[rgba(29,161,242,0.15)]",
  reddit: "bg-[rgba(255,69,0,0.15)]",
  pdf: "bg-[rgba(245,158,11,0.15)]",
  web: "bg-cyan/15",
}

function getTypeAbbr(type: string) {
  return typeAbbr[type] || type.slice(0, 3).toUpperCase()
}

function getTypeColor(type: string) {
  return typeColors[type] || "bg-cyan/15"
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("it-IT", {
      day: "numeric", month: "short", year: "numeric",
    })
  } catch {
    return dateStr
  }
}

export default function FeedPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [sources, setSources] = useState<SourceItem[]>([])
  const [buckets, setBuckets] = useState<Bucket[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFolder, setActiveFolder] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  const [convertUrl, setConvertUrl] = useState("")
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionError, setExtractionError] = useState("")
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [sourcesRes, bucketsRes] = await Promise.all([
          fetch("/api/sources"),
          fetch("/api/buckets"),
        ])
        if (sourcesRes.ok) setSources(await sourcesRes.json())
        if (bucketsRes.ok) setBuckets(await bucketsRes.json())
      } catch (e) {
        console.error("Failed to fetch data", e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const sortedBuckets = [...buckets].sort((a, b) => a.name.localeCompare(b.name))

  const types = Array.from(new Set(sources.map((s) => s.type)))

  const filtered = sources.filter((s) => {
    const matchesSearch = !searchQuery ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.domain.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFolder = activeFolder === "all" || s.bucketId === activeFolder
    const matchesType = types.length > 0
    return matchesSearch && matchesFolder && matchesType
  })

  const handleExtract = async () => {
    if (!convertUrl.trim()) return
    setIsExtracting(true)
    setExtractionError("")
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: convertUrl.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Errore estrazione")
      const targetBucket = buckets.length > 0 ? buckets[0] : null
      if (targetBucket) {
        await fetch(`/api/buckets/${targetBucket.id}/sources`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source: data }),
        })
        const [sourcesRes, bucketsRes] = await Promise.all([
          fetch("/api/sources"),
          fetch("/api/buckets"),
        ])
        if (sourcesRes.ok) setSources(await sourcesRes.json())
        if (bucketsRes.ok) setBuckets(await bucketsRes.json())
      }
      setConvertUrl("")
    } catch (e: any) {
      setExtractionError(e.message || "Errore durante l'estrazione")
    } finally {
      setIsExtracting(false)
    }
  }

  const handleDeleteSource = async (sourceId: string) => {
    try {
      const res = await fetch(`/api/sources/${sourceId}`, { method: "DELETE" })
      if (res.ok) {
        setSources((prev) => prev.filter((s) => s.id !== sourceId))
      }
    } catch (e) {
      console.error("Failed to delete source", e)
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return
    try {
      const res = await fetch("/api/buckets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName }),
      })
      if (res.ok) {
        const newBucket = await res.json()
        setBuckets((prev) => [...prev, { ...newBucket, sources: [] }])
        setNewFolderName("")
        setShowCreateFolder(false)
      }
    } catch (e) {
      console.error("Failed to create bucket", e)
    }
  }

  const totalCredits = 500
  const usedCredits = sources.length * 3
  const creditPercent = Math.min((usedCredits / totalCredits) * 100, 100)

  return (
    <main className="min-h-screen pt-[73px] bg-dark text-white selection:bg-cyan/30">
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-cyan/10 border border-cyan/25 flex items-center justify-center text-cyan shrink-0">
            <Rss size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight">Feed</h1>
            <p className="text-xs text-gray mt-1 truncate">{session?.user?.email}</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Estrazione URL */}
          <section className="bg-white/2 border border-white/8 hover:border-cyan/15 transition-colors p-5 md:p-6">
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-dark/80 border border-cyan/20 flex items-center justify-center text-cyan">
                <Link2 size={14} />
              </span>
              Estrai contenuto
            </h2>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Incolla un link YouTube, X, Reddit, PDF o pagina web..."
                value={convertUrl}
                onChange={(e) => setConvertUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleExtract()}
                className="flex-1 bg-dark/60 border border-cyan/15 px-3 py-2.5 text-xs text-white placeholder:text-gray focus:outline-none focus:border-cyan/40 transition-colors font-mono"
              />
              <button
                onClick={handleExtract}
                disabled={isExtracting || !convertUrl.trim()}
                className="px-4 py-2.5 border border-cyan/30 text-cyan text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 hover:bg-cyan hover:text-black hover:border-cyan active:scale-95"
              >
                {isExtracting ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                Estrai
              </button>
            </div>
            {extractionError && (
              <p className="text-xs text-cyan mt-2">{extractionError}</p>
            )}
          </section>

          {/* Risorse salvate */}
          <section className="bg-white/2 border border-white/8 hover:border-cyan/15 transition-colors p-5 md:p-6">
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-dark/80 border border-cyan/20 flex items-center justify-center text-cyan">
                <FolderOpen size={14} />
              </span>
              Risorse salvate
              {!isLoading && (
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan bg-cyan/15 border border-cyan/25 px-2 py-0.5 ml-auto">
                  {filtered.length}
                </span>
              )}
            </h2>

            {/* Search + Folder tabs */}
            <div className="flex flex-col gap-3 mb-4">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" />
                <input
                  type="text"
                  placeholder="Cerca per titolo, tipo, URL..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-dark/60 border border-cyan/15 px-3 py-2.5 pl-9 text-xs text-white placeholder:text-gray focus:outline-none focus:border-cyan/40 transition-colors"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 items-center">
                <button
                  onClick={() => setActiveFolder("all")}
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border transition-all ${
                    activeFolder === "all"
                      ? "bg-cyan/15 border-cyan/25 text-cyan"
                      : "bg-transparent border-white/10 text-gray hover:border-cyan/25 hover:text-cyan"
                  }`}
                >
                  Tutti
                </button>
                {sortedBuckets.map((bucket) => {
                  const bucketCount = sources.filter((s) => s.bucketId === bucket.id).length
                  return (
                    <button
                      key={bucket.id}
                      onClick={() => setActiveFolder(bucket.id)}
                      className={`px-2.5 py-1 text-[10px] font-bold border transition-all ${
                        activeFolder === bucket.id
                          ? "bg-cyan/15 border-cyan/25 text-cyan"
                          : "bg-transparent border-white/10 text-gray hover:border-cyan/25 hover:text-cyan"
                      }`}
                    >
                      {bucket.name} {bucketCount > 0 && <span className="opacity-50">({bucketCount})</span>}
                    </button>
                  )
                })}
                {showCreateFolder ? (
                  <div className="flex gap-1 items-center">
                    <input
                      type="text"
                      placeholder="Nome cartella..."
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                      className="w-28 bg-dark/60 border border-cyan/20 px-2 py-1 text-[10px] text-white placeholder:text-gray focus:outline-none focus:border-cyan/40 transition-colors"
                      autoFocus
                    />
                    <button
                      onClick={handleCreateFolder}
                      disabled={!newFolderName.trim()}
                      className="px-2 py-1 border border-cyan/30 text-cyan text-[10px] font-bold transition-all hover:bg-cyan hover:text-black disabled:opacity-40"
                    >
                      Crea
                    </button>
                    <button
                      onClick={() => { setShowCreateFolder(false); setNewFolderName("") }}
                      className="px-1.5 py-1 text-[10px] text-gray hover:text-cyan transition-colors"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCreateFolder(true)}
                    className="px-2.5 py-1 text-[10px] border border-dashed border-cyan/20 text-gray hover:border-cyan/35 hover:text-cyan transition-all flex items-center gap-1"
                  >
                    <Plus size={10} />
                    Cartella
                  </button>
                )}
              </div>
            </div>

            {/* Feed list */}
            <div className="flex flex-col gap-1.5">
              {isLoading ? (
                <div className="text-center py-12 text-xs text-gray">
                  <Loader2 size={16} className="animate-spin mx-auto mb-2 text-cyan" />
                  Caricamento...
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray leading-relaxed border border-white/8 bg-dark/40 p-6">
                  <svg className="w-7 h-7 mx-auto mb-3 text-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {sources.length === 0
                    ? <>Nessuna risorsa salvata.<br />Usa l&apos;estensione per salvare pagine web e trascrizioni YouTube.</>
                    : "Nessun risultato. Prova a modificare i filtri."}
                </div>
              ) : (
                filtered.map((source) => (
                  <div
                    key={source.id}
                    className="group flex items-center gap-2.5 px-3 py-2.5 bg-dark/40 border border-white/8 hover:border-cyan/25 transition-colors"
                  >
                    <div className={`w-8 h-8 flex items-center justify-center shrink-0 text-cyan border border-cyan/15 ${getTypeColor(source.type)}`}>
                      <span className="text-[9px] font-bold">{getTypeAbbr(source.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-white truncate block hover:text-cyan transition-colors"
                      >
                        {source.title}
                      </a>
                      <div className="text-[10px] text-gray mt-0.5">
                        {source.domain} · {formatDate(source.date || source.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-2 py-1 border border-cyan/20 text-cyan text-[10px] transition-all hover:bg-cyan/15"
                      >
                        <ExternalLink size={11} />
                      </a>
                      <button
                        onClick={() => handleDeleteSource(source.id)}
                        className="px-2 py-1 border border-cyan/20 text-cyan text-[10px] transition-all hover:bg-cyan/15"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Crediti */}
          <section className="bg-white/2 border border-white/8 hover:border-cyan/15 transition-colors p-5 md:p-6">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-gray">Crediti</span>
              <span className="text-cyan font-semibold">{usedCredits}/{totalCredits}</span>
            </div>
            <div className="h-2 bg-dark/80 border border-white/5 overflow-hidden">
              <div
                className="h-full bg-cyan transition-all duration-500"
                style={{ width: `${creditPercent}%` }}
              />
            </div>
            <button
              onClick={() => router.push("/account")}
              className="w-full mt-4 py-2.5 border border-cyan/30 text-cyan text-xs font-bold transition-all hover:bg-cyan hover:text-black hover:border-cyan active:scale-95"
            >
              Ricarica
            </button>
          </section>
        </div>
      </div>
    </main>
  )
}
