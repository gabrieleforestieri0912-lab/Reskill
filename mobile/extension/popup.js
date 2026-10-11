/**
 * popup.js — Logica specifica del popup
 *
 * Il popup si chiude quando si clicca fuori, quindi onActionSuccess
 * aggiorna lo status e poi chiude automaticamente il popup dopo
 * un breve delay (UX: conferma visiva poi chiude).
 */

/**
 * Chiamata da shared.js dopo un'azione andata a buon fine.
 * Nel popup: mostra conferma e chiude dopo 1.5 secondi.
 */
function onActionSuccess() {
  const status = document.getElementById("main-status");
  if (status) {
    status.textContent = "✓ Clipper aperto!";
    status.style.color = "oklch(72% .06 240)";
  }

  // Il popup si chiude automaticamente dopo che il clipper è aperto
  setTimeout(() => {
    window.close();
  }, 1200);
}

/**
 * Aggiorna l'avatar con la prima lettera del nome o email
 */
async function updateAvatarFromStorage() {
  const result = await chrome.storage.local.get(["sg_name", "sg_email"]);
  const display = result.sg_name || result.sg_email || "S";
  const avatarEl = document.getElementById("user-avatar");
  if (avatarEl) {
    avatarEl.textContent = display.charAt(0).toUpperCase();
  }
}

// Aggiorna l'avatar quando la main-ui diventa attiva
const mainUIObserver = new MutationObserver((mutations) => {
  mutations.forEach((m) => {
    if (m.type === "attributes" && m.attributeName === "class") {
      const target = m.target;
      if (target.classList.contains("active")) {
        updateAvatarFromStorage();
      }
    }
  });
});

const mainUIEl = document.getElementById("main-ui");
if (mainUIEl) {
  mainUIObserver.observe(mainUIEl, { attributes: true });
}

