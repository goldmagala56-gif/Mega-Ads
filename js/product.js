// PRODUCT DETAIL PAGE LOGIC
// Reads ?id=xxx from URL, finds product in deals/flashProducts (data.js)
// =====================

let currentProduct = null;
let currentQty = 1;
let wishlisted = false;
let activeVariantPrice = null;

// Combine all products for lookup. Each item already carries its real
// server-assigned id (e.g. 'd-3', 'fl-2') from data.js — no more
// re-deriving ids from array position, which used to break the moment
// products were added/removed/reordered.
function getAllProducts() {
  const fromDeals = deals.map(d => ({ ...d, source: 'deals' }));
  const fromFlash = flashProducts.map(f => ({ ...f, discount: f.discount || '-10%', source: 'flash' }));
  const fromCatalog = catalogProducts.map(c => ({ ...c, source: 'catalog' }));
  return [...fromDeals, ...fromFlash, ...fromCatalog];
}

function getProductFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const all = getAllProducts();
  return all.find(p => p.id === id) || all[0];
}

function getProductGallery(p) {
  const raw = (p.images && p.images.length) ? p.images.slice() : [];
  // normalize: old plain-string entries become { img, label:'', usd:null }
  const gallery = raw.map(entry =>
    typeof entry === 'string' ? { img: entry, label: '', usd: null } : entry
  );
  if (p.img && !gallery.some(g => g.img === p.img)) {
    gallery.unshift({ img: p.img, label: '', usd: null });
  }
  return gallery;
}

// =====================
// RENDER PRODUCT
// =====================
function renderProduct() {
  currentProduct = getProductFromUrl();
  const p = currentProduct;

  if (!p) {
    document.getElementById('productTitle').textContent = 'Product not found';
    return;
  }

  document.title = p.name + ' — Mega Ads';
  document.getElementById('productTitle').textContent = p.name;
  document.getElementById('bcProduct').textContent = p.name;
  document.getElementById('bcCategory').textContent = guessCategory(p.name);

  const gallery = getProductGallery(p);
const mainImg = document.getElementById('mainImg');
mainImg.src = gallery.length ? gallery[0].img : emojiToDataUri(p.icon);

const thumbsWrap = document.getElementById('galleryThumbs');
thumbsWrap.innerHTML = gallery.length
  ? gallery.map((g, idx) => `
      <div class="gallery-thumb ${idx === 0 ? 'active' : ''}" onclick="selectThumb(this, ${idx})">
        <img src="${g.img}" alt=""/>
        ${g.label ? `<span class="thumb-variant-label">${g.label}</span>` : ''}
      </div>
    `).join('')
  : [0,1,2,3].map((n, idx) => `
      <div class="gallery-thumb ${idx === 0 ? 'active' : ''}" onclick="selectThumb(this)">
        <span>${p.icon}</span>
      </div>
    `).join('');

  refreshProductPrice();

  const badge = document.getElementById('badgeDiscount');
  if (p.discount) {
    badge.textContent = p.discount;
    badge.classList.add('show');
  }

  renderVariants(p);

  document.getElementById('stockNote').textContent = '\u2705 In Stock — Ships within 24h';
  document.getElementById('descContent').innerHTML = buildDescription(p);
  document.getElementById('specsTable').innerHTML = buildSpecs(p);
  document.getElementById('reviewsList').innerHTML = buildReviews();

  renderRelated(p);
  renderCurrencyPills();
  syncCartBadges();
}

function guessCategory(name) {
  const n = name.toLowerCase();
  if (n.includes('shoe') || n.includes('sneaker')) return 'Shoes';
  if (n.includes('watch')) return 'Watch & Jewelry';
  if (n.includes('phone') || n.includes('bluetooth') || n.includes('earbud')) return 'Electronics';
  if (n.includes('bag')) return 'Luggage & Bags';
  if (n.includes('baby')) return 'Kids & Toys';
  return 'General';
}

