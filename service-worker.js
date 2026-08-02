// =====================
// MEGA ADS SERVICE WORKER
// Bump CACHE_VERSION any time you change cached files, so returning
// visitors pick up the new versions instead of stale cached ones.
// =====================
const CACHE_VERSION = 'v3';
const SHELL_CACHE = 'megaads-shell-' + CACHE_VERSION;
const RUNTIME_CACHE = 'megaads-runtime-' + CACHE_VERSION;

// The "app shell" — static files needed to render the basic page layout
// even before any network request succeeds. Cached up front on install.
const SHELL_FILES = [
  '/',
  '/index.html',
  '/cart.html',
  '/product.html',
  '/login.html',
  '/track.html',
  '/services.html',
  '/partnership.html',
  '/offline.html',
  '/css/style.css',
  '/css/cart.css',
  '/css/product.css',
  '/css/services.css',
  '/css/partnership.css',
  '/js/app.js',
  '/js/data.js',
  '/js/product.js',
  '/js/cart.js',
  '/js/services.js',
  '/js/partnership.js',
  '/manifest.json',
  '/images/icons/icon-192.png',
  '/images/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      // addAll fails entirely if ANY single file 404s — cache what we can
      // individually instead, so one missing/renamed file doesn't break
      // the whole install.
      return Promise.all(
        SHELL_FILES.map((url) =>
          cache.add(url).catch((err) => console.warn('[SW] Skipped caching', url, err.message))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET requests from our own origin — never intercept
  // POST/PUT/DELETE (checkout, admin edits, uploads) or cross-origin
  // requests (Flutterwave's own script, etc.).
  if (req.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Page navigations: try the network first (so you always see the
  // latest page while online), fall back to cache, then to offline.html.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put(req, clone));
          return res;
        })
        .catch(() =>
          caches.match(req).then((cached) => cached || caches.match('/offline.html'))
        )
    );
    return;
  }

  // API data (products/hero/tiles): network first, but cache successful
  // responses so the storefront can still show the last-known catalog
  // if the connection drops.
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, clone));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Everything else (css/js/images/uploads): cache-first, refresh in the
  // background so updates still arrive without slowing down the current load.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});