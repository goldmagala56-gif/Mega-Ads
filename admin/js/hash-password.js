// One-time helper: turns a plain password into a bcrypt hash you paste into .env.
// Run it like: node hash-password.js "your-real-password-here"
// Then copy the printed hash into ADMIN_PASSWORD_HASH in your .env file.
// Never put the plain password itself in .env — only this hash.

const bcrypt = require('bcryptjs');

const plainPassword = process.argv[2];

if (!plainPassword) {
  console.log('\nUsage: node hash-password.js "your-password-here"\n');
  process.exit(1);
}

const hash = bcrypt.hashSync(plainPassword, 10);
console.log('\nPaste this into your .env file as ADMIN_PASSWORD_HASH:\n');
console.log(hash);
console.log('');