// =====================
// SELLER DASHBOARD LOGIC
// =====================

let editingProductId = null;
let currentOrderFilter = 'all';

// =====================
// NAVIGATION
// =====================
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.snav-item').forEach(n => n.classList.remove('active'));

  document.getElementById('view-' + name).classList.add('active');
  document.querySelectorAll('.snav-item').forEach(n => {
    if (n.getAttribute('onclick') && n.getAttribute('onclick').includes("'" + name + "'")) {
      n.classList.add('active');
    }
  });

  if (name === 'overview')  renderOverview();
  if (name === 'products')  renderProductsTable();
  if (name === 'orders')    renderOrdersTable();
  if (name === 'earnings')  renderEarnings();
  if (name === 'reviews')   renderReviews();

  return false;
}

// =====================
// PROFILE MENU
// =====================
function toggleProfileMenu() {
  document.getElementById('profileMenu').classList.toggle('open');
}
document.addEventListener('click', e => {
  if (!e.target.closest('.seller-profile')) {
    const menu = document.getElementById('profileMenu');
    if (menu) menu.classList.remove('open');
  }
});

function logoutSeller() {
  showToast('\uD83D\uDC4B Logged out');
  setTimeout(() => { window.location.href = '../index.html'; }, 800);
}

// =====================
// OVERVIEW
// =====================
function renderOverview() {
  const revenue  = sellerOrders.reduce((sum, o) => sum + o.amount, 0);
  const products = sellerProducts.filter(p => p.status !== 'out').length;

  document.getElementById('statRevenue').textContent  = '$' + revenue;
  document.getElementById('statOrders').textContent   = sellerOrders.length;
  document.getElementById('statProducts').textContent = products;

  // simple CSS bar chart, last 7 days
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const values = [40, 65, 30, 80, 55, 95, 70]; // sample percentages
  document.getElementById('salesChart').innerHTML = days.map((d, i) => `
    <div class="bar-col">
      <div class="bar-fill-chart" style="height:${values[i]}%"></div>
      <div class="bar-day">${d}</div>
    </div>
  `).join('');

  // recent orders (last 5)
  const recent = sellerOrders.slice(0, 5);
  document.getElementById('recentOrdersTable').innerHTML = buildOrdersTableHtml(recent, true);
}

// =====================
// PRODUCTS TABLE
// =====================
function renderProductsTable(filter, statusFilter) {
  let items = sellerProducts;
  if (filter) items = items.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));
  if (statusFilter && statusFilter !== 'all') items = items.filter(p => p.status === statusFilter);

  const table = document.getElementById('productsTable');
  if (!items.length) {
    table.innerHTML = `<tbody><tr class="empty-row"><td>No products found.</td></tr></tbody>`;
    return;
  }

  table.innerHTML = `
    <thead><tr>
      <th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Sold</th><th>Status</th><th>Actions</th>
    </tr></thead>
    <tbody>
      ${items.map(p => `
        <tr>
          <td>
            <div class="table-product-cell">
              <div class="table-thumb">${p.img ? `<img src="${p.img}" alt=""/>` : '\uD83D\uDCE6'}</div>
              <span>${p.name}</span>
            </div>
          </td>
          <td>${p.category}</td>
          <td>$${p.price}</td>
          <td>${p.stock}</td>
          <td>${p.sold}</td>
          <td><span class="badge badge-${p.status}">${statusLabel(p.status)}</span></td>
          <td>
            <div class="table-actions">
              <button class="table-action-btn" onclick="openProductModal('${p.id}')" title="Edit">\u270F\uFE0F</button>
              <button class="table-action-btn danger" onclick="deleteProduct('${p.id}')" title="Delete">\uD83D\uDDD1\uFE0F</button>
            </div>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;
}

function statusLabel(s) {
  if (s === 'active') return 'Active';
  if (s === 'low')    return 'Low Stock';
  if (s === 'out')    return 'Out of Stock';
  return s;
}

function filterProducts(q) { renderProductsTable(q); }
function filterByStatus(s) {
  const q = document.querySelector('.search-box') ? document.querySelector('.search-box').value : '';
  renderProductsTable(q, s);
}

// =====================
// ORDERS TABLE
// =====================
function buildOrdersTableHtml(items, compact) {
  if (!items.length) {
    return `<tbody><tr class="empty-row"><td colspan="6">No orders yet.</td></tr></tbody>`;
  }
  return `
    <thead><tr>
      <th>Order ID</th><th>Customer</th><th>Product</th><th>Amount</th><th>Date</th><th>Status</th>
    </tr></thead>
    <tbody>
      ${items.map(o => `
        <tr>
          <td>${o.id}</td>
          <td>${o.customer}</td>
          <td>${o.product}</td>
          <td>$${o.amount}</td>
          <td>${o.date}</td>
          <td>
            ${compact
              ? `<span class="badge badge-${o.status}">${capitalize(o.status)}</span>`
              : `<select onchange="updateOrderStatus('${o.id}', this.value)" class="filter-select" style="padding:4px 10px;font-size:11px">
                  <option value="pending"   ${o.status==='pending'?'selected':''}>Pending</option>
                  <option value="shipped"   ${o.status==='shipped'?'selected':''}>Shipped</option>
                  <option value="delivered" ${o.status==='delivered'?'selected':''}>Delivered</option>
                </select>`
            }
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;
}

function renderOrdersTable() {
  let items = sellerOrders;
  if (currentOrderFilter !== 'all') items = items.filter(o => o.status === currentOrderFilter);
  document.getElementById('ordersTable').innerHTML = buildOrdersTableHtml(items, false);
}

