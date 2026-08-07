// =====================
// STATE
// =====================
let activeSection = 'hero';
let modalTarget   = null;   // { section, id }
let pendingImgUrl = '';     // image chosen but not yet applied
let pendingGalleryImages = [];

// =====================
// NAVIGATION
// =====================
function showSection(name) {
  activeSection = name;

  document.querySelectorAll('.section-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById('panel-' + name).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.getAttribute('onclick') && n.getAttribute('onclick').includes("'" + name + "'")) {
      n.classList.add('active');
    }
  });

  if (name === 'hero')    renderHeroCards();
  if (name === 'flash')   renderFlashCards();
  if (name === 'tiles')   renderTileCards();
  if (name === 'deals')   renderDealCards();
  if (name === 'library') renderLibrary();
  if (name === 'catalog') renderCatalogCards();
  if (name === 'bulk') renderBulkHistory();

  return false;
}

// =====================
// CARD BUILDERS
// =====================
function thumbHtml(item) {
  if (item.img) {
    return `<img src="${item.img}" alt=""/><div class="img-status"></div>`;
  }
  return `<span class="thumb-emoji">${item.icon || '\uD83D\uDDBC\uFE0F'}</span><div class="img-status"></div>`;
}

function renderHeroCards() {
  document.getElementById('hero-cards').innerHTML = heroData.map(h => `
    <div class="img-card ${h.img ? 'has-image' : ''}" id="card-${h.id}">
      <div class="img-card-thumb" onclick="openModal('hero','${h.id}')">
        ${thumbHtml(h)}
        <div class="edit-overlay"><span class="ov-icon">\uD83D\uDDBC\uFE0F</span>Change Image</div>
      </div>
      <div class="img-card-body">
        <div class="img-card-name">${h.label}: ${h.subtitle}</div>
        <div style="font-size:11px;color:#999;margin-top:3px">${h.text}</div>
      </div>
      <div class="img-card-actions">
        <button class="btn-card-edit" onclick="openModal('hero','${h.id}')">\u270F\uFE0F Edit</button>
      </div>
    </div>
  `).join('');
}

function renderTileCards() {
  document.getElementById('tiles-cards').innerHTML = tilesData.map(t => `
    <div class="img-card ${t.img ? 'has-image' : ''}" id="card-${t.id}">
      <div class="img-card-thumb" onclick="openModal('tiles','${t.id}')">
        ${thumbHtml(t)}
        <div class="edit-overlay"><span class="ov-icon">\uD83D\uDDBC\uFE0F</span>Change Image</div>
      </div>
      <div class="img-card-body">
        <div class="img-card-name">${t.name}</div>
      </div>
      <div class="img-card-actions">
        <button class="btn-card-edit" onclick="openModal('tiles','${t.id}')">\u270F\uFE0F Edit</button>
      </div>
    </div>
  `).join('');
}

function renderFlashCards(filter) {
  const items = filter
    ? flashData.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
    : flashData;
  document.getElementById('flash-cards').innerHTML = items.map(p => `
    <div class="img-card ${p.img ? 'has-image' : ''}" id="card-${p.id}">
      <div class="img-card-thumb" onclick="openModal('flash','${p.id}')">
        ${thumbHtml(p)}
        <div class="edit-overlay"><span class="ov-icon">\uD83D\uDDBC\uFE0F</span>Change Image</div>
      </div>
      <div class="img-card-body">
        <div class="img-card-name">${p.name}</div>
        <div class="img-card-price">$${p.usd} USD</div>
      </div>
      <div class="img-card-actions">
        <button class="btn-card-edit"   onclick="openModal('flash','${p.id}')">\u270F\uFE0F Edit</button>
        <button class="btn-card-delete" onclick="deleteItem('flash','${p.id}')">\uD83D\uDDD1\uFE0F</button>
      </div>
    </div>
  `).join('');
}

