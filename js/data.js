// =====================
// SIDEBAR CATEGORIES
// This stays static — it's a fixed filter menu, not admin-editable inventory.
// =====================
const sidebarCategories = [
  { slug: 'clothing',        name: 'Clothing' },
  { slug: 'shoes',           name: 'Shoes' },
  { slug: 'luggage-bags',    name: 'Luggage & Bags' },
  { slug: 'watch-jewelry',   name: 'Watch & Jewelry' },
  { slug: 'kids-toys',       name: 'Kids & Toys' },
  { slug: 'home-appliances', name: 'Home & Appliances' },
  { slug: 'beauty',          name: 'Beauty' },
  { slug: 'weddings',        name: 'Weddings' },
  { slug: 'hair',            name: 'Hair' },
  { slug: 'phones-tel',      name: 'Phones & Tel' },
  { slug: 'electronics',     name: 'Electronics' },
  { slug: 'computer',        name: 'Computer & Office' },
  { slug: 'automobile',      name: 'Automobile Accessory' },
];

// =====================
// LIVE CATALOG DATA
// These start empty and get filled in by loadStorefrontData() below, from
// the same server API the admin panel writes to (server/data-store.js).
// Declared as `const` and mutated via .push()/.length=0 rather than
// reassigned, since app.js/product.js hold direct references to these
// exact arrays and expect them to update in place.
// =====================
const deals = [];
const flashProducts = [];
const catalogProducts = [];   // NEW — in the database, searchable, never auto-shown on homepage
const heroSlides = [];
const categoryTiles = [];

// =====================
// DATA-READY SIGNAL
// Fetching is async, but app.js/product.js used to assume this data was
// available the instant the page parsed. onDataReady() lets any file
// safely wait for the fetch to finish, whether it registers before or
// after that fetch actually completes.
// =====================
let megaadsDataReady = false;

function onDataReady(cb) {
  if (megaadsDataReady) cb();
  else document.addEventListener('megaads:data-ready', cb, { once: true });
}

async function loadStorefrontData() {
  try {
    const [productsRes, heroRes, tilesRes] = await Promise.all([
      fetch('/api/products'),
      fetch('/api/hero'),
      fetch('/api/tiles'),
    ]);

    const products = await productsRes.json();
    const hero = await heroRes.json();
    const tiles = await tilesRes.json();

    deals.length = 0;
flashProducts.length = 0;
catalogProducts.length = 0;
products.forEach(p => {
  const item = {
    id: p.id, icon: p.icon, name: p.name, usd: p.usd,
    img: p.img || '', images: Array.isArray(p.images) ? p.images : []
  };
  if (p.section === 'deals') {
    item.discount = p.discount;
    deals.push(item);
  } else if (p.section === 'flash') {
    flashProducts.push(item);
  } else if (p.section === 'catalog') {
    catalogProducts.push(item);
  }
});

    heroSlides.length = 0;
    hero.forEach(h => heroSlides.push({
      subtitle: h.subtitle,
      text: h.text,
      bg: h.bg,
      icon: h.icon,
      cta: 'Shop Now',
      img: h.img || '',
    }));

    categoryTiles.length = 0;
    tiles.forEach(t => categoryTiles.push({
      name: t.name,
      slug: t.slug,
      icon: t.icon,
      tileClass: t.bg,
      img: t.img || '',
    }));
  } catch (e) {
    console.error('Could not load storefront data from the server. Is it running?', e);
  }

  megaadsDataReady = true;
  document.dispatchEvent(new Event('megaads:data-ready'));
}

loadStorefrontData();