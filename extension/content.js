// Reskill Content Script - Multi-User Cloud Clipper with Visual Element Picker

async function getServerUrl() {
  const result = await chrome.storage.local.get(["sg_server_url"]);
  return result.sg_server_url || "http://localhost:3000";
}

async function getAuthHeaders() {
  const result = await chrome.storage.local.get(["sg_token"]);
  const headers = { "Content-Type": "application/json" };
  if (result.sg_token) {
    headers["x-extension-token"] = result.sg_token;
  }
  return headers;
}

let activePicker = false;
let hoveredElement = null;
let selectedContentMarkdown = "";
let fetchedBuckets = [];

// Main listener for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "convertToMarkdown" || request.action === "createSkill") {
    try {
      showClipperHub();
      sendResponse({ success: true });
    } catch (error) {
      console.error("Reskill Clipper error:", error);
      sendResponse({ success: false, error: error.message });
    }
  } else if (request.action === "extractYoutubeTranscript") {
    handleYoutubeTranscript().then(() => sendResponse({ success: true })).catch((err) => {
      console.error("YouTube transcript error:", err);
      sendResponse({ success: false, error: err.message });
    });
    return true;
  } else if (request.action === "grabElements") {
    // Apre il clipper hub con il picker già avviato
    try {
      showClipperHub().then(() => {
        startElementPicker();
        const status = document.getElementById("sg-status");
        if (status) status.textContent = "Muovi il mouse e clicca sull'elemento da catturare...";
      });
      sendResponse({ success: true });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  } else if (request.action === "sg_get_video_title") {
    // Risponde con il titolo del video YouTube corrente
    const title = getYoutubeVideoTitle();
    sendResponse({ title });
  } else if (request.action === "sg_get_playlist_count") {
    // Risponde con il numero di video nella playlist YouTube
    const count = getPlaylistVideoCount();
    sendResponse({ count });
  } else if (request.action === "extractYoutubePlaylist") {
    handleYoutubePlaylist().then(() => sendResponse({ success: true })).catch((err) => {
      console.error("YouTube playlist error:", err);
      sendResponse({ success: false, error: err.message });
    });
    return true;
  }
  return true;
});

// ─── Notifica automatica titolo su YouTube ────────────────────────────────────
function getYoutubeVideoTitle() {
  // Prova varie fonti: heading principale, meta og, document.title
  const h1 = document.querySelector("h1.ytd-video-primary-info-renderer, h1.style-scope.ytd-watch-metadata");
  if (h1 && h1.textContent.trim()) return h1.textContent.trim();

  const metaOg = document.querySelector('meta[property="og:title"]');
  if (metaOg) return metaOg.getAttribute("content") || "";

  // Rimuovi " - YouTube" dal titolo del documento
  return document.title.replace(/ - YouTube$/, "").trim();
}

/**
 * Estrae il numero di video in una playlist YouTube dal DOM.
 * Cerca l'elemento che mostra "N video" nel titolo della playlist.
 */
function getPlaylistVideoCount() {
  const statsEl = document.querySelector("#stats yt-formatted-string, ytd-playlist-header-renderer #stats span");
  if (statsEl) {
    const text = statsEl.textContent || "";
    const match = text.match(/(\d+)\s*(video|Video)/);
    if (match) return parseInt(match[1], 10);
  }
  // Fallback: conta gli elementi playlist
  const items = document.querySelectorAll("ytd-playlist-video-renderer, ytd-video-renderer");
  if (items.length > 0) return items.length;
  return 0;
}

// Su YouTube, notifica subito il background del titolo e ri-notifica ai cambi SPA
if (/youtube\.com\/(watch|playlist)/.test(window.location.href)) {
  function notifyVideoContext() {
    try {
      if (/youtube\.com\/playlist/.test(window.location.href)) {
        const count = getPlaylistVideoCount();
        chrome.runtime.sendMessage({ action: "sg_playlist_count_update", count }, () => {
          chrome.runtime.lastError;
        });
      } else {
        const title = getYoutubeVideoTitle();
        chrome.runtime.sendMessage({ action: "sg_video_title_update", title }, () => {
          chrome.runtime.lastError;
        });
      }
    } catch {
      // Extension context invalidated (extension reloaded/updated)
    }
  }

  // Notifica al primo caricamento
  notifyVideoContext();

  // Rileva navigazione SPA di YouTube (cambia URL senza reload)
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      if (/youtube\.com\/(watch|playlist)/.test(location.href)) {
        // Attende un attimo che il titolo/conteggio venga aggiornato dal DOM
        setTimeout(notifyVideoContext, 1500);
      }
    }
  }).observe(document, { subtree: true, childList: true });
}

