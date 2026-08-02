// =====================
// ADMIN DATA
// Live working copies, loaded from the server API (server/data-store.js)
// instead of localStorage. Every add/edit/delete in admin.js calls the
// API directly and then updates these arrays from the server's response,
// so they always reflect what's actually saved on disk.
// =====================

let heroData  = [];
let tilesData = [];
let flashData = [];
let dealsData = [];
let catalogData = [];   // NEW

async function loadAllAdminData() {
  const [productsRes, heroRes, tilesRes] = await Promise.all([
    fetch('/api/products'), fetch('/api/hero'), fetch('/api/tiles'),
  ]);
  const products = await productsRes.json();
  heroData  = await heroRes.json();
  tilesData = await tilesRes.json();

  dealsData   = products.filter(p => p.section === 'deals');
  flashData   = products.filter(p => p.section === 'flash');
  catalogData = products.filter(p => p.section === 'catalog');   // NEW

  adminDataReady = true;
  document.dispatchEvent(new Event('megaads-admin:data-ready'));
}

let adminDataReady = false;

async function loadAllAdminData() {
  const [productsRes, heroRes, tilesRes] = await Promise.all([
    fetch('/api/products'),
    fetch('/api/hero'),
    fetch('/api/tiles'),
  ]);

  const products = await productsRes.json();
  heroData  = await heroRes.json();
  tilesData = await tilesRes.json();

  dealsData = products.filter(p => p.section === 'deals');
  flashData = products.filter(p => p.section === 'flash');

  adminDataReady = true;
  document.dispatchEvent(new Event('megaads-admin:data-ready'));
}

function onAdminDataReady(cb) {
  if (adminDataReady) cb();
  else document.addEventListener('megaads-admin:data-ready', cb, { once: true });
}

// =====================
// IMAGE LIBRARY
// This stays in localStorage — it's just a personal shortcut list of
// recently-used image URLs for this browser, not real inventory data,
// so it's fine if it doesn't sync across devices.
// =====================
function loadLibrary() {
  try {
    return JSON.parse(localStorage.getItem('megaads_library') || '[]');
  } catch(e) { return []; }
}

function saveToLibrary(url) {
  if (!url) return;
  const lib = loadLibrary();
  if (!lib.includes(url)) { lib.unshift(url); }
  localStorage.setItem('megaads_library', JSON.stringify(lib.slice(0, 100)));
}

// kick off the initial load
loadAllAdminData();