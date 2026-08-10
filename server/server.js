require('dotenv').config();
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const { verifySellerCredentials, requireSellerApi, requireSellerPage } = require('./seller-auth');

const store = require('./data-store');
const { verifyAdminCredentials, requireAdminApi, requireAdminPage } = require('./admin-auth');

const app = express();
app.use(express.json());

const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY || '';
const FLW_PUBLIC_KEY = process.env.FLW_PUBLIC_KEY || '';

if (!FLW_SECRET_KEY || !FLW_PUBLIC_KEY) {
  console.warn('\n\u26A0\uFE0F  FLW_SECRET_KEY / FLW_PUBLIC_KEY are not set. Payments will not work until this is done.\n');
}

const crypto = require('crypto');

function generateOrderId() {
  // MA- + 8 random hex characters (uppercase) — e.g. MA-7F3A9C2B
  // crypto.randomBytes is cryptographically random, not time-based,
  // so two orders placed in the same millisecond can never collide.
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return 'MA-' + random;
}

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

app.use(session({
  secret: process.env.SESSION_SECRET || 'megaads-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 8, secure: false },
}));

// =====================
// IMAGE UPLOADS — via Cloudinary instead of local disk
// =====================
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });


// =====================
// ADMIN AUTH
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

app.post('/api/seller/register', async (req, res) => {
  try {
    const { storeName, email, password, phone, country, description } = req.body || {};
    if (!storeName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Store name, email, and password are required' });
    }
    const existing = await store.findSellerByEmail(email);
    if (existing) return res.status(409).json({ success: false, message: 'An account with that email already exists' });

    const seller = await store.createSeller({ storeName, email, password, phone, country, description });
    req.session.sellerId = seller.id;
    req.session.sellerStoreName = seller.storeName;
    res.json({ success: true, seller });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Database error' }); }
});

app.post('/api/seller/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const seller = await verifySellerCredentials(email, password);
    if (!seller) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    req.session.sellerId = seller.id;
    req.session.sellerStoreName = seller.store_name;
    res.json({ success: true, seller: { id: seller.id, storeName: seller.store_name, email: seller.email } });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Database error' }); }
});

app.post('/api/seller/logout', (req, res) => {
  req.session.sellerId = null;
  req.session.sellerStoreName = null;
  res.json({ success: true });
});

app.get('/api/seller/session', (req, res) => {
  res.json({
    isSeller: !!(req.session && req.session.sellerId),
    sellerId: req.session ? req.session.sellerId : null,
    storeName: req.session ? req.session.sellerStoreName : null,
  });
});

app.get('/api/seller/products', requireSellerApi, async (req, res) => {
  try { res.json(await store.getSellerProducts(req.session.sellerId)); }
  catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Database error' }); }
});

app.post('/api/seller/products', requireSellerApi, async (req, res) => {
  try { res.json({ success: true, product: await store.createSellerProduct(req.session.sellerId, req.body || {}) }); }
  catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Database error' }); }
});

app.put('/api/seller/products/:id', requireSellerApi, async (req, res) => {
  try {
    const updated = await store.updateSellerProduct(req.session.sellerId, req.params.id, req.body || {});
    if (!updated) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product: updated });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Database error' }); }
});

