// =====================
// STORE PAGE
// Shows deals + flash + catalog products together, shuffled, so shoppers
// can browse the full inventory — not just what's featured on the homepage.
// =====================

function shuffleArray(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function renderStore() {
  const all = [...deals, ...flashProducts, ...catalogProducts];
  const shuffled = shuffleArray(all);
  renderDeals(shuffled, 'storeGrid');
  const countEl = document.getElementById('storeCount');
  if (countEl) countEl.textContent = all.length;
}

function shuffleStore() {
  renderStore();
  const grid = document.getElementById('storeGrid');
  if (grid) grid.scrollIntoView({ behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => {
  syncCartBadges();
  onDataReady(renderStore);
});