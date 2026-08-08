// =====================
// DATA STORE — Postgres-backed (Render free tier)
// Same exported function shape as before (initStore, getAllProducts,
// createProduct, updateProduct, deleteProduct, getHero, updateHeroSlide,
// getTiles, updateTile, readOrders, saveOrder) — but every function is
// now async, since it talks to a real database over the network instead
// of reading/writing local JSON files.
// =====================
const pool = require('./db');

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

async function initStore() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY, section TEXT NOT NULL, icon TEXT, name TEXT,
      usd NUMERIC DEFAULT 0, discount TEXT, img TEXT, images JSONB DEFAULT '[]'::jsonb
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hero_slides (
      id TEXT PRIMARY KEY, label TEXT, subtitle TEXT, text TEXT, bg TEXT, icon TEXT, img TEXT
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tiles (
      id TEXT PRIMARY KEY, name TEXT, slug TEXT, icon TEXT, bg TEXT, img TEXT
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY, method TEXT, transaction_id TEXT, flw_status TEXT,
      amount NUMERIC, currency TEXT, order_data JSONB, created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
  await pool.query(`
  CREATE TABLE IF NOT EXISTS image_library (
    url TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now()
  );
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS sellers (
    id TEXT PRIMARY KEY,
    store_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone TEXT, country TEXT, description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );
`);
await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS seller_id TEXT REFERENCES sellers(id) ON DELETE CASCADE;`);
await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;`);
await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;`);

  const { rows: pc } = await pool.query('SELECT COUNT(*) FROM products');
  if (Number(pc[0].count) === 0) {
    for (const p of SEED_PRODUCTS) {
      await pool.query(
        `INSERT INTO products (id, section, icon, name, usd, discount, img, images) VALUES ($1,$2,$3,$4,$5,$6,$7,'[]'::jsonb)`,
        [p.id, p.section, p.icon, p.name, p.usd, p.discount || null, p.img || '']
      );
    }
  }
  const { rows: hc } = await pool.query('SELECT COUNT(*) FROM hero_slides');
  if (Number(hc[0].count) === 0) {
    for (const h of SEED_HERO) {
      await pool.query(
        `INSERT INTO hero_slides (id, label, subtitle, text, bg, icon, img) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [h.id, h.label, h.subtitle, h.text, h.bg, h.icon, h.img || '']
      );
    }
  }
  const { rows: tc } = await pool.query('SELECT COUNT(*) FROM tiles');
  if (Number(tc[0].count) === 0) {
    for (const t of SEED_TILES) {
      await pool.query(
        `INSERT INTO tiles (id, name, slug, icon, bg, img) VALUES ($1,$2,$3,$4,$5,$6)`,
        [t.id, t.name, t.slug, t.icon, t.bg, t.img || '']
      );
    }
  }
}

function rowToProduct(row) {
  return {
    id: row.id, section: row.section, icon: row.icon, name: row.name,
    usd: Number(row.usd), discount: row.discount || undefined,
    img: row.img || '', images: row.images || [],
  };
}

async function getAllProducts() {
  const { rows } = await pool.query('SELECT * FROM products ORDER BY id');
  return rows.map(rowToProduct);
}

