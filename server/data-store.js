// =====================
// DATA STORE
// File-backed "database" for products / hero slides / tiles.
// Not a real DB — just JSON files on disk — but it gives you the thing
// localStorage couldn't: one shared source of truth that every browser,
// every device, and the admin panel all read from and write to.
//
// Swapping this for SQLite/Postgres later just means rewriting the
// functions below; nothing in server.js or the frontend needs to change,
// since they only ever call these functions, never touch the files directly.
// =====================
const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const HERO_FILE = path.join(DATA_DIR, 'hero.json');
const TILES_FILE = path.join(DATA_DIR, 'tiles.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return fallback;
  }
}

function writeJson(file, data) {
  ensureDataDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// =====================
// SEED DATA — only used the very first time the server runs, i.e. if
// server/data/*.json don't exist yet. After that, whatever's on disk wins.
// =====================
const SEED_PRODUCTS = [
  { id: 'd-1',  section: 'deals', icon: '\uD83C\uDFAE', name: 'Game Station 5 Video Game Console With 2 Controllers', usd: 17, discount: '-11%', img: '' },
  { id: 'd-2',  section: 'deals', icon: '\uD83C\uDF75', name: 'Ginseng Five Treasures Tea Kidney Tea Natural',         usd: 3,  discount: '-13%', img: '' },
  { id: 'd-3',  section: 'deals', icon: '\uD83D\uDC5E', name: 'Genuine Leather Handmade Shoes 20 Styles',              usd: 14, discount: '-13%', img: '' },
  { id: 'd-4',  section: 'deals', icon: '\uD83D\uDC5C', name: 'Large Capacity New Big Bag Commuting Simple',           usd: 5,  discount: '-17%', img: '' },
  { id: 'd-5',  section: 'deals', icon: '\uD83D\uDC59', name: "New Style Luxury Nightgown Women Summer",               usd: 4,  discount: '-29%', img: '' },
  { id: 'd-6',  section: 'deals', icon: '\uD83E\uDDE6', name: '10 Pairs Women Seamless Underwear Comfort',             usd: 6,  discount: '-14%', img: '' },
  { id: 'd-7',  section: 'deals', icon: '\uD83E\uDD43', name: '8oz Luxury Stainless Steel Alcohol Hip Flask',          usd: 12, discount: '-8%',  img: '' },
  { id: 'd-8',  section: 'deals', icon: '\uD83E\uDDF6', name: "Color Hollow Women's Sweater Spring Autumn",            usd: 6,  discount: '-14%', img: '' },
  { id: 'd-9',  section: 'deals', icon: '\uD83D\uDD26', name: 'DJ Disco Light AC85-265V 1W LED Mini Stage',            usd: 5,  discount: '-17%', img: '' },
  { id: 'd-10', section: 'deals', icon: '\uD83E\uDDD8', name: '4 Pairs Women Anti-skid Yoga Socks Grips',              usd: 5,  discount: '-17%', img: '' },
  { id: 'd-11', section: 'deals', icon: '\uD83E\uDDE3', name: 'Solid Color Hair Towel Textured Dry Hair Cap',          usd: 3,  discount: '-20%', img: '' },
  { id: 'd-12', section: 'deals', icon: '\uD83D\uDC76', name: 'Baby Set Letter Long Sleeve Hooded Top Romper',         usd: 8,  discount: '-20%', img: '' },
  { id: 'd-13', section: 'deals', icon: '\uD83D\uDC8D', name: 'African Style Artistic Temperament Egg Ring',          usd: 4,  discount: '-43%', img: '' },
  { id: 'd-14', section: 'deals', icon: '\uD83C\uDF39', name: '1000pcs Colorful Love Romantic Warm Petals',            usd: 3,  discount: '-20%', img: '' },
  { id: 'd-15', section: 'deals', icon: '\uD83D\uDEAA', name: 'Independent Door Sensor Burglar Alarm System',          usd: 2,  discount: '-15%', img: '' },
  { id: 'd-16', section: 'deals', icon: '\uD83C\uDF3F', name: '10PCS/Bag 100% Natural Herbal Anti Stress Patch',       usd: 2,  discount: '-10%', img: '' },
  { id: 'd-17', section: 'deals', icon: '\uD83D\uDC5F', name: "Men's Leather Casual Shoes Plus Size",                  usd: 6,  discount: '-12%', img: '' },
  { id: 'd-18', section: 'deals', icon: '\u231A',        name: "Fashion Men's Luxury Alloy Quartz Watch",              usd: 2,  discount: '-18%', img: '' },
  { id: 'd-19', section: 'deals', icon: '\uD83C\uDF73', name: '200ML Oil Spray Bottle BBQ Cooking Olive Oil',          usd: 3,  discount: '-10%', img: '' },
  { id: 'd-20', section: 'deals', icon: '\uD83D\uDC8E', name: 'Fashion Women Watches Luxury Magnetic Square',          usd: 4,  discount: '-12%', img: '' },
  { id: 'd-21', section: 'deals', icon: '\uD83D\uDC55', name: 'Men T-Shirt Oversized Graphic Tee Streetwear',          usd: 3,  discount: '-25%', img: '' },
  { id: 'd-22', section: 'deals', icon: '\uD83C\uDFA7', name: 'Bluetooth 5.3 Headphone TWS Wireless Earbuds Pro',      usd: 3,  discount: '-25%', img: '' },
  { id: 'd-23', section: 'deals', icon: '\uD83C\uDFB8', name: 'Hot Guitar Audio Interface Tuner Cable Kit',            usd: 3,  discount: '-33%', img: '' },
  { id: 'd-24', section: 'deals', icon: '\uD83D\uDCF1', name: 'Baby Phone Toys Bilingual Telephone Learning',          usd: 4,  discount: '-20%', img: '' },

  { id: 'fl-1', section: 'flash', icon: '\uD83C\uDCCF', name: '24K Gold Playing Cards Poker Game',         usd: 4,  img: '' },
  { id: 'fl-2', section: 'flash', icon: '\u231A',        name: 'Imported Genuine Automatic Movement Watch', usd: 3,  img: '' },
  { id: 'fl-3', section: 'flash', icon: '\uD83D\uDC57', name: "New Large Size Women's Solid Shirt Suit",   usd: 10, img: '' },
  { id: 'fl-4', section: 'flash', icon: '\uD83E\uDDE5', name: "Autumn Large Size Women's Suit",            usd: 14, img: '' },
  { id: 'fl-5', section: 'flash', icon: '\uD83C\uDFB8', name: 'Hot Guitar Audio Interface Tuner',          usd: 3,  img: '' },
  { id: 'fl-6', section: 'flash', icon: '\uD83D\uDC5F', name: 'Classic Leather Running Shoes',             usd: 8,  img: '' },
  { id: 'fl-7', section: 'flash', icon: '\uD83C\uDFA7', name: 'Wireless Earbuds Bluetooth 5.3 TWS',        usd: 6,  img: '' },
  { id: 'fl-8', section: 'flash', icon: '\uD83D\uDD76', name: 'Polarized UV400 Sunglasses Unisex',         usd: 5,  img: '' },
];

const SEED_HERO = [
  { id: 'hero-1', label: 'Slide 1', subtitle: 'New Arrivals', text: 'Fresh styles, unbeatable prices', bg: 'linear-gradient(135deg,#e91e8c,#7b2ff7)', icon: '\uD83D\uDECD\uFE0F', img: '' },
  { id: 'hero-2', label: 'Slide 2', subtitle: 'Hot Sales',    text: 'Up to 50% off today only',        bg: 'linear-gradient(135deg,#4f8ef7,#1a1a9e)', icon: '\uD83D\uDD25',       img: '' },
  { id: 'hero-3', label: 'Slide 3', subtitle: 'Flash Deals',  text: 'Limited time, massive savings',   bg: 'linear-gradient(135deg,#7b2ff7,#4f8ef7)', icon: '\u26A1',            img: '' },
];

const SEED_TILES = [
  { id: 'tile-1', name: "Men's Shoes",   slug: 'mens-shoes',   icon: '\uD83D\uDC5F', bg: 'tile-blue',   img: '' },
  { id: 'tile-2', name: "Women's Shoes", slug: 'womens-shoes', icon: '\uD83D\uDC60', bg: 'tile-purple', img: '' },
  { id: 'tile-3', name: 'Phone',         slug: 'phones',       icon: '\uD83D\uDCF1', bg: 'tile-teal',   img: '' },
  { id: 'tile-4', name: 'Accessories',   slug: 'accessories',  icon: '\uD83D\uDC8D', bg: 'tile-indigo', img: '' },
];

function initStore() {
  ensureDataDir();
  if (!fs.existsSync(PRODUCTS_FILE)) writeJson(PRODUCTS_FILE, SEED_PRODUCTS);
  if (!fs.existsSync(HERO_FILE)) writeJson(HERO_FILE, SEED_HERO);
  if (!fs.existsSync(TILES_FILE)) writeJson(TILES_FILE, SEED_TILES);
}

// =====================
// PRODUCTS (deals + flash sale, unified — split by `section`)
// =====================
function getAllProducts() {
  return readJson(PRODUCTS_FILE, []);
}

function createProduct(input) {
  const products = getAllProducts();
  const section = input.section === 'flash' ? 'flash'
                : input.section === 'catalog' ? 'catalog'
                : 'deals';
  const product = {
    id: (section === 'flash' ? 'fl-' : section === 'catalog' ? 'cat-' : 'd-') + Date.now(),
    section,
    icon: input.icon || '\uD83D\uDCE6',
    name: input.name || 'New Product',
    usd: Number(input.usd) || 0,
    img: input.img || '',
    images: Array.isArray(input.images) ? input.images : [],
  };
  if (section === 'deals') product.discount = input.discount || '-0%';
  products.push(product);
  writeJson(PRODUCTS_FILE, products);
  return product;
}

function updateProduct(id, updates) {
  const products = getAllProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return null;
  const allowed = ['icon', 'name', 'usd', 'discount', 'img', 'images'];   // 'images' added
  allowed.forEach(key => {
    if (updates[key] !== undefined) products[idx][key] = updates[key];
  });
  writeJson(PRODUCTS_FILE, products);
  return products[idx];
}

function deleteProduct(id) {
  const products = getAllProducts();
  const next = products.filter(p => p.id !== id);
  const changed = next.length !== products.length;
  if (changed) writeJson(PRODUCTS_FILE, next);
  return changed;
}

// =====================
// HERO SLIDES
// =====================
function getHero() {
  return readJson(HERO_FILE, []);
}

function updateHeroSlide(id, updates) {
  const slides = getHero();
  const idx = slides.findIndex(h => h.id === id);
  if (idx === -1) return null;
  const allowed = ['subtitle', 'text', 'img'];
  allowed.forEach(key => {
    if (updates[key] !== undefined) slides[idx][key] = updates[key];
  });
  writeJson(HERO_FILE, slides);
  return slides[idx];
}

// =====================
// CATEGORY TILES
// =====================
function getTiles() {
  return readJson(TILES_FILE, []);
}

function updateTile(id, updates) {
  const tiles = getTiles();
  const idx = tiles.findIndex(t => t.id === id);
  if (idx === -1) return null;
  const allowed = ['name', 'img'];
  allowed.forEach(key => {
    if (updates[key] !== undefined) tiles[idx][key] = updates[key];
  });
  writeJson(TILES_FILE, tiles);
  return tiles[idx];
}

module.exports = {
  initStore,
  getAllProducts, createProduct, updateProduct, deleteProduct,
  getHero, updateHeroSlide,
  getTiles, updateTile,
};