// Create and show the premium clipper floating interface
async function showClipperHub() {
  // Remove existing hub if any
  const existing = document.getElementById("reskill-clipper-hub");
  if (existing) existing.remove();

  const hub = document.createElement("div");
  hub.id = "reskill-clipper-hub";

  // Clean, matte dark theme aligned with web app
  hub.style.position = "fixed";
  hub.style.bottom = "24px";
  hub.style.right = "24px";
  hub.style.width = "320px";
  hub.style.backgroundColor = SG_THEME.dark;
  hub.style.border = `1px solid ${SG_THEME.cyanBorder(0.35)}`;
  hub.style.borderRadius = "16px";
  hub.style.boxShadow = `0 10px 25px -5px ${SG_THEME.dark}`;
  hub.style.padding = "16px";
  hub.style.color = SG_THEME.white;
  hub.style.fontFamily = "'JetBrains Mono', ui-monospace, monospace";
  hub.style.fontSize = "12px";
  hub.style.zIndex = "2147483647";
  hub.style.lineHeight = "1.5";

  // HTML Content
  hub.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid oklch(72% 0.06 240); padding-bottom:8px; margin-bottom:12px;">
      <div style="font-weight:bold; color:oklch(98.5% 0.002 260); display:flex; align-items:center; gap:6px;">
        <img src="${chrome.runtime.getURL('reskill.png')}" style="width:18px;height:18px;border-radius:4px;">
        Reskill Clipper
      </div>
      <button id="sg-close-btn" style="background:none; border:none; color:oklch(72% 0.06 240); font-weight:bold; cursor:pointer; font-size:14px; margin-left:auto;">x</button>
    </div>

    <div style="margin-bottom:12px;">
      <span style="font-size:10px; color:oklch(72% 0.06 240); font-weight:bold; text-transform:uppercase; display:block; margin-bottom:4px;">Seleziona Area</span>
      <div style="display:flex; gap:8px;">
        <button id="sg-picker-btn" style="flex:1; padding:6px 10px; background-color:oklch(13% 0.006 260); border:1px solid oklch(72% 0.06 240); color:oklch(72% 0.06 240); border-radius:8px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:4px; font-size:11px;">
          [Seleziona Elemento]
        </button>
        <button id="sg-full-btn" style="flex:1; padding:6px 10px; background-color:oklch(13% 0.006 260); border:1px solid oklch(72% 0.06 240); color:oklch(98.5% 0.002 260); border-radius:8px; font-weight:bold; cursor:pointer; font-size:11px;">
          [Tutta la Pagina]
        </button>
      </div>
    </div>

    <div style="margin-bottom:16px;">
      <label for="sg-bucket-select" style="font-size:10px; color:oklch(72% 0.06 240); font-weight:bold; text-transform:uppercase; display:block; margin-bottom:4px;">Salva in Bucket</label>
      <select id="sg-bucket-select" style="width:100%; padding:8px; background-color:oklch(13% 0.006 260); border:1px solid oklch(72% 0.06 240); color:oklch(98.5% 0.002 260); border-radius:8px; font-size:11px; outline:none;">
        <option value="">Caricamento bucket...</option>
      </select>
    </div>

    <div style="display:flex; flex-direction:column; gap:8px;">
      <button id="sg-save-cloud" style="width:100%; padding:10px; background-color:oklch(13% 0.006 260); border:1px solid oklch(72% 0.06 240); color:oklch(72% 0.06 240); font-weight:bold; border-radius:10px; cursor:pointer; font-size:11px;">
        > Invia a Reskill Cloud
      </button>
      <button id="sg-download-md" style="width:100%; padding:8px; background-color:transparent; border:1px solid oklch(72% 0.06 240); color:oklch(98.5% 0.002 260); font-weight:semibold; border-radius:10px; cursor:pointer; font-size:10px;">
        v Scarica come file .md locale
      </button>
    </div>
    <div id="sg-status" style="margin-top:10px; text-align:center; font-size:10px; color:oklch(72% 0.06 240);"></div>
  `;

  document.body.appendChild(hub);

  // Load user's buckets from active server session
  try {
    // Leggi anche il bucket pre-selezionato nel sidepanel/popup
    const storageResult = await chrome.storage.local.get(["sg_last_bucket_id"]);
    const lastBucketId = storageResult.sg_last_bucket_id || "";

    const res = await fetch(`${await getServerUrl()}/api/buckets`, { headers: await getAuthHeaders() });
    const buckets = await res.json();
    const select = document.getElementById("sg-bucket-select");
    if (select) {
      select.innerHTML = "";
      if (Array.isArray(buckets) && buckets.length > 0) {
        fetchedBuckets = buckets;
        buckets.forEach((b) => {
          const opt = document.createElement("option");
          opt.value = b.id;
          opt.textContent = `${b.name} (${b.sources.length} fonti)`;
          if (b.id === lastBucketId) opt.selected = true;
          select.appendChild(opt);
        });
      } else {
        select.innerHTML = `<option value="">Nessun bucket trovato. Crea uno prima!</option>`;
      }
    }
  } catch (e) {
    const select = document.getElementById("sg-bucket-select");
    if (select) {
      select.innerHTML = `<option value="">Errore: accedi prima a Reskill</option>`;
    }
  }

  // Pre-scaffold full page markdown by default
  selectedContentMarkdown = convertPageToMarkdown();

  // Setup Event Listeners
  document.getElementById("sg-close-btn")?.addEventListener("click", () => hub.remove());

  document.getElementById("sg-picker-btn")?.addEventListener("click", () => {
    startElementPicker();
    const status = document.getElementById("sg-status");
    if (status) status.textContent = "Muovi il mouse e clicca sull'elemento da clippare...";
  });

  document.getElementById("sg-full-btn")?.addEventListener("click", () => {
    selectedContentMarkdown = convertPageToMarkdown();
    const status = document.getElementById("sg-status");
    if (status) status.textContent = "Selezionato l'intero corpo della pagina.";
  });

  document.getElementById("sg-download-md")?.addEventListener("click", () => {
    downloadMarkdown(selectedContentMarkdown);
  });

  document.getElementById("sg-save-cloud")?.addEventListener("click", async () => {
    const bucketSelect = document.getElementById("sg-bucket-select");
    const bucketId = bucketSelect?.value;
    const status = document.getElementById("sg-status");

    if (!bucketId) {
      if (status) status.textContent = "Seleziona un bucket prima di salvare.";
      return;
    }

    // Salva l'ultimo bucket usato per pre-selezionarlo la prossima volta
    await chrome.storage.local.set({ sg_last_bucket_id: bucketId });

    if (status) status.textContent = "Salvataggio nel Cloud...";

    try {
      const domain = window.location.hostname.replace("www.", "");

      const payload = {
        type: domain.includes("youtube.com") ? "youtube" : domain.includes("reddit.com") ? "reddit" : "webpage",
        title: document.title || "Pagina Esterna",
        url: window.location.href,
        domain: domain,
        date: new Date().toISOString().split("T")[0],
        content: document.body.innerText.slice(0, 4000),
        skillMarkdown: selectedContentMarkdown
      };

      const headers = await getAuthHeaders();
      const res = await fetch(`${await getServerUrl()}/api/buckets/${bucketId}/sources`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && !data.error) {
        if (status) status.innerHTML = "<span style='color:oklch(72% 0.06 240); font-weight:bold;'>✓ Salvato nel Cloud!</span>";
        setTimeout(() => hub.remove(), 2000);
      } else if (res.status === 401 || res.status === 403) {
        if (status) status.textContent = "Sessione scaduta: riapri il pannello e riaccedi.";
      } else {
        throw new Error(data.error || "Salvataggio fallito");
      }
    } catch (err) {
      if (status) status.textContent = `Errore: ${err.message || "Accedi prima a Reskill"}`;
    }
  });
}

// Visual Element Picker Implementation
function startElementPicker() {
  if (activePicker) return;
  activePicker = true;

  document.addEventListener("mouseover", handlePickerMouseOver, true);
  document.addEventListener("mouseout", handlePickerMouseOut, true);
  document.addEventListener("click", handlePickerClick, true);
}

function stopElementPicker() {
  activePicker = false;
  if (hoveredElement) {
    hoveredElement.style.outline = "";
    hoveredElement = null;
  }
  document.removeEventListener("mouseover", handlePickerMouseOver, true);
  document.removeEventListener("mouseout", handlePickerMouseOut, true);
  document.removeEventListener("click", handlePickerClick, true);
}

function handlePickerMouseOver(e) {
  e.stopPropagation();
  const el = e.target;

  if (el.closest("#reskill-clipper-hub")) return;

  if (hoveredElement) {
    hoveredElement.style.outline = "";
  }
  hoveredElement = el;
  el.style.outline = "2px solid oklch(72% 0.06 240)";
}

function handlePickerMouseOut(e) {
  e.stopPropagation();
  const el = e.target;
  el.style.outline = "";
}

function handlePickerClick(e) {
  e.preventDefault();
  e.stopPropagation();

  const el = e.target;
  if (el.closest("#reskill-clipper-hub")) return;

  let markdown = traverse(el);
  selectedContentMarkdown = cleanUpMarkdown(markdown);

  const status = document.getElementById("sg-status");
  if (status) status.textContent = `Catturato l'elemento <${el.tagName.toLowerCase()}> con successo.`;

  stopElementPicker();
}

