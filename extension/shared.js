/**
 * shared.js — Logica condivisa tra popup.html e sidepanel.html
 *
 * Auth flow:
 * 1. Controlla chrome.storage.local per un token già salvato
 * 2. Se trovato, valida il token con /api/extension/me
 * 3. Se il token non è valido, prova a sincronizzare con la sessione web
 * 4. Se nessuna sessione, mostra il form email/codice
 */

// ─── Costanti storage ────────────────────────────────────────────────────────
const VERIFIED_KEY = "sg_verified";
const EMAIL_KEY = "sg_email";
const NAME_KEY = "sg_name";
const PLAN_KEY = "sg_plan";
const TOKEN_KEY = "sg_token";
const SERVER_URL_KEY = "sg_server_url";
const MCP_URL_KEY = "sg_mcp_url";
const MCP_DISMISSED_KEY = "sg_mcp_banner_dismissed";
const FOLDERS_KEY = "sg_folders";
const SOURCE_FOLDER_KEY = "sg_source_folder";

// ─── Stato locale ────────────────────────────────────────────────────────────
let currentEmail = "";
let currentToken = "";
let currentPlan = "free";
let allSources = [];
let currentFolderId = "";
let currentSearchQuery = "";

// ─── DOM refs (auth) ─────────────────────────────────────────────────────────
const stepEmail = document.getElementById("step-email");
const stepCode = document.getElementById("step-code");
const mainSections = document.querySelectorAll(".section-panel");
const emailInput = document.getElementById("email-input");
const sendCodeBtn = document.getElementById("send-code-btn");
const codeInputs = document.querySelectorAll(".code-digit");
const verifyBtn = document.getElementById("verify-btn");
const backBtn = document.getElementById("back-btn");
const emailError = document.getElementById("email-error");
const emailStatus = document.getElementById("email-status");
const codeError = document.getElementById("code-error");
const codeStatus = document.getElementById("code-status");
const codeSubtitle = document.getElementById("code-subtitle");
const codeEmailDisplay = document.getElementById("code-email-display");
const timerDisplay = document.getElementById("timer-display");
const userInfo = document.getElementById("user-info");
const userPlanBadge = document.getElementById("user-plan-badge");
const mainStatus = document.getElementById("main-status");
const bucketSelect = document.getElementById("quick-bucket-select");

let codeExpiryTime = null;

bucketSelect?.addEventListener("change", async () => {
  await chrome.storage.local.set({ sg_last_bucket_id: bucketSelect.value });
});

// ─── Server URL ──────────────────────────────────────────────────────────────
async function getServerUrl() {
  const result = await chrome.storage.local.get([SERVER_URL_KEY]);
  return result[SERVER_URL_KEY] || "http://localhost:3000";
}

// ─── Gestione UI Steps (auth) ────────────────────────────────────────────────
function showStep(step) {
  document.querySelectorAll(".step").forEach((s) => s.classList.remove("active"));
  step.classList.add("active");
  hideAllSections();
  const authScreen = document.getElementById("auth-screen");
  const authUi = document.getElementById("authenticated-ui");
  if (authScreen) authScreen.style.display = "";
  if (authUi) authUi.classList.remove("active");
}

function hideAllSections() {
  mainSections.forEach((s) => s.classList.remove("active"));
  const sidebar = document.getElementById("sidebar-nav");
  if (sidebar) {
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
  }
}

function showSection(id) {
  document.querySelectorAll(".step").forEach((s) => s.classList.remove("active"));
  hideAllSections();
  const panel = document.getElementById("section-" + id);
  if (panel) panel.classList.add("active");
  const btn = document.querySelector(`.nav-btn[data-section="${id}"]`);
  if (btn) btn.classList.add("active");
}

function showMainUI() {
  document.querySelectorAll(".step").forEach((s) => s.classList.remove("active"));

  const feed = document.getElementById("section-feed");
  if (feed) {
    // Nuovo layout sidepanel
    const authScreen = document.getElementById("auth-screen");
    const authUi = document.getElementById("authenticated-ui");
    if (authScreen) authScreen.style.display = "none";
    if (authUi) authUi.classList.add("active");
    hideAllSections();
    feed.classList.add("active");
    const feedBtn = document.querySelector('.nav-btn[data-section="feed"]');
    if (feedBtn) feedBtn.classList.add("active");
    initMcpBanner();
    loadFeed();
  } else {
    // Legacy layout popup
    const mainUI = document.getElementById("main-ui");
    if (mainUI) {
      mainUI.style.display = "flex";
      mainUI.classList.add("active");
    }
    initMcpBanner();
  }
}

// ─── Navigation ──────────────────────────────────────────────────────────────
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const section = btn.dataset.section;
    if (section) showSection(section);

    // Lazy load data per le sezioni
    if (section === "feed") loadFeed();
    if (section === "usage") loadUsage();
    if (section === "connections") {
      updateConnectionStatuses();
    }
  });
});

// ─── Aggiorna la UI con i dati dell'utente ───────────────────────────────────
function updateUserUI(email, name, plan) {
  const displayName = name || email;
  const shortEmail = email.length > 22 ? email.substring(0, 20) + "…" : email;
  if (userInfo) userInfo.textContent = `Ciao, ${displayName.split(" ")[0] || shortEmail}`;
  if (userPlanBadge) {
    userPlanBadge.textContent = (plan || "free").toUpperCase();
    userPlanBadge.className = "plan-badge plan-" + (plan || "free");
  }
  const avatarEl = document.getElementById("user-avatar");
  if (avatarEl) {
    avatarEl.textContent = displayName.charAt(0).toUpperCase();
  }
  currentPlan = plan || "free";
  updateAccountDropdown(email, name, plan);
}

