"use client";

import { useState } from "react";
import { LoaderCircle, Download, TriangleAlert, CircleCheck } from "lucide-react";
import { FaYoutube } from "react-icons/fa6";
import {
  buildExportFilename,
  loadExportSettingsWeb,
} from "@/lib/export-settings";

interface YTResult {
  kind: string;
  title: string;
  videoCount: number;
  markdown: string;
  filename: string;
}

export default function YouTubeConverter() {
  const [url, setUrl] = useState("");
  const [maxVideos, setMaxVideos] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<YTResult | null>(null);

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/youtube-to-markdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), maxVideos }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Conversione fallita");
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result?.markdown) return;
    const settings = loadExportSettingsWeb();
    const filename = buildExportFilename(
      result.filename.replace(/\.md$/i, ""),
      settings
    );
    const blob = new Blob([result.markdown], { type: "text/markdown;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  };

  return (
    <div className="bg-[oklch(13%_.006_260)] border border-[oklch(72%_.06_240)]/15 p-5">
      <h3 className="text-xs font-semibold text-slate-350 mb-1 flex items-center gap-2">
        <FaYoutube size={13} className="text-[oklch(72%_.06_240)]" />
        YouTube → Markdown
      </h3>
      <p className="text-[11px] text-[oklch(60%_0.01_260)] mb-3 leading-relaxed">
        Incolla un video, una playlist o un canale YouTube: verrà convertito in un
        unico file Markdown (trascrizioni incluse).
      </p>

      <form onSubmit={handleConvert} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=… / playlist?list=… / @canale"
            className="flex-1 bg-[oklch(13%_0.006_260)] border border-[oklch(72%_.06_240)]/20 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[oklch(72%_.06_240)] transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 bg-[oklch(13%_.006_260)] text-[oklch(72%_.06_240)] border border-[oklch(72%_.06_240)]/30 text-xs font-bold hover:bg-[oklch(72%_.06_240)] hover:text-black transition-all disabled:opacity-50 flex items-center gap-1.5 min-w-[110px] justify-center"
          >
            {loading ? <LoaderCircle size={13} className="animate-spin" /> : "Converti"}
          </button>
        </div>

        <label className="flex items-center gap-2 text-[11px] text-[oklch(60%_0.01_260)]">
          Max video
          <input
            type="number"
            min={1}
            max={100}
            value={maxVideos}
            onChange={(e) => setMaxVideos(Number(e.target.value) || 20)}
            className="w-16 bg-[oklch(13%_0.006_260)] border border-[oklch(72%_.06_240)]/20 px-2 py-1 text-xs text-white focus:outline-none"
          />
          <span>(solo playlist/canali, max 100)</span>
        </label>
      </form>

      {error && (
        <p className="text-[11px] text-red-400 mt-3 flex items-center gap-1.5">
          <TriangleAlert size={12} /> {error}
        </p>
      )}

      {result && (
        <div className="mt-3 p-3 bg-[oklch(13%_0.006_260)]/60 border border-[oklch(72%_.06_240)]/20">
          <p className="text-[11px] text-emerald-300 flex items-center gap-1.5 font-semibold">
            <CircleCheck size={12} />
            {result.kind === "video" && "Video convertito"}
            {result.kind === "playlist" && `Playlist convertita · ${result.videoCount} video`}
            {result.kind === "channel" && `Canale convertito · ${result.videoCount} video`}
          </p>
          <p className="text-[11px] text-white mt-1 truncate">{result.title}</p>
          <button
            onClick={handleDownload}
            className="mt-2 px-3 py-2 bg-[oklch(72%_.06_240)]/90 text-black text-[11px] font-bold flex items-center gap-1.5 hover:bg-[oklch(72%_.06_240)] transition-colors"
          >
            <Download size={12} /> Scarica .md (usa percorso dalle Impostazioni)
          </button>
        </div>
      )}
    </div>
  );
}
