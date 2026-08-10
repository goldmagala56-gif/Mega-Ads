// =====================
// CURRENCY STATE
// =====================
const rates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  UGX: 3720,
  KES: 129,
  NGN: 1580,
  GHS: 15.2,
  CNY: 7.25,
  INR: 83.5,
};
const symbols = {
  USD: '$', EUR: '\u20ac', GBP: '\u00a3',
  UGX: 'UGX ', KES: 'KES ', NGN: '\u20a6',
  GHS: 'GH\u20b5', CNY: '\u00a5', INR: '\u20b9',
};

let currentCurrency = 'USD';

function convertPrice(usdAmount) {
  const rate = rates[currentCurrency] || 1;
  const symbol = symbols[currentCurrency] || '$';
  const converted = (usdAmount * rate).toFixed(currentCurrency === 'USD' ? 2 : 0);
  return symbol + converted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function convertPriceRaw(usdAmount) {
  const rate = rates[currentCurrency] || 1;
  return Math.round(usdAmount * rate * 100) / 100;
}

function parseUSD(priceStr) {
  return parseFloat(priceStr.replace(/[^0-9.]/g, ''));
}

function refreshPrices() {
  document.querySelectorAll('[data-usd]').forEach(el => {
    el.textContent = convertPrice(parseFloat(el.dataset.usd));
  });
}

function setCurrency(code, flagHtml, symbol) {
  currentCurrency = code;
  const codeEl = document.getElementById('currencyCode');
  const flagEl = document.getElementById('currencyFlag');
  if (codeEl) codeEl.textContent = code;
  if (flagEl) flagEl.innerHTML = flagHtml;
  document.querySelectorAll('.currency-option').forEach(o => o.classList.remove('active'));
  if (event && event.currentTarget) event.currentTarget.classList.add('active');
  toggleCurrencyDropdown();
  refreshPrices();
  showToast('Currency changed to ' + code);
}

function toggleCurrencyDropdown() {
  const dd = document.getElementById('currencyDropdown');
  if (dd) dd.classList.toggle('open');
}

document.addEventListener('click', function(e) {
  const dd = document.getElementById('currencyDropdown');
  if (dd && !e.target.closest('.currency-switcher')) {
    dd.classList.remove('open');
  }
});

// =====================
// MOBILE DRAWER
// =====================
function openDrawer() {
  const drawer = document.getElementById('cat-drawer');
  const overlay = document.getElementById('cat-drawer-overlay');
  if (!drawer || !overlay) { window.location.href = 'index.html'; return; }
  drawer.classList.add('open');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  document.getElementById('cat-drawer').classList.remove('open');
  document.getElementById('cat-drawer-overlay').classList.remove('open');
  document.body.style.overflow = '';
}
function openSiteMenu() {
  document.getElementById('site-menu').classList.add('open');
  document.getElementById('site-menu-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeSiteMenu() {
  document.getElementById('site-menu').classList.remove('open');
  document.getElementById('site-menu-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// =====================
// RENDER SIDEBAR CATEGORIES
// =====================
function renderSidebarCategories() {
  const html = sidebarCategories.map(cat =>
    `<li><a href="#" onclick="filterByCategory('${cat.slug}'); closeDrawer(); return false;">${cat.name}</a></li>`
  ).join('');
  const desktop = document.getElementById('catList');
  const drawer  = document.getElementById('catListDrawer');
  if (desktop) desktop.innerHTML = html;
  if (drawer)  drawer.innerHTML  = html;
}

// =====================
// HERO SLIDER (data-driven, picks up admin panel images)
// =====================
function renderHeroSlides() {
  const wrap = document.getElementById('heroSlidesWrap');
  const dotsWrap = document.getElementById('heroDots');
  if (!wrap || !dotsWrap) return;

  wrap.innerHTML = heroSlides.map((s, i) => `
    <div class="hero-slide ${i === 0 ? 'active' : ''}" style="background:${s.bg};">
      <div class="hero-slide-content">
        <h2>${s.subtitle}</h2>
        <p>${s.text}</p>
        <a href="#" class="hero-cta">${s.cta || 'Shop Now'} &#8594;</a>
      </div>
      ${s.img
        ? `<div class="hero-slide-bg" style="background-image:url('${s.img}')"></div>`
        : `<div class="hero-slide-visual">${s.icon}</div>`}
    </div>
  `).join('');

  dotsWrap.innerHTML = heroSlides.map((s, i) => `<span class="dot ${i === 0 ? 'active' : ''}" onclick="goSlide(${i})"></span>`).join('');
  currentSlide = 0;
}

// =====================
// CATEGORY TILES (data-driven, picks up admin panel images)
// =====================
function renderCategoryTiles() {
  const wrap = document.getElementById('catTiles');
  if (!wrap) return;
  wrap.innerHTML = categoryTiles.map(t => `
    <div class="cat-tile ${t.tileClass}" onclick="filterByCategory('${t.slug}')">
      <div class="tile-label">
        <span>${t.name}</span>
        <span class="tile-btn">View &gt;</span>
      </div>
      ${t.img
        ? `<div class="cat-tile-media"><img src="${t.img}" alt=""/></div>`
        : `<div class="tile-icon">${t.icon}</div>`}
    </div>
  `).join('');
}

// =====================
// RENDER FLASH PRODUCTS
// =====================
function renderFlashProducts() {
  const el = document.getElementById('flashProducts');
  if (!el) return;
  const itemHtml = flashProducts.map(p => `
    <div class="flash-product" onclick="window.location.href='product.html?id=${p.id}'">
      <div class="fp-img">${p.img ? `<img src="${p.img}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:6px"/>` : p.icon}</div>
      <div class="fp-name">${p.name}</div>
      <div class="fp-price"><span data-usd="${p.usd}">${convertPrice(p.usd)}</span></div>
    </div>
  `).join('');
  el.innerHTML = itemHtml + itemHtml; // duplicated so translateX(-50%) loops seamlessly
}

function scrollFlash() {
  const track = document.getElementById('flashProducts');
  if (track) track.classList.toggle('paused');
}

// =====================
// RENDER DEALS GRID
// =====================
function renderDeals(items, gridId) {
  gridId = gridId || 'dealsGrid';
  items = items || deals;
  const grid = document.getElementById(gridId);
  if (!grid) return;
  if (!items.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:48px;color:#888;font-size:15px;">No products found.</div>';
    return;
  }
  grid.innerHTML = items.map(d => `
    <div class="deal-card" onclick="window.location.href='product.html?id=${d.id}'">
      ${d.discount ? `<div class="deal-badge">${d.discount}</div>` : ''}
      <div class="deal-img">${d.img ? `<img src="${d.img}" alt=""/>` : d.icon}</div>
      <div class="deal-info">
        <div class="deal-price"><span data-usd="${d.usd}">${convertPrice(d.usd)}</span></div>
        <div class="deal-name">${d.name}</div>
      </div>
      <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${d.name.replace(/'/g,"\\'")}', ${d.usd}, '${d.icon}', '${d.img || ''}')">+ Add to Cart</button>
    </div>
  `).join('');
}

// =====================
// HERO SLIDER MECHANICS
// =====================
let currentSlide = 0;

function getSlides() { return document.querySelectorAll('.hero-slide'); }
function getDots()   { return document.querySelectorAll('.dot'); }

function goSlide(n) {
  const sl = getSlides(), dt = getDots();
  if (!sl.length) return;
  sl[currentSlide].classList.remove('active');
  if (dt[currentSlide]) dt[currentSlide].classList.remove('active');
  currentSlide = (n + sl.length) % sl.length;
  sl[currentSlide].classList.add('active');
  if (dt[currentSlide]) dt[currentSlide].classList.add('active');
}
function nextSlide() { goSlide(currentSlide + 1); }
function prevSlide() { goSlide(currentSlide - 1); }
function startSlider() {
  if (!getSlides().length) return;
  setInterval(nextSlide, 4000);
}

// =====================
// COUNTDOWN TIMER
// =====================
function startCountdown() {
  const chEl = document.getElementById('ch');
  const cmEl = document.getElementById('cm');
  const csEl = document.getElementById('cs');
  if (!chEl || !cmEl || !csEl) return;

  let total = 7 * 3600 + 29 * 60 + 54;
  function tick() {
    if (total <= 0) total = 8 * 3600;
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    chEl.textContent = String(h).padStart(2,'0');
    cmEl.textContent = String(m).padStart(2,'0');
    csEl.textContent = String(s).padStart(2,'0');
    total--;
  }
  tick();
  setInterval(tick, 1000);
}

// =====================
// CART
// =====================
let cart = [];

const CART_STORAGE_KEY = 'megaads_cart';

function loadCart() {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    cart = saved ? JSON.parse(saved) : [];
  } catch (e) {
    cart = [];
  }
}

function persistCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    // ignore storage errors
  }
}

function syncCartBadges() {
  const count = cart.length;
  const el = document.getElementById('cartCount');
  if (el) el.textContent = count;
  const mob = document.getElementById('cartCountMobile');
  if (mob) mob.textContent = count;
}

function addToCart(name, usdPrice, icon, img) {
  cart.push({ name, usdPrice, icon, img: img || '' });
  persistCart();
  syncCartBadges();
  showToast(icon + ' Added to cart!');
}

function openCart() {
  window.location.href = 'cart.html';
}

function addToCartPage() {
  const p = currentProduct;
  const unitPrice = (activeVariantPrice !== null) ? activeVariantPrice : p.usd;
  const activeLabel = document.querySelector('.gallery-thumb.active .thumb-variant-label');
  const itemName = activeLabel ? `${p.name} — ${activeLabel.textContent}` : p.name;
  const currentImg = document.getElementById('mainImg').src;

  for (let i = 0; i < currentQty; i++) {
    cart.push({ name: itemName, usdPrice: unitPrice, icon: p.icon, img: currentImg });
  }
  persistCart();
  syncCartBadges();
  showToast(p.icon + ' Added ' + currentQty + ' to cart!');
}

// =====================
// SEARCH
// =====================
function handleSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;
  const q = input.value.trim().toLowerCase();
  if (!q) { renderDeals(); return; }
  const allSearchable = [...deals, ...flashProducts, ...catalogProducts];
  const results = allSearchable.filter(d => d.name.toLowerCase().includes(q));
  renderDeals(results);
  const grid = document.getElementById('dealsGrid');
  if (grid) grid.scrollIntoView({ behavior: 'smooth' });
}