// ─── Carica i bucket dell'utente nel select rapido ───────────────────────────
async function loadQuickBuckets(token) {
  if (!bucketSelect) return;
  try {
    const server = await getServerUrl();
    const res = await fetch(`${server}/api/buckets`, {
      headers: { "x-extension-token": token },
    });
    if (!res.ok) return;
    const buckets = await res.json();
    if (!Array.isArray(buckets) || buckets.length === 0) {
      bucketSelect.innerHTML = `<option value="">Nessun bucket — creane uno</option>`;
      return;
    }
    bucketSelect.innerHTML = buckets
      .map((b) => `<option value="${b.id}">${b.name}</option>`)
      .join("");

    const storageResult = await chrome.storage.local.get(["sg_last_bucket_id"]);
    if (storageResult.sg_last_bucket_id) {
      bucketSelect.value = storageResult.sg_last_bucket_id;
    } else {
      await chrome.storage.local.set({ sg_last_bucket_id: bucketSelect.value });
    }
  } catch {
    bucketSelect.innerHTML = `<option value="">Errore nel caricamento</option>`;
  }
}

// ─── Feed: carica risorse ────────────────────────────────────────────────────
// ─── Folder Management ──────────────────────────────────────────────────────

async function loadFolders() {
  const result = await chrome.storage.local.get([FOLDERS_KEY, SOURCE_FOLDER_KEY]);
  const folders = result[FOLDERS_KEY] || [];
  return folders;
}

async function saveFolders(folders) {
  await chrome.storage.local.set({ [FOLDERS_KEY]: folders });
}

async function createFolder(name) {
  const folders = await loadFolders();
  const id = "folder_" + Date.now();
  folders.push({ id, name: name.trim() });
  await saveFolders(folders);
  return id;
}

async function assignSourceToFolder(sourceId, folderId) {
  const result = await chrome.storage.local.get([SOURCE_FOLDER_KEY]);
  const map = result[SOURCE_FOLDER_KEY] || {};
  if (folderId === "") {
    delete map[sourceId];
  } else {
    map[sourceId] = folderId;
  }
  await chrome.storage.local.set({ [SOURCE_FOLDER_KEY]: map });
}

async function getSourceFolderMap() {
  const result = await chrome.storage.local.get([SOURCE_FOLDER_KEY]);
  return result[SOURCE_FOLDER_KEY] || {};
}

function renderFolderTabs(folders) {
  const container = document.getElementById("feed-folders");
  if (!container) return;
  const toolbar = document.getElementById("feed-toolbar");
  if (toolbar) toolbar.style.display = "flex";

  let html = `<button class="folder-tab ${currentFolderId === "" ? "active" : ""}" data-folder-id="">Tutti</button>`;
  folders.forEach((f) => {
    html += `<button class="folder-tab ${currentFolderId === f.id ? "active" : ""}" data-folder-id="${f.id}">${f.name.replace(/"/g, "&quot;")}</button>`;
  });
  html += `<button class="folder-add-btn" id="folder-add-btn">+</button>`;
  container.innerHTML = html;

  // Folder tab click handlers
  container.querySelectorAll(".folder-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentFolderId = btn.dataset.folderId;
      renderFolderTabsFn();
      renderFeedWithFilters();
    });
  });

  const addBtn = document.getElementById("folder-add-btn");
  const createRow = document.getElementById("folder-create-row");
  const createInput = document.getElementById("folder-create-input");
  const createBtn = document.getElementById("folder-create-btn");
  const cancelBtn = document.getElementById("folder-create-cancel");

  if (addBtn && createRow) {
    addBtn.addEventListener("click", () => {
      addBtn.style.display = "none";
      createRow.style.display = "flex";
      createInput?.focus();
    });
  }

  if (cancelBtn && createRow && addBtn) {
    cancelBtn.addEventListener("click", () => {
      createRow.style.display = "none";
      addBtn.style.display = "inline-block";
      if (createInput) createInput.value = "";
    });
  }

  if (createBtn && createInput) {
    createBtn.addEventListener("click", async () => {
      const name = createInput.value.trim();
      if (!name) return;
      await createFolder(name);
      createInput.value = "";
      createRow.style.display = "none";
      if (addBtn) addBtn.style.display = "inline-block";
      const updatedFolders = await loadFolders();
      renderFolderTabs(updatedFolders);
      renderFeedWithFilters();
    });
    createInput.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") createBtn.click();
      if (e.key === "Escape") cancelBtn?.click();
    });
  }
}

function renderFolderTabsFn() {
  const container = document.getElementById("feed-folders");
  if (!container) return;
  container.querySelectorAll(".folder-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.folderId === currentFolderId);
  });
}

// ─── Feed (Search + Folder filtered) ────────────────────────────────────────

async function renderFeedWithFilters() {
  const list = document.getElementById("feed-list");
  const status = document.getElementById("feed-status");
  if (!list) return;

  let filtered = allSources.slice().reverse();

  // Filter by folder
  if (currentFolderId) {
    const map = await getSourceFolderMap();
    filtered = filtered.filter((s) => map[s.id] === currentFolderId);
  }

  applySearchAndRender(filtered, list, status);
}

