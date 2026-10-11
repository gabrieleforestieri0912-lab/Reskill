/**
 * background.js — Reskill Extension Service Worker
 *
 * Responsabilità:
 * - Gestione del token di sessione in chrome.storage.local
 * - Relay auth dal content-auth.js (sito web) allo storage
 * - Context menu dinamico (YouTube vs pagina normale)
 * - Apertura sidepanel al click sull'icona
 */

// ─── Costanti ────────────────────────────────────────────────────────────────
const VERIFIED_KEY    = "sg_verified";
const EMAIL_KEY       = "sg_email";
const NAME_KEY        = "sg_name";
const PLAN_KEY        = "sg_plan";
const TOKEN_KEY       = "sg_token";
const SERVER_URL_KEY  = "sg_server_url";

const DEFAULT_SERVER  = "http://localhost:3000";

// Titolo corrente del video YouTube (aggiornato via messaggio dal content script)
let currentVideoTitle = "";

// Conteggio video per playlist YouTube
let currentPlaylistCount = 0;

// ─── Inizializzazione ─────────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {
    console.warn("sidePanel.setPanelBehavior not supported");
  });

  buildContextMenu(false, "");
});

// ─── Costruzione menu contestuale ─────────────────────────────────────────────
let menuRebuildPending = false;

/**
 * Ricostruisce il context menu con debounce.
 * Evita il crash "Cannot create item with duplicate id" quando più eventi
 * (onActivated + onUpdated) scattano in rapida successione.
 * @param {boolean} isYouTube     - true se la tab attiva è una pagina YouTube con video
 * @param {string}  videoTitle    - titolo del video (usato solo se isYouTube === true)
 * @param {boolean} isPlaylist    - true se la pagina è una playlist YouTube
 * @param {number}  playlistCount - numero di video nella playlist
 */
function buildContextMenu(isYouTube, videoTitle, isPlaylist, playlistCount) {
  if (menuRebuildPending) return;
  menuRebuildPending = true;

  chrome.contextMenus.removeAll(() => {
    // Voce genitore
    chrome.contextMenus.create({
      id: "reskill-parent",
      title: "Reskill",
      contexts: ["all"],
    });

    // ── Voce 1: dipende dal contesto ──────────────────────────────────────────
    if (isPlaylist && playlistCount > 0) {
      chrome.contextMenus.create({
        id: "action-primary",
        parentId: "reskill-parent",
        title: `Estrai trascrizione: ${playlistCount} video`,
        contexts: ["all"],
      });
    } else if (isYouTube) {
      const label = videoTitle
        ? `Estrai trascrizione: ${videoTitle.substring(0, 50)}${videoTitle.length > 50 ? "…" : ""}`
        : "Estrai trascrizione";

      chrome.contextMenus.create({
        id: "action-primary",
        parentId: "reskill-parent",
        title: label,
        contexts: ["all"],
      });
    } else {
      chrome.contextMenus.create({
        id: "action-primary",
        parentId: "reskill-parent",
        title: "Converti in markdown",
        contexts: ["all"],
      });
    }

    // ── Voce 2: Prendi elementi ───────────────────────────────────────────────
    chrome.contextMenus.create({
      id: "action-grab",
      parentId: "reskill-parent",
      title: "Prendi elementi",
      contexts: ["all"],
    });

    // ── Voce 3: Apri feed ─────────────────────────────────────────────────────
    chrome.contextMenus.create({
      id: "action-feed",
      parentId: "reskill-parent",
      title: "Apri feed",
      contexts: ["all"],
    });

    menuRebuildPending = false;
  });
}

// ─── Aggiornamento menu al cambio tab / navigazione ──────────────────────────
/**
 * Verifica se la tab è YouTube con un video aperto
 * e chiede il titolo tramite content script.
 */
async function refreshMenuForTab(tabId, tabUrl) {
  if (!tabId || !tabUrl) {
    buildContextMenu(false, "", false, 0);
    return;
  }

  const isYTWatch = /youtube\.com\/watch/.test(tabUrl);
  const isYTPlaylist = /youtube\.com\/playlist/.test(tabUrl);

  if (!isYTWatch && !isYTPlaylist) {
    currentVideoTitle = "";
    currentPlaylistCount = 0;
    buildContextMenu(false, "", false, 0);
    return;
  }

  if (isYTPlaylist) {
    currentVideoTitle = "";
    try {
      const response = await chrome.tabs.sendMessage(tabId, { action: "sg_get_playlist_count" });
      const count = response?.count || 0;
      currentPlaylistCount = count;
      buildContextMenu(false, "", true, count);
    } catch {
      currentPlaylistCount = 0;
      buildContextMenu(false, "", true, 0);
    }
    return;
  }

  // È YouTube /watch: prova a ottenere il titolo dalla pagina
  try {
    const response = await chrome.tabs.sendMessage(tabId, { action: "sg_get_video_title" });
    const title = response?.title || "";
    currentVideoTitle = title;
    buildContextMenu(true, title, false, 0);
  } catch {
    // Content script non ancora iniettato o pagina non pronta
    currentVideoTitle = "";
    buildContextMenu(true, "", false, 0);
  }
}