function convertPageToMarkdown() {
  const clone = document.cloneNode(true);

  const selectorsToRemove = [
    'script', 'style', 'noscript', 'iframe', 'frame',
    'nav', 'header', 'footer', 'aside', 'sidebar', 'advertisement',
    '.ad', '.ads', '.advert', '.banner', '.popup', '.modal',
    '.cookie', '.consent', '.newsletter', '.social-share',
    'button', 'input', 'textarea', 'select', 'form',
    'svg', 'canvas', 'video', 'audio', 'iframe',
    '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]',
    '.menu', '.navbar', '.footer', '.header', '.sidebar',
    '#comments', '.comments', '.comment-section',
    '.related-posts', '.recommended', '.share-buttons'
  ];

  selectorsToRemove.forEach(selector => {
    clone.querySelectorAll(selector).forEach(el => el.remove());
  });

  const mainContent = clone.querySelector('main') ||
                      clone.querySelector('article') ||
                      clone.querySelector('[role="main"]') ||
                      clone.querySelector('.content') ||
                      clone.querySelector('#content') ||
                      clone.body;

  if (!mainContent) {
    throw new Error("No content found on page");
  }

  return cleanUpMarkdown(traverse(mainContent));
}

function traverse(node, markdown) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim();
    if (text) return text;
    return '';
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const element = node;
  const tag = element.tagName.toLowerCase();
  const children = Array.from(element.childNodes);

  let content = '';
  children.forEach(child => {
    content += traverse(child, markdown);
  });

  if (!content.trim() && !['img', 'br', 'hr'].includes(tag)) {
    return '';
  }

  let result = content;

  switch (tag) {
    case 'h1':
      result = `\n# ${content}\n`;
      break;
    case 'h2':
      result = `\n## ${content}\n`;
      break;
    case 'h3':
      result = `\n### ${content}\n`;
      break;
    case 'h4':
      result = `\n#### ${content}\n`;
      break;
    case 'h5':
      result = `\n##### ${content}\n`;
      break;
    case 'h6':
      result = `\n###### ${content}\n`;
      break;
    case 'p':
      result = `\n${content}\n`;
      break;
    case 'br':
      result = '\n';
      break;
    case 'hr':
      result = '\n---\n';
      break;
    case 'strong':
    case 'b':
      result = `**${content}**`;
      break;
    case 'em':
    case 'i':
      result = `*${content}*`;
      break;
    case 'code':
      result = `\`${content}\``;
      break;
    case 'pre':
      result = `\n\`\`\`\n${content}\n\`\`\`\n`;
      break;
    case 'a':
      const href = element.getAttribute('href');
      if (href && !href.startsWith('#') && isValidUrl(href)) {
        result = `[${content}](${href})`;
      } else {
        result = content;
      }
      break;
    case 'ul':
    case 'ol':
      result = `\n${content}\n`;
      break;
    case 'li':
      const parent = element.parentElement;
      const isOrdered = parent?.tagName.toLowerCase() === 'ol';
      const index = Array.from(parent?.children || []).indexOf(element) + 1;
      const prefix = isOrdered ? `${index}.` : '-';
      result = `\n${prefix} ${content}`;
      break;
    case 'blockquote':
      result = `\n> ${content.replace(/\n/g, '\n> ')}\n`;
      break;
    case 'img':
      const src = element.getAttribute('src');
      const alt = element.getAttribute('alt') || '';
      if (src && isValidUrl(src)) {
        result = `\n![${alt}](${src})\n`;
      } else {
        result = alt ? `![${alt}]` : '';
      }
      break;
    case 'table':
      result = convertTable(element);
      break;
    default:
      result = content;
  }

  return result;
}