function filterOrders(status, btn) {
  currentOrderFilter = status;
  document.querySelectorAll('.order-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderOrdersTable();
}

function updateOrderStatus(orderId, newStatus) {
  const order = sellerOrders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    saveSellerData('orders', sellerOrders);
    showToast('\u2705 Order ' + orderId + ' marked as ' + newStatus);
    renderOrdersTable();
  }
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// =====================
// EARNINGS
// =====================
function renderEarnings() {
  const lifetime  = sellerOrders.reduce((sum, o) => sum + o.amount, 0) + sellerPayouts.reduce((sum, p) => sum + p.amount, 0);
  const pending   = sellerOrders.filter(o => o.status !== 'delivered').reduce((sum, o) => sum + o.amount, 0);
  const available = sellerOrders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.amount, 0);

  document.getElementById('availableBalance').textContent = '$' + available.toFixed(2);
  document.getElementById('pendingBalance').textContent   = '$' + pending.toFixed(2);
  document.getElementById('lifetimeBalance').textContent  = '$' + lifetime.toFixed(2);

  const table = document.getElementById('payoutsTable');
  table.innerHTML = `
    <thead><tr><th>Payout ID</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th></tr></thead>
    <tbody>
      ${sellerPayouts.map(p => `
        <tr>
          <td>${p.id}</td><td>$${p.amount}</td><td>${p.method}</td><td>${p.date}</td>
          <td><span class="badge badge-delivered">${capitalize(p.status)}</span></td>
        </tr>
      `).join('')}
    </tbody>
  `;
}

function requestPayout() {
  showToast('\uD83D\uDCB8 Payout request submitted! Funds arrive in 3-5 business days.');
}

// =====================
// REVIEWS
// =====================
function renderReviews() {
  document.getElementById('sellerReviewsList').innerHTML = sellerReviews.map(r => `
    <div class="review-item">
      <div class="review-avatar">${r.name[0]}</div>
      <div class="review-content">
        <div class="review-top">
          <span class="review-name">${r.name}</span>
          <span class="review-stars">${'\u2605'.repeat(r.stars)}${'\u2606'.repeat(5-r.stars)}</span>
          <span class="review-date">${r.date}</span>
        </div>
        <div class="review-text">${r.text}</div>
        <div class="review-product">on ${r.product}</div>
      </div>
    </div>
  `).join('');
}

// =====================
// PRODUCT MODAL
// =====================
function openProductModal(id) {
  editingProductId = id || null;
  const form = document.getElementById('productForm');
  form.reset();
  document.getElementById('pImagePreview').style.display = 'none';
  document.getElementById('imgUploadPlaceholder').style.display = 'block';

  if (id) {
    const p = sellerProducts.find(x => x.id === id);
    document.getElementById('productModalTitle').textContent = 'Edit Product';
    document.getElementById('pName').value = p.name;
    document.getElementById('pPrice').value = p.price;
    document.getElementById('pStock').value = p.stock;
    document.getElementById('pCategory').value = p.category;
    document.getElementById('pDesc').value = p.desc || '';
    if (p.img) {
      document.getElementById('pImagePreview').src = p.img;
      document.getElementById('pImagePreview').style.display = 'block';
      document.getElementById('imgUploadPlaceholder').style.display = 'none';
    }
  } else {
    document.getElementById('productModalTitle').textContent = 'Add New Product';
  }

  document.getElementById('productOverlay').classList.add('open');
  document.getElementById('productModal').classList.add('open');
}

function closeProductModal() {
  document.getElementById('productOverlay').classList.remove('open');
  document.getElementById('productModal').classList.remove('open');
  editingProductId = null;
}

function previewProductImage(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('pImagePreview').src = e.target.result;
    document.getElementById('pImagePreview').style.display = 'block';
    document.getElementById('imgUploadPlaceholder').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function saveProduct(e) {
  e.preventDefault();

  const name     = document.getElementById('pName').value.trim();
  const price    = parseFloat(document.getElementById('pPrice').value);
  const stock    = parseInt(document.getElementById('pStock').value);
  const category = document.getElementById('pCategory').value;
  const desc     = document.getElementById('pDesc').value.trim();
  const imgSrc   = document.getElementById('pImagePreview').src;
  const img      = document.getElementById('pImagePreview').style.display !== 'none' ? imgSrc : '';

  const status = stock === 0 ? 'out' : stock <= 5 ? 'low' : 'active';

  if (editingProductId) {
    const p = sellerProducts.find(x => x.id === editingProductId);
    Object.assign(p, { name, price, stock, category, desc, img, status });
    showToast('\u2705 Product updated');
  } else {
    sellerProducts.push({
      id: 'sp-' + Date.now(), name, price, stock, category, desc, img, status, sold: 0
    });
    showToast('\u2705 Product added');
  }

  saveSellerData('products', sellerProducts);
  closeProductModal();
  renderProductsTable();
  renderOverview();
}

function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  sellerProducts = sellerProducts.filter(p => p.id !== id);
  saveSellerData('products', sellerProducts);
  renderProductsTable();
  showToast('\uD83D\uDDD1\uFE0F Product deleted');
}

// =====================
// SETTINGS
// =====================
function saveSellerSettings(e) {
  e.preventDefault();
  const settings = {
    name:    document.getElementById('storeName').value,
    email:   document.getElementById('storeEmail').value,
    phone:   document.getElementById('storePhone').value,
    country: document.getElementById('storeCountry').value,
    desc:    document.getElementById('storeDesc').value,
  };
  saveSellerData('settings', settings);
  showToast('\u2705 Store settings saved');
}

// =====================
// TOAST
// =====================
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._t);
  t._t = setTimeout(() => { t.style.opacity = '0'; }, 3000);
}

// =====================
// INIT
// =====================
document.addEventListener('DOMContentLoaded', () => {
  showView('overview');
});