async function createProduct(input) {
  const section = input.section === 'flash' ? 'flash' : input.section === 'catalog' ? 'catalog' : 'deals';
  const id = (section === 'flash' ? 'fl-' : section === 'catalog' ? 'cat-' : 'd-') + Date.now();
  const icon = input.icon || '\uD83D\uDCE6';
  const name = input.name || 'New Product';
  const usd = Number(input.usd) || 0;
  const discount = section === 'deals' ? (input.discount || '-0%') : null;
  const img = input.img || '';
  const images = Array.isArray(input.images) ? input.images : [];

  await pool.query(
    `INSERT INTO products (id, section, icon, name, usd, discount, img, images) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [id, section, icon, name, usd, discount, img, JSON.stringify(images)]
  );
  return { id, section, icon, name, usd, discount: discount || undefined, img, images };
}

async function updateProduct(id, updates) {
  const { rows } = await pool.query('SELECT * FROM products WHERE id=$1', [id]);
  if (!rows.length) return null;
  const cur = rowToProduct(rows[0]);
  const m = {
    icon: updates.icon !== undefined ? updates.icon : cur.icon,
    name: updates.name !== undefined ? updates.name : cur.name,
    usd: updates.usd !== undefined ? updates.usd : cur.usd,
    discount: updates.discount !== undefined ? updates.discount : cur.discount,
    img: updates.img !== undefined ? updates.img : cur.img,
    images: updates.images !== undefined ? updates.images : cur.images,
  };
  await pool.query(
    `UPDATE products SET icon=$1, name=$2, usd=$3, discount=$4, img=$5, images=$6 WHERE id=$7`,
    [m.icon, m.name, m.usd, m.discount || null, m.img, JSON.stringify(m.images), id]
  );
  return { id, section: cur.section, ...m };
}

async function deleteProduct(id) {
  const res = await pool.query('DELETE FROM products WHERE id=$1', [id]);
  return res.rowCount > 0;
}

async function getHero() {
  const { rows } = await pool.query('SELECT * FROM hero_slides ORDER BY id');
  return rows.map(r => ({ id: r.id, label: r.label, subtitle: r.subtitle, text: r.text, bg: r.bg, icon: r.icon, img: r.img || '' }));
}

async function updateHeroSlide(id, updates) {
  const { rows } = await pool.query('SELECT * FROM hero_slides WHERE id=$1', [id]);
  if (!rows.length) return null;
  const cur = rows[0];
  const subtitle = updates.subtitle !== undefined ? updates.subtitle : cur.subtitle;
  const text = updates.text !== undefined ? updates.text : cur.text;
  const img = updates.img !== undefined ? updates.img : cur.img;
  await pool.query('UPDATE hero_slides SET subtitle=$1, text=$2, img=$3 WHERE id=$4', [subtitle, text, img, id]);
  return { id, label: cur.label, subtitle, text, bg: cur.bg, icon: cur.icon, img };
}

async function getTiles() {
  const { rows } = await pool.query('SELECT * FROM tiles ORDER BY id');
  return rows.map(r => ({ id: r.id, name: r.name, slug: r.slug, icon: r.icon, bg: r.bg, img: r.img || '' }));
}

async function updateTile(id, updates) {
  const { rows } = await pool.query('SELECT * FROM tiles WHERE id=$1', [id]);
  if (!rows.length) return null;
  const cur = rows[0];
  const name = updates.name !== undefined ? updates.name : cur.name;
  const img = updates.img !== undefined ? updates.img : cur.img;
  await pool.query('UPDATE tiles SET name=$1, img=$2 WHERE id=$3', [name, img, id]);
  return { id, name, slug: cur.slug, icon: cur.icon, bg: cur.bg, img };
}

async function readOrders() {
  const { rows } = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
  return rows.map(r => ({
    id: r.id, method: r.method, transaction_id: r.transaction_id, flw_status: r.flw_status,
    amount: r.amount !== null ? Number(r.amount) : undefined, currency: r.currency,
    order: r.order_data, created_at: r.created_at,
  }));
}

async function saveOrder(order) {
  await pool.query(
    `INSERT INTO orders (id, method, transaction_id, flw_status, amount, currency, order_data) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [order.id, order.method, order.transaction_id || null, order.flw_status || null, order.amount ?? null, order.currency || null, JSON.stringify(order.order || {})]
  );
}

async function getLibrary() {
  const { rows } = await pool.query('SELECT url FROM image_library ORDER BY created_at DESC');
  return rows.map(r => r.url);
}
async function addToLibrary(url) {
  if (!url) return;
  await pool.query('INSERT INTO image_library (url) VALUES ($1) ON CONFLICT (url) DO NOTHING', [url]);
}
async function clearLibraryTable() {
  await pool.query('DELETE FROM image_library');
}

const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return salt + ':' + hash;
}
function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const check = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(check, 'hex'));
}