function convertTable(table) {
  const rows = Array.from(table.querySelectorAll('tr'));
  if (rows.length === 0) return '';

  let markdown = '\n';
  let headerProcessed = false;

  rows.forEach((row) => {
    const cells = Array.from(row.querySelectorAll('th, td'));
    const cellTexts = cells.map(cell => cell.textContent?.trim().replace(/\s+/g, ' ') || '');

    if (cellTexts.length === 0) return;

    markdown += '| ' + cellTexts.join(' | ') + ' |\n';

    if (!headerProcessed && row.querySelector('th')) {
      const separators = cells.map(() => '---').join(' | ');
      markdown += '| ' + separators + ' |\n';
      headerProcessed = true;
    }
  });

  return markdown + '\n';
}

function isValidUrl(url) {
  if (!url) return false;
  const dangerous = ['javascript:', 'data:', 'vbscript:', 'file:'];
  return !dangerous.some(prefix => url.toLowerCase().startsWith(prefix));
}

function cleanUpMarkdown(text) {
  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim();
}

async function handleYoutubeTranscript() {
  const videoId = extractYoutubeId();
  if (!videoId) {
    showStatusMessage("Video YouTube non trovato.");
    return;
  }

  showStatusMessage("Scaricamento trascrizione...");

  const url = window.location.href;

  try {
    const res = await fetch(`${await getServerUrl()}/api/extract`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify({ url: window.location.href })
    });

    if (!res.ok) throw new Error("Errore API");

    const data = await res.json();

    const title = data.title || document.title || "Trascrizione YouTube";
    const safeTitle = title.replace(/[^a-z0-9]/gi, "_").substring(0, 50);

    const markdown = `---
title: "${title}"
source: youtube
url: "${url}"
extracted: "${new Date().toISOString()}"
---

# ${title}

${data.content || data.text || ""}
`;

    downloadMarkdown(markdown);
  } catch {
    showStatusMessage("Impossibile scaricare la trascrizione.");
  }
}