function renderDealCards(filter) {
  const items = filter
    ? dealsData.filter(d => d.name.toLowerCase().includes(filter.toLowerCase()))
    : dealsData;
  document.getElementById('deals-cards').innerHTML = items.map(d => `
    <div class="img-card ${d.img ? 'has-image' : ''}" id="card-${d.id}">
      ${d.discount ? `<div class="img-card-discount">${d.discount}</div>` : ''}
      <div class="img-card-thumb" onclick="openModal('deals','${d.id}')">
        ${thumbHtml(d)}
        <div class="edit-overlay"><span class="ov-icon">\uD83D\uDDBC\uFE0F</span>Change Image</div>
      </div>
      <div class="img-card-body">
        <div class="img-card-name">${d.name}</div>
        <div class="img-card-price">$${d.usd} USD</div>
      </div>
      <div class="img-card-actions">
        <button class="btn-card-edit"   onclick="openModal('deals','${d.id}')">\u270F\uFE0F Edit</button>
        <button class="btn-card-delete" onclick="deleteItem('deals','${d.id}')">\uD83D\uDDD1\uFE0F</button>
      </div>
    </div>
  `).join('');
}

function renderCatalogCards(filter) {
  const items = filter
    ? catalogData.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()))
    : catalogData;
  document.getElementById('catalog-cards').innerHTML = items.map(c => `
    <div class="img-card ${c.img ? 'has-image' : ''}" id="card-${c.id}">
      <div class="img-card-thumb" onclick="openModal('catalog','${c.id}')">
        ${thumbHtml(c)}
        <div class="edit-overlay"><span class="ov-icon">\uD83D\uDDBC\uFE0F</span>Change Image</div>
      </div>
      <div class="img-card-body">
        <div class="img-card-name">${c.name}</div>
        <div class="img-card-price">$${c.usd} USD</div>
      </div>
      <div class="img-card-actions">
        <button class="btn-card-edit"   onclick="openModal('catalog','${c.id}')">\u270F\uFE0F Edit</button>
        <button class="btn-card-delete" onclick="deleteItem('catalog','${c.id}')">\uD83D\uDDD1\uFE0F</button>
      </div>
    </div>
  `).join('');
}
function filterCatalog(q) { renderCatalogCards(q); }

// =====================
// SEARCH / FILTER
// =====================
function filterDeals(q)  { renderDealCards(q); }
function filterLibrary(q) {
  const lib = loadLibrary();
  const filtered = q ? lib.filter(u => u.toLowerCase().includes(q.toLowerCase())) : lib;
  renderLibraryItems(filtered);
}

// =====================
// ADD NEW ITEMS — now creates on the server first, then renders
// =====================
async function addFlashProduct() {
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'flash', icon: '\uD83D\uDCE6', name: 'New Product', usd: 0 }),
    });
    if (res.status === 401) return handleAuthExpired();
    const data = await res.json();
    flashData.push(data.product);
    renderFlashCards();
    openModal('flash', data.product.id);
  } catch (e) {
    showToast('\u274C Could not create product \u2014 check your connection');
  }
}

async function addDeal() {
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'deals', icon: '\uD83D\uDCE6', name: 'New Product', usd: 0, discount: '-0%' }),
    });
    if (res.status === 401) return handleAuthExpired();
    const data = await res.json();
    dealsData.push(data.product);
    renderDealCards();
    openModal('deals', data.product.id);
  } catch (e) {
    showToast('\u274C Could not create product \u2014 check your connection');
  }
}

async function addCatalogProduct() {
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'catalog', icon: '\uD83D\uDCE6', name: 'New Product', usd: 0 }),
    });
    if (res.status === 401) return handleAuthExpired();
    const data = await res.json();
    catalogData.push(data.product);
    renderCatalogCards();
    openModal('catalog', data.product.id);
  } catch (e) {
    showToast('\u274C Could not create product \u2014 check your connection');
  }
}