// Cambio tab attiva
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    await refreshMenuForTab(tab.id, tab.url || tab.pendingUrl || "");
  } catch { /* ok */ }
});

// Navigazione all'interno della stessa tab
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") return;

  // Controlla se questa è la tab attiva
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab || activeTab.id !== tabId) return;

  await refreshMenuForTab(tabId, tab.url || "");
});

// ─── Cache titoli per link ────────────────────────────────────────────────────
const linkTitleCache = new Map();

async function fetchLinkTitle(linkUrl) {
  try {
    if (/youtube\.com\/watch/.test(linkUrl)) {
      const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(linkUrl)}&format=json`);
      if (!res.ok) return;
      const data = await res.json();
      const t = (data.title || "").trim();
      if (!t) return;
      const label = `Estrai trascrizione: ${t.substring(0, 50)}${t.length > 50 ? "…" : ""}`;
      linkTitleCache.set(linkUrl, label);
      return label;
    }
    if (/youtube\.com\/playlist/.test(linkUrl)) {
      const res = await fetch(linkUrl);
      if (!res.ok) return;
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const titleEl = doc.querySelector("title");
      const rawTitle = titleEl?.textContent?.replace(/ - YouTube$/, "").trim() || "";
      const statsEl = doc.querySelector("#stats yt-formatted-string, ytd-playlist-header-renderer #stats span");
      let count = 0;
      if (statsEl) {
        const m = statsEl.textContent?.match(/(\d+)\s*(video|Video)/);
        if (m) count = parseInt(m[1], 10);
      }
      if (!rawTitle && !count) return;
      let label;
      if (count > 0) {
        label = `Estrai trascrizione: ${count} video`;
      } else {
        label = `Estrai trascrizione: ${rawTitle.substring(0, 50)}`;
      }
      linkTitleCache.set(linkUrl, label);
      return label;
    }
  } catch { /* fallback silenzioso */ }
}

function getLinkLabel(linkUrl) {
  const cached = linkTitleCache.get(linkUrl);
  if (cached) return cached;
  // Avvia fetch asincrono e mostra intanto un titolo generico
  fetchLinkTitle(linkUrl).then((label) => {
    if (!label) return;
    try {
      chrome.contextMenus.update("action-primary", { title: label });
      if (chrome.contextMenus.refresh) chrome.contextMenus.refresh();
    } catch { /* api non supportata */ }
  });
  if (/youtube\.com\/playlist/.test(linkUrl)) return "Estrai trascrizione playlist...";
  if (/youtube\.com\/watch/.test(linkUrl)) return "Estrai trascrizione video...";
  return "Converti link in markdown";
}

// ─── Aggiornamento menu al click destro (link vs pagina) ─────────────────────
if (chrome.contextMenus.onShown) {
  chrome.contextMenus.onShown.addListener((info, tab) => {
    const linkUrl = info.linkUrl || "";
    const pageUrl = tab?.url || "";

    let title;
    if (linkUrl) {
      title = getLinkLabel(linkUrl);
    } else if (/youtube\.com\/playlist/.test(pageUrl)) {
      title = currentPlaylistCount > 0
        ? `Estrai trascrizione: ${currentPlaylistCount} video`
        : "Estrai trascrizione";
    } else if (/youtube\.com\/watch/.test(pageUrl)) {
      title = currentVideoTitle
        ? `Estrai trascrizione: ${currentVideoTitle.substring(0, 50)}${currentVideoTitle.length > 50 ? "…" : ""}`
        : "Estrai trascrizione";
    } else {
      title = "Converti in markdown";
    }

    chrome.contextMenus.update("action-primary", { title });
    if (chrome.contextMenus.refresh) chrome.contextMenus.refresh();
  });
}

// ─── Context Menu Click ───────────────────────────────────────────────────────
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const targetUrl = info.linkUrl || tab?.url || "";

  switch (info.menuItemId) {
    case "action-primary":
      if (/youtube\.com\/playlist/.test(targetUrl)) {
        if (info.linkUrl) {
          extractAndDownload(info.linkUrl, "youtube_playlist");
        } else if (tab?.id) {
          chrome.tabs.sendMessage(tab.id, { action: "extractYoutubePlaylist" }, () => {
            chrome.runtime.lastError;
          });
        }
      } else if (/youtube\.com\/watch/.test(targetUrl)) {
        if (info.linkUrl) {
          extractAndDownload(info.linkUrl, "youtube");
        } else if (tab?.id) {
          chrome.tabs.sendMessage(tab.id, { action: "extractYoutubeTranscript" }, () => {
            chrome.runtime.lastError;
          });
        }
      } else if (info.linkUrl) {
        extractAndDownload(info.linkUrl, "webpage");
      } else if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { action: "convertToMarkdown" }, () => {
          chrome.runtime.lastError;
        });
      }
      break;

    case "action-grab":
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { action: "grabElements" }, () => {
          chrome.runtime.lastError;
        });
      }
      break;

    case "action-feed":
      openFeed();
      break;
  }
});

// ─── Estrai e scarica da URL (click su link) ─────────────────────────────────
async function extractAndDownload(url, sourceType) {
  try {
    const server = await getServerUrl();
    const result = await chrome.storage.local.get([TOKEN_KEY]);
    const headers = { "Content-Type": "application/json" };
    if (result[TOKEN_KEY]) headers["x-extension-token"] = result[TOKEN_KEY];

    const res = await fetch(`${server}/api/extract`, {
      method: "POST",
      headers,
      body: JSON.stringify({ url }),
    });

    if (!res.ok) {
      chrome.tabs.create({ url });
      return;
    }

    const data = await res.json();
    const title = data.title || new URL(url).hostname || "estrazione";
    const content = data.content || data.text || "";
    const safeTitle = title.replace(/[^a-z0-9]/gi, "_").substring(0, 50);

    const now = new Date().toISOString();
    const markdown = `---
title: "${title}"
source: ${sourceType}
url: "${url}"
extracted: "${now}"
---

# ${title}

${content}
`;

    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);

    chrome.downloads.download({
      url: blobUrl,
      filename: `${safeTitle}.md`,
      saveAs: false,
    });

    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  } catch {
    chrome.tabs.create({ url });
  }
}

// ─── Messages dal Content Script e da Popup/Sidepanel ────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    /**
     * Il content script YouTube notifica il titolo del video corrente.
     */
    case "sg_video_title_update":
      currentVideoTitle = message.title || "";
      currentPlaylistCount = 0;
      buildContextMenu(true, currentVideoTitle, false, 0);
      sendResponse({ success: true });
      break;

    /**
     * Il content script YouTube notifica il conteggio video di una playlist.
     */
    case "sg_playlist_count_update":
      currentPlaylistCount = message.count || 0;
      currentVideoTitle = "";
      buildContextMenu(false, "", true, currentPlaylistCount);
      sendResponse({ success: true });
      break;

    /**
     * Il content-auth.js (sul sito) ci passa il token della sessione web.
     */
    case "sg_session_linked":
      saveSession({
        token: message.token,
        email: message.email,
        name: message.name || "",
      }).then(() => sendResponse({ success: true }));
      return true;

    /**
     * Il popup/sidepanel chiede di fare logout.
     */
    case "sg_logout":
      clearSession().then(async () => {
        try {
          const tabs = await getReskillTabs();
          for (const tab of tabs) {
            chrome.tabs.sendMessage(tab.id, { action: "sg_logout_web" }, () => {
              chrome.runtime.lastError;
            });
          }
        } catch { /* ok */ }
        sendResponse({ success: true });
      });
      return true;

    /**
     * Re-check della sessione web.
     */
    case "sg_sync_session":
      syncSessionFromWebTabs().then((found) => sendResponse({ found }));
      return true;

    /**
     * Apri la dashboard nel browser.
     */
    case "sg_open_dashboard":
      openDashboard();
      sendResponse({ success: true });
      break;
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getServerUrl() {
  const result = await chrome.storage.local.get([SERVER_URL_KEY]);
  return result[SERVER_URL_KEY] || DEFAULT_SERVER;
}

async function saveSession({ token, email, name, plan }) {
  await chrome.storage.local.set({
    [VERIFIED_KEY]: true,
    [TOKEN_KEY]: token,
    [EMAIL_KEY]: email,
    [NAME_KEY]: name || "",
    [PLAN_KEY]: plan || "free",
  });
}

async function clearSession() {
  await chrome.storage.local.remove([VERIFIED_KEY, TOKEN_KEY, EMAIL_KEY, NAME_KEY, PLAN_KEY]);
}

async function getReskillTabs() {
  const serverUrl = await getServerUrl();
  const origin = new URL(serverUrl).origin;
  const tabs    = await chrome.tabs.query({ url: `${origin}/*` });
  const devTabs = await chrome.tabs.query({ url: "http://localhost:3000/*" });
  return [...tabs, ...devTabs].filter((t) => t.id);
}

let lastSyncTime = 0;

async function syncSessionFromWebTabs() {
  const now = Date.now();
  if (now - lastSyncTime < 5000) return false;
  lastSyncTime = now;

  const tabs = await getReskillTabs();
  if (tabs.length === 0) return false;

  const tab = tabs[0];
  try {
    await new Promise((resolve) => {
      chrome.tabs.sendMessage(tab.id, { action: "sg_check_session" }, () => {
        chrome.runtime.lastError;
        resolve(true);
      });
    });
    return true;
  } catch {
    return false;
  }
}

function openDashboard() {
  getServerUrl().then((url) => {
    chrome.tabs.create({ url: `${url}/dashboard` });
  });
}

function openFeed() {
  getServerUrl().then((url) => {
    chrome.tabs.create({ url: `${url}/feed` });
  });
}