function applySearchAndRender(filtered, list, status) {
  // Filter by search query
  if (currentSearchQuery) {
    const q = currentSearchQuery.toLowerCase();
    filtered = filtered.filter((s) => {
      const title = (s.title || "").toLowerCase();
      const url = (s.url || "").toLowerCase();
      const type = (s.type || "").toLowerCase();
      return title.includes(q) || url.includes(q) || type.includes(q);
    });
  }

  // Render
  if (filtered.length === 0) {
    list.innerHTML = `<div class="feed-empty">
      <span class="big-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="oklch(60% .01 260)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </span>
      ${currentSearchQuery ? "Nessuna risorsa trovata per questa ricerca." : "Nessuna risorsa in questa cartella."}
    </div>`;
    if (status) status.textContent = "";
    return;
  }

  if (status) {
    const total = allSources.length;
    const shown = filtered.length;
    status.textContent = shown < total ? `${shown} di ${total} risorse` : `${total} risorse salvate`;
    status.className = "status-text success";
  }

  const typeIcons = {
    youtube: ["YT", "youtube"],
    webpage: ["WEB", "webpage"],
    twitter: ["X", "twitter"],
    reddit: ["RD", "reddit"],
    pdf: ["PDF", "pdf"],
  };

  list.innerHTML = filtered
    .map((s) => {
      const icon = typeIcons[s.type] || ["WEB", "webpage"];
      const date = s.date || s.created_at || "";
      const dateStr = date ? new Date(date).toLocaleDateString("it-IT") : "";
      const title = s.title || s.url || "Senza titolo";
      const safeTitle = title.replace(/"/g, "&quot;");
      return `<div class="resource-card">
        <div class="resource-header">${safeTitle}</div>
        <div class="resource-body">
          <div class="resource-icon ${icon[1]}"><span class="res-icon-text">${icon[0]}</span></div>
          <div class="resource-info">
            <div class="resource-meta">${s.type} · ${dateStr}</div>
          </div>
          <button class="folder-assign-btn" data-source-id="${s.id}" title="Sposta in cartella">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          </button>
          <button class="resource-download-btn" data-source-id="${s.id}" data-source-title="${safeTitle}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:3px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            MD
          </button>
        </div>
      </div>`;
    })
    .join("");

  // Download handlers
  list.querySelectorAll(".resource-download-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.sourceId;
      const title = btn.dataset.sourceTitle || "risorsa";
      await downloadSource(id, title);
    });
  });

  // Folder assign handlers
  list.querySelectorAll(".folder-assign-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const sourceId = btn.dataset.sourceId;
      await showFolderPopup(btn, sourceId);
    });
  });
}

async function showFolderPopup(anchor, sourceId) {
  const popup = document.getElementById("folder-popup");
  const popupList = document.getElementById("folder-popup-list");
  if (!popup || !popupList) return;

  const folders = await loadFolders();
  const map = await getSourceFolderMap();
  const currentAssigned = map[sourceId] || "";

  let html = "";
  html += `<button class="folder-popup-item ${currentAssigned === "" ? "active-folder" : ""}" data-folder-id="">Nessuna</button>`;
  if (folders.length > 0) html += `<div class="folder-popup-divider"></div>`;
  folders.forEach((f) => {
    html += `<button class="folder-popup-item ${currentAssigned === f.id ? "active-folder" : ""}" data-folder-id="${f.id}">${f.name.replace(/"/g, "&quot;")}</button>`;
  });
  popupList.innerHTML = html;

  // Position popup
  const rect = anchor.getBoundingClientRect();
  popup.style.top = rect.bottom + 4 + "px";
  popup.style.left = Math.max(4, rect.left - 40) + "px";
  popup.style.display = "block";

  // Item click handlers
  popupList.querySelectorAll(".folder-popup-item").forEach((item) => {
    item.addEventListener("click", async () => {
      const folderId = item.dataset.folderId;
      await assignSourceToFolder(sourceId, folderId);
      closeFolderPopup();
      renderFeedWithFilters();
    });
  });
}

function closeFolderPopup() {
  const popup = document.getElementById("folder-popup");
  if (popup) popup.style.display = "none";
}

async function loadFeed() {
  const list = document.getElementById("feed-list");
  const status = document.getElementById("feed-status");
  if (!list) return;

  const folders = await loadFolders();
  renderFolderTabs(folders);

  try {
    const server = await getServerUrl();
    const res = await fetch(`${server}/api/sources`, {
      headers: { "x-extension-token": currentToken },
    });

    if (!res.ok) {
      allSources = [];
      showEmptyFeed(list, status);
      return;
    }

    const sources = await res.json();

    if (!Array.isArray(sources) || sources.length === 0) {
      allSources = [];
      showEmptyFeed(list, status);
      return;
    }

    allSources = sources;
    renderFeedWithFilters();
  } catch {
    allSources = [];
    showEmptyFeed(list, status);
  }
}

function showEmptyFeed(list, status) {
  list.innerHTML = `<div class="feed-empty">
    <span class="big-icon">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="oklch(60% .01 260)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    </span>
    Nessuna risorsa salvata.<br/>
    Usa l'estensione per salvare pagine web e trascrizioni YouTube.
  </div>`;
  if (status) {
    status.textContent = "";
    status.className = "status-text";
  }
}

async function downloadSource(sourceId, title) {
  try {
    const server = await getServerUrl();
    const res = await fetch(`${server}/api/sources?single=${sourceId}`, {
      headers: { "x-extension-token": currentToken },
    });
    if (!res.ok) return;
    const sources = await res.json();
    const source = Array.isArray(sources) ? sources[0] : sources;
    if (!source) return;

    const content = source.skillMarkdown || source.content || "";
    const safeName = title.replace(/[^a-zA-Z0-9_\-\s]/g, "").substring(0, 50) || "risorsa";
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    await chrome.downloads.download({
      url: url,
      filename: `${safeName}.md`,
      saveAs: true,
    });

    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } catch {
    // silent
  }
}

// ─── Link to Markdown ─────────────────────────────────────────────────────────
const convertUrlInput = document.getElementById("convert-url-input");
const convertExtractBtn = document.getElementById("convert-extract-btn");
const convertOutput = document.getElementById("convert-output");
const convertSpinner = document.getElementById("convert-spinner");
const convertActions = document.getElementById("convert-actions");
const convertError = document.getElementById("convert-error");
const convertStatus = document.getElementById("convert-status");

let lastExtractedMarkdown = "";

