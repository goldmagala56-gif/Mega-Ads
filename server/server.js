require('dotenv').config();
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const store = require('./data-store');
const { verifyAdminCredentials, requireAdminApi, requireAdminPage } = require('./admin-auth');

const app = express();
app.use(express.json());

store.initStore();

const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY || '';
const FLW_PUBLIC_KEY = process.env.FLW_PUBLIC_KEY || '';

if (!FLW_SECRET_KEY || !FLW_PUBLIC_KEY) {
  console.warn(
    '\n\u26A0\uFE0F  FLW_SECRET_KEY / FLW_PUBLIC_KEY are not set.\n' +
    '   Copy server/.env.example to server/.env and fill in your Flutterwave TEST keys,\n' +
    '   then restart the server. Payments will not work until this is done.\n'
  );
}

// =====================
// SESSIONS (for admin login)
// MemoryStore is fine for a single small store like this during
// development, but it forgets everyone every time the server restarts,
// and isn't meant for a real multi-instance production deployment.
// Swap for connect-sqlite3 / connect-pg-simple later if that matters to you.
// =====================
app.use(session({
  secret: process.env.SESSION_SECRET || 'megaads-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 8, // 8 hours
    secure: false, // set true once you're serving over HTTPS
  },
}));

// =====================
// IMAGE UPLOADS
// Uploaded files are saved to disk under server/uploads and served back
// at /uploads/<filename> — this replaces storing raw base64 image data
// inside the JSON files, which would otherwise bloat fast.
// =====================
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      cb(null, Date.now() + '-' + safeName);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

app.post('/api/upload', requireAdminApi, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file received' });
  res.json({ success: true, url: '/uploads/' + req.file.filename });
});

app.use('/uploads', express.static(UPLOADS_DIR));

// =====================
// ADMIN AUTH ROUTES
// =====================
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!verifyAdminCredentials(username, password)) {
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  }
  req.session.isAdmin = true;
  req.session.username = username;
  res.json({ success: true });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

app.get('/api/admin/session', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

// =====================
// PRODUCTS API
// GET is public (the storefront needs it too). Writes require admin login.
// =====================
app.get('/api/products', (req, res) => {
  res.json(store.getAllProducts());
});

app.post('/api/products', requireAdminApi, (req, res) => {
  res.json({ success: true, product: store.createProduct(req.body || {}) });
});

app.put('/api/products/:id', requireAdminApi, (req, res) => {
  const updated = store.updateProduct(req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product: updated });
});

app.delete('/api/products/:id', requireAdminApi, (req, res) => {
  const ok = store.deleteProduct(req.params.id);
  if (!ok) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true });
});

// =====================
// HERO SLIDES API
// =====================
app.get('/api/hero', (req, res) => {
  res.json(store.getHero());
});

app.put('/api/hero/:id', requireAdminApi, (req, res) => {
  const updated = store.updateHeroSlide(req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ success: false, message: 'Slide not found' });
  res.json({ success: true, slide: updated });
});

// =====================
// CATEGORY TILES API
// =====================
app.get('/api/tiles', (req, res) => {
  res.json(store.getTiles());
});

app.put('/api/tiles/:id', requireAdminApi, (req, res) => {
  const updated = store.updateTile(req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ success: false, message: 'Tile not found' });
  res.json({ success: true, tile: updated });
});

// =====================
// ORDERS (unchanged from before)
// =====================
const ORDERS_FILE = path.join(__dirname, 'orders.json');

function readOrders() {
  try { return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8')); }
  catch (e) { return []; }
}

function saveOrder(order) {
  const orders = readOrders();
  orders.push(order);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

app.get('/api/config', (req, res) => {
  res.json({ publicKey: FLW_PUBLIC_KEY });
});

app.post('/api/verify-payment', async (req, res) => {
  const { transaction_id, expected_amount, expected_currency, order } = req.body;

  if (!transaction_id || expected_amount === undefined || !expected_currency) {
    return res.status(400).json({ success: false, message: 'Missing transaction_id, expected_amount, or expected_currency' });
  }
  if (!FLW_SECRET_KEY) {
    return res.status(500).json({ success: false, message: 'Server is missing FLW_SECRET_KEY — cannot verify payments yet.' });
  }

  try {
    const flwRes = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      { headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` } }
    );

    const data = flwRes.data.data;
    const amountOk = Math.abs(Number(data.amount) - Number(expected_amount)) < 0.01;
    const currencyOk = data.currency === expected_currency;

    if (data.status === 'successful' && amountOk && currencyOk) {
      const record = {
        id: 'MA-' + Date.now().toString().slice(-8),
        method: 'flutterwave',
        transaction_id,
        flw_status: data.status,
        amount: data.amount,
        currency: data.currency,
        order: order || {},
        created_at: new Date().toISOString(),
      };
      saveOrder(record);
      return res.json({ success: true, order: record });
    }

    return res.json({
      success: false,
      message: !amountOk ? 'Amount mismatch' : !currencyOk ? 'Currency mismatch' : 'Transaction not successful',
      flw_status: data.status,
    });
  } catch (err) {
    console.error('Verification error:', err.response ? err.response.data : err.message);
    return res.status(502).json({ success: false, message: 'Could not reach Flutterwave to verify this transaction.' });
  }
});

app.post('/api/record-cod-order', (req, res) => {
  const { order, amount, currency } = req.body;
  const record = {
    id: 'MA-' + Date.now().toString().slice(-8),
    method: 'cash_on_delivery',
    amount,
    currency,
    order: order || {},
    created_at: new Date().toISOString(),
  };
  saveOrder(record);
  res.json({ success: true, order: record });
});

app.get('/api/orders', requireAdminApi, (req, res) => {
  res.json(readOrders());
});

// =====================
// PROTECT THE ADMIN PAGE ITSELF
// Must be registered BEFORE express.static, so unauthenticated requests
// get redirected instead of static-served straight through.
// =====================
app.get('/admin', requireAdminPage, (req, res) => {
  res.redirect('/admin/index.html');
});
app.get('/admin/', requireAdminPage, (req, res) => {
  res.redirect('/admin/index.html');
});
app.get('/admin/index.html', requireAdminPage, (req, res, next) => next());

// Serve the static Mega Ads site itself (index.html, css/, js/, seller/, admin/, etc.)
app.use(express.static(path.join(__dirname, '..')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n\uD83D\uDE80 Mega Ads running at http://localhost:${PORT}\n`);
});