// =====================
// FILTER BY CATEGORY
// =====================
function filterByCategory(slug) {
  const map = {
    'clothing':        ['shirt','sweater','nightgown','t-shirt'],
    'shoes':           ['shoes','sneaker','boots'],
    'luggage-bags':    ['bag'],
    'watch-jewelry':   ['watch','ring'],
    'kids-toys':       ['baby','toy'],
    'home-appliances': ['door','disco','bottle'],
    'beauty':          ['serum','tea','herbal','towel'],
    'electronics':     ['bluetooth','earbuds','guitar','headphone'],
    'phones-tel':      ['phone'],
    'mens-shoes':      ['leather','shoes','sneaker'],
    'womens-shoes':    ['shoes','heels','sandal','nightgown'],
    'accessories':     ['watch','bag','ring','sunglasses'],
    'phones':          ['phone','bluetooth','earbuds'],
    'weddings':        ['ring','wedding'],
    'hair':            ['hair','towel'],
    'computer':        ['computer','laptop','usb'],
  };
  const keys = map[slug] || [slug.replace(/-/g,' ')];
  const results = deals.filter(d => keys.some(k => d.name.toLowerCase().includes(k)));
  renderDeals(results.length ? results : deals);
  const grid = document.getElementById('dealsGrid');
  if (grid) grid.scrollIntoView({ behavior: 'smooth' });
}

// =====================
// TOAST
// =====================
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._t);
  t._t = setTimeout(() => { t.style.opacity = '0'; }, 2600);
}

// =====================
// INIT
// app.js is loaded on index.html, cart.html, and product.html, so every
// page-specific piece of init is guarded to only run when its elements
// are present. Product-catalog-dependent rendering additionally waits
// for onDataReady() (defined in data.js) since that data now loads
// asynchronously from the server instead of being hardcoded.
// =====================
document.addEventListener('DOMContentLoaded', function () {
  loadCart();
  syncCartBadges();

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleSearch();
    });
  }

  if (document.getElementById('catList') || document.getElementById('catListDrawer')) {
    renderSidebarCategories();
  }
  if (document.getElementById('ch')) {
    startCountdown();
  }

  onDataReady(function () {
    if (document.getElementById('flashProducts')) {
      renderFlashProducts();
    }
    if (document.getElementById('dealsGrid')) {
      renderDeals();
    }
    if (document.getElementById('heroSlidesWrap')) {
      renderHeroSlides();
    }
    if (document.getElementById('catTiles')) {
      renderCategoryTiles();
    }
    if (window.location.hash === '#categories') {
      openDrawer();
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    if (getSlides().length) {
      startSlider();
    }
    
  });
});