convertExtractBtn?.addEventListener("click", async () => {
  const url = convertUrlInput?.value?.trim();
  if (!url) {
    if (convertError) {
      convertError.textContent = "Inserisci un URL valido.";
      convertError.classList.add("show");
    }
    return;
  }

  if (convertError) convertError.classList.remove("show");
  if (convertStatus) convertStatus.textContent = "";
  if (convertOutput) convertOutput.classList.remove("visible");
  if (convertActions) convertActions.style.display = "none";
  if (convertSpinner) convertSpinner.classList.add("active");
  if (convertExtractBtn) convertExtractBtn.disabled = true;

  try {
    const server = await getServerUrl();
    const res = await fetch(`${server}/api/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      lastExtractedMarkdown = data.content || "";
      if (convertOutput) {
        convertOutput.textContent = lastExtractedMarkdown;
        convertOutput.classList.add("visible");
      }
      if (convertActions) convertActions.style.display = "flex";
      if (convertStatus) {
        convertStatus.textContent = "✓ Estratto con successo";
        convertStatus.className = "status-text success";
      }
    } else {
      if (convertError) {
        convertError.textContent = data.error || "Errore durante l'estrazione.";
        convertError.classList.add("show");
      }
    }
  } catch {
    if (convertError) {
      convertError.textContent = "Errore di connessione. Controlla la rete.";
      convertError.classList.add("show");
    }
  }

  if (convertSpinner) convertSpinner.classList.remove("active");
  if (convertExtractBtn) convertExtractBtn.disabled = false;
});

document.getElementById("convert-copy-btn")?.addEventListener("click", async () => {
  if (!lastExtractedMarkdown) return;
  try {
    await navigator.clipboard.writeText(lastExtractedMarkdown);
    if (convertStatus) {
      convertStatus.textContent = "✓ Copiato negli appunti";
      convertStatus.className = "status-text success";
      setTimeout(() => { if (convertStatus) convertStatus.textContent = ""; }, 2000);
    }
  } catch {
    if (convertStatus) {
      convertStatus.textContent = "Errore nella copia";
      convertStatus.className = "status-text error-msg";
    }
  }
});

document.getElementById("convert-download-btn")?.addEventListener("click", async () => {
  if (!lastExtractedMarkdown) return;
  const blob = new Blob([lastExtractedMarkdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    await chrome.downloads.download({
      url: url,
      filename: "estrazione.md",
      saveAs: true,
    });
  } catch {
    // silent
  }
  setTimeout(() => URL.revokeObjectURL(url), 10000);
});

// ─── Usage: carica statistiche ───────────────────────────────────────────────
const typeIcons = {
  youtube: ["YT", "youtube"],
  webpage: ["WEB", "webpage"],
  twitter: ["X", "twitter"],
  reddit: ["RD", "reddit"],
  pdf: ["PDF", "pdf"],
};

async function loadUsage() {
  if (!currentToken) return;

  try {
    const server = await getServerUrl();
    const res = await fetch(`${server}/api/stats`, {
      headers: { "x-extension-token": currentToken },
    });

    if (!res.ok) return;

    const stats = await res.json();

    // Plan info
    const planName = document.getElementById("usage-plan-name");
    const planDesc = document.getElementById("usage-plan-desc");
    if (planName) planName.textContent = (stats.currentPlan || "free").toUpperCase();
    if (planDesc) {
      const planLabels = {
        free: "Piano gratuito · Aggiorna per più funzionalità",
        starter: "Piano Starter",
        pro: "Piano Pro · Accesso illimitato",
        business: "Piano Business",
        enterprise: "Piano Enterprise",
      };
      planDesc.textContent = planLabels[stats.currentPlan] || "Piano attivo";
    }

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val ?? "—";
    };

    setVal("usage-buckets", stats.totalBuckets);
    setVal("usage-sources", stats.totalSources);
    setVal("usage-youtube", stats.sourcesByType?.youtube || 0);
    setVal("usage-webpages", (stats.sourcesByType?.webpage || 0) + (stats.sourcesByType?.pdf || 0));
    setVal("usage-skills", stats.skillsGenerated);

    // Credit bar
    const used = stats.totalCreditsUsed || 0;
    const total = stats.planCredits || 100;
    const remaining = stats.creditsRemaining || 0;

    // Update account dropdown credits
    const nameEl = document.getElementById("acct-dropdown-name");
    if (nameEl) {
      const display = nameEl.textContent;
      updateAccountDropdown("", display, stats.currentPlan, used, total);
    }

    const creditsUsedEl = document.getElementById("credits-used");
    const creditsTotalEl = document.getElementById("credits-total");
    if (creditsUsedEl) creditsUsedEl.textContent = used;
    if (creditsTotalEl) creditsTotalEl.textContent = total;

    const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
    const fill = document.getElementById("credit-bar-fill");
    if (fill) {
      fill.style.width = pct + "%";
      fill.className = "credit-bar-fill" + (pct > 80 ? " low" : pct > 50 ? " medium" : " high");
    }

    // Credit breakdown by type
    const breakdown = document.getElementById("credit-breakdown");
    if (breakdown && stats.creditsByType) {
      breakdown.innerHTML = Object.entries(stats.creditsByType)
        .map(([type, count]) => `<span class="credit-breakdown-item">${typeIcons[type]?.[0] || "WEB"} ${type}: <strong>${count}</strong></span>`)
        .join("");
    }

  } catch {
    // silent
  }
}

document.getElementById("usage-upgrade-btn")?.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "sg_open_dashboard" });
});

// ─── Auto-Recharge ───────────────────────────────────────────────────────────
document.getElementById("recharge-buy-btn")?.addEventListener("click", async () => {
  const select = document.getElementById("recharge-plan-select");
  const planId = select?.value || "pro";
  const server = await getServerUrl();

  try {
    const res = await fetch(`${server}/api/stripe/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-extension-token": currentToken,
      },
      body: JSON.stringify({ planId }),
    });

    const data = await res.json();

    if (data.url) {
      chrome.tabs.create({ url: data.url });
    } else if (data.demo) {
      const status = document.getElementById("usage-status");
      if (status) {
        status.textContent = `Demo: reindirizzamento al piano ${planId}...`;
        status.className = "status-text";
      }
      setTimeout(() => {
        chrome.tabs.create({ url: `${server}/dashboard?plan=${planId}` });
      }, 800);
    } else {
      chrome.tabs.create({ url: `${server}/dashboard` });
    }
  } catch {
    chrome.tabs.create({ url: `${server}/dashboard` });
  }
});