async function createSeller({ storeName, email, password, phone, country, description }) {
  const id = 'sel-' + Date.now();
  const passwordHash = hashPassword(password);
  await pool.query(
    `INSERT INTO sellers (id, store_name, email, password_hash, phone, country, description) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [id, storeName, email.toLowerCase(), passwordHash, phone || '', country || '', description || '']
  );
  return { id, storeName, email };
}

async function findSellerByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM sellers WHERE email=$1', [email.toLowerCase()]);
  return rows[0] || null;
}

async function getSellerById(id) {
  const { rows } = await pool.query('SELECT id, store_name, email, phone, country, description FROM sellers WHERE id=$1', [id]);
  return rows[0] || null;
}

async function updateSeller(id, updates) {
  const { rows } = await pool.query('SELECT * FROM sellers WHERE id=$1', [id]);
  if (!rows.length) return null;
  const cur = rows[0];
  const storeName = updates.storeName !== undefined ? updates.storeName : cur.store_name;
  const phone = updates.phone !== undefined ? updates.phone : cur.phone;
  const country = updates.country !== undefined ? updates.country : cur.country;
  const description = updates.description !== undefined ? updates.description : cur.description;
  await pool.query(
    'UPDATE sellers SET store_name=$1, phone=$2, country=$3, description=$4 WHERE id=$5',
    [storeName, phone, country, description, id]
  );
  return { id, storeName, phone, country, description };
}

async function getSellerProducts(sellerId) {
  const { rows } = await pool.query('SELECT * FROM products WHERE seller_id=$1 ORDER BY id DESC', [sellerId]);
  return rows.map(r => ({
    id: r.id, name: r.name, usd: Number(r.usd), stock: r.stock, category: r.category,
    icon: r.icon, img: r.img || '', images: r.images || [],
  }));
}

async function createSellerProduct(sellerId, input) {
  const id = 'sel-p-' + Date.now();
  const name = input.name || 'New Product';
  const usd = Number(input.usd) || 0;
  const stock = Number(input.stock) || 0;
  const category = input.category || '';
  const icon = input.icon || '\uD83D\uDCE6';
  const img = input.img || '';
  await pool.query(
    `INSERT INTO products (id, section, icon, name, usd, img, images, seller_id, stock, category) VALUES ($1,'seller',$2,$3,$4,$5,'[]'::jsonb,$6,$7,$8)`,
    [id, icon, name, usd, img, sellerId, stock, category]
  );
  return { id, name, usd, stock, category, icon, img, images: [] };
}

async function updateSellerProduct(sellerId, id, updates) {
  const { rows } = await pool.query('SELECT * FROM products WHERE id=$1 AND seller_id=$2', [id, sellerId]);
  if (!rows.length) return null; // not found OR not owned by this seller — same response either way
  const cur = rows[0];
  const name = updates.name !== undefined ? updates.name : cur.name;
  const usd = updates.usd !== undefined ? Number(updates.usd) : Number(cur.usd);
  const stock = updates.stock !== undefined ? Number(updates.stock) : cur.stock;
  const category = updates.category !== undefined ? updates.category : cur.category;
  const img = updates.img !== undefined ? updates.img : cur.img;
  await pool.query(
    'UPDATE products SET name=$1, usd=$2, stock=$3, category=$4, img=$5 WHERE id=$6 AND seller_id=$7',
    [name, usd, stock, category, img, id, sellerId]
  );
  return { id, name, usd, stock, category, img };
}

async function deleteSellerProduct(sellerId, id) {
  const res = await pool.query('DELETE FROM products WHERE id=$1 AND seller_id=$2', [id, sellerId]);
  return res.rowCount > 0;
}

module.exports = {
  initStore,
  getAllProducts, createProduct, updateProduct, deleteProduct,
  getHero, updateHeroSlide,
  getTiles, updateTile,
  readOrders, saveOrder,
  getLibrary, addToLibrary, clearLibraryTable,
  hashPassword, verifyPassword,
  createSeller, findSellerByEmail, getSellerById, updateSeller,
  getSellerProducts, createSellerProduct, updateSellerProduct, deleteSellerProduct,
};