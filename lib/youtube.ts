import { extractUrl } from "@/lib/extract";

export type YouTubeKind = "video" | "playlist" | "channel";

const FETCH_TIMEOUT_MS = 10000;

async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept-Language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

function uniqueVideoIds(html: string, max: number): string[] {
  const ids: string[] = [];
  const seen = new Set<string>();
  // Copre /watch?v=ID, youtu.be/ID, "videoId":"ID" (ytInitialData)
  const re = /(?:watch\?v=|youtu\.be\/|"videoId":"|v=)([a-zA-Z0-9_-]{11})/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null && ids.length < max) {
    const id = m[1];
    if (!seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }
  return ids;
}

function extractPlaylistId(url: string): string | null {
  try {
    const u = new URL(url, "https://www.youtube.com");
    const list = u.searchParams.get("list");
    if (list) return list;
  } catch { /* ignore */ }
  const m = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

export function detectYouTubeKind(url: string): YouTubeKind {
  const listId = extractPlaylistId(url);
  if (listId) return "playlist";
  if (
    /youtube\.com\/(@|channel\/|c\/|user\/)|youtu\.be/i.test(url) === false &&
    /youtube\.com/i.test(url) &&
    !/youtube\.com\/watch|youtube\.com\/shorts\/|youtube\.com\/embed\//i.test(url)
  ) {
    return "channel";
  }
  if (/youtube\.com\/(@|channel\/|c\/|user\/)/i.test(url)) return "channel";
  return "video";
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "youtube-export"
  );
}

/** Raccoglie gli ID video per playlist o canale (scraping HTML, senza API key). */
export async function collectYouTubeVideoIds(
  url: string,
  kind: YouTubeKind,
  maxVideos = 50
): Promise<{ ids: string[]; title: string }> {
  const max = Math.min(Math.max(maxVideos, 1), 100);

  if (kind === "video") {
    // Singolo video: nessun listing necessario, l'ID viene risolto dal chiamante
    return { ids: [], title: "" };
  }

  const candidates: string[] = [];
  if (kind === "playlist") {
    const listId = extractPlaylistId(url);
    if (!listId) throw new Error("ID playlist non trovato nell'URL");
    candidates.push(`https://www.youtube.com/playlist?list=${listId}`);
  } else {
    // channel: prova /videos + pagina base (handle, /channel/, /c/, /user/)
    const base = url.split("?")[0].replace(/\/$/, "");
    candidates.push(`${base}/videos`);
    candidates.push(base);
  }

  let bestIds: string[] = [];
  let pageTitle = kind === "playlist" ? "Playlist YouTube" : "Canale YouTube";

  for (const pageUrl of candidates) {
    try {
      const html = await fetchHtml(pageUrl);
      const ids = uniqueVideoIds(html, max);
      const titleMatch =
        html.match(/<meta name="title" content="([^"]+)"/) ||
        html.match(/<title>([^<]+)<\/title>/);
      if (titleMatch?.[1]) {
        pageTitle = titleMatch[1].replace(/ - YouTube$/, "").trim() || pageTitle;
      }
      if (ids.length > bestIds.length) bestIds = ids;
      if (bestIds.length >= Math.min(max, 10)) break;
    } catch {
      continue;
    }
  }

  if (bestIds.length === 0) {
    throw new Error(
      kind === "playlist"
        ? "Nessun video trovato nella playlist (potrebbe essere privata o vuota)."
        : "Nessun video trovato nel canale (potrebbe essere privato o protetto)."
    );
  }
  return { ids: bestIds.slice(0, max), title: pageTitle };
}

export interface YouTubeExportResult {
  kind: YouTubeKind;
  title: string;
  videoCount: number;
  videos: { id: string; title: string; url: string; ok: boolean }[];
  markdown: string;
  filename: string;
}

function sanitizeFilename(s: string): string {
  return s.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim().substring(0, 60) || "youtube";
}

/**
 * Converte un video, playlist o canale YouTube in un unico file Markdown.
 * Per ogni video riusa `extractUrl` (trascrizione + metadati oEmbed).
 */
export async function convertYouTubeToMarkdown(
  url: string,
  maxVideos = 30
): Promise<YouTubeExportResult> {
  const kind = detectYouTubeKind(url);
  const date = new Date().toLocaleDateString("it-IT");

  if (kind === "video") {
    const single = await extractUrl(url);
    const markdown =
      `---\ntitle: "${single.title.replace(/"/g, "'")}"\n` +
      `source: youtube_video\nurl: "${single.url}"\ndate: "${date}"\n---\n\n${single.content}\n`;
    return {
      kind,
      title: single.title,
      videoCount: 1,
      videos: [{ id: "", title: single.title, url: single.url, ok: true }],
      markdown,
      filename: `${sanitizeFilename(single.title)}.md`,
    };
  }

  const { ids, title } = await collectYouTubeVideoIds(url, kind, maxVideos);
  const slug = slugify(title);

  let markdown = `---\ntitle: "${title.replace(/"/g, "'")}"\n`;
  markdown += `source: youtube_${kind}\nurl: "${url}"\ndate: "${date}"\nvideo_count: ${ids.length}\n---\n\n`;
  markdown += `# ${title}\n\n`;
  markdown += `> Origine: ${kind === "playlist" ? "Playlist" : "Canale"} YouTube · ${ids.length} video · Esportato il ${date}\n`;
  markdown += `> URL: ${url}\n\n`;
  markdown += `## Indice\n\n`;
  ids.forEach((id, i) => {
    markdown += `${i + 1}. [Video ${id}](https://www.youtube.com/watch?v=${id})\n`;
  });
  markdown += `\n---\n\n`;

  const videos: YouTubeExportResult["videos"] = [];
  let n = 0;
  for (const id of ids) {
    n += 1;
    const videoUrl = `https://www.youtube.com/watch?v=${id}`;
    try {
      const ex = await extractUrl(videoUrl);
      videos.push({ id, title: ex.title, url: videoUrl, ok: true });
      markdown += `\n\n---\n\n## ${n}. ${ex.title}\n\n**URL:** ${videoUrl}\n\n${ex.content}\n`;
    } catch {
      videos.push({ id, title: `Video ${id}`, url: videoUrl, ok: false });
      markdown += `\n\n---\n\n## ${n}. Video ${id}\n\n**URL:** ${videoUrl}\n\n> ⚠️ Trascrizione non disponibile per questo video.\n`;
    }
  }

  return {
    kind,
    title,
    videoCount: ids.length,
    videos,
    markdown,
    filename: `${slug}-${kind}-${ids.length}video.md`,
  };
}