// =====================
// DELETE ITEM
// =====================
async function deleteItem(section, id) {
  if (!confirm('Delete this product?')) return;
  try {
    const res = await fetch('/api/products/' + id, { method: 'DELETE' });
    if (res.status === 401) return handleAuthExpired();
    if (!res.ok) { showToast('\u274C Could not delete product'); return; }

    if (section === 'flash') { flashData = flashData.filter(p => p.id !== id); renderFlashCards(); }
    if (section === 'deals') { dealsData = dealsData.filter(d => d.id !== id); renderDealCards(); }
    if (section === 'catalog') { catalogData = catalogData.filter(c => c.id !== id); renderCatalogCards(); }
    showToast('\uD83D\uDDD1\uFE0F Product deleted');
  } catch (e) {
    showToast('\u274C Could not delete product \u2014 check your connection');
  }
}

async function renderBulkHistory() {
  const wrap = document.getElementById('bulkPreviews');
  if (!wrap) return;
  const lib = await loadLibrary();
  wrap.innerHTML = lib.length
    ? lib.map(url => `
        <div class="bulk-thumb">
          <img src="${url}" alt=""/>
          <button class="bulk-thumb-assign" onclick="assignBulkImage('${url}')">Assign to product</button>
        </div>
      `).join('')
    : '<div class="lib-empty">No images uploaded yet.</div>';
}

// =====================
// MODAL
// =====================
function openModal(section, id) {
  modalTarget  = { section, id };
  pendingImgUrl = '';

  const item = getItem(section, id);
  if (!item) return;

  document.getElementById('modalTitle').textContent =
    section === 'hero'  ? `Edit Hero: ${item.subtitle || item.label}` :
    section === 'tiles' ? `Edit Tile: ${item.name}` : `Edit: ${item.name}`;

  const previewImg   = document.getElementById('modalPreviewImg');
  const previewEmoji = document.getElementById('modalEmoji');
  if (item.img) {
    previewImg.src = item.img; previewImg.style.display = 'block';
    previewEmoji.style.display = 'none';
  } else {
    previewImg.style.display = 'none';
    previewEmoji.style.display = 'block';
    previewEmoji.textContent  = item.icon || '\uD83D\uDDBC\uFE0F';
  }

  const urlInput = document.getElementById('urlInput');
  urlInput.value = item.img || '';

  buildModalFields(section, item);
  renderMiniLibrary();
  switchTab('url', document.querySelector('.tab'));

  pendingGalleryImages = Array.isArray(item.images) ? [...item.images] : [];
  renderGalleryGrid();

  const gallerySection = document.getElementById('modalGallerySection');
  if (gallerySection) {
   gallerySection.style.display = (section === 'flash' || section === 'deals' || section === 'catalog') ? 'block' : 'none';
  }
  

  document.getElementById('modal').classList.add('open');
  document.getElementById('modalOverlay').classList.add('open');
  setTimeout(() => urlInput.focus(), 100);
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.getElementById('modalOverlay').classList.remove('open');
  modalTarget = null;
  pendingImgUrl = '';
}

function buildModalFields(section, item) {
  const wrap = document.getElementById('modalFields');
  let html = '';

  if (section === 'hero') {
    html = `
      <div class="field-row"><label>Slide Heading</label><input id="f-subtitle" value="${item.subtitle || ''}"/></div>
      <div class="field-row"><label>Slide Subtext</label><input id="f-text" value="${item.text || ''}"/></div>
    `;
  } else if (section === 'tiles') {
    html = `<div class="field-row"><label>Tile Name</label><input id="f-name" value="${item.name || ''}"/></div>`;
  } else if (section === 'flash' || section === 'deals' || section === 'catalog') {
    html = `
      <div class="field-row"><label>Product Name</label><input id="f-name" value="${item.name || ''}"/></div>
      <div class="field-row"><label>Price (USD)</label><input id="f-usd" type="number" value="${item.usd || 0}"/></div>
      ${section === 'deals' ? `<div class="field-row"><label>Discount Badge (e.g. -20%)</label><input id="f-discount" value="${item.discount || ''}"/></div>` : ''}
    `;
  }
  wrap.innerHTML = html;
}

