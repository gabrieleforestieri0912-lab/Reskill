"use client";

import { useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/translations";
import {
  Link2, CodeXml, Copy, Check, Download, LoaderCircle,
  TriangleAlert, CircleCheck, FolderOpen, Settings2,
} from "lucide-react";
import { FaYoutube, FaChrome } from "react-icons/fa6";
import ReactMarkdown from "react-markdown";
import {
  loadExportSettingsWeb,
  saveExportSettingsWeb,
} from "@/lib/export-settings";

type ToolId = "link" | "youtube" | "html";

interface ConvertResult {
  title: string;
  content: string;
  filename: string;
  type: string;
  url?: string;
  domain?: string;
  date?: string;
  videoCount?: number;
  kind?: string;
}

interface BucketOption {
  id: string;
  name: string;
}

const inputCls =
  "w-full bg-[oklch(13%_0.006_260)] border border-[oklch(72%_.06_240)]/20 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[oklch(72%_.06_240)] transition-colors";
const btnPrimary =
  "px-4 py-2.5 bg-cyan text-black text-xs font-bold hover:bg-[oklch(60%_0.08_240)] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5";
const btnGhost =
  "px-3 py-2 border border-white/15 text-xs font-bold text-white/80 hover:text-white hover:border-cyan/40 transition-all flex items-center gap-1.5";

export default function StrumentiPage() {
  const { status } = useSession();
  const { locale } = useTranslation();
  const isEn = locale === "en";

  const [tool, setTool] = useState<ToolId>("link");
  const [url, setUrl] = useState("");
  const [html, setHtml] = useState("");
  const [maxVideos, setMaxVideos] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewRaw, setViewRaw] = useState(false);

  const [buckets, setBuckets] = useState<BucketOption[]>([]);
  const [bucketId, setBucketId] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const [exportDefaults] = useState(() => loadExportSettingsWeb());
  const [exportPath, setExportPath] = useState(exportDefaults.exportPath);
  const [exportFolder, setExportFolder] = useState(exportDefaults.exportFolder);
  const [exportSaved, setExportSaved] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    fetch("/api/buckets")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Array<{ id: string; name: string }>) => {
        if (cancelled) return;
        const opts = (Array.isArray(data) ? data : []).map((b) => ({ id: b.id, name: b.name }));
        setBuckets(opts);
        if (opts.length > 0) setBucketId(opts[0].id);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [status]);

  const reset = () => {
    setError(null);
    setResult(null);
    setSaveMsg(null);
    setCopied(false);
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    setLoading(true);
    try {
      let res: Response;
      if (tool === "link") {
        if (!url.trim()) throw new Error(isEn ? "Paste a URL." : "Incolla un URL.");
        res = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: url.trim() }),
        });
      } else if (tool === "youtube") {
        if (!url.trim()) throw new Error(isEn ? "Paste a YouTube URL." : "Incolla un URL YouTube.");
        res = await fetch("/api/youtube-to-markdown", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: url.trim(), maxVideos }),
        });
      } else {
        if (html.trim().length < 20)
          throw new Error(isEn ? "Paste a valid HTML fragment." : "Incolla un frammento HTML valido.");
        res = await fetch("/api/html-to-markdown", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ html, url: url.trim() || undefined }),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Conversione fallita");
      const title: string = data.title || "estrazione";
      const base = (data.filename || title).replace(/\.md$/i, "");
      setResult({
        title,
        content: data.markdown || data.content || "",
        filename: base,
        type: data.type || (tool === "youtube" ? "youtube" : tool === "html" ? "pasted-html" : "webpage"),
        url: data.url || (tool === "html" ? undefined : url.trim() || undefined),
        domain: data.domain,
        date: data.date,
        videoCount: data.videoCount,
        kind: data.kind,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    // Su web il browser salva con il basename; percorso/cartella restano
    // la preferenza condivisa con l'estensione (localStorage).
    const safe = result.filename.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim().substring(0, 60) || "estrazione";
    const blob = new Blob([result.content], { type: "text/markdown;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = `${safe}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  };

  const handleSaveToBucket = async () => {
    if (!result || !bucketId) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch(`/api/buckets/${bucketId}/sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: result.type,
          title: result.title,
          url: result.url || "https://reskill.app/tools",
          domain: result.domain || "web-tools",
          date: result.date,
          content: result.content,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Salvataggio fallito");
      setSaveMsg(isEn ? "Saved to bucket ✓" : "Salvata nel bucket ✓");
    } catch (err: unknown) {
      setSaveMsg(err instanceof Error ? err.message : "Errore");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveExportSettings = () => {
    saveExportSettingsWeb({ exportPath, exportFolder });
    setExportSaved(true);
    setTimeout(() => setExportSaved(false), 2000);
  };

  const tabs: { id: ToolId; label: string; icon: ComponentType<{ size?: number | string; className?: string }>; hint: string }[] = [
    {
      id: "link",
      label: "Link → Markdown",
      icon: Link2,
      hint: isEn
        ? "Any article, blog, docs page, X post, Reddit thread or PDF via URL."
        : "Qualsiasi articolo, blog, documentazione, post X, thread Reddit o PDF tramite URL.",
    },
    {
      id: "youtube",
      label: "YouTube → Markdown",
      icon: FaYoutube,
      hint: isEn
        ? "Single video, playlist or entire channel with transcripts."
        : "Singolo video, playlist o intero canale con trascrizioni.",
    },
    {
      id: "html",
      label: isEn ? "Clean HTML" : "Pulisci HTML",
      icon: CodeXml,
      hint: isEn
        ? "Paste raw HTML: banners, menus and scripts are stripped."
        : "Incolla HTML grezzo: banner, menu e script vengono rimossi.",
    },
  ];

  return (
    <main className="min-h-screen pt-[73px] bg-dark text-white selection:bg-cyan/30">
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <p className="text-[11px] font-bold uppercase tracking-widest text-cyan mb-2">
          {isEn ? "Same as the extension, no install needed" : "Come l'estensione, senza installare nulla"}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          {isEn ? "Web Tools" : "Strumenti web"}
        </h1>
        <p className="text-sm text-gray leading-relaxed mb-8 max-w-xl">
          {isEn
            ? "Every converter from the browser extension, usable right here: extract, preview, download or save to a bucket."
            : "Tutti i convertitori dell'estensione, usabili direttamente da qui: estrai, visualizza l'anteprima, scarica o salva nel bucket."}
        </p>

        {status === "unauthenticated" && (
          <div className="mb-6 p-4 border border-cyan/30 bg-cyan/5 text-sm flex items-center justify-between gap-4">
            <span className="text-white/85">
              {isEn ? "Log in to convert, download and save sources." : "Accedi per convertire, scaricare e salvare fonti."}
            </span>
            <Link href="/login" className="px-4 py-2 bg-cyan text-black text-xs font-bold shrink-0">
              {isEn ? "Log in" : "Accedi"}
            </Link>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 border border-white/10 bg-white/[0.02] mb-6 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTool(t.id); reset(); }}
              className={`flex-1 min-w-[150px] px-3 py-2.5 text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                tool === t.id ? "bg-cyan text-black" : "text-gray hover:text-white"
              }`}
            >
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {/* Converter card */}
        <section className="bg-white/2 border border-white/8 p-5 md:p-6">
          <p className="text-xs text-gray leading-relaxed mb-4">
            {tabs.find((t) => t.id === tool)?.hint}
          </p>

          <form onSubmit={handleConvert} className="space-y-3">
            {(tool === "link" || tool === "youtube") && (
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={
                  tool === "youtube"
                    ? "https://www.youtube.com/watch?v=… / playlist?list=… / @canale"
                    : "https://esempio.com/articolo"
                }
                className={inputCls}
              />
            )}
            {tool === "youtube" && (
              <label className="flex items-center gap-2 text-[11px] text-gray">
                Max video
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={maxVideos}
                  onChange={(e) => setMaxVideos(Number(e.target.value) || 20)}
                  className="w-16 bg-[oklch(13%_0.006_260)] border border-[oklch(72%_.06_240)]/20 px-2 py-1 text-xs text-white focus:outline-none"
                />
                <span>({isEn ? "playlists/channels only" : "solo playlist/canali"})</span>
              </label>
            )}
            {tool === "html" && (
              <>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={isEn ? "Source URL (optional, for reference)" : "URL di riferimento (facoltativo)"}
                  className={inputCls}
                />
                <textarea
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  placeholder="<article>…incolla qui l'HTML grezzo…</article>"
                  rows={8}
                  className={`${inputCls} font-mono resize-y`}
                />
              </>
            )}
            <button type="submit" disabled={loading || status !== "authenticated"} className={btnPrimary}>
              {loading ? (
                <><LoaderCircle size={13} className="animate-spin" /> {isEn ? "Converting…" : "Conversione…"}</>
              ) : (
                <>{isEn ? "Convert" : "Converti"} →</>
              )}
            </button>
          </form>

          {error && (
            <p className="text-xs text-red-400 mt-4 flex items-center gap-1.5">
              <TriangleAlert size={12} /> {error}
            </p>
          )}

          {result && (
            <div className="mt-5 border border-cyan/20 bg-black/30">
              <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-white/8">
                <span className="text-xs font-bold text-white truncate flex-1 min-w-[120px]">
                  {result.title}
                </span>
                {result.videoCount ? (
                  <span className="text-[11px] text-cyan">· {result.videoCount} video</span>
                ) : null}
                <button
                  onClick={() => setViewRaw(!viewRaw)}
                  className="text-[11px] font-bold uppercase text-gray hover:text-white transition-colors"
                >
                  {viewRaw ? "Preview" : "Raw"}
                </button>
              </div>
              <div className="max-h-[380px] overflow-y-auto p-4">
                {viewRaw ? (
                  <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-white/85">
                    {result.content.slice(0, 20000)}
                  </pre>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{result.content.replace(/^---[\s\S]*?---\s*/, "").slice(0, 20000)}</ReactMarkdown>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-t border-white/8">
                <button onClick={handleCopy} className={btnGhost}>
                  {copied ? <><Check size={12} /> {isEn ? "Copied" : "Copiato"}!</> : <><Copy size={12} /> {isEn ? "Copy" : "Copia"}</>}
                </button>
                <button onClick={handleDownload} className={btnGhost}>
                  <Download size={12} /> .md
                </button>
                {buckets.length > 0 && (
                  <>
                    <select
                      value={bucketId}
                      onChange={(e) => setBucketId(e.target.value)}
                      className="bg-[oklch(13%_0.006_260)] border border-white/15 px-2 py-2 text-xs text-white focus:outline-none"
                    >
                      {buckets.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                    <button onClick={handleSaveToBucket} disabled={saving} className={btnGhost}>
                      {saving ? <LoaderCircle size={12} className="animate-spin" /> : <FolderOpen size={12} />}
                      {isEn ? "Save to bucket" : "Salva nel bucket"}
                    </button>
                  </>
                )}
                {saveMsg && (
                  <span className="text-[11px] text-emerald-300 flex items-center gap-1">
                    <CircleCheck size={11} /> {saveMsg}
                  </span>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Export settings */}
        <section className="mt-5 bg-white/2 border border-white/8 p-5 md:p-6">
          <h2 className="text-sm font-bold mb-1 flex items-center gap-2">
            <span className="w-7 h-7 bg-dark/80 border border-cyan/20 flex items-center justify-center text-cyan">
              <Settings2 size={14} />
            </span>
            {isEn ? "Export settings" : "Impostazioni export"}
          </h2>
          <p className="text-[11px] text-gray leading-relaxed mb-4">
            {isEn
              ? "Shared with the browser extension: choose where your Markdown files are saved."
              : "Condivise con l'estensione browser: scegli dove salvare i file Markdown."}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray block mb-1.5">
                {isEn ? "Save path" : "Percorso di salvataggio"}
              </label>
              <input type="text" value={exportPath} onChange={(e) => setExportPath(e.target.value)} className={`${inputCls} font-mono`} />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray block mb-1.5">
                {isEn ? "Folder name" : "Nome cartella"}
              </label>
              <input type="text" value={exportFolder} onChange={(e) => setExportFolder(e.target.value)} className={`${inputCls} font-mono`} />
            </div>
          </div>
          <button
            onClick={handleSaveExportSettings}
            className="mt-4 px-4 py-2.5 border border-cyan/30 text-cyan text-xs font-bold transition-all hover:bg-cyan hover:text-black active:scale-95"
          >
            {exportSaved ? (isEn ? "Saved ✓" : "Salvato ✓") : (isEn ? "Save export settings" : "Salva impostazioni export")}
          </button>
        </section>

        {/* Extension CTA */}
        <section className="mt-5 border border-white/8 bg-white/[0.015] p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 shrink-0 bg-cyan/10 border border-cyan/25 flex items-center justify-center text-cyan">
            <FaChrome size={18} />
          </div>
          <p className="text-xs text-gray leading-relaxed flex-1">
            {isEn
              ? "Prefer one click? The extension converts any page, video, playlist or channel from the context menu."
              : "Preferisci un clic? L'estensione converte qualsiasi pagina, video, playlist o canale dal menu contestuale."}
          </p>
          <Link href="/#estensione" className="px-4 py-2.5 bg-cyan text-black text-xs font-bold shrink-0 hover:bg-[oklch(60%_0.08_240)] transition-all">
            {isEn ? "Get the extension" : "Scarica l'estensione"}
          </Link>
        </section>
      </div>
    </main>
  );
}
