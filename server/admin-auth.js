// =====================
// ADMIN AUTH
// Simple single-admin session login. Good enough for one shop owner;
// if you ever have multiple admin accounts, this is the file to expand
// into a real users table.
// =====================
const bcrypt = require('bcryptjs');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme123';

if (!process.env.ADMIN_PASSWORD) {
  console.warn(
    '\n\u26A0\uFE0F  ADMIN_PASSWORD is not set in server/.env \u2014 using the default "changeme123".\n' +
    '   Set ADMIN_USERNAME and ADMIN_PASSWORD in server/.env before this goes anywhere public.\n'
  );
}

// Hash once at startup rather than storing/comparing the plain password on every request.
const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, 10);

function verifyAdminCredentials(username, password) {
  if (username !== ADMIN_USERNAME) return false;
  return bcrypt.compareSync(password || '', passwordHash);
}

// For fetch() calls from admin.js — returns JSON 401 instead of redirecting,
// since a redirect doesn't make sense as a response to an API call.
function requireAdminApi(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ success: false, message: 'Not authenticated' });
}

// For the actual admin HTML page — sends the browser to the login page.
function requireAdminPage(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.redirect('/admin/login.html');
}

module.exports = { verifyAdminCredentials, requireAdminApi, requireAdminPage };