// =====================
// APPLY IMAGE + FIELDS — now PUTs to the server and updates the local
// cache from the server's response, instead of writing to localStorage
// =====================
async function applyImage() {
  if (!modalTarget) return;
  const { section, id } = modalTarget;
  const item = getItem(section, id);
  if (!item) return;

  const updates = {};

  const url = pendingImgUrl || document.getElementById('urlInput').value.trim();
  if (url) {
    updates.img = url;
    saveToLibrary(url);
  }
  if (url) {
  updates.img = url;
  await saveToLibrary(url);
  }

  const fName     = document.getElementById('f-name');
  const fUsd      = document.getElementById('f-usd');
  const fDiscount = document.getElementById('f-discount');
  const fSubtitle = document.getElementById('f-subtitle');
  const fText     = document.getElementById('f-text');

  if (fName && fName.value.trim())     updates.name     = fName.value.trim();
  if (fUsd && fUsd.value !== '')       updates.usd      = parseFloat(fUsd.value);
  if (fDiscount && fDiscount.value.trim()) updates.discount = fDiscount.value.trim();
  if (fSubtitle && fSubtitle.value.trim()) updates.subtitle = fSubtitle.value.trim();
  if (fText && fText.value.trim())     updates.text     = fText.value.trim();
  if (modalTarget.section === 'flash' || modalTarget.section === 'deals' || modalTarget.section === 'catalog') {
  updates.images = pendingGalleryImages;
 }

  try {
    let endpoint, resultKey;
    if (section === 'hero')  { endpoint = '/api/hero/' + id;  resultKey = 'slide'; }
    else if (section === 'tiles') { endpoint = '/api/tiles/' + id; resultKey = 'tile'; }
    else { endpoint = '/api/products/' + id; resultKey = 'product'; }

    const res = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.status === 401) return handleAuthExpired();
    if (!res.ok) { showToast('\u274C Could not save changes'); return; }

    const data = await res.json();
    Object.assign(item, data[resultKey]);

    if (section === 'hero')  renderHeroCards();
    if (section === 'tiles') renderTileCards();
    if (section === 'flash') renderFlashCards();
    if (section === 'deals') renderDealCards();
    if (section === 'catalog') renderCatalogCards();

    closeModal();
    showToast('\u2705 Changes saved!');
  } catch (e) {
    showToast('\u274C Could not save changes \u2014 check your connection');
  }
}

// =====================
// TABS IN MODAL
// =====================
function switchTab(name, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => {
    if (t.getAttribute('onclick') && t.getAttribute('onclick').includes("'" + name + "'")) {
      t.classList.add('active');
    }
  });
  document.getElementById('tab-' + name).classList.add('active');
  if (name === 'library') renderMiniLibrary();
}

// =====================
// URL PREVIEW
// =====================
function previewFromUrl(url) {
  pendingImgUrl = url;
  const previewImg   = document.getElementById('modalPreviewImg');
  const previewEmoji = document.getElementById('modalEmoji');
  if (url) {
    previewImg.src = url;
    previewImg.style.display = 'block';
    previewEmoji.style.display = 'none';
  } else {
    previewImg.style.display = 'none';
    previewEmoji.style.display = 'block';
  }
}

// =====================
// FILE UPLOAD — now uploads to the server (/api/upload) instead of
// embedding base64 data directly, so the JSON data files stay small
// =====================
async function handleFileUpload(input) {
  const file = input.files[0];
  if (!file) return;
  await uploadAndPreview(file);
}

async function uploadAndPreview(file) {
  const formData = new FormData();
  formData.append('image', file);

  showToast('\u2B06\uFE0F Uploading image\u2026');
  try {
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (res.status === 401) return handleAuthExpired();
    const data = await res.json();
    if (!data.success) { showToast('\u274C Upload failed'); return null; }

    pendingImgUrl = data.url;
    previewFromUrl(data.url);
    await saveToLibrary(data.url);
    showToast('\uD83D\uDDBC\uFE0F Image uploaded \u2014 click Apply to save');
    return data.url;
  } catch (e) {
    showToast('\u274C Upload failed \u2014 check your connection');
    return null;
  }
  
}