function emojiToDataUri(emoji) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
    <rect width="100%" height="100%" fill="#f5f6fa"/>
    <text x="50%" y="55%" font-size="160" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
  </svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

function selectThumb(el, galleryIndex) {
  document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  if (galleryIndex === undefined) return;

  const gallery = getProductGallery(currentProduct);
  const g = gallery[galleryIndex];
  document.getElementById('mainImg').src = g.img;

  // Update title + price only if this variant actually has its own values
  const titleEl = document.getElementById('productTitle');
  titleEl.textContent = g.label ? `${currentProduct.name} — ${g.label}` : currentProduct.name;

  if (g.usd !== null && g.usd !== undefined && g.usd !== '') {
    activeVariantPrice = g.usd;
  } else {
    activeVariantPrice = null;
  }
  refreshProductPrice();
}

// =====================
// PRICE + CURRENCY
// =====================
function refreshProductPrice() {
  const p = currentProduct;
  const unitPrice = (activeVariantPrice !== null) ? activeVariantPrice : p.usd;
  const total = unitPrice * currentQty;
  const display = document.getElementById('priceDisplay');
  const original = document.getElementById('priceOriginal');
  const saving = document.getElementById('priceSaving');
  const mobileBar = document.getElementById('mobilePriceBar');

  display.textContent = convertPrice(total);

  if (p.discount) {
    const pct = parseInt(p.discount.replace(/[^0-9]/g,'')) || 15;
    const originalUsd = total / (1 - pct/100);
    original.textContent = convertPrice(originalUsd);
    saving.textContent = 'Save ' + p.discount;
  } else {
    original.textContent = '';
    saving.textContent = '';
  }

  mobileBar.textContent = convertPrice(total);
}

function renderCurrencyPills() {
  const codes = ['USD','EUR','GBP','UGX','KES','NGN'];
  const wrap = document.getElementById('currencyPills');
  wrap.innerHTML = codes.map(c => `
    <span class="currency-pill ${c === currentCurrency ? 'active' : ''}" onclick="switchPillCurrency('${c}', this)">${c}</span>
  `).join('');
}

