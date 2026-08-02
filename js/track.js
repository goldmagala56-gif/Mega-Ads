// =====================
// ORDER TRACKING LOGIC
// Looks up orders placed via cart.js (localStorage: megaads_placed_orders),
// plus ships with one built-in sample order (MA-87654321) so the page has
// something to show before any real order has been placed.
// =====================

const SAMPLE_ORDER = {
  id: 'MA-87654321',
  email: 'goldmagala56@gmail.com',
  date: '2026-06-30',
  status: 'shipped', // pending | processing | shipped | delivered
  carrier: 'MegaExpress Logistics',
  trackingNo: 'MX-99281734UG',
  contact: '+256 741 969 520',
  address: {
    name: 'Sarah K.',
    line: '123 Main Street, Apartment 4B',
    city: 'Kampala, Uganda',
  },
  items: [
    { icon: '\uD83C\uDFA7', name: 'Wireless Bluetooth Earbuds Pro', usdPrice: 6, qty: 1 },
    { icon: '\uD83D\uDD76', name: 'Polarized UV400 Sunglasses Unisex', usdPrice: 5, qty: 1 },
  ],
};

const PROGRESS_STEPS = [
  { key: 'pending',    label: 'Order Placed', icon: '\uD83D\uDCDD' },
  { key: 'processing', label: 'Processing',   icon: '\uD83D\uDCE6' },
  { key: 'shipped',    label: 'Shipped',      icon: '\uD83D\uDE9A' },
  { key: 'delivered',  label: 'Delivered',    icon: '\u2705' },
];

function fillSample() {
  document.getElementById('trackOrderId').value = SAMPLE_ORDER.id;
  document.getElementById('trackEmail').value = SAMPLE_ORDER.email;
}

function findOrder(orderId, email) {
  if (orderId.toUpperCase() === SAMPLE_ORDER.id) return SAMPLE_ORDER;

  try {
    const placed = JSON.parse(localStorage.getItem('megaads_placed_orders') || '[]');
    const match = placed.find(o => o.id.toUpperCase() === orderId.toUpperCase());
    if (!match) return null;

    // Real orders are simulated as "processing" since there's no real
    // courier/logistics integration yet — but the address and totals
    // are the real ones captured at checkout.
    const addr = match.address || {};
    return {
      id: match.id,
      email: match.email || email,
      date: match.date,
      status: 'processing',
      carrier: 'MegaExpress Logistics',
      trackingNo: 'MX-' + match.id.replace('MA-', ''),
      contact: addr.phone || '+256 741 969 520',
      address: {
        name: addr.name || 'You',
        line: addr.address || 'Address provided at checkout',
        city: [addr.city, addr.country].filter(Boolean).join(', ') || '—',
      },
      items: match.items.map(i => ({ ...i, qty: 1 })),
      totalUsd: match.totalUsd,
    };
  } catch (e) {
    return null;
  }
}

function handleTrack(e) {
  e.preventDefault();
  const orderId = document.getElementById('trackOrderId').value.trim();
  const email = document.getElementById('trackEmail').value.trim();

  const order = findOrder(orderId, email);

  document.getElementById('trackResult').style.display = 'none';
  document.getElementById('trackNotFound').style.display = 'none';

  if (!order) {
    document.getElementById('trackNotFound').style.display = 'block';
    document.getElementById('trackNotFound').scrollIntoView({ behavior: 'smooth' });
    return;
  }

  renderOrderResult(order);
  document.getElementById('trackResult').style.display = 'block';
  document.getElementById('trackResult').scrollIntoView({ behavior: 'smooth' });
}

function resetTrack() {
  document.getElementById('trackResult').style.display = 'none';
  document.getElementById('trackNotFound').style.display = 'none';
  document.getElementById('trackForm').reset();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderOrderResult(order) {
  document.getElementById('resultOrderId').textContent = order.id;
  document.getElementById('resultOrderDate').textContent = 'Placed on ' + order.date;

  const statusIdx = PROGRESS_STEPS.findIndex(s => s.key === order.status);
  document.getElementById('resultStatusBadge').textContent = PROGRESS_STEPS[statusIdx].label;

  const etaMap = { pending: '10-14 business days', processing: '7-10 business days', shipped: '2-4 business days', delivered: 'Delivered' };
  document.getElementById('resultEta').textContent = 'Estimated arrival: ' + (etaMap[order.status] || '—');

  // items
  const total = order.totalUsd !== undefined ? order.totalUsd : order.items.reduce((s,i) => s + i.usdPrice * i.qty, 0);
  document.getElementById('orderItemsList').innerHTML = order.items.map(i => `
    <div class="order-item-row">
      <div class="order-item-icon">${i.icon}</div>
      <div>
        <div class="order-item-name">${i.name}</div>
        <div class="order-item-meta">Qty: ${i.qty}</div>
      </div>
      <div class="order-item-price">${convertPrice(i.usdPrice * i.qty)}</div>
    </div>
  `).join('');
  document.getElementById('resultTotal').textContent = convertPrice(total);

  // address + courier
  document.getElementById('resultAddress').innerHTML = `${order.address.name}<br>${order.address.line}<br>${order.address.city}`;
  document.getElementById('resultCarrier').textContent = order.carrier;
  document.getElementById('resultTrackingNo').textContent = order.trackingNo;
  document.getElementById('resultContact').textContent = order.contact;

  // progress bubbles
  document.getElementById('progressTrack').innerHTML = PROGRESS_STEPS.map((s, i) => {
    let cls = '';
    if (i < statusIdx) cls = 'done';
    if (i === statusIdx) cls = 'active';
    return `
      <div class="progress-step ${cls}">
        <div class="step-bubble">${s.icon}</div>
        <div class="step-label-track">${s.label}</div>
      </div>
    `;
  }).join('');

  // timeline
  const timelineEvents = buildTimelineEvents(order, statusIdx);
  document.getElementById('trackingTimeline').innerHTML = timelineEvents.map((ev, i) => `
    <div class="timeline-item">
      <div class="tl-left">
        <div class="tl-dot ${ev.done ? 'done' : ev.active ? 'active' : ''}"></div>
        ${i < timelineEvents.length - 1 ? `<div class="tl-line ${ev.done ? 'done' : ''}"></div>` : ''}
      </div>
      <div class="tl-right">
        <div class="tl-title">${ev.title}</div>
        <div class="tl-desc">${ev.desc}</div>
        <div class="tl-time">${ev.time}</div>
      </div>
    </div>
  `).join('');
}

function buildTimelineEvents(order, statusIdx) {
  const base = [
    { title: 'Order Placed',      desc: 'Your order was received and confirmed.', time: order.date },
    { title: 'Processing',        desc: 'Seller is preparing your items for shipment.', time: order.date },
    { title: 'Shipped',           desc: 'Package handed to ' + order.carrier + '.', time: order.date },
    { title: 'Out for Delivery',  desc: 'Courier is on the way to your address.', time: '—' },
    { title: 'Delivered',         desc: 'Package delivered.', time: '—' },
  ];
  return base.map((ev, i) => ({
    ...ev,
    done: i < statusIdx + 1,
    active: i === statusIdx + 1,
  }));
}

// =====================
// INIT
// =====================
document.addEventListener('DOMContentLoaded', () => {
  syncCartBadges();
});