app.delete('/api/seller/products/:id', requireSellerApi, async (req, res) => {
  try {
    const ok = await store.deleteSellerProduct(req.session.sellerId, req.params.id);
    if (!ok) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Database error' }); }
});

app.put('/api/seller/settings', requireSellerApi, async (req, res) => {
  try {
    const updated = await store.updateSeller(req.session.sellerId, req.body || {});
    res.json({ success: true, seller: updated });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Database error' }); }
});

// =====================
// PRODUCTS API
// =====================
app.get('/api/products', async (req, res) => {
  try { res.json(await store.getAllProducts()); }
  catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Database error' }); }
});

app.post('/api/products', requireAdminApi, async (req, res) => {
  try { res.json({ success: true, product: await store.createProduct(req.body || {}) }); }
  catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Database error' }); }
});

app.put('/api/products/:id', requireAdminApi, async (req, res) => {
  try {
    const updated = await store.updateProduct(req.params.id, req.body || {});
    if (!updated) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product: updated });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Database error' }); }
});

app.delete('/api/products/:id', requireAdminApi, async (req, res) => {
  try {
    const ok = await store.deleteProduct(req.params.id);
    if (!ok) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Database error' }); }
});

// =====================
// HERO SLIDES API
// =====================
app.get('/api/hero', async (req, res) => {
  try { res.json(await store.getHero()); }
  catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Database error' }); }
});

app.put('/api/hero/:id', requireAdminApi, async (req, res) => {
  try {
    const updated = await store.updateHeroSlide(req.params.id, req.body || {});
    if (!updated) return res.status(404).json({ success: false, message: 'Slide not found' });
    res.json({ success: true, slide: updated });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Database error' }); }
});

// =====================
// CATEGORY TILES API
// =====================
app.get('/api/tiles', async (req, res) => {
  try { res.json(await store.getTiles()); }
  catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Database error' }); }
});

app.put('/api/tiles/:id', requireAdminApi, async (req, res) => {
  try {
    const updated = await store.updateTile(req.params.id, req.body || {});
    if (!updated) return res.status(404).json({ success: false, message: 'Tile not found' });
    res.json({ success: true, tile: updated });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Database error' }); }
});

// =====================
// ORDERS / PAYMENTS
// =====================
app.get('/api/config', (req, res) => {
  res.json({ publicKey: FLW_PUBLIC_KEY });
});

app.post('/api/verify-payment', async (req, res) => {
  const { transaction_id, expected_amount, expected_currency, order } = req.body;

  if (!transaction_id || expected_amount === undefined || !expected_currency) {
    return res.status(400).json({ success: false, message: 'Missing transaction_id, expected_amount, or expected_currency' });
  }
  if (!FLW_SECRET_KEY) {
    return res.status(500).json({ success: false, message: 'Server is missing FLW_SECRET_KEY \u2014 cannot verify payments yet.' });
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
        id: generateOrderId(),
        method: 'flutterwave',
        transaction_id, flw_status: data.status, amount: data.amount, currency: data.currency,
        order: order || {},
      };
      await store.saveOrder(record);
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

app.post('/api/record-cod-order', async (req, res) => {
  try {
    const { order, amount, currency } = req.body;
    const record = {
      id: generateOrderId(),
      method: 'cash_on_delivery',
      amount, currency, order: order || {},
    };
    await store.saveOrder(record);
    res.json({ success: true, order: record });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Database error' }); }
});

app.get('/api/orders', requireAdminApi, async (req, res) => {
  try { res.json(await store.readOrders()); }
  catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Database error' }); }
});

app.get('/api/library', requireAdminApi, async (req, res) => {
  try { res.json(await store.getLibrary()); }
  catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Database error' }); }
});
app.post('/api/library', requireAdminApi, async (req, res) => {
  try {
    const { url } = req.body || {};
    if (!url) return res.status(400).json({ success: false, message: 'Missing url' });
    await store.addToLibrary(url);
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Database error' }); }
});
app.delete('/api/library', requireAdminApi, async (req, res) => {
  try { await store.clearLibraryTable(); res.json({ success: true }); }
  catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Database error' }); }
});

function requireAdminOrSellerApi(req, res, next) {
  if (req.session && (req.session.isAdmin || req.session.sellerId)) return next();
  return res.status(401).json({ success: false, message: 'Not logged in' });
}

app.post('/api/upload', requireAdminOrSellerApi, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file received' });

  const uploadStream = cloudinary.uploader.upload_stream({ folder: 'mega-ads' }, (error, result) => {
    if (error) {
      console.error('Cloudinary upload error:', error);
      return res.status(500).json({ success: false, message: 'Upload failed' });
    }
    res.json({ success: true, url: result.secure_url });
  });
  uploadStream.end(req.file.buffer);
});

app.post('/api/upload', requireAdminOrSellerApi, upload.single('image'), (req, res) => {
  // ...unchanged body...
});

// =====================
// ADMIN PAGE PROTECTION
// =====================
app.get('/admin', requireAdminPage, (req, res) => res.redirect('/admin/index.html'));
app.get('/admin/', requireAdminPage, (req, res) => res.redirect('/admin/index.html'));
app.get('/admin/index.html', requireAdminPage, (req, res, next) => next());
app.get('/seller', requireSellerPage, (req, res) => res.redirect('/seller/seller.html'));
app.get('/seller/', requireSellerPage, (req, res) => res.redirect('/seller/seller.html'));
app.get('/seller/seller.html', requireSellerPage, (req, res, next) => next());

app.use(express.static(path.join(__dirname, '..')));

const PORT = process.env.PORT || 3000;

store.initStore()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n\uD83D\uDE80 Mega Ads running at http://localhost:${PORT}\n`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

  async function saveOrderWithUniqueId(orderData) {
  let attempts = 0;
  while (attempts < 5) {
    const id = generateOrderId();
    try {
      await store.saveOrder({ ...orderData, id });
      return id;
    } catch (err) {
      if (err.code === '23505') { attempts++; continue; } // unique_violation — try again
      throw err;
    }
  }
  throw new Error('Could not generate a unique order ID after 5 attempts');
}