// ─── Verifica token esistente con il server ──────────────────────────────────
async function validateStoredToken(token) {
  try {
    const server = await getServerUrl();
    const res = await fetch(`${server}/api/extension/me`, {
      headers: { "x-extension-token": token },
    });
    const data = await res.json();
    if (!data.verified) return null;
    return data;
  } catch {
    return null;
  }
}

// ─── Flusso principale di verifica ──────────────────────────────────────────
async function checkVerification() {
  showMainUI();
}

// ─── Utility: stato temporaneo ───────────────────────────────────────────────
function setStatus(msg, durationMs = 0) {
  if (mainStatus) {
    mainStatus.textContent = msg;
    if (durationMs > 0) setTimeout(() => { mainStatus.textContent = ""; }, durationMs);
  }
}

// ─── Invia codice email ──────────────────────────────────────────────────────
sendCodeBtn.addEventListener("click", async () => {
  if (emailError) emailError.classList.remove("show");
  if (emailStatus) emailStatus.textContent = "";
  const email = emailInput ? emailInput.value.trim() : "";

  if (!email || !email.includes("@")) {
    if (emailError) { emailError.textContent = "Inserisci un'email valida."; emailError.classList.add("show"); }
    return;
  }

  sendCodeBtn.disabled = true;
  sendCodeBtn.textContent = "Invio...";

  try {
    const server = await getServerUrl();
    const res = await fetch(`${server}/api/extension/send-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

if (res.ok) {
       currentEmail = email;
       if (codeEmailDisplay) codeEmailDisplay.textContent = email;
       codeInputs.forEach((input) => (input.value = ""));
       if (codeError) codeError.classList.remove("show");
       if (codeStatus) {
         codeStatus.textContent = data.devCode
           ? `[DEV] Codice: ${data.devCode} (scade tra 1 min)`
           : "";
       }
       codeExpiryTime = Date.now() + 60 * 1000;
       startCodeTimer();
       showStep(stepCode);
       const firstInput = codeInputs[0];
       if (firstInput) firstInput.focus();
     } else {
       if (emailError) { emailError.textContent = data.error || "Errore nell'invio del codice."; emailError.classList.add("show"); }
     }
  } catch {
    if (emailError) { emailError.textContent = "Errore di connessione. Controlla la rete."; emailError.classList.add("show"); }
  }

  sendCodeBtn.disabled = false;
  sendCodeBtn.textContent = "Invia Codice";
});

backBtn.addEventListener("click", () => {
  showStep(stepEmail);
  if (emailInput) emailInput.focus();
});

verifyBtn.addEventListener("click", async () => {
  if (codeError) codeError.classList.remove("show");
  if (codeStatus) codeStatus.textContent = "";
  const code = Array.from(codeInputs).map((input) => input.value).join("");

  if (!code || code.length < 6) {
    if (codeError) { codeError.textContent = "Inserisci il codice a 6 cifre."; codeError.classList.add("show"); }
    return;
  }

  verifyBtn.disabled = true;
  verifyBtn.textContent = "Verifica...";

  try {
    const server = await getServerUrl();
    const res = await fetch(`${server}/api/extension/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: currentEmail, code }),
    });
    const data = await res.json();

    if (res.ok && data.token) {
      currentToken = data.token;
      codeExpiryTime = null;
      await chrome.storage.local.set({
        [VERIFIED_KEY]: true,
        [EMAIL_KEY]: currentEmail,
        [TOKEN_KEY]: data.token,
        [NAME_KEY]: "",
        [PLAN_KEY]: "free",
      });
      const userData = await validateStoredToken(data.token);
      if (userData) {
        updateUserUI(userData.email, userData.name, userData.plan);
        await chrome.storage.local.set({
          [NAME_KEY]: userData.name,
          [PLAN_KEY]: userData.plan,
        });
      } else {
        updateUserUI(currentEmail, "", "free");
      }
      await loadQuickBuckets(data.token);
      showMainUI();
    } else {
      if (codeError) { codeError.textContent = data.error || "Codice non valido."; codeError.classList.add("show"); }
      verifyBtn.disabled = false;
      verifyBtn.textContent = "Verifica";
    }
  } catch {
    if (codeError) { codeError.textContent = "Errore di connessione."; codeError.classList.add("show"); }
    verifyBtn.disabled = false;
    verifyBtn.textContent = "Verifica";
  }
});

// ─── Code timer ───────────────────────────────────────────────────────────────
function startCodeTimer() {
  if (!timerDisplay) return;
  
  function updateTimer() {
    if (!codeExpiryTime) return;
    
    const now = Date.now();
    const remaining = codeExpiryTime - now;
    
    if (remaining <= 0) {
      timerDisplay.textContent = "Scaduto";
      timerDisplay.style.color = "oklch(72% .06 240)";
      return;
    }
    
    const seconds = Math.floor(remaining / 1000);
    timerDisplay.textContent = `${seconds.toString().padStart(2, "0")}`;
  }
  
  updateTimer();
  setInterval(updateTimer, 1000);
}

