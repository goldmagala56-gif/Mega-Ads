// =====================
// SELLER DATA
// Sample data + localStorage persistence
// =====================

const DEFAULT_SELLER_PRODUCTS = [
  { id: 'sp-1', name: 'Wireless Bluetooth Earbuds Pro', price: 6,  stock: 42, category: 'Electronics', sold: 218, img: '', status: 'active' },
  { id: 'sp-2', name: 'Classic Leather Running Shoes',  price: 8,  stock: 3,  category: 'Shoes',       sold: 95,  img: '', status: 'low' },
  { id: 'sp-3', name: 'Luxury Alloy Quartz Watch',       price: 2,  stock: 0,  category: 'Accessories', sold: 310, img: '', status: 'out' },
  { id: 'sp-4', name: "Women's Solid Color Shirt Suit",  price: 10, stock: 67, category: 'Clothing',    sold: 142, img: '', status: 'active' },
  { id: 'sp-5', name: 'Stainless Steel Hip Flask 8oz',   price: 12, stock: 28, category: 'Accessories', sold: 51,  img: '', status: 'active' },
];

const DEFAULT_SELLER_ORDERS = [
  { id: 'ORD-10293', customer: 'Sarah K.',  product: 'Wireless Bluetooth Earbuds Pro', amount: 6,  status: 'pending',   date: '2026-06-28' },
  { id: 'ORD-10288', customer: 'Daniel M.', product: 'Classic Leather Running Shoes',  amount: 8,  status: 'shipped',   date: '2026-06-27' },
  { id: 'ORD-10271', customer: 'Aisha N.',  product: "Women's Solid Color Shirt Suit", amount: 10, status: 'delivered', date: '2026-06-25' },
  { id: 'ORD-10260', customer: 'Brian O.',  product: 'Stainless Steel Hip Flask 8oz',  amount: 12, status: 'delivered', date: '2026-06-24' },
  { id: 'ORD-10254', customer: 'Grace T.',  product: 'Wireless Bluetooth Earbuds Pro', amount: 6,  status: 'pending',   date: '2026-06-23' },
  { id: 'ORD-10240', customer: 'Kevin R.',  product: 'Luxury Alloy Quartz Watch',      amount: 2,  status: 'shipped',   date: '2026-06-20' },
];

const DEFAULT_SELLER_PAYOUTS = [
  { id: 'PO-3321', amount: 240, date: '2026-06-15', method: 'Mobile Money', status: 'completed' },
  { id: 'PO-3298', amount: 185, date: '2026-06-01', method: 'Bank Transfer', status: 'completed' },
  { id: 'PO-3270', amount: 310, date: '2026-05-15', method: 'Mobile Money', status: 'completed' },
];

const DEFAULT_SELLER_REVIEWS = [
  { name: 'Sarah K.',  stars: 5, date: '3 days ago',  text: 'Fast shipping and exactly as described. Will buy again!', product: 'Wireless Bluetooth Earbuds Pro' },
  { name: 'Daniel M.', stars: 4, date: '1 week ago',  text: 'Good quality shoes, true to size.', product: 'Classic Leather Running Shoes' },
  { name: 'Aisha N.',  stars: 5, date: '2 weeks ago', text: 'Beautiful suit, great material. Highly recommend this seller.', product: "Women's Solid Color Shirt Suit" },
  { name: 'Brian O.',  stars: 3, date: '3 weeks ago', text: 'Item was fine but packaging could be improved.', product: 'Stainless Steel Hip Flask 8oz' },
];

// =====================
// STORAGE HELPERS
// =====================
function loadSellerData(key, defaults) {
  try {
    const saved = localStorage.getItem('megaads_seller_' + key);
    return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(defaults));
  } catch(e) { return JSON.parse(JSON.stringify(defaults)); }
}

function saveSellerData(key, data) {
  localStorage.setItem('megaads_seller_' + key, JSON.stringify(data));
}

let sellerProducts = loadSellerData('products', DEFAULT_SELLER_PRODUCTS);
let sellerOrders   = loadSellerData('orders',   DEFAULT_SELLER_ORDERS);
let sellerPayouts  = loadSellerData('payouts',  DEFAULT_SELLER_PAYOUTS);
let sellerReviews  = loadSellerData('reviews',  DEFAULT_SELLER_REVIEWS);