async function renderLibrary() {
  renderLibraryItems(await loadLibrary());
}

async function filterLibrary(q) {
  const lib = await loadLibrary();
  const filtered = q ? lib.filter(u => u.toLowerCase().includes(q.toLowerCase())) : lib;
  renderLibraryItems(filtered);
}

async function renderMiniLibrary() {
  const lib  = await loadLibrary();
  const mini = document.getElementById('miniLibrary');
  if (!lib.length) {
    mini.innerHTML = '<div class="mini-lib-empty">No saved images yet.</div>';
    return;
  }
  mini.innerHTML = lib.map(url => `
    <div class="mini-lib-item" onclick="pickFromMiniLibrary('${url}')">
      <img src="${url}" alt="" onerror="this.parentElement.style.display='none'"/>
    </div>
  `).join('');
}

async function clearLibrary() {
  if (!confirm('Clear entire image library? Product images are NOT deleted.')) return;
  try {
    await fetch('/api/library', { method: 'DELETE' });
    renderLibrary();
    showToast('\uD83D\uDDD1\uFE0F Library cleared');
  } catch (e) {
    showToast('\u274C Could not clear library \u2014 check your connection');
  }
}

function renderGalleryGrid() {
  const grid = document.getElementById('modalGalleryGrid');
  if (!grid) return;
  if (!pendingGalleryImages.length) {
    grid.innerHTML = '<div class="gallery-empty">No alternate images yet.</div>';
    return;
  }
  grid.innerHTML = pendingGalleryImages.map((entry, i) => {
    const img = typeof entry === 'string' ? entry : entry.img;
    const label = typeof entry === 'string' ? '' : (entry.label || '');
    const usd = typeof entry === 'string' ? '' : (entry.usd ?? '');
    return `
    <div class="gallery-thumb-item">
      <img src="${img}" alt="" onerror="this.parentElement.style.display='none'"/>
      <input type="text" class="gallery-thumb-label" placeholder="Name (optional)" value="${label}"
             oninput="updateGalleryMeta(${i}, 'label', this.value)"/>
      <input type="number" class="gallery-thumb-price" placeholder="Price (optional)" value="${usd}"
             oninput="updateGalleryMeta(${i}, 'usd', this.value)"/>
      <button class="gallery-thumb-remove" onclick="removeGalleryImage(${i})">&#10005;</button>
    </div>`;
  }).join('');
}

function updateGalleryMeta(index, field, value) {
  const entry = pendingGalleryImages[index];
  const img = typeof entry === 'string' ? entry : entry.img;
  const label = typeof entry === 'string' ? '' : (entry.label || '');
  const usd = typeof entry === 'string' ? '' : (entry.usd ?? '');
  const updated = { img, label, usd: usd === '' ? null : Number(usd) };
  updated[field] = field === 'usd' ? (value === '' ? null : Number(value)) : value;
  pendingGalleryImages[index] = updated;
}

function addGalleryImage(url) {
  if (!url) return;
  pendingGalleryImages.push({ img: url, label: '', usd: null });
  saveToLibrary(url);
  renderGalleryGrid();
  const input = document.getElementById('galleryUrlInput');
  if (input) input.value = '';
}

function removeGalleryImage(index) {
  pendingGalleryImages.splice(index, 1);
  renderGalleryGrid();
}

async function handleGalleryFileUpload(input) {
  const file = input.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('image', file);
  showToast('\u2B06\uFE0F Uploading image\u2026');
  try {
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (res.status === 401) return handleAuthExpired();
    const data = await res.json();
    if (!data.success) { showToast('\u274C Upload failed'); return; }
    addGalleryImage(data.url);
    showToast('\uD83D\uDDBC\uFE0F Alternate image added \u2014 click Apply to save');
  } catch (e) {
    showToast('\u274C Upload failed \u2014 check your connection');
  }
}