// ─── Code input keyboard navigation ───────────────────────────────────────────
codeInputs.forEach((input, index) => {
  input.addEventListener("input", (e) => {
    const target = e.target;
    target.value = target.value.replace(/[^0-9]/g, "");
    if (target.value && index < codeInputs.length - 1) {
      codeInputs[index + 1].focus();
    }
    if (codeError) codeError.classList.remove("show");
  });
  
  input.addEventListener("keydown", (e) => {
    const target = e.target;
    if (e.key === "Backspace" && !target.value && index > 0) {
      codeInputs[index - 1].focus();
    }
    if (e.key === "Enter") {
      const allFilled = Array.from(codeInputs).every((inp) => inp.value);
      if (allFilled) verifyBtn.click();
    }
  });
});

// ─── Enter key shortcuts ─────────────────────────────────────────────────────
if (emailInput) emailInput.addEventListener("keydown", (e) => { if (e.key === "Enter") sendCodeBtn.click(); });
if (convertUrlInput) convertUrlInput.addEventListener("keydown", (e) => { if (e.key === "Enter") convertExtractBtn?.click(); });

function performLogout() {
  chrome.runtime.sendMessage({ action: "sg_logout" }, async () => {
    currentToken = "";
    currentEmail = "";
    codeExpiryTime = null;
    if (emailInput) emailInput.value = "";
    codeInputs.forEach((input) => (input.value = ""));
    if (emailError) emailError.classList.remove("show");
    if (codeError) codeError.classList.remove("show");
    if (emailStatus) emailStatus.textContent = "";
    if (codeStatus) codeStatus.textContent = "";
    const authScreen = document.getElementById("auth-screen");
    const authUi = document.getElementById("authenticated-ui");
    if (authScreen) authScreen.style.display = "";
    if (authUi) authUi.classList.remove("active");
    showStep(stepEmail);
    if (emailInput) emailInput.focus();
  });
}

document.getElementById("logout-btn")?.addEventListener("click", performLogout);
document.getElementById("conn-logout-btn")?.addEventListener("click", performLogout);

// ─── Account Dropdown ────────────────────────────────────────────────────────
const accountBtn = document.getElementById("account-menu-btn");
const accountDropdown = document.getElementById("account-dropdown");

accountBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  const isOpen = accountDropdown?.classList.contains("open");
  document.querySelectorAll(".account-dropdown.open").forEach((d) => d.classList.remove("open"));
  if (!isOpen) accountDropdown?.classList.add("open");
});

document.addEventListener("click", (e) => {
  const wrap = document.getElementById("account-btn-wrap");
  if (wrap && !wrap.contains(e.target)) {
    accountDropdown?.classList.remove("open");
  }
});

document.getElementById("acct-buy-credits")?.addEventListener("click", () => {
  accountDropdown?.classList.remove("open");
  showSection("usage");
  loadUsage();
});

// ─── Tour / "Come si usa" ────────────────────────────────────────────────────
const tourSteps = [
  {
    selector: '.nav-btn[data-section="feed"]',
    title: "Feed",
    desc: "Qui trovi tutte le risorse che hai salvato: trascrizioni YouTube e pagine web convertite in markdown. Puoi scaricarle singolarmente con il pulsante MD. In alto trovi anche il convertitore Link → Markdown per estrarre nuove pagine.",
  },
  {
    selector: ".convert-card",
    title: "Link → Markdown",
    desc: "Incolla un URL e premi Estrai per convertire qualsiasi pagina web in formato Markdown. Il risultato può essere copiato negli appunti o scaricato come file .md.",
  },
  {
    selector: '.nav-btn[data-section="usage"]',
    title: "Usage",
    desc: "Monitora il consumo dei tuoi crediti. Ogni risorsa salvata consuma crediti in base al tipo (YouTube: 10, Web: 3, PDF: 8). Puoi vedere la cronologia delle risorse e ricaricare i crediti scegliendo un piano.",
  },
  {
    selector: '.nav-btn[data-section="connections"]',
    title: "Connessioni",
    desc: "Collega Skillgrowth ai tuoi strumenti: Codex, Claude, Cursor (via MCP), API Key per sviluppatori, e CLI. Lo stato di ogni connessione viene verificato in tempo reale. Clicca su una connessione per configurarla.",
  },
  {
    selector: "#account-menu-btn",
    title: "Account",
    desc: "Gestisci il tuo profilo e abbonamento. Da qui puoi comprare crediti aggiuntivi, vedere il saldo, e disconnetterti.",
  },
];

let tourIndex = 0;

function startTour() {
  tourIndex = 0;
  showTourStep(tourIndex);
}

function showTourStep(index) {
  const overlay = document.getElementById("tour-overlay");
  const popup = document.getElementById("tour-popup");
  const stepNum = document.getElementById("tour-step-num");
  const title = document.getElementById("tour-title");
  const desc = document.getElementById("tour-desc");
  const backBtn = document.getElementById("tour-back-btn");
  const nextBtn = document.getElementById("tour-next-btn");
  const dots = document.getElementById("tour-dots");

  const step = tourSteps[index];
  if (!step) return;

  const target = document.querySelector(step.selector);
  if (!target) return;

  // Rimuovi highlight precedenti
  document.querySelectorAll(".tour-highlight").forEach((el) => el.classList.remove("tour-highlight"));

  // Aggiungi highlight
  target.classList.add("tour-highlight");

  // Overlay
  overlay.classList.add("active");

  // Step number
  stepNum.textContent = `${index + 1}/${tourSteps.length}`;

  // Title & desc
  title.textContent = step.title;
  desc.textContent = step.desc;

  // Back / Next
  backBtn.style.display = index === 0 ? "none" : "flex";
  nextBtn.textContent = index === tourSteps.length - 1 ? "Fine" : "Avanti";

  // Dots
  dots.innerHTML = tourSteps
    .map((_, i) => `<span class="tour-dot${i === index ? " active" : ""}"></span>`)
    .join("");

  // Posiziona il popup accanto al target
  positionTourPopup(target, popup);

  popup.classList.add("active");
}

function positionTourPopup(target, popup) {
  const targetRect = target.getBoundingClientRect();
  const popupWidth = 260;

  // Posiziona a destra del target, centrato verticalmente
  let left = targetRect.right + 10;
  let top = targetRect.top + targetRect.height / 2 - 60;

  // Se non c'è spazio a destra, metti a sinistra
  if (left + popupWidth > window.innerWidth - 10) {
    left = targetRect.left - popupWidth - 10;
  }

  // Limita in verticale
  if (top < 10) top = 10;
  if (top + 160 > window.innerHeight) top = window.innerHeight - 170;

  popup.style.left = left + "px";
  popup.style.top = top + "px";
}

function endTour() {
  const overlay = document.getElementById("tour-overlay");
  const popup = document.getElementById("tour-popup");
  overlay.classList.remove("active");
  popup.classList.remove("active");
  document.querySelectorAll(".tour-highlight").forEach((el) => el.classList.remove("tour-highlight"));
}

document.getElementById("tour-back-btn")?.addEventListener("click", () => {
  if (tourIndex > 0) {
    tourIndex--;
    showTourStep(tourIndex);
  }
});

document.getElementById("tour-next-btn")?.addEventListener("click", () => {
  if (tourIndex < tourSteps.length - 1) {
    tourIndex++;
    showTourStep(tourIndex);
  } else {
    endTour();
  }
});

// Click overlay chiude il tour
document.getElementById("tour-overlay")?.addEventListener("click", endTour);

document.getElementById("acct-how-to-use")?.addEventListener("click", () => {
  accountDropdown?.classList.remove("open");
  startTour();
});

document.getElementById("acct-logout-btn")?.addEventListener("click", async () => {
  accountDropdown?.classList.remove("open");
  chrome.runtime.sendMessage({ action: "sg_logout" }, async () => {
    currentToken = "";
    currentEmail = "";
    if (emailInput) emailInput.value = "";
    if (codeInput) codeInput.value = "";
    if (emailError) emailError.classList.remove("show");
    if (codeError) codeError.classList.remove("show");
    if (emailStatus) emailStatus.textContent = "";
    if (codeStatus) codeStatus.textContent = "";
    showStep(stepEmail);
    if (emailInput) emailInput.focus();
  });
});

function updateAccountDropdown(email, name, plan, creditsUsed, planCredits) {
  const display = name || email || "Utente";
  const avatarEl = document.getElementById("acct-dropdown-avatar");
  const nameEl = document.getElementById("acct-dropdown-name");
  const planEl = document.getElementById("acct-dropdown-plan");
  const creditsEl = document.getElementById("acct-dropdown-credits");

  if (avatarEl) avatarEl.textContent = display.charAt(0).toUpperCase();
  if (nameEl) nameEl.textContent = display;
  if (planEl) planEl.textContent = (plan || "free").toUpperCase();
  if (creditsEl) creditsEl.textContent = `${creditsUsed || 0} / ${planCredits || 100}`;
}

// ─── Apri Dashboard ──────────────────────────────────────────────────────────
document.getElementById("open-dashboard-btn")?.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "sg_open_dashboard" });
});

document.getElementById("login-on-site-btn")?.addEventListener("click", async () => {
  const server = await getServerUrl();
  chrome.tabs.create({ url: `${server}/login` });
});

// ─── Azioni: Converti & Crea Skill ───────────────────────────────────────────
document.getElementById("action-convert")?.addEventListener("click", async () => {
  setStatus("Apertura clipper...");
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]?.id) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "convertToMarkdown" }, () => {
      if (chrome.runtime.lastError) {
        setStatus("Errore: ricarica la pagina.", 3000);
      } else {
        setStatus("Clipper aperto!", 2000);
        if (typeof onActionSuccess === "function") onActionSuccess();
      }
    });
  }
});

document.getElementById("action-skill")?.addEventListener("click", async () => {
  setStatus("Apertura clipper...");
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]?.id) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "createSkill" }, () => {
      if (chrome.runtime.lastError) {
        setStatus("Errore: ricarica la pagina.", 3000);
      } else {
        setStatus("Clipper aperto!", 2000);
        if (typeof onActionSuccess === "function") onActionSuccess();
      }
    });
  }
});

// ─── Settings: Server URL ────────────────────────────────────────────────────
async function loadServerUrl() {
  const url = await getServerUrl();
  const input = document.getElementById("server-url-input");
  if (input) input.value = url;
}

const settingsToggle = document.createElement("button");
settingsToggle.className = "settings-toggle-btn";
settingsToggle.textContent = "⚙ Impostazioni";
settingsToggle.addEventListener("click", () => {
  const panel = document.getElementById("settings-panel");
  if (panel) {
    panel.classList.toggle("open");
    if (panel.classList.contains("open")) loadServerUrl();
  }
});

// Settings toggle (sidepanel: connections section; popup: main-ui legacy)
const settingsPanel = document.getElementById("settings-panel");
if (settingsPanel && !document.getElementById("section-connections")) {
  const mainUIEl = document.getElementById("main-ui");
  if (mainUIEl) mainUIEl.appendChild(settingsToggle);
} else if (settingsPanel) {
  settingsPanel.parentNode?.insertBefore(settingsToggle, settingsPanel);
}

document.getElementById("save-url-btn")?.addEventListener("click", async () => {
  const url = document.getElementById("server-url-input")?.value.trim();
  if (!url) { setStatus("Inserisci un URL valido.", 2000); return; }
  try {
    new URL(url);
  } catch {
    setStatus("URL non valido. Es: https://skillgrowth.app", 3000);
    return;
  }
  await chrome.storage.local.set({ [SERVER_URL_KEY]: url });
  setStatus("Server URL aggiornato!", 2000);
});

// ─── Storage change listener (sync tra popup e sidepanel) ───────────────────
chrome.storage.onChanged.addListener((changes) => {
  if (changes[VERIFIED_KEY] && !changes[VERIFIED_KEY].newValue) {
    showStep(stepEmail);
  }
  if (changes[TOKEN_KEY] && changes[TOKEN_KEY].newValue && !changes[TOKEN_KEY].oldValue) {
    checkVerification();
  }
});

// ─── MCP Banner ──────────────────────────────────────────────────────────────
async function initMcpBanner() {
  const banner = document.getElementById("mcp-banner");
  if (!banner) return;

  const docsLink = document.getElementById("mcp-docs-link");
  if (docsLink) {
    getServerUrl().then((server) => {
      docsLink.href = `${server}/docs/mcp`;
    });
  }

  const result = await chrome.storage.local.get([MCP_URL_KEY, MCP_DISMISSED_KEY]);
  const mcpUrl = result[MCP_URL_KEY] || "";
  const dismissed = result[MCP_DISMISSED_KEY] || false;

  const input = document.getElementById("mcp-url-input");
  if (input && mcpUrl) input.value = mcpUrl;

  if (!mcpUrl && !dismissed) {
    banner.classList.add("visible");
  }

  const closeBtn = document.getElementById("mcp-banner-close");
  closeBtn?.addEventListener("click", async () => {
    await chrome.storage.local.set({ [MCP_DISMISSED_KEY]: true });
    banner.style.transition = "opacity 0.3s, transform 0.3s";
    banner.style.opacity = "0";
    banner.style.transform = "translateY(-4px)";
    setTimeout(() => {
      banner.classList.remove("visible");
      banner.style.transition = "";
      banner.style.opacity = "";
      banner.style.transform = "";
    }, 300);
  });

  const saveBtn = document.getElementById("mcp-save-btn");
  saveBtn?.addEventListener("click", async () => {
    const val = input?.value?.trim();
    if (!val) {
      if (input) input.style.borderColor = SG_THEME.cyanBorder(0.5);
      setTimeout(() => { if (input) input.style.borderColor = ""; }, 1500);
      return;
    }
    try { new URL(val); } catch {
      if (input) input.style.borderColor = SG_THEME.cyanBorder(0.5);
      setTimeout(() => { if (input) input.style.borderColor = ""; }, 1500);
      return;
    }
    await chrome.storage.local.set({ [MCP_URL_KEY]: val });
    updateConnectionStatuses();
    banner.style.transition = "opacity 0.3s, transform 0.3s";
    banner.style.opacity = "0";
    banner.style.transform = "translateY(-4px)";
    setTimeout(() => {
      banner.classList.remove("visible");
      banner.style.transition = "";
      banner.style.opacity = "";
      banner.style.transform = "";
    }, 300);
  });
}

// ─── Connection Status ───────────────────────────────────────────────────────
async function updateConnectionStatuses() {
  const result = await chrome.storage.local.get([MCP_URL_KEY]);
  const mcpUrl = result[MCP_URL_KEY] || "";

  // ── MCP ──
  const mcpDot = document.querySelector("#conn-status-mcp .status-dot");
  const mcpLabel = document.querySelector("#conn-status-mcp .status-label");
  const mcpDesc = document.getElementById("conn-desc-mcp");

  if (mcpUrl) {
    if (mcpDot) mcpDot.className = "status-dot active";
    if (mcpLabel) mcpLabel.textContent = "Connesso";
    if (mcpDesc) mcpDesc.textContent = mcpUrl;
  } else {
    if (mcpDot) mcpDot.className = "status-dot inactive";
    if (mcpLabel) mcpLabel.textContent = "Non configurato";
    if (mcpDesc) mcpDesc.textContent = "Model Context Protocol";
  }
}

// Make connection cards clickable
document.querySelectorAll(".conn-card").forEach((card) => {
  card.style.cursor = "pointer";
  card.addEventListener("click", async () => {
    const conn = card.dataset.conn;
    const server = await getServerUrl();
    const status = document.getElementById("main-status");

    if (status) {
      status.textContent = "";
      status.className = "status-text";
    }

    switch (conn) {
      case "mcp":
        showSection("feed");
        document.getElementById("mcp-url-input")?.focus();
        break;

    }
  });
});

// ─── Connection copy buttons ─────────────────────────────────────────────────
document.querySelectorAll(".conn-copy-btn").forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    e.stopPropagation();
    const cmd = btn.dataset.cmd;
    if (!cmd) return;
    try {
      await navigator.clipboard.writeText(cmd);
      btn.textContent = "Copiato!";
      btn.classList.add("copied");
      setTimeout(() => {
        btn.textContent = "Copia comando";
        btn.classList.remove("copied");
      }, 2000);
    } catch {
      btn.textContent = "Errore";
      setTimeout(() => { btn.textContent = "Copia comando"; }, 2000);
    }
  });
});

// ─── Feed: search input + popup close ────────────────────────────────────────
const feedSearchInput = document.getElementById("feed-search-input");
if (feedSearchInput) {
  feedSearchInput.addEventListener("input", () => {
    currentSearchQuery = feedSearchInput.value;
    renderFeedWithFilters();
  });
}

document.addEventListener("click", (e) => {
  const popup = document.getElementById("folder-popup");
  if (popup && popup.style.display === "block" && !e.target.closest(".folder-popup") && !e.target.closest(".folder-assign-btn")) {
    popup.style.display = "none";
  }
});

// ─── Avvio ───────────────────────────────────────────────────────────────────
checkVerification();