async function handleYoutubePlaylist() {
  const playlistId = extractYoutubePlaylistId();
  if (!playlistId) {
    showStatusMessage("Playlist YouTube non trovata.");
    return;
  }

  showStatusMessage(`Estrazione trascrizioni da ${getPlaylistVideoCount()} video...`);

  try {
    const res = await fetch(`${await getServerUrl()}/api/extract`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify({ url: window.location.href })
    });

    if (!res.ok) throw new Error("Errore API");

    const data = await res.json();

    const title = data.title || document.title || "Playlist YouTube";
    const safeTitle = title.replace(/[^a-z0-9]/gi, "_").substring(0, 50);

    const markdown = `---
title: "${title}"
source: youtube_playlist
url: "${window.location.href}"
extracted: "${new Date().toISOString()}"
videos: ${getPlaylistVideoCount()}
---

# ${title}

${data.content || data.text || ""}
`;

    downloadMarkdown(markdown);
    showStatusMessage("Playlist estratta con successo!");
  } catch {
    showStatusMessage("Impossibile estrarre la playlist.");
  }
}

function extractYoutubePlaylistId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("list");
}

function extractYoutubeId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("v");
}

function showStatusMessage(msg) {
  const existing = document.getElementById("reskill-status-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "reskill-status-toast";
  toast.textContent = msg;
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.right = "20px";
  toast.style.padding = "10px 16px";
  toast.style.background = SG_THEME.dark;
  toast.style.border = `1px solid ${SG_THEME.cyanBorder(0.3)}`;
  toast.style.borderRadius = "10px";
  toast.style.color = SG_THEME.white;
  toast.style.fontSize = "12px";
  toast.style.fontFamily = "'JetBrains Mono', ui-monospace, monospace";
  toast.style.zIndex = "2147483647";
  toast.style.boxShadow = `0 4px 12px ${SG_THEME.dark}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function downloadMarkdown(markdown) {
  const pageTitle = document.title.trim() || 'reskill-page';
  const safeTitle = pageTitle.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
  const filename = `${safeTitle}.md`;

  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
