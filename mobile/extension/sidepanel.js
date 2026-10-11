/**
 * sidepanel.js — Logica specifica del side panel
 */

function onActionSuccess() {
  const status = document.getElementById("main-status");
  if (status) {
    status.textContent = "✓ Clipper aperto sulla pagina";
    status.className = "status-text success";
    setTimeout(() => {
      status.textContent = "";
      status.className = "status-text";
    }, 3000);
  }
  updateAvatarFromStorage();
}

async function updateAvatarFromStorage() {
  const result = await chrome.storage.local.get(["sg_name", "sg_email"]);
  const display = result.sg_name || result.sg_email || "S";
  const avatarEl = document.getElementById("user-avatar");
  if (avatarEl) {
    avatarEl.textContent = display.charAt(0).toUpperCase();
  }
}

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

const sectionConnections = document.getElementById("section-connections");
if (sectionConnections) {
  mainUIObserver.observe(sectionConnections, { attributes: true });
}