function switchPillCurrency(code, el) {
  currentCurrency = code;
  document.querySelectorAll('.currency-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  refreshProductPrice();
  refreshPrices();
}

// =====================
// VARIANTS
// =====================
function renderVariants(p) {
  const wrap = document.getElementById('variantSection');
  const isApparel = /shirt|shoe|sweater|coat|dress|suit/i.test(p.name);
  const isElectronic = /watch|phone|earbud|bluetooth/i.test(p.name);

  let html = '';

  if (isApparel) {
    html += `
      <div class="variant-group">
        <div class="variant-label">Size</div>
        <div class="variant-options">
          ${['S','M','L','XL','XXL'].map((s,i) => `<span class="variant-chip ${i===1?'selected':''}" onclick="selectVariant(this)">${s}</span>`).join('')}
        </div>
      </div>`;
  }

  if (isApparel || isElectronic) {
    html += `
      <div class="variant-group">
        <div class="variant-label">Color</div>
        <div class="variant-options">
          ${['Black','Blue','Red','White'].map((c,i) => `<span class="variant-chip ${i===0?'selected':''}" onclick="selectVariant(this)">${c}</span>`).join('')}
        </div>
      </div>`;
  }

  wrap.innerHTML = html;
}

function selectVariant(el) {
  el.parentElement.querySelectorAll('.variant-chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

// =====================
// QUANTITY
// =====================
function changeQty(delta) {
  currentQty = Math.max(1, currentQty + delta);
  document.getElementById('qtyVal').textContent = currentQty;
  refreshProductPrice();
}

// =====================
// CART / BUY ACTIONS
// =====================
function addToCartPage() {
  const p = currentProduct;
  for (let i = 0; i < currentQty; i++) {
    cart.push({ name: p.name, usdPrice: p.usd, icon: p.icon });
  }
  persistCart();
  syncCartBadges();
  showToast(p.icon + ' Added ' + currentQty + ' to cart!');
}

function buyNow() {
  addToCartPage();
  showToast('\u26A1 Redirecting to checkout...');
  setTimeout(() => { window.location.href = 'cart.html'; }, 800);
}

function toggleWish() {
  wishlisted = !wishlisted;
  const btn = document.getElementById('wishBtn');
  btn.classList.toggle('active', wishlisted);
  btn.innerHTML = wishlisted ? '\u2764 Wishlisted' : '\u2661 Wishlist';
  showToast(wishlisted ? '\u2764 Added to wishlist' : 'Removed from wishlist');
}

// =====================
// TABS
// =====================
function switchPTab(name, btn) {
  document.querySelectorAll('.ptab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.ptab-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('ptab-' + name).classList.add('active');
}

// =====================
// DESCRIPTION + SPECS
// =====================
function buildDescription(p) {
  return `
    <p>Introducing the <strong>${p.name}</strong> — a top-rated item from our curated Mega Ads collection, loved by thousands of customers worldwide.</p>
    <ul>
      <li>Premium quality materials built to last</li>
      <li>Carefully inspected before shipping</li>
      <li>Trusted by 2,400+ buyers globally</li>
      <li>Backed by our 30-day easy return policy</li>
    </ul>
    <p>Whether you're shopping for yourself or a gift, this product delivers reliable quality at an unbeatable price point.</p>
  `;
}

function buildSpecs(p) {
  const rows = [
    ['Product Name', p.name],
    ['Category', guessCategory(p.name)],
    ['Brand', 'Mega Ads Store'],
    ['Availability', 'In Stock'],
    ['Shipping Time', '7–14 business days'],
    ['Warranty', '30-day return guarantee'],
  ];
  return rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('');
}

// =====================
// REVIEWS (sample static set)
// =====================
function buildReviews() {
  const sample = [
    { name: 'Sarah K.', stars: 5, date: '2 weeks ago', text: 'Exactly as described, fast shipping, very happy with this purchase!' },
    { name: 'Daniel M.', stars: 5, date: '1 month ago', text: 'Great quality for the price. Will buy again from Mega Ads.' },
    { name: 'Aisha N.', stars: 4, date: '1 month ago', text: 'Good product overall, packaging could be better but item arrived safely.' },
  ];
  return sample.map(r => `
    <div class="review-item">
      <div class="review-header">
        <div class="review-avatar">${r.name[0]}</div>
        <div>
          <div class="review-name">${r.name}</div>
          <div class="review-stars">${'\u2605'.repeat(r.stars)}${'\u2606'.repeat(5-r.stars)}</div>
        </div>
        <div class="review-date">${r.date}</div>
      </div>
      <div class="review-text">${r.text}</div>
    </div>
  `).join('');
}

// =====================
// RELATED PRODUCTS
// =====================
function renderRelated(p) {
  const all = deals.filter(d => d.name !== p.name);
  const shuffled = all.sort(() => 0.5 - Math.random()).slice(0, 6);
  const grid = document.getElementById('relatedGrid');
  grid.innerHTML = shuffled.map(d => `
    <div class="deal-card" onclick="window.location.href='product.html?id=${d.id}'">
      <div class="deal-badge">${d.discount}</div>
      <div class="deal-img">${d.img ? `<img src="${d.img}" alt=""/>` : d.icon}</div>
      <div class="deal-info">
        <div class="deal-price"><span data-usd="${d.usd}">${convertPrice(d.usd)}</span></div>
        <div class="deal-name">${d.name}</div>
      </div>
    </div>
  `).join('');
}

// =====================
// ZOOM MODAL
// =====================
function openZoom() {
  document.getElementById('zoomImg').src = document.getElementById('mainImg').src;
  document.getElementById('zoomOverlay').classList.add('open');
}
function closeZoom() {
  document.getElementById('zoomOverlay').classList.remove('open');
}

// =====================
// INIT — wait for the catalog data to arrive from the API before
// trying to look up the product from the URL
// =====================
document.addEventListener('DOMContentLoaded', () => {
  onDataReady(renderProduct);
});