// =====================
// BULK UPLOAD
// =====================
async function handleBulkUpload(files) {
  for (const file of Array.from(files)) {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.status === 401) return handleAuthExpired();
      const data = await res.json();
      if (!data.success) continue;
      await saveToLibrary(data.url);
    } catch (e) { /* continue with remaining files */ }
  }
  await renderBulkHistory();
  showToast('\uD83D\uDCE4 Images uploaded to library');
}

function assignBulkImage(url) {
  pendingImgUrl = url;
  showSection('deals');
  showToast('\uD83D\uDC49 Now click a product card to assign this image');
}

document.addEventListener('DOMContentLoaded', () => {
  const zone = document.getElementById('bulkDropZone');
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('dragover');
    handleBulkUpload(e.dataTransfer.files);
  });
});

// =====================
// IMAGE LIBRARY (still localStorage — see admin-data.js note)
// =====================

function renderLibraryItems(items) {
  const grid = document.getElementById('libraryGrid');
  if (!items.length) {
    grid.innerHTML = '<div class="lib-empty">\uD83D\uDDBC\uFE0F No images yet. Upload or link some images first.</div>';
    return;
  }
  grid.innerHTML = items.map(url => `
    <div class="lib-item" onclick="useFromLibrary('${url}')">
      <img src="${url}" alt="" onerror="this.parentElement.style.display='none'"/>
      <div class="lib-item-url">${url.substring(0, 40)}...</div>
    </div>
  `).join('');
}


function pickFromMiniLibrary(url) {
  pendingImgUrl = url;
  previewFromUrl(url);
  switchTab('url', null);
  document.getElementById('urlInput').value = url;
  showToast('\u2705 Image selected \u2014 click Apply');
}

function useFromLibrary(url) {
  showToast('\u2705 Click a product card to assign this image');
  pendingImgUrl = url;
}


// =====================
// REFRESH FROM SERVER
// Each edit already saves immediately via the API — this just re-pulls
// everything fresh, useful if you have two admin tabs/devices open at once.
// =====================
async function saveAllImages() {
  await loadAllAdminData();
  showSection(activeSection);
  showToast('\uD83D\uDD04 Refreshed from server \u2014 all changes save automatically as you make them');
}

// =====================
// AUTH
// =====================
function handleAuthExpired() {
  showToast('\u26A0\uFE0F Session expired \u2014 redirecting to login\u2026');
  setTimeout(() => { window.location.href = 'login.html'; }, 1200);
}

async function logoutAdmin() {
  try { await fetch('/api/admin/logout', { method: 'POST' }); } catch (e) {}
  window.location.href = 'login.html';
}

async function toggleGalleryLibraryPicker() {
  const picker = document.getElementById('galleryLibraryPicker');
  if (!picker) return;
  if (picker.style.display !== 'none') { picker.style.display = 'none'; return; }
  const lib = await loadLibrary();
  picker.innerHTML = lib.length
    ? lib.map(url => `
        <div class="mini-lib-item" onclick="addGalleryImage('${url}')">
          <img src="${url}" alt="" onerror="this.parentElement.style.display='none'"/>
        </div>
      `).join('')
    : '<div class="mini-lib-empty">No saved images yet.</div>';
  picker.style.display = 'grid';
}

// =====================
// HELPERS
// =====================
function getItem(section, id) {
  return getData(section).find(i => i.id === id);
}
function getData(section) {
  if (section === 'hero')  return heroData;
  if (section === 'tiles') return tilesData;
  if (section === 'flash') return flashData;
  if (section === 'deals') return dealsData;
  if (section === 'catalog') return catalogData;
  return [];
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._t);
  t._t = setTimeout(() => { t.style.opacity = '0'; }, 3000);
}

// =====================
// INIT — wait for the initial API data load before rendering anything
// =====================
document.addEventListener('DOMContentLoaded', () => {
  onAdminDataReady(() => showSection('hero'));
});