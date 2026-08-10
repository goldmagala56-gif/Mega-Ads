// =====================
// CART & CHECKOUT LOGIC
// Depends on: cart[], persistCart(), convertPrice() from app.js, deals/flashProducts from data.js
// =====================

let selectedShippingCost = 0;
let selectedPaymentMethod = 'card';
let promoDiscount = 0;
let promoCode = '';

// =====================
// STAGE NAVIGATION
// =====================
function goToStage(name) {
  document.querySelectorAll('.stage').forEach(s => s.classList.remove('active'));
  document.getElementById('stage-' + name).classList.add('active');

  const order = ['cart', 'shipping', 'payment', 'confirmation'];
  const idx = order.indexOf(name);

  order.forEach((s, i) => {
    const stepEl = document.getElementById('step' + (i + 1));
    stepEl.classList.remove('active', 'done');
    if (i < idx) stepEl.classList.add('done');
    if (i === idx) stepEl.classList.add('active');
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (name === 'shipping' || name === 'payment') {
    refreshAllSummaries();
  }
}

// =====================
// RENDER CART ITEMS
// =====================
function renderCartItems() {
  const list = document.getElementById('cartItemsList');
  const emptyMsg = document.getElementById('cartEmptyMsg');

  document.getElementById('cartItemCount').textContent = cart.length;
  syncCartBadges();

  if (!cart.length) {
    list.style.display = 'none';
    emptyMsg.style.display = 'block';
    refreshAllSummaries();
    return;
  }

  list.style.display = 'block';
  emptyMsg.style.display = 'none';

  // group identical items
  const grouped = {};
  cart.forEach(item => {
    const key = item.name;
    if (!grouped[key]) grouped[key] = { ...item, qty: 0 };
    grouped[key].qty++;
  });

  list.innerHTML = Object.values(grouped).map((item, idx) => `
    <div class="cart-item" data-name="${item.name.replace(/"/g,'&quot;')}">
      <div class="cart-item-img">${item.img ? `<img src="${item.img}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:6px"/>` : item.icon}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-unit">Unit price: <span data-usd="${item.usdPrice}">${convertPrice(item.usdPrice)}</span></div>
      </div>
      <div class="cart-item-qty">
        <button onclick="changeCartQty('${item.name.replace(/'/g,"\\'")}', -1)">&#8722;</button>
        <span>${item.qty}</span>
        <button onclick="changeCartQty('${item.name.replace(/'/g,"\\'")}', 1)">&#43;</button>
      </div>
      <div class="cart-item-price" data-usd="${item.usdPrice * item.qty}">${convertPrice(item.usdPrice * item.qty)}</div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.name.replace(/'/g,"\\'")}')">&#10005;</button>
    </div>
  `).join('');

  refreshAllSummaries();
}

// =====================
// QTY / REMOVE
// =====================
function changeCartQty(name, delta) {
  if (delta > 0) {
    const ref = cart.find(i => i.name === name);
    if (ref) cart.push({ ...ref });
  } else {
    const idx = cart.findIndex(i => i.name === name);
    if (idx > -1) cart.splice(idx, 1);
  }
  persistCart();
  renderCartItems();
}

function removeFromCart(name) {
  cart = cart.filter(i => i.name !== name);
  persistCart();
  renderCartItems();
  showToast('Item removed from cart');
}

// =====================
// TOTALS
// =====================
function getSubtotalUsd() {
  return cart.reduce((sum, i) => sum + i.usdPrice, 0);
}

function refreshAllSummaries() {
  const subtotalUsd = getSubtotalUsd();
  const shippingUsd = selectedShippingCost;
  const discountUsd = subtotalUsd * promoDiscount;
  const totalUsd = Math.max(0, subtotalUsd + shippingUsd - discountUsd);

  // Stage 1
  setText('sumSubtotal', convertPrice(subtotalUsd));
  setText('sumShipping', shippingUsd === 0 ? 'Free' : convertPrice(shippingUsd));
  setText('sumTotal', convertPrice(totalUsd));
  if (promoDiscount > 0) {
    const promoEl = document.getElementById('promoApplied');
    if (promoEl) promoEl.style.display = 'flex';
    setText('sumDiscount', '-' + convertPrice(discountUsd));
  }

  // Stage 2
  setText('sumSubtotal2', convertPrice(subtotalUsd));
  setText('sumShipping2', shippingUsd === 0 ? 'Free' : convertPrice(shippingUsd));
  setText('sumTotal2', convertPrice(totalUsd));

  // Stage 3
  setText('sumSubtotal3', convertPrice(subtotalUsd));
  setText('sumShipping3', shippingUsd === 0 ? 'Free' : convertPrice(shippingUsd));
  setText('sumTotal3', convertPrice(totalUsd));
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// =====================
// PROMO CODE
// =====================
function applyPromo() {
  const code = document.getElementById('promoInput').value.trim().toUpperCase();
  const codes = { 'MEGA10': 0.10, 'WELCOME5': 0.05, 'SAVE20': 0.20 };
  if (codes[code]) {
    promoDiscount = codes[code];
    promoCode = code;
    refreshAllSummaries();
    showToast('\u2705 Promo code applied: ' + code);
  } else {
    showToast('\u274C Invalid promo code');
  }
}

// =====================
// SHIPPING SELECTION
// =====================
function selectShipping(el, cost) {
  document.querySelectorAll('.ship-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  selectedShippingCost = cost;
  refreshAllSummaries();
}

// =====================
// PAYMENT SELECTION
// =====================
function selectPayment(el, method) {
  document.querySelectorAll('.pay-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  selectedPaymentMethod = method;

  document.querySelectorAll('.payment-fields').forEach(f => f.style.display = 'none');
  document.getElementById('fields-' + method).style.display = 'block';
}

// =====================
// CURRENCY (cart page version)
// =====================
function renderCurrencyPillsCart() {
  const codes = ['USD','EUR','GBP','UGX','KES','NGN'];
  const wrap = document.getElementById('currencyPillsCart');
  wrap.innerHTML = codes.map(c => `
    <span class="currency-pill ${c === currentCurrency ? 'active' : ''}" onclick="switchCartCurrency('${c}', this)">${c}</span>
  `).join('');
}

function switchCartCurrency(code, el) {
  currentCurrency = code;
  document.querySelectorAll('#currencyPillsCart .currency-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  renderCartItems();
}

// =====================
// SHIPPING VALIDATION
// (the shipping form has no submit button of its own — the checkout
//  flow moves it forward manually, so we validate it manually too,
//  using the browser's built-in required-field checking)
// =====================
function proceedToPayment() {
  const form = document.getElementById('shippingForm');
  if (!form.reportValidity()) {
    showToast('\u274C Please fill in all required shipping fields');
    return;
  }
  goToStage('payment');
}

function getShippingDetails() {
  return {
    name: document.getElementById('shipName').value.trim(),
    phone: document.getElementById('shipPhone').value.trim(),
    email: document.getElementById('shipEmail').value.trim(),
    address: document.getElementById('shipAddress').value.trim(),
    city: document.getElementById('shipCity').value.trim(),
    country: document.getElementById('shipCountry').value,
    notes: document.getElementById('shipNotes').value.trim(),
  };
}

// =====================
// FLUTTERWAVE PUBLIC KEY
// fetched from our own server so it lives in exactly one place (.env)
// =====================
let flwPublicKey = null;

async function loadFlutterwaveConfig() {
  try {
    const res = await fetch('/api/config');
    const data = await res.json();
    flwPublicKey = data.publicKey || null;
  } catch (e) {
    console.warn('Could not load payment config from server:', e);
  }
}

// =====================
// PLACE ORDER
// =====================
function placeOrder() {
  if (!cart.length) {
    showToast('Your cart is empty');
    return;
  }

  const shipping = getShippingDetails();
  if (!shipping.name || !shipping.phone || !shipping.email || !shipping.address || !shipping.city || !shipping.country) {
    showToast('\u274C Please complete your shipping details first');
    goToStage('shipping');
    return;
  }

  if (selectedPaymentMethod === 'cod') {
    placeCodOrder(shipping);
  } else {
    placeGatewayOrder(shipping);
  }
}

// Cash on Delivery — no payment gateway involved, just record the order.
function placeCodOrder(shipping) {
  const subtotalUsd = getSubtotalUsd();
  const totalUsd = Math.max(0, subtotalUsd + selectedShippingCost - (subtotalUsd * promoDiscount));

  const orderPayload = {
    items: cart.map(i => ({ name: i.name, icon: i.icon, usdPrice: i.usdPrice })),
    shipping,
    totalUsd,
  };

  fetch('/api/record-cod-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order: orderPayload, amount: totalUsd, currency: 'USD' }),
  })
    .then(res => res.json())
    .then(result => {
      const orderId = (result.order && result.order.id) || ('MA-' + Date.now().toString().slice(-8));
      finishOrder(orderId, totalUsd, shipping);
    })
    .catch(() => {
      // even if the backend is unreachable, still let a COD order go through —
      // no money has changed hands, so this is safe to fall back on locally
      const orderId = 'MA-' + Date.now().toString().slice(-8);
      finishOrder(orderId, totalUsd, shipping);
    });
}

// Card / Mobile Money / Bank Transfer — go through Flutterwave, then verify
// the result with our own server before treating the order as paid.
function placeGatewayOrder(shipping) {
  if (typeof FlutterwaveCheckout !== 'function') {
    showToast('\u274C Payment system failed to load. Check your internet connection and try again.');
    return;
  }
  if (!flwPublicKey) {
    showToast('\u274C Payment isn\u2019t configured yet \u2014 the store owner needs to add Flutterwave API keys.');
    return;
  }

  const subtotalUsd = getSubtotalUsd();
  const totalUsd = Math.max(0, subtotalUsd + selectedShippingCost - (subtotalUsd * promoDiscount));
  const chargeAmount = convertPriceRaw(totalUsd);
  const chargeCurrency = currentCurrency;
  const txRef = 'MA-' + Date.now() + '-' + Math.floor(Math.random() * 100000);

  const paymentOptionsMap = {
    card: 'card',
    mobile: 'mobilemoneyuganda',
    banktransfer: 'banktransfer',
  };

  const orderPayload = {
    items: cart.map(i => ({ name: i.name, icon: i.icon, usdPrice: i.usdPrice })),
    shipping,
    totalUsd,
  };

  showToast('Opening secure payment window\u2026');

  FlutterwaveCheckout({
    public_key: flwPublicKey,
    tx_ref: txRef,
    amount: chargeAmount,
    currency: chargeCurrency,
    payment_options: paymentOptionsMap[selectedPaymentMethod] || 'card, mobilemoneyuganda, banktransfer',
    customer: {
      email: shipping.email,
      phone_number: document.getElementById('mobileMoneyPhone') && document.getElementById('mobileMoneyPhone').value
        ? document.getElementById('mobileMoneyPhone').value.trim()
        : shipping.phone,
      name: shipping.name,
    },
    customizations: {
      title: 'Mega Ads',
      description: 'Payment for your Mega Ads order',
    },
    callback: function (response) {
      verifyPaymentWithServer(response.transaction_id, chargeAmount, chargeCurrency, orderPayload);
    },
    onclose: function () {
      showToast('Payment window closed \u2014 your cart is still here whenever you\u2019re ready.');
    },
  });
}

function verifyPaymentWithServer(transactionId, expectedAmount, expectedCurrency, orderPayload) {
  showToast('Confirming your payment\u2026');

  fetch('/api/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transaction_id: transactionId,
      expected_amount: expectedAmount,
      expected_currency: expectedCurrency,
      order: orderPayload,
    }),
  })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        finishOrder(result.order.id, orderPayload.totalUsd, orderPayload.shipping);
      } else {
        showToast('\u274C ' + (result.message || 'We could not confirm this payment. No charge was applied — please try again.'));
      }
    })
    .catch(() => {
      showToast('\u274C Could not reach our server to confirm payment. If you were charged, contact support with your reference: ' + transactionId);
    });
}

