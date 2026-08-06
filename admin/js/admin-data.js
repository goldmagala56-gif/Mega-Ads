let heroData  = [];
let tilesData = [];
let flashData = [];
let dealsData = [];
let catalogData = [];
let adminDataReady = false;

async function loadAllAdminData() {
  const [productsRes, heroRes, tilesRes] = await Promise.all([
    fetch('/api/products'), fetch('/api/hero'), fetch('/api/tiles'),
  ]);
  const products = await productsRes.json();
  heroData  = await heroRes.json();
  tilesData = await tilesRes.json();

  dealsData   = products.filter(p => p.section === 'deals');
  flashData   = products.filter(p => p.section === 'flash');
  catalogData = products.filter(p => p.section === 'catalog');

  adminDataReady = true;
  document.dispatchEvent(new Event('megaads-admin:data-ready'));
}

function onAdminDataReady(cb) {
  if (adminDataReady) cb();
  else document.addEventListener('megaads-admin:data-ready', cb, { once: true });
}

// =====================
// IMAGE LIBRARY — now Postgres-backed via /api/library, shared across
// every browser/device the admin logs in from.
// =====================
async function loadLibrary() {
  try {
    const res = await fetch('/api/library');
    if (!res.ok) return [];
    return await res.json();
  } catch (e) { return []; }
}

async function saveToLibrary(url) {
  if (!url) return;
  try {
    await fetch('/api/library', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
  } catch (e) { /* non-fatal — image is already uploaded either way */ }
}

loadAllAdminData();