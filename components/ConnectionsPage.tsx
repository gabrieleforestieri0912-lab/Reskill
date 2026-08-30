"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/translations"
import {
  Plug, Key, Terminal, Globe, Loader2, Check,
  Copy, ChevronLeft, RefreshCw,
} from "lucide-react"

const connectionPlatforms = [
  { id: "claude", name: "Claude", desc: "AI assistant", icon: "\u{1F4AC}" },
  { id: "cursor", name: "Cursor", desc: "AI-first IDE", icon: "\u{2197}" },
  { id: "codex", name: "Codex", desc: "Editor AI", icon: "</>" },
]

const connectionTools = [
  { id: "mcp", name: "MCP Server", desc: "Model Context Protocol", icon: Plug },
  { id: "api", name: "API Key", desc: "REST API", icon: Key },
  { id: "cli", name: "CLI", desc: "Command line interface", icon: Terminal },
]

function SectionIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="w-7 h-7 bg-dark/80 border border-cyan/20 flex items-center justify-center text-cyan">
      {children}
    </span>
  )
}

export default function ConnectionsPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const a = t.account

  const [mcpUrl, setMcpUrl] = useState("")
  const [mcpSaved, setMcpSaved] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [apiKeyMask, setApiKeyMask] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [cliConfigured, setCliConfigured] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedToken, setCopiedToken] = useState(false)
  const [generatingKey, setGeneratingKey] = useState(false)

  const [mcpToken, setMcpToken] = useState("")
  const [mcpTokenPrefix, setMcpTokenPrefix] = useState("")
  const [mcpTokenId, setMcpTokenId] = useState("")
  const [showMcpToken, setShowMcpToken] = useState(false)
  const [generatingToken, setGeneratingToken] = useState(false)
  const [revokingToken, setRevokingToken] = useState(false)

  useEffect(() => {
    const init = async () => {
      const savedUrl = localStorage.getItem("sg_mcp_url") || ""
      setMcpUrl(savedUrl)
      setMcpSaved(!!savedUrl)
      const savedCli = localStorage.getItem("sg_cli_configured") === "true"
      setCliConfigured(savedCli)

      const [keyRes, tokenRes] = await Promise.all([
        fetch("/api/extension/api-keys"),
        fetch("/api/mcp/token"),
      ])

      if (keyRes.ok) {
        const data = await keyRes.json()
        const activeKeys = (data.keys || []).filter((k: { revoked?: boolean }) => !k.revoked)
        if (activeKeys.length > 0) {
          const key = activeKeys[0]
          if (key.key) {
            setApiKey(key.key)
          } else {
            setApiKeyMask(`sg_...${key.key_prefix?.slice(-6) || ""}`)
          }
        }
      }

      if (tokenRes.ok) {
        const data = await tokenRes.json()
        const activeTokens = (data.tokens || []).filter((t: { revoked?: boolean }) => !t.revoked)
        if (activeTokens.length > 0) {
          const t = activeTokens[0]
          setMcpTokenPrefix(t.key_prefix || "")
          setMcpTokenId(t.id || "")
        }
      }
    }
    init().catch(() => {})
  }, [])

  const handleSaveMcpUrl = () => {
    if (!mcpUrl.trim()) return
    try {
      new URL(mcpUrl.trim())
      localStorage.setItem("sg_mcp_url", mcpUrl.trim())
      setMcpSaved(true)
      setTimeout(() => setMcpSaved(false), 2000)
    } catch {
      alert("URL non valido")
    }
  }

  const handleCopyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleGenerateApiKey = async () => {
    setGeneratingKey(true)
    try {
      const res = await fetch("/api/extension/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "webapp" }),
      })
      if (res.ok) {
        const data = await res.json()
        setApiKey(data.key)
        setApiKeyMask("")
        localStorage.setItem("reskill_api_key", data.key)
        await navigator.clipboard.writeText(data.key)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setGeneratingKey(false)
    }
  }

  const handleGenerateMcpToken = async () => {
    setGeneratingToken(true)
    try {
      const res = await fetch("/api/mcp/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "webapp" }),
      })
      if (res.ok) {
        const data = await res.json()
        setMcpToken(data.token)
        setMcpTokenPrefix(data.keyPrefix)
        setMcpTokenId(data.id || "")
        await navigator.clipboard.writeText(data.token)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setGeneratingToken(false)
    }
  }

  const handleCopyMcpToken = () => {
    const value = mcpToken || mcpTokenPrefix
    if (value) {
      navigator.clipboard.writeText(value)
      setCopiedToken(true)
      setTimeout(() => setCopiedToken(false), 2000)
    }
  }

  const handleRevokeMcpToken = async () => {
    if (!mcpTokenId) return
    setRevokingToken(true)
    try {
      await fetch("/api/mcp/token", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: mcpTokenId }),
      })
      setMcpToken("")
      setMcpTokenPrefix("")
      setMcpTokenId("")
      setShowMcpToken(false)
    } catch (e) {
      console.error(e)
    } finally {
      setRevokingToken(false)
    }
  }

  const handleRegenerateMcpToken = async () => {
    await handleRevokeMcpToken()
    await handleGenerateMcpToken()
  }

  const handleConnectionClick = (connId: string) => {
    switch (connId) {
      case "mcp":
        setTimeout(() => document.getElementById("mcp-url-input")?.focus(), 100)
        break
      case "api":
        if (!apiKey) handleGenerateApiKey()
        break
      case "cli":
        window.open("/mcp", "_blank")
        break
      case "codex":
      case "claude":
      case "cursor":
        window.open("/mcp", "_blank")
        break
    }
  }

  const connectionStatuses: Record<string, { active: boolean; label: string; desc: string }> = {}

  if (mcpUrl || mcpToken || mcpTokenPrefix) {
    connectionStatuses["mcp"] = { active: true, label: "Connesso", desc: mcpUrl || "Server MCP attivo" }
    connectionStatuses["codex"] = { active: true, label: "Disponibile", desc: "via MCP Server" }
    connectionStatuses["claude"] = { active: true, label: "Disponibile", desc: "via MCP Server" }
    connectionStatuses["cursor"] = { active: true, label: "Disponibile", desc: "via MCP Server" }
  } else {
    connectionStatuses["mcp"] = { active: false, label: "Non configurato", desc: "Model Context Protocol" }
    connectionStatuses["codex"] = { active: false, label: "Non connesso", desc: "Editor AI" }
    connectionStatuses["claude"] = { active: false, label: "Non connesso", desc: "AI assistant" }
    connectionStatuses["cursor"] = { active: false, label: "Non connesso", desc: "AI-first IDE" }
  }

  if (apiKey || apiKeyMask) {
    connectionStatuses["api"] = { active: true, label: "Chiave attiva", desc: apiKey || apiKeyMask }
  } else {
    connectionStatuses["api"] = { active: false, label: "Non generata", desc: "REST API" }
  }

  if (cliConfigured) {
    connectionStatuses["cli"] = { active: true, label: "Configurata", desc: "CLI pronta all'uso" }
  } else {
    connectionStatuses["cli"] = { active: false, label: "Non configurata", desc: "Command line interface" }
  }

  const connectionStatus = (id: string) =>
    connectionStatuses[id] || { active: false, label: "—", desc: "—" }

  const activeCount = Object.values(connectionStatuses).filter((s) => s.active).length

  return (
    <main className="min-h-screen pt-[73px] bg-dark text-white selection:bg-cyan/30">
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-start gap-4 mb-10">
          <button
            onClick={() => router.push("/account")}
            className="mt-1 w-9 h-9 bg-white/5 border border-white/10 flex items-center justify-center text-gray hover:text-white hover:border-cyan/30 transition-all shrink-0"
            aria-label="Back"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex-1 flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 bg-cyan/10 border border-cyan/25 flex items-center justify-center text-cyan shrink-0">
              <Plug size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight">{a.connections_title}</h1>
                {activeCount > 0 && (
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-cyan/15 text-cyan border border-cyan/25">
                    {activeCount} attive
                  </span>
                )}
              </div>
              <p className="text-xs text-gray mt-1">MCP Server, API Key, piattaforme e strumenti</p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {/* MCP Server */}
          <section className="bg-white/2 border border-white/8 hover:border-cyan/15 transition-colors p-5 md:p-6">
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
              <SectionIcon><Plug size={14} /></SectionIcon>
              Server MCP
            </h2>
            <div className="flex gap-2">
              <input
                id="mcp-url-input"
                type="text"
                value={mcpUrl}
                onChange={(e) => { setMcpUrl(e.target.value); setMcpSaved(false) }}
                placeholder="http://localhost:3001"
                className="flex-1 bg-dark/60 border border-white/10 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan/50 font-mono transition-colors"
              />
              <button
                onClick={handleSaveMcpUrl}
                className="px-4 py-2.5 border border-cyan/30 text-cyan text-xs font-bold transition-all hover:bg-cyan hover:text-black hover:border-cyan active:scale-95 flex items-center gap-1.5"
              >
                {mcpSaved ? <Check size={12} /> : <RefreshCw size={12} />}
                {mcpSaved ? "Salvato" : a.save}
              </button>
            </div>
            {connectionStatus("mcp").active && (
              <p className="text-xs text-cyan mt-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-cyan inline-block rounded-full" />
                MCP configurato — {mcpUrl || "Server MCP attivo"}
              </p>
            )}

            <div className="mt-5 pt-5 border-t border-white/8">
              <p className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                <SectionIcon><Key size={14} /></SectionIcon>
                Token MCP
              </p>
              {mcpToken || mcpTokenPrefix ? (
                <div>
                  <div className="flex gap-2 mb-2">
                    <input
                      type={showMcpToken ? "text" : "password"}
                      value={showMcpToken ? mcpToken || `sg_mcp_...${mcpTokenPrefix.slice(-6)}` : "••••••••••••••••••••"}
                      readOnly
                      className="flex-1 bg-dark/60 border border-white/10 px-4 py-2.5 text-xs text-white font-mono"
                    />
                    <button
                      onClick={() => setShowMcpToken(!showMcpToken)}
                      className="px-3 py-2 border border-white/10 text-gray hover:text-white hover:border-white/20 text-xs transition-all"
                    >
                      {showMcpToken ? "Nascondi" : "Mostra"}
                    </button>
                    <button
                      onClick={handleCopyMcpToken}
                      className="px-3 py-2 border border-cyan/30 text-cyan text-xs font-bold transition-all hover:bg-cyan hover:text-black hover:border-cyan active:scale-95 flex items-center gap-1"
                    >
                      {copiedToken ? <Check size={12} /> : <Copy size={12} />}
                      {copiedToken ? "Copiato" : "Copia"}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleRegenerateMcpToken}
                      disabled={generatingToken || revokingToken}
                      className="px-3 py-2 border border-white/10 text-gray hover:text-white hover:border-white/20 text-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <RefreshCw size={12} className={generatingToken || revokingToken ? "animate-spin" : ""} />
                      Rigenera
                    </button>
                    <button
                      onClick={handleRevokeMcpToken}
                      disabled={revokingToken || !mcpTokenId}
                      className="px-3 py-2 border border-red-500/30 text-red-400 text-xs transition-all hover:bg-red-500/10 hover:border-red-500/50 disabled:opacity-50"
                    >
                      Revoca
                    </button>
                  </div>
                  <p className="text-xs text-gray mt-3 leading-relaxed">
                    Usa questo token nel file di configurazione del tuo client MCP (flag <code className="bg-dark/60 px-1 font-mono">--token</code>).
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleGenerateMcpToken}
                  disabled={generatingToken}
                  className="px-4 py-2.5 border border-cyan/30 text-cyan text-xs font-bold transition-all hover:bg-cyan hover:text-black hover:border-cyan active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                  {generatingToken ? <Loader2 size={12} className="animate-spin" /> : <Key size={12} />}
                  {generatingToken ? "Generazione..." : "Genera Token"}
                </button>
              )}
            </div>
          </section>

          {/* API Key */}
          <section className="bg-white/2 border border-white/8 hover:border-cyan/15 transition-colors p-5 md:p-6">
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
              <SectionIcon><Key size={14} /></SectionIcon>
              API Key
            </h2>
            {apiKey ? (
              <div>
                <div className="flex gap-2 mb-2">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    readOnly
                    className="flex-1 bg-dark/60 border border-white/10 px-4 py-2.5 text-xs text-white font-mono"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="px-3 py-2 border border-white/10 text-gray hover:text-white hover:border-white/20 text-xs transition-all"
                  >
                    {showApiKey ? "Nascondi" : "Mostra"}
                  </button>
                  <button
                    onClick={handleCopyApiKey}
                    className="px-3 py-2 border border-cyan/30 text-cyan text-xs font-bold transition-all hover:bg-cyan hover:text-black hover:border-cyan active:scale-95 flex items-center gap-1"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? "Copiato" : "Copia"}
                  </button>
                </div>
                <p className="text-xs text-cyan flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-cyan inline-block rounded-full" />
                  Chiave attiva
                </p>
              </div>
            ) : (
              <button
                onClick={handleGenerateApiKey}
                disabled={generatingKey}
                className="px-4 py-2.5 border border-cyan/30 text-cyan text-xs font-bold transition-all hover:bg-cyan hover:text-black hover:border-cyan active:scale-95 flex items-center gap-2 disabled:opacity-50"
              >
                {generatingKey ? <Loader2 size={12} className="animate-spin" /> : <Key size={12} />}
                {generatingKey ? "Generazione..." : "Genera API Key"}
              </button>
            )}
          </section>

          {/* Piattaforme */}
          <section className="bg-white/2 border border-white/8 hover:border-cyan/15 transition-colors p-5 md:p-6">
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
              <SectionIcon><Globe size={14} /></SectionIcon>
              Piattaforme
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {connectionPlatforms.map((p) => {
                const status = connectionStatus(p.id)
                return (
                  <div
                    key={p.id}
                    onClick={() => handleConnectionClick(p.id)}
                    className={`flex items-center gap-3 px-4 py-3 bg-dark/40 border cursor-pointer transition-colors group ${
                      status.active
                        ? "border-cyan/25 hover:border-cyan/40"
                        : "border-white/8 hover:border-cyan/20"
                    }`}
                  >
                    <span className="text-lg">{p.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white group-hover:text-cyan transition-colors">{p.name}</p>
                      <p className="text-[11px] text-gray truncate">{status.desc}</p>
                    </div>
                    <span className={`text-[11px] flex items-center gap-1.5 shrink-0 ${status.active ? "text-cyan" : "text-gray"}`}>
                      <span className={`w-1.5 h-1.5 inline-block rounded-full ${status.active ? "bg-cyan" : "bg-gray"}`} />
                      {status.label}
                    </span>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-gray mt-3 leading-relaxed">
              Le piattaforme si connettono automaticamente tramite MCP Server. Configura il server sopra per abilitarle.
            </p>
          </section>

          {/* Strumenti */}
          <section className="bg-white/2 border border-white/8 hover:border-cyan/15 transition-colors p-5 md:p-6">
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
              <SectionIcon><Terminal size={14} /></SectionIcon>
              Strumenti
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {connectionTools.map((tool) => {
                const ToolIcon = tool.icon
                const status = connectionStatus(tool.id)
                return (
                  <div
                    key={tool.id}
                    onClick={() => handleConnectionClick(tool.id)}
                    className={`flex items-center gap-3 px-4 py-3 bg-dark/40 border cursor-pointer transition-colors group ${
                      status.active
                        ? "border-cyan/25 hover:border-cyan/40"
                        : "border-white/8 hover:border-cyan/20"
                    }`}
                  >
                    <div className="text-cyan"><ToolIcon size={16} /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white group-hover:text-cyan transition-colors">{tool.name}</p>
                      <p className="text-[11px] text-gray truncate">{status.desc}</p>
                    </div>
                    <span className={`text-[11px] flex items-center gap-1.5 shrink-0 ${status.active ? "text-cyan" : "text-gray"}`}>
                      <span className={`w-1.5 h-1.5 inline-block rounded-full ${status.active ? "bg-cyan" : "bg-gray"}`} />
                      {status.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
