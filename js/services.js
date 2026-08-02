// =====================
// FAQ DATA
// =====================
const faqData = [
  { category: 'shipping', q: 'How long does delivery take?', a: 'Standard delivery takes 7–14 business days, and Express delivery takes 3–5 business days, depending on your location.' },
  { category: 'shipping', q: 'Do you deliver outside Uganda?', a: 'Yes — we currently ship to Uganda, Kenya, Nigeria, Ghana, and several other countries. Delivery time and cost vary by destination.' },
  { category: 'shipping', q: 'How much does shipping cost?', a: 'Standard delivery is free. Express delivery costs a flat $4.99, shown at checkout before you pay.' },

  { category: 'payments', q: 'What payment methods do you accept?', a: 'We accept credit/debit cards, Mobile Money, bank transfer, and Cash on Delivery (COD) in supported areas.' },
  { category: 'payments', q: 'Is my payment information safe?', a: 'Yes — card and mobile money payments are processed securely through Flutterwave. We never see or store your card number or PIN.' },
  { category: 'payments', q: 'Can I pay in my local currency?', a: 'Yes — use the currency switcher in the header to view and pay in USD, EUR, GBP, UGX, KES, NGN, GHS, CNY, or INR.' },

  { category: 'returns', q: 'What is your return policy?', a: 'You can return most items within 30 days of delivery for a full refund, as long as they\u2019re unused and in original packaging.' },
  { category: 'returns', q: 'How do I start a return?', a: 'Contact us using the form below with your order ID, and our support team will send you return instructions within 24 hours.' },
  { category: 'returns', q: 'When will I get my refund?', a: 'Refunds are processed within 24\u201348 hours of us receiving your returned item, and typically appear in 3\u20137 business days depending on your payment method.' },

  { category: 'account', q: 'How do I reset my password?', a: 'Go to the Login page and click "Forgot password?" \u2014 we\u2019ll email you a reset link.' },
  { category: 'account', q: 'Is my personal data safe with Mega Ads?', a: 'Yes \u2014 we never sell your data, and all account information is encrypted both in transit and at rest.' },
  { category: 'account', q: 'Can I delete my account?', a: 'Yes \u2014 contact support using the form below and we\u2019ll process your account deletion request within 5 business days.' },
];

let activeFaqCategory = 'all';

// =====================
// FAQ RENDER
// =====================
function renderFaq(items) {
  const list = document.getElementById('faqList');
  const empty = document.getElementById('faqEmpty');
  if (!list) return;

  if (!items.length) {
    list.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  list.innerHTML = items.map((item, i) => `
    <div class="faq-item" id="faq-item-${i}">
      <div class="faq-question" onclick="toggleFaqItem(${i})">
        <span>${item.q}</span>
        <span class="faq-caret">&#9662;</span>
      </div>
      <div class="faq-answer">${item.a}</div>
    </div>
  `).join('');
}

function toggleFaqItem(i) {
  const el = document.getElementById('faq-item-' + i);
  if (el) el.classList.toggle('open');
}

// =====================
// FILTER BY CATEGORY (pills + service-grid links)
// =====================
function filterFaq(category) {
  activeFaqCategory = category;

  document.querySelectorAll('.faq-pill').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.faq-pill').forEach(p => {
    if (p.getAttribute('onclick') && p.getAttribute('onclick').includes("'" + category + "'")) {
      p.classList.add('active');
    }
  });

  const helpInput = document.getElementById('helpSearchInput');
  if (helpInput) helpInput.value = '';

  const items = category === 'all' ? faqData : faqData.filter(f => f.category === category);
  renderFaq(items);

  const faqSection = document.getElementById('faq');
  if (faqSection) faqSection.scrollIntoView({ behavior: 'smooth' });
}

// =====================
// SEARCH (hero search box + quick-search tags)
// =====================
function handleHelpSearch(value) {
  const q = value.trim().toLowerCase();
  if (!q) {
    filterFaq(activeFaqCategory);
    return;
  }
  const results = faqData.filter(f =>
    f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
  );
  renderFaq(results);
}

function quickSearch(term) {
  const helpInput = document.getElementById('helpSearchInput');
  if (helpInput) helpInput.value = term;
  handleHelpSearch(term);
  const faqSection = document.getElementById('faq');
  if (faqSection) faqSection.scrollIntoView({ behavior: 'smooth' });
}

// =====================
// CONTACT FORM
// =====================
function handleContactSubmit(event) {
  event.preventDefault();
  showToast('\u2705 Message sent! We\u2019ll get back to you within 24 hours.');
  document.getElementById('contactForm').reset();
}

// =====================
// INIT
// =====================
document.addEventListener('DOMContentLoaded', () => {
  renderFaq(faqData);
});