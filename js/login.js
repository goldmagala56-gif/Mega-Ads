// =====================
// LOGIN & REGISTER LOGIC
// =====================

// =====================
// TAB SWITCHING
// =====================
function switchAuthTab(name, btn) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.getElementById('panel-' + name).classList.add('active');
}

// =====================
// PASSWORD VISIBILITY TOGGLE
// =====================
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '\uD83D\uDD12';
  } else {
    input.type = 'password';
    btn.textContent = '\uD83D\uDC41\uFE0F';
  }
}

// =====================
// PASSWORD STRENGTH METER
// =====================
function checkPasswordStrength(value) {
  const bar = document.getElementById('strengthBar');
  const label = document.getElementById('strengthLabel');

  let score = 0;
  if (value.length >= 6) score++;
  if (value.length >= 10) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  const levels = [
    { width: '0%',   color: '#eee',    text: '' },
    { width: '20%',  color: '#e53935', text: 'Very weak' },
    { width: '40%',  color: '#ff6b35', text: 'Weak' },
    { width: '60%',  color: '#ffb300', text: 'Fair' },
    { width: '80%',  color: '#4f8ef7', text: 'Good' },
    { width: '100%', color: '#2e7d32', text: 'Strong' },
  ];

  const lvl = value.length === 0 ? levels[0] : levels[Math.min(score, 5)];
  bar.style.width = lvl.width;
  bar.style.background = lvl.color;
  label.textContent = lvl.text;
}

// =====================
// LOGIN HANDLER
// =====================
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showToast('\u274C Please fill in all fields');
    return;
  }

  // simulate auth (no backend yet)
  const users = getStoredUsers();
  const user = users.find(u => u.email === email || u.phone === email);

  if (!user) {
    showToast('\u274C No account found with that email/phone');
    return;
  }
  if (user.password !== password) {
    showToast('\u274C Incorrect password');
    return;
  }

  localStorage.setItem('megaads_session', JSON.stringify({ name: user.name, email: user.email }));
  showToast('\u2705 Welcome back, ' + user.name + '!');
  setTimeout(() => { window.location.href = 'index.html'; }, 1000);
}

// =====================
// REGISTER HANDLER
// =====================
function handleRegister(e) {
  e.preventDefault();

  const name     = document.getElementById('regName').value.trim();
  const phone    = document.getElementById('regPhone').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm  = document.getElementById('regConfirm').value;
  const terms    = document.getElementById('termsCheck').checked;

  if (!name || !phone || !email || !password || !confirm) {
    showToast('\u274C Please fill in all fields');
    return;
  }
  if (password.length < 6) {
    showToast('\u274C Password must be at least 6 characters');
    return;
  }
  if (password !== confirm) {
    showToast('\u274C Passwords do not match');
    return;
  }
  if (!terms) {
    showToast('\u274C Please agree to the Terms of Service');
    return;
  }

  const users = getStoredUsers();
  if (users.find(u => u.email === email)) {
    showToast('\u274C An account with this email already exists');
    return;
  }

  users.push({ name, phone, email, password });
  localStorage.setItem('megaads_users', JSON.stringify(users));
  localStorage.setItem('megaads_session', JSON.stringify({ name, email }));

  showToast('\u2705 Account created! Welcome, ' + name + '!');
  setTimeout(() => { window.location.href = 'index.html'; }, 1200);
}

function getStoredUsers() {
  try {
    return JSON.parse(localStorage.getItem('megaads_users') || '[]');
  } catch(e) { return []; }
}

// =====================
// SOCIAL LOGIN (simulated)
// =====================
function socialLogin(provider) {
  showToast('\uD83D\uDD17 Connecting to ' + provider + '...');
  setTimeout(() => {
    localStorage.setItem('megaads_session', JSON.stringify({ name: 'Guest User', email: provider.toLowerCase() + '@social.com' }));
    showToast('\u2705 Logged in with ' + provider);
    setTimeout(() => { window.location.href = 'index.html'; }, 800);
  }, 900);
}

// =====================
// FORGOT PASSWORD MODAL
// =====================
function openForgotModal() {
  document.getElementById('forgotOverlay').classList.add('open');
  document.getElementById('forgotModal').classList.add('open');
  document.getElementById('forgotStep1').style.display = 'block';
  document.getElementById('forgotStep2').style.display = 'none';
}

function closeForgotModal() {
  document.getElementById('forgotOverlay').classList.remove('open');
  document.getElementById('forgotModal').classList.remove('open');
}

function sendResetLink() {
  const email = document.getElementById('forgotEmail').value.trim();
  if (!email) {
    showToast('\u274C Please enter your email');
    return;
  }
  document.getElementById('forgotSentTo').textContent = email;
  document.getElementById('forgotStep1').style.display = 'none';
  document.getElementById('forgotStep2').style.display = 'block';
}

// =====================
// INIT — redirect if already logged in
// =====================
document.addEventListener('DOMContentLoaded', () => {
  const session = localStorage.getItem('megaads_session');
  if (session) {
    const user = JSON.parse(session);
    showToast('You are already logged in as ' + user.name);
  }
});