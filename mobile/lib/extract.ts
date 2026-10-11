import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

// Identità browser realistica per evitare 403 dai siti con anti-bot.
// Mozilla/5.0 + Accept-Language it-it riduce i falsi positivi contro i CDN
// (Cloudflare/Akamai) che bloccano l'User-Agent di default di fetch su Node 18+.
const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept":
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  "Pragma": "no-cache",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Upgrade-Insecure-Requests": "1",
};

// Reddit richiede uno User-Agent nel formato <platform>:<app-id>:<version>.
const REDDIT_USER_AGENT = "web:Reskill:v1.0.0 (by /u/Reskill_app)";

// Timeout per singola richiesta di rete: Vercel free = 10s, pro = 60s.
const FETCH_TIMEOUT_MS = 8000;

// Retry su 429/5xx con backoff esponenziale (max 2 retry: 0s, 1s, 2s).
async function fetchWithRetry(
  url: string,
  init: RequestInit & { userAgent?: string } = {},
  retries = 2
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.userAgent) {
    headers.set("User-Agent", init.userAgent);
  } else {
    headers.set("User-Agent", BROWSER_HEADERS["User-Agent"]);
    headers.set("Accept", BROWSER_HEADERS["Accept"]);
    headers.set("Accept-Language", BROWSER_HEADERS["Accept-Language"]);
  }

  let lastErr: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, { ...init, headers, signal: controller.signal });
      clearTimeout(timer);

      // Successo o errore "permanente" del client (non ritentare 4xx)
      if (res.ok || (res.status >= 400 && res.status < 500 && res.status !== 429)) {
        return res;
      }

      // 429 o 5xx: ritenta con backoff
      lastErr = new Error(`HTTP ${res.status}`);
      if (attempt < retries) {
        const delay = Math.min(1000 * 2 ** attempt, 3000);
        await new Promise((r) => setTimeout(r, delay));
      }
    } catch (e: unknown) {
      clearTimeout(timer);
      lastErr = e instanceof Error ? e : new Error("fetch failed");
      if (attempt < retries) {
        const delay = Math.min(1000 * 2 ** attempt, 3000);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastErr ?? new Error("fetch failed");
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function extractTweetId(url: string): string | null {
  const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
  return match ? match[1] : null;
}

async function extractYouTube(url: string, domain: string, date: string) {
  let transcriptItems: { text: string; offset: number; duration: number }[] = [];
  let title = "Video YouTube";
  let channelName = "";

  const videoId = extractVideoId(url);
  if (!videoId) throw new Error("ID video YouTube non trovato nell'URL");

  // Fetch transcript
  try {
    const { YoutubeTranscript } = await import('youtube-transcript');
    transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
  } catch {
    // transcript might not be available
  }

  // Try to get video metadata from oEmbed (no API key needed)
  try {
    const oembedRes = await fetchWithRetry(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      {},
      1
    );
    if (oembedRes.ok) {
      const oembed = await oembedRes.json();
      title = oembed.title || title;
      channelName = oembed.author_name || "";
    }
  } catch {
    // fallback
  }

  let content = `# ${title}\n\n`;
  content += `**URL Originale:** ${url}\n`;
  if (channelName) content += `**Canale:** ${channelName}\n`;
  content += `**Data Estrazione:** ${date}\n`;
  content += `**ID Video:** ${videoId}\n\n`;

  if (transcriptItems.length > 0) {
    const durationSec = Math.max(...transcriptItems.map((t) => t.offset + t.duration));
    const minutes = Math.floor(durationSec / 60);
    const secs = Math.floor(durationSec % 60);
    content += `**Durata:** ${minutes}:${secs.toString().padStart(2, "0")}\n`;
    content += `**Segmenti di Trascrizione:** ${transcriptItems.length}\n\n`;

    content += `## Trascrizione Completa\n\n`;
    // Group transcript into segments of ~30s for readability
    let currentSegment = "";
    let segmentStart = 0;
    for (const item of transcriptItems) {
      if (item.offset - segmentStart > 30000 && currentSegment) {
        const startMin = Math.floor(segmentStart / 60000);
        const startSec = Math.floor((segmentStart % 60000) / 1000);
        content += `### ${startMin}:${startSec.toString().padStart(2, "0")}\n${currentSegment.trim()}\n\n`;
        currentSegment = "";
        segmentStart = item.offset;
      }
      currentSegment += item.text + " ";
    }
    if (currentSegment) {
      const startMin = Math.floor(segmentStart / 60000);
      const startSec = Math.floor((segmentStart % 60000) / 1000);
      content += `### ${startMin}:${startSec.toString().padStart(2, "0")}\n${currentSegment.trim()}\n\n`;
    }
  } else {
    content += `> ⚠️ Trascrizione non disponibile per questo video. Il video potrebbe non avere sottotitoli.\n\n`;
    // Try to get description from the page
    try {
        const pageRes = await fetchWithRetry(
          `https://www.youtube.com/watch?v=${videoId}`,
          {},
          1
        );
        const pageHtml = await pageRes.text();
        const descMatch = pageHtml.match(/<meta name="description" content="([^"]+)"/);
        if (descMatch) {
          content += `## Descrizione\n\n${descMatch[1]}\n\n`;
        }
      } catch {
        // ignore
      }
  }

  return { type: "youtube", title, url, domain, date, content };
}

async function extractTwitter(url: string, domain: string, date: string) {
  const tweetId = extractTweetId(url);
  let title = "Post su X / Twitter";
  let content = `# Post da X / Twitter\n\n**URL Originale:** ${url}\n**Data Estrazione:** ${date}\n\n`;

  // Try fxtwitter API (no auth needed)
  if (tweetId) {
    try {
      const apiRes = await fetchWithRetry(
        `https://api.fxtwitter.com/status/${tweetId}`,
        {},
        2
      );
      if (apiRes.ok) {
        const data = await apiRes.json();
        const tweet = data.tweet;
        title = `@${tweet.author.screen_name}: ${tweet.text?.slice(0, 80)}...`;
        content = `# Post di @${tweet.author.screen_name}\n\n`;
        content += `**Autore:** ${tweet.author.name} (@${tweet.author.screen_name})\n`;
        content += `**URL:** ${url}\n`;
        content += `**Data:** ${new Date(tweet.created_at).toLocaleDateString("it-IT")}\n`;
        if (tweet.likes) content += `**Like:** ${tweet.likes}\n`;
        if (tweet.retweets) content += `**Retweet:** ${tweet.retweets}\n`;
        if (tweet.replies) content += `**Risposte:** ${tweet.replies}\n`;
        content += `**Data Estrazione:** ${date}\n\n`;

        content += `## Contenuto del Post\n\n${tweet.text}\n\n`;

        // Include quoted tweet if present
        if (tweet.quote) {
          content += `---\n### Citazione da @${tweet.quote.author?.screen_name || "altro utente"}\n\n${tweet.quote.text}\n\n`;
        }
      } else {
        throw new Error("fxtwitter API error");
      }
    } catch {
      // Fallback: try basic page fetch
      try {
        const pageRes = await fetchWithRetry(url, {}, 1);
        const html = await pageRes.text();
        const dom = new JSDOM(html);
        const doc = dom.window.document;

        // Try Open Graph
        const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute("content");
        const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute("content");
        if (ogTitle) title = ogTitle;
        content = `# ${ogTitle || "Post X/Twitter"}\n\n**URL:** ${url}\n**Data Estrazione:** ${date}\n\n## Contenuto\n\n${ogDesc || "Impossibile estrarre il contenuto del post."}\n\n`;
      } catch {
        content += `> ⚠️ Impossibile estrarre il contenuto di questo post. Prova a incollare il link direttamente.\n\n`;
      }
    }
  } else {
    content += `> ⚠️ URL del post non valido. Formato atteso: twitter.com/username/status/1234567890\n\n`;
  }

  return { type: "twitter", title, url, domain, date, content };
}

async function extractReddit(url: string, domain: string, date: string) {
  const apiUrl = url.replace(/\/?$/, "") + ".json";
  let title = "Post Reddit";
  let content = "";

  const res = await fetchWithRetry(apiUrl, { userAgent: REDDIT_USER_AGENT }, 2);

  if (!res.ok) throw new Error(`Reddit API error: ${res.status}`);

  const data = await res.json();
  const post = data[0]?.data?.children?.[0]?.data;
  const comments = data[1]?.data?.children;

  if (!post) throw new Error("Impossibile trovare il post Reddit");

  title = post.title || "Post Reddit";
  const subreddit = post.subreddit || "sconosciuto";
  const author = post.author || "unknown";
  const ups = post.ups || 0;
  const numComments = post.num_comments || 0;
  const postDate = new Date(post.created_utc * 1000).toLocaleDateString("it-IT");

  content = `# ${title}\n\n`;
  content += `**Subreddit:** r/${subreddit}\n`;
  content += `**Autore:** u/${author}\n`;
  content += `**Data:** ${postDate}\n`;
  content += `**Voti:** ${ups} | **Commenti:** ${numComments}\n`;
  content += `**URL:** ${url}\n`;
  content += `**Data Estrazione:** ${date}\n\n`;

  // Post content (selftext or link)
  if (post.selftext) {
    content += `## Post\n\n${post.selftext}\n\n`;
  } else if (post.url && post.url !== url) {
    content += `**Link:** ${post.url}\n\n`;
  }

  if (post.is_video && post.media) {
    content += `> 🎬 Questo post contiene un video.\n\n`;
  }

  // Comments
  if (comments && comments.length > 0) {
    content += `## Commenti\n\n`;
    let commentCount = 0;
    for (const child of comments) {
      if (commentCount >= 10) break; // max 10 top-level comments
      const comment = child?.data;
      if (!comment || comment.body === "[removed]" || comment.body === "[deleted]") continue;

      const commentAuthor = comment.author || "unknown";
      const commentUps = comment.ups || 0;
      const commentDate = new Date(comment.created_utc * 1000).toLocaleDateString("it-IT");
      const commentBody = comment.body || "";

      content += `### u/${commentAuthor} (${commentUps} voti, ${commentDate})\n\n${commentBody}\n\n`;
      commentCount++;
    }
  }

  return { type: "reddit", title, url, domain, date, content };
}

async function extractPdf(url: string, domain: string, date: string) {
  // I PDF spesso richiedono tempo: timeout più largo del default
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  const res = await fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
  if (!res.ok) throw new Error(`Impossibile scaricare il PDF: ${res.status}`);

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  let title = "Documento PDF";

  // Try to get title from URL
  const urlFilename = url.split("/").pop()?.split("?")[0] || "";
  if (urlFilename) {
    title = urlFilename.replace(/\.pdf$/i, "").replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // Parse PDF
  const pdfModule = await import('pdf-parse');
  const pdfParser = new pdfModule.PDFParse({ data: buffer });
  const data = await pdfParser.getText();

  const content = `# ${title}\n\n**URL Originale:** ${url}\n**Pagine:** ${data.total || "?"}\n**Data Estrazione:** ${date}\n\n## Contenuto Estratto\n\n${data.text}\n\n`;

  return { type: "pdf", title, url, domain, date, content };
}

async function extractWebpage(url: string, domain: string, date: string) {
  const res = await fetchWithRetry(url, {}, 2);

  if (!res.ok) throw new Error(`HTTP ${res.status}: impossibile recuperare la pagina`);

  const html = await res.text();
  const dom = new JSDOM(html, { url });
  const doc = dom.window.document;

  // Remove unwanted elements
  for (const sel of ["script", "style", "nav", "footer", "header", "aside", "noscript", "iframe", "svg", "form"]) {
    doc.querySelectorAll(sel).forEach((el: Element) => el.remove());
  }

  // Extract with Readability
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  let title = article?.title || doc.title || `Articolo da ${domain}`;
  let content = "";

  if (article?.content) {
    // Convert HTML to Markdown
    const markdown = turndownService.turndown(article.content);
    const excerpt = article.excerpt || "";
    const byline = article.byline || "";

    content = `# ${title}\n\n`;
    content += `**Sito:** ${domain}\n`;
    content += `**URL Originale:** ${url}\n`;
    if (byline) content += `**Autore:** ${byline}\n`;
    content += `**Data Estrazione:** ${date}\n\n`;

    if (excerpt) {
      content += `> ${excerpt}\n\n`;
    }

    content += `## Contenuto Principale\n\n${markdown}\n\n`;
  } else {
    // Fallback: try Open Graph / meta tags
    const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute("content");
    const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute("content");
    const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute("content");

    title = ogTitle || title;

    content = `# ${title}\n\n`;
    content += `**Sito:** ${domain}\n`;
    content += `**URL Originale:** ${url}\n`;
    content += `**Data Estrazione:** ${date}\n\n`;

    if (ogDesc) {
      content += `## Descrizione\n\n${ogDesc}\n\n`;
    }

    // Get all paragraph text as last resort
    const paragraphs: string[] = [];
    doc.querySelectorAll("p").forEach((p: Element) => {
      const text = p.textContent?.trim();
      if (text && text.length > 20) paragraphs.push(text);
    });

    if (paragraphs.length > 0) {
      content += `## Contenuto\n\n${paragraphs.join("\n\n")}\n\n`;
    }

    if (ogImage) {
      content += `![Immagine](${ogImage})\n\n`;
    }
  }

  return { type: "webpage", title, url, domain, date, content };
}

export interface ExtractedContent {
  type: string;
  title: string;
  url: string;
  domain: string;
  date: string;
  content: string;
}

/**
 * Determines the source type from the URL and extracts its content.
 * Supports YouTube, X/Twitter, Reddit, PDF and generic web pages.
 */
export async function extractUrl(url: string): Promise<ExtractedContent> {
  const parsedUrl = new URL(url);
  const domain = parsedUrl.hostname.replace("www.", "");
  const date = new Date().toLocaleDateString("it-IT");

  let type = "webpage";
  if (domain.includes("youtube.com") || domain.includes("youtu.be")) type = "youtube";
  else if (domain.includes("twitter.com") || domain.includes("x.com")) type = "twitter";
  else if (domain.includes("reddit.com")) type = "reddit";
  else if (url.toLowerCase().endsWith(".pdf")) type = "pdf";

  switch (type) {
    case "youtube":
      return extractYouTube(url, domain, date);
    case "twitter":
      return extractTwitter(url, domain, date);
    case "reddit":
      return extractReddit(url, domain, date);
    case "pdf":
      return extractPdf(url, domain, date);
    default:
      return extractWebpage(url, domain, date);
  }
}