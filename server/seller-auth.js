const store = require('./data-store');

async function verifySellerCredentials(email, password) {
  if (!email || !password) return null;
  const seller = await store.findSellerByEmail(email);
  if (!seller) return null;
  const ok = store.verifyPassword(password, seller.password_hash);
  return ok ? seller : null;
}

function requireSellerApi(req, res, next) {
  if (req.session && req.session.sellerId) return next();
  return res.status(401).json({ success: false, message: 'Not logged in' });
}

function requireSellerPage(req, res, next) {
  if (req.session && req.session.sellerId) return next();
  return res.redirect('/seller/login.html');
}

module.exports = { verifySellerCredentials, requireSellerApi, requireSellerPage };