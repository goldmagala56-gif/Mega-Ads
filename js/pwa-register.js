// =====================
// PWA REGISTRATION
// Include this on customer-facing pages (index.html, product.html, cart.html).
// Not needed on admin pages — the admin panel doesn't need offline support
// or a home-screen icon.
// =====================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}

// =====================
// CUSTOM "INSTALL APP" PROMPT
// Chrome/Edge suppress the automatic install banner unless you handle
// this event yourself, so we capture it and show our own button instead
// of relying on the browser's default UI.
// =====================
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  showInstallButton();
});

function showInstallButton() {
  if (document.getElementById('pwaInstallBtn')) return;

  const btn = document.createElement('button');
  btn.id = 'pwaInstallBtn';
  btn.textContent = '\u2B07\uFE0F Install App';
  btn.style.cssText = `
    position: fixed; bottom: 74px; right: 16px; z-index: 998;
    background: linear-gradient(135deg, #4f8ef7, #7b2ff7); color: #fff;
    border: none; padding: 11px 18px; border-radius: 26px;
    font-weight: 800; font-size: 13px; font-family: inherit; cursor: pointer;
    box-shadow: 0 4px 14px rgba(123,47,247,0.4);
  `;
  btn.onclick = async () => {
    if (!deferredInstallPrompt) return;
    btn.remove();
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
  };
  document.body.appendChild(btn);
}

window.addEventListener('appinstalled', () => {
  const btn = document.getElementById('pwaInstallBtn');
  if (btn) btn.remove();
  deferredInstallPrompt = null;
});