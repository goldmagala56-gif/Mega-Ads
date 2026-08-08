// =====================
// SELLER DATA — real backend via /api/seller/*
// Orders/payouts/reviews stay as sample data for now — see note in chat
// about why (checkout doesn't yet record which seller an item belongs to).
// =====================

let sellerId = null;
let sellerStoreName = '';
let sellerProducts = [];
let sellerDataReady = false;

const DEFAULT_SELLER_ORDERS = [
  { id: 'ORD-10293', customer: 'Sarah K.',  product: 'Wireless Bluetooth Earbuds Pro', amount: 6,  status: 'pending',   date: '2026-06-28' },
  { id: 'ORD-10288', customer: 'Daniel M.', product: 'Classic Leather Running Shoes',  amount: 8,  status: 'shipped',   date: '2026-06-27' },
];
const DEFAULT_SELLER_PAYOUTS = [
  { id: 'PO-3321', amount: 240, date: '2026-06-15', method: 'Mobile Money', status: 'completed' },
];
const DEFAULT_SELLER_REVIEWS = [
  { name: 'Sarah K.', stars: 5, date: '3 days ago', text: 'Fast shipping and exactly as described.', product: 'Sample Product' },
];

let sellerOrders  = DEFAULT_SELLER_ORDERS;
let sellerPayouts = DEFAULT_SELLER_PAYOUTS;
let sellerReviews = DEFAULT_SELLER_REVIEWS;

async function loadAllSellerData() {
  const sessRes = await fetch('/api/seller/session');
  const sess = await sessRes.json();
  if (!sess.isSeller) { window.location.href = 'login.html'; return; }

  sellerId = sess.sellerId;
  sellerStoreName = sess.storeName;

  const prodRes = await fetch('/api/seller/products');
  sellerProducts = await prodRes.json();

  sellerDataReady = true;
  document.dispatchEvent(new Event('megaads-seller:data-ready'));
}

function onSellerDataReady(cb) {
  if (sellerDataReady) cb();
  else document.addEventListener('megaads-seller:data-ready', cb, { once: true });
}

// kept for the still-sample-data views (orders/payouts/reviews) so
// existing seller.js code paths (updateOrderStatus, etc.) don't crash
function saveSellerData(key, data) {
  if (key === 'orders')  sellerOrders  = data;
  if (key === 'payouts') sellerPayouts = data;
  if (key === 'reviews') sellerReviews = data;
}

loadAllSellerData();