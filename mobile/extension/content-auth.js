/**
 * content-auth.js
 * Iniettato SOLO su reskill.app e localhost:3000.
 * Funzione: fare da ponte tra la sessione web NextAuth (ha i cookie)
 * e il background service worker dell'estensione (non ha i cookie).
 *
 * Flusso:
 * 1. Appena la pagina è caricata, chiama /api/extension/link-session (GET)
 *    con credentials="include" → il cookie Next-Auth è disponibile qui!
 * 2. Se la chiamata ha successo, invia il token al background via
 *    chrome.runtime.sendMessage → background lo salva in chrome.storage.local
 * 3. Ascolta messaggi dal background per gestire il logout dal sito
 */

(async function () {
  // Aspetta che il documento sia pronto
  if (document.readyState === "loading") {
    await new Promise((resolve) =>
      document.addEventListener("DOMContentLoaded", resolve, { once: true })
    );
  }

  const BASE = window.location.origin; // https://reskill.app o http://localhost:3000
  let linkInProgress = false;

  /**
   * Verifica se l'estensione ha già un token valido nello storage.
   */
  async function hasExistingToken() {
    try {
      const result = await chrome.storage.local.get(["sg_verified", "sg_token"]);
      return !!(result.sg_verified && result.sg_token);
    } catch {
      return false;
    }
  }

  /**
   * Tenta di collegare la sessione web all'estensione.
   * Usa credentials: "include" che funziona perché siamo nel content script
   * della pagina stessa (non nell'extension page).
   */
  async function tryLinkSession() {
    if (linkInProgress) return;
    linkInProgress = true;
    try {
      const res = await fetch(`${BASE}/api/extension/link-session`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (data.verified && data.token && data.email) {
        chrome.runtime.sendMessage({
          action: "sg_session_linked",
          token: data.token,
          email: data.email,
          name: data.name || "",
        });
      }
    } catch (e) {
      // Silently fail — l'utente potrebbe non essere loggato
    } finally {
      linkInProgress = false;
    }
  }

  // Esegui subito solo se l'estensione non ha già un token
  const alreadyLinked = await hasExistingToken();
  if (!alreadyLinked) {
    tryLinkSession();
  }

  // Ascolta messaggi dal background (es. logout richiesto dall'estensione)
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === "sg_logout_web") {
      // L'utente ha fatto logout dall'estensione → esegui logout sul sito
      fetch(`${BASE}/api/auth/signout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callbackUrl: "/" }),
      })
        .then(() => sendResponse({ success: true }))
        .catch(() => sendResponse({ success: false }));
      return true; // async response
    }

    if (message.action === "sg_check_session") {
      // Il background vuole sapere se c'è una sessione attiva → ritenta il link
      tryLinkSession().then(() => sendResponse({ done: true }));
      return true;
    }
  });
})();