function finishOrder(orderId, totalUsd, shipping) {
  saveOrderRecord(orderId, totalUsd, shipping);

  document.getElementById('orderId').textContent = orderId;
  document.getElementById('confirmTotal').textContent = convertPrice(totalUsd);

  cart = [];
  persistCart();

  goToStage('confirmation');
  showToast('\uD83C\uDF89 Order placed successfully!');
}

function saveOrderRecord(orderId, totalUsd, shipping) {
  try {
    const orders = JSON.parse(localStorage.getItem('megaads_placed_orders') || '[]');
    const session = JSON.parse(localStorage.getItem('megaads_session') || 'null');
    orders.push({
      id: orderId,
      items: cart.map(i => ({ name: i.name, icon: i.icon, usdPrice: i.usdPrice })),
      totalUsd,
      email: (shipping && shipping.email) || (session ? session.email : ''),
      address: shipping || null,
      date: new Date().toISOString().slice(0,10),
    });
    localStorage.setItem('megaads_placed_orders', JSON.stringify(orders));
  } catch(e) { /* ignore storage errors */ }
}

// =====================
// INIT
// =====================
document.addEventListener('DOMContentLoaded', () => {
  renderCartItems();
  renderCurrencyPillsCart();
  loadFlutterwaveConfig();
});