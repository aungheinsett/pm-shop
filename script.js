// ===== PRODUCT DATA =====
const MMK_TO_BAHT = 0.016; // Approximate exchange rate
const PAGE_SIZE = 20;
const VISIBLE_COUNT = 8;
const categoryPages = {};
const categoryTotals = {};
const expandedCategories = {};

const products = {
  wallets: [
    { id: 9, name: "Bifold Leather Wallet", category: "Wallets", icon: "fas fa-wallet", price_mmk: 18000, description: "Classic bifold wallet in genuine leather with 8 card slots and coin pocket." },
    { id: 10, name: "Zip-Around Wallet", category: "Wallets", icon: "fas fa-wallet", price_mmk: 24000, description: "Secure zip-around wallet with RFID blocking technology. Multiple compartments." },
    { id: 11, name: "Mini Card Holder", category: "Wallets", icon: "fas fa-credit-card", price_mmk: 9500, description: "Slim card holder with 6 slots. Perfect for minimalist carry." },
    { id: 12, name: "Long Continental", category: "Wallets", icon: "fas fa-wallet", price_mmk: 32000, description: "Elegant long wallet with bill compartments and phone pocket." },
    { id: 13, name: "Coin Purse Charm", category: "Wallets", icon: "fas fa-coins", price_mmk: 6500, description: "Adorable coin purse with zipper closure and keychain attachment." },
    { id: 14, name: "Travel Wallet Pro", category: "Wallets", icon: "fas fa-plane", price_mmk: 28000, description: "Spacious travel wallet with passport holder and ticket sleeve." },
    { id: 15, name: "Canvas Zip Wallet", category: "Wallets", icon: "fas fa-wallet", price_mmk: 12000, description: "Durable canvas wallet with leather trim. Casual everyday essential." },
    { id: 16, name: "RFID Blocker Wallet", category: "Wallets", icon: "fas fa-shield-alt", price_mmk: 22000, description: "Advanced RFID blocking technology keeps your cards safe and secure." }
  ],
  totebags: [
    { id: 17, name: "Leather Shopper Tote", category: "Totebags", icon: "fas fa-shopping-bag", price_mmk: 45000, description: "Spacious leather shopper with inner pockets. The ultimate everyday bag." },
    { id: 18, name: "Canvas Beach Tote", category: "Totebags", icon: "fas fa-umbrella-beach", price_mmk: 18000, description: "Oversized canvas tote with waterproof lining. Beach days made easy." },
    { id: 19, name: "Structured Office Tote", category: "Totebags", icon: "fas fa-briefcase", price_mmk: 52000, description: "Professional structured tote with laptop compartment. Work in style." },
    { id: 20, name: "Bohemian Fringe Tote", category: "Totebags", icon: "fas fa-feather", price_mmk: 35000, description: "Free-spirited fringe tote with suede details. Boho chic at its best." },
    { id: 21, name: "Mini Nylon Tote", category: "Totebags", icon: "fas fa-shopping-bag", price_mmk: 15000, description: "Lightweight nylon tote that folds into your pocket. Ultra practical." },
    { id: 22, name: "Monogram Tote", category: "Totebags", icon: "fas fa-crown", price_mmk: 68000, description: "Luxury monogrammed tote with gold hardware. Make a statement." },
    { id: 23, name: "Woven Rattan Tote", category: "Totebags", icon: "fas fa-leaf", price_mmk: 28000, description: "Handcrafted rattan tote with cotton lining. Natural elegance." },
    { id: 24, name: "Convertible Tote", category: "Totebags", icon: "fas fa-exchange-alt", price_mmk: 42000, description: "Versatile tote that converts to a backpack. Two bags in one." }
  ],
  brandbags: [
    { id: 25, name: "Signature Quilted Bag", category: "Brand Bags", icon: "fas fa-crown", price_mmk: 185000, description: "Iconic quilted design from a world-renowned fashion house. Timeless elegance." },
    { id: 26, name: "Monogram Shoulder Bag", category: "Brand Bags", icon: "fas fa-crown", price_mmk: 220000, description: "Classic monogram pattern with premium leather trim. A fashion investment." },
    { id: 27, name: "Designer Saddle Bag", category: "Brand Bags", icon: "fas fa-gem", price_mmk: 155000, description: "Elegant saddle bag shape with signature hardware. Runway to street." },
    { id: 28, name: "Luxury Top Handle", category: "Brand Bags", icon: "fas fa-crown", price_mmk: 280000, description: "The ultimate status symbol. Handcrafted with the finest materials." },
    { id: 29, name: "Brand Chain Crossbody", category: "Brand Bags", icon: "fas fa-link", price_mmk: 142000, description: "Compact crossbody with signature chain strap. Effortless luxury." },
    { id: 30, name: "Classic Tote Designer", category: "Brand Bags", icon: "fas fa-crown", price_mmk: 320000, description: "The iconic designer tote that never goes out of style. A forever piece." },
    { id: 31, name: "Embossed Logo Bag", category: "Brand Bags", icon: "fas fa-stamp", price_mmk: 175000, description: "Subtly embossed logo on premium leather. Understated luxury." },
    { id: 32, name: "Runway Collection Bag", category: "Brand Bags", icon: "fas fa-star", price_mmk: 350000, description: "Limited edition runway piece. Collector's dream with Certificate of Authenticity." }
  ],
  bags: [
    { id: 33, name: "Everyday Backpack", category: "Bags", icon: "fas fa-suitcase", price_mmk: 32000, description: "Durable backpack with padded laptop sleeve. Your daily companion." },
    { id: 34, name: "Sling Bag Sport", category: "Bags", icon: "fas fa-running", price_mmk: 18000, description: "Lightweight sport sling with breathable back panel. Active lifestyle ready." },
    { id: 35, name: "Messenger Classic", category: "Bags", icon: "fas fa-envelope", price_mmk: 28000, description: "Vintage-inspired messenger with adjustable strap. Cool and functional." },
    { id: 36, name: "Duffle Weekender", category: "Bags", icon: "fas fa-suitcase-rolling", price_mmk: 55000, description: "Spacious weekender with shoe compartment. Travel in organized style." },
    { id: 37, name: "Bucket Bag", category: "Bags", icon: "fas fa-circle", price_mmk: 24000, description: "Trendy bucket bag with drawstring closure. Modern silhouette." },
    { id: 38, name: "Hobo Comfort Bag", category: "Bags", icon: "fas fa-cloud", price_mmk: 30000, description: "Soft and slouchy hobo bag for relaxed everyday style." },
    { id: 39, name: "Belt Bag Urban", category: "Bags", icon: "fas fa-shield-alt", price_mmk: 16000, description: "Urban belt bag with multiple zip pockets. Street style essential." },
    { id: 40, name: "North-South Tote", category: "Bags", icon: "fas fa-suitcase", price_mmk: 35000, description: "Tall north-south tote with secure top zip. Sleek and spacious." }
  ],
  keychains: [
    { id: 41, name: "Leather Tassel Charm", category: "Keychains", icon: "fas fa-key", price_mmk: 5500, description: "Elegant leather tassel keychain in assorted colors. Adds flair to any bag." },
    { id: 42, name: "Crystal Ball Charm", category: "Keychains", icon: "fas fa-gem", price_mmk: 8000, description: "Sparkling crystal ball keychain with gold chain. Dazzling accessory." },
    { id: 43, name: "Pearl Bag Charm", category: "Keychains", icon: "fas fa-circle", price_mmk: 7200, description: "Delicate faux pearl charm cluster. Elegant touch for your handbag." },
    { id: 44, name: "Metal Logo Tag", category: "Keychains", icon: "fas fa-tag", price_mmk: 4800, description: "Sleek metal tag keychain with PM Shop logo. Brand with pride." },
    { id: 45, name: "Pom Pom Fluffy", category: "Keychains", icon: "fas fa-cloud", price_mmk: 6500, description: "Ultra-soft fluffy pom pom keychain. Fun and playful bag accessory." },
    { id: 46, name: "Chain Link Charm", category: "Keychains", icon: "fas fa-link", price_mmk: 3800, description: "Chunky chain link keychain in gold or silver. Minimalist and bold." },
    { id: 47, name: "Animal Figure Charm", category: "Keychains", icon: "fas fa-paw", price_mmk: 7800, description: "Cute animal figure keychain. Choose from cat, bear, or bunny designs." },
    { id: 48, name: "Tassel & Bell Set", category: "Keychains", icon: "fas fa-bell", price_mmk: 9200, description: "Decorative tassel with tiny bell. Jingles softly with every step." }
  ]
};

// ===== CART STATE =====
let cart = [];

// ===== UTILITY FUNCTIONS =====
function mmkToBaht(mmk) {
  const rate = (window.MMK_TO_BAHT_FN && window.MMK_TO_BAHT_FN()) || MMK_TO_BAHT;
  return Math.round(mmk * rate);
}

function formatMmk(price) {
  return price.toLocaleString() + " MMK";
}

function formatBaht(baht) {
  return "฿" + (baht || 0).toLocaleString();
}

// ===== RENDER PRODUCTS =====
function renderProducts(category) {
  const cats = category ? [category] : Object.keys(products);
  cats.forEach(cat => {
    const grid = document.getElementById(cat + 'Grid');
    if (!grid) return;

    const allItems = products[cat];
    const isExpanded = expandedCategories[cat];
    const visibleItems = isExpanded ? allItems : allItems.slice(0, VISIBLE_COUNT);

    grid.innerHTML = visibleItems.map(p => {
      return `
        <div class="product-card" data-id="${p.id}" onclick="openProductDetail('${p.id}')" style="cursor:pointer;">
          <div class="product-badge">
            ${p.badge === 'new' ? '<span class="badge-new">New</span>' : ''}
          </div>
          <div class="product-image">
            ${p.images && p.images[0] ? `<img src="${p.images[0].url}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;">` : `<i class="${p.icon}"></i>`}
          </div>
          <div class="product-info">
            <span class="product-category">${p.category}</span>
            <h3 class="product-name">${p.name}</h3>
            <div class="product-prices">
              <span class="price-mmk">${formatMmk(p.price_mmk)}</span>
              <span class="price-baht">${formatBaht(p.price_baht)}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // See More / See Less button
    const loadMoreContainer = document.getElementById(cat + 'LoadMore');
    if (loadMoreContainer) {
      if (allItems.length > VISIBLE_COUNT) {
        const remaining = allItems.length - VISIBLE_COUNT;
        if (isExpanded) {
          loadMoreContainer.innerHTML = `<button class="btn btn-primary load-more-btn" onclick="toggleSeeMore('${cat}')">See Less</button>`;
        } else {
          loadMoreContainer.innerHTML = `<button class="btn btn-primary load-more-btn" onclick="toggleSeeMore('${cat}')">See More (${remaining} more)</button>`;
        }
      } else {
        loadMoreContainer.innerHTML = '';
      }
    }
  });
}

function toggleSeeMore(cat) {
  expandedCategories[cat] = !expandedCategories[cat];
  renderProducts(cat);
}

// ===== LOAD MORE PRODUCTS =====
async function loadMoreProducts(catKey) {
  const btn = document.querySelector(`#${catKey}LoadMore .load-more-btn`);
  if (btn) { btn.textContent = 'Loading...'; btn.disabled = true; }

  const page = (categoryPages[catKey] || 1) + 1;
  const order = { 'wallets': 'Wallets', 'totebags': 'Totebags', 'brandbags': 'Brand Bags', 'bags': 'Bags', 'keychains': 'Keychains' };
  const catName = order[catKey] || catKey;

  try {
    const res = await fetch(`/api/products?isActive=true&limit=${PAGE_SIZE}&page=${page}&category=${encodeURIComponent(catName)}`);
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    const apiProducts = data.products || [];

    apiProducts.forEach(p => {
      products[catKey].push({
        id: p._id,
        name: p.name,
        category: catName,
        icon: p.icon || 'fas fa-shopping-bag',
        price_mmk: p.priceMmk,
        price_baht: p.priceBaht || 0,
        description: p.description || '',
        images: p.images || []
      });
    });

    categoryPages[catKey] = page;
    categoryTotals[catKey] = data.total || products[catKey].length;
    renderProducts(catKey);
  } catch (e) {
    if (btn) { btn.textContent = 'Error - Try Again'; btn.disabled = false; }
  }
}

// ===== FIND PRODUCT =====
function findProduct(id) {
  for (const cat of Object.values(products)) {
    const found = cat.find(p => p.id === id);
    if (found) return found;
  }
  return null;
}

// ===== API LOADING (from backend DB, falls back to hardcoded data) =====
async function loadFromApi() {
  try {
    const catRes = await fetch('/api/categories');
    if (!catRes.ok) throw new Error('Server not ready');
    const catData = await catRes.json();
    const categories = catData.categories || [];

    const catKeyMap = {};
    const keyOrder = { 'Wallets': 'wallets', 'Totebags': 'totebags', 'Brand Bags': 'brandbags', 'Bags': 'bags', 'Keychains': 'keychains' };
    categories.forEach(c => {
      const key = keyOrder[c.name] || c.slug;
      catKeyMap[c.name] = key;
    });

    Object.values(keyOrder).forEach(k => { products[k] = []; categoryPages[k] = 1; });

    const fetches = categories.map(async (c) => {
      const key = catKeyMap[c.name] || 'bags';
      if (!keyOrder[c.name] && !keyOrder[Object.keys(keyOrder).find(k => keyOrder[k] === key)]) return;
      try {
        const res = await fetch(`/api/products?isActive=true&limit=${PAGE_SIZE}&page=1&category=${encodeURIComponent(c.name)}`);
        if (!res.ok) return;
        const data = await res.json();
        const apiProducts = data.products || [];
        categoryTotals[key] = data.total || apiProducts.length;
        apiProducts.forEach(p => {
          products[key].push({
            id: p._id,
            name: p.name,
            category: c.name,
            icon: p.icon || 'fas fa-shopping-bag',
            price_mmk: p.priceMmk,
            price_baht: p.priceBaht || 0,
            description: p.description || '',
            images: p.images || []
          });
        });
      } catch (e) {}
    });

    await Promise.all(fetches);

    try {
      const sRes = await fetch('/api/settings/public');
      if (sRes.ok) {
        const sData = await sRes.json();
        const rate = parseFloat(sData.settings?.currency?.exchangeRate);
        if (rate && rate > 0) {
          window.MMK_TO_BAHT_FN = () => rate;
        }
      }
    } catch (e) {}

    renderProducts();
  } catch (err) {
    renderProducts();
  }
}

// ===== CART FUNCTIONS =====
function addToCart(id) {
  const product = findProduct(id);
  if (!product) return;

  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, qty: 1 });
  }

  updateCartUI();
  showAddedAnimation(id);
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCartUI();
}

function updateQty(id, delta) {
  const item = cart.find(item => item.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }
  updateCartUI();
}

function updateCartUI() {
  const cartCount = document.getElementById('cartCount');
  const cartItems = document.getElementById('cartItems');
  const cartFooter = document.getElementById('cartFooter');
  const totalMmk = document.getElementById('totalMmk');
  const totalBaht = document.getElementById('totalBaht');

  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = totalQty;

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <i class="fas fa-shopping-bag"></i>
        <p>Your cart is empty</p>
      </div>
    `;
    cartFooter.style.display = 'none';
    return;
  }

  cartFooter.style.display = 'block';

  let totalMmkVal = 0;

  cartItems.innerHTML = cart.map(item => {
    const p = findProduct(item.id);
    if (!p) return '';
    totalMmkVal += p.price_mmk * item.qty;

    return `
      <div class="cart-item">
        <div class="cart-item-image">
          <i class="${p.icon}"></i>
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">
            ${formatMmk(p.price_mmk)}
            <span class="baht">${formatBaht(p.price_baht)}</span>
          </div>
          <div class="cart-item-qty">
            <button onclick="updateQty(${p.id}, -1)"><i class="fas fa-minus"></i></button>
            <span>${item.qty}</span>
            <button onclick="updateQty(${p.id}, 1)"><i class="fas fa-plus"></i></button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${p.id})">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `;
  }).join('');

  totalMmk.textContent = formatMmk(totalMmkVal);
  totalBaht.textContent = formatBaht(totalMmkVal);
}

function showAddedAnimation(id) {
  const card = document.querySelector(`.product-card[data-id="${id}"]`);
  if (!card) return;

  const img = card.querySelector('.product-image');
  img.style.transition = 'all 0.3s';
  img.style.background = 'linear-gradient(135deg, #c3e6cb 0%, #a3d9a5 100%)';

  setTimeout(() => {
    img.style.background = '';
  }, 600);
}

function addToWishlist(id) {
  // Placeholder - wishlist feature removed
}

// ===== PRODUCT DETAIL PAGE =====
function openProductDetail(id) {
  const product = findProduct(id);
  if (!product) return;

  const categoryKey = Object.keys(products).find(k =>
    products[k].some(p => p.id === id)
  );
  let recommended = [];
  if (categoryKey) {
    recommended = products[categoryKey]
      .filter(p => p.id !== id)
      .slice(0, 4);
  }

  const recommendedHtml = recommended.map(p => `
      <div class="rec-card" onclick="openProductDetail('${p.id}')">
        <div class="rec-image">
          ${p.images && p.images[0] ? `<img src="${p.images[0].url}" alt="${p.name}">` : `<i class="${p.icon}"></i>`}
        </div>
        <div class="rec-info">
          <h4>${p.name}</h4>
          <div class="rec-prices">
            <span class="price-mmk">${formatMmk(p.price_mmk)}</span>
            <span class="price-baht">${formatBaht(p.price_baht)}</span>
          </div>
        </div>
      </div>
    `).join('');

  const detailHtml = `
    <div class="product-detail-page">
      <button class="detail-back" onclick="closeProductDetail()"><i class="fas fa-arrow-left"></i> Back to Shop</button>

      <div class="detail-main">
        <div class="detail-image">
          ${product.images && product.images[0]
            ? `<img src="${product.images[0].url}" alt="${product.name}">`
            : `<div class="detail-icon"><i class="${product.icon}"></i></div>`
          }
        </div>
        <div class="detail-info">
          <span class="detail-category">${product.category}</span>
          <h1 class="detail-name">${product.name}</h1>
          <div class="detail-prices">
            <span class="price-mmk">${formatMmk(product.price_mmk)}</span>
            <span class="price-baht">${formatBaht(product.price_baht)}</span>
          </div>
          <div class="detail-desc">
            <h3>Description</h3>
            <p>${product.description || 'No description available for this product.'}</p>
          </div>
        </div>
      </div>

      ${recommended.length > 0 ? `
        <div class="detail-recommended">
          <h2>You May Also Like</h2>
          <div class="rec-grid">${recommendedHtml}</div>
        </div>
      ` : ''}
    </div>
  `;

  // Show detail page
  const overlay = document.getElementById('productDetailOverlay');
  const container = document.getElementById('productDetailContainer');
  container.innerHTML = detailHtml;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  window.scrollTo(0, 0);
}

function closeProductDetail() {
  const overlay = document.getElementById('productDetailOverlay');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ===== HERO SLIDER =====
let currentSlide = 0;
const slides = () => document.querySelectorAll('.slide');

function initHeroSlider() {
  const slidesCount = slides().length;
  const dotsContainer = document.getElementById('sliderDots');

  dotsContainer.innerHTML = '';
  for (let i = 0; i < slidesCount; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }

  setInterval(() => nextSlide(), 5000);
}

function goToSlide(index) {
  slides().forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.slider-dots .dot').forEach(d => d.classList.remove('active'));

  currentSlide = index;
  slides()[currentSlide].classList.add('active');
  document.querySelectorAll('.slider-dots .dot')[currentSlide].classList.add('active');
}

function nextSlide() {
  goToSlide((currentSlide + 1) % slides().length);
}

function prevSlide() {
  goToSlide((currentSlide - 1 + slides().length) % slides().length);
}

// ===== CATEGORY DRAWER =====
function initNavSlider() {
  const menuBtn = document.getElementById('menuBtn');
  const drawer = document.getElementById('slideDrawer');
  const overlay = document.getElementById('drawerOverlay');
  const closeBtn = document.getElementById('drawerClose');

  if (!menuBtn || !drawer) return;

  function openDrawer() {
    drawer.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  menuBtn.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('active')) closeDrawer();
  });

  // Close drawer when clicking a category, then scroll to section
  document.querySelectorAll('.drawer-item').forEach(item => {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      const href = this.getAttribute('href');
      closeDrawer();

      // Set active state
      document.querySelectorAll('.drawer-item').forEach(i => i.classList.remove('active'));
      this.classList.add('active');

      // Scroll to section after drawer closes
      setTimeout(() => {
        const section = document.querySelector(href);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 400);
    });
  });

  // Highlight active drawer item on scroll
  const sections = ['sale', 'wallets', 'totebags', 'brandbags', 'bags', 'keychains'];
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(id => {
      const section = document.getElementById(id);
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 200) current = id;
      }
    });

    if (current) {
      document.querySelectorAll('.drawer-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === '#' + current) {
          item.classList.add('active');
        }
      });
    }
  });

  // Update product count badges
  updateCategoryCounts();
}

function updateCategoryCounts() {
  Object.keys(products).forEach(cat => {
    const countEl = document.querySelector(`[data-count="${cat}"]`);
    if (countEl && products[cat]) {
      countEl.textContent = products[cat].length;
    }
  });
}

// ===== CART TOGGLE =====
function initCart() {
  const cartBtn = document.getElementById('cartBtn');
  const cartSidebar = document.getElementById('cartSidebar');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartClose = document.getElementById('cartClose');

  if (cartBtn) {
    cartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      cartSidebar.classList.add('active');
      cartOverlay.classList.add('active');
    });
  }

  if (cartClose) {
    cartClose.addEventListener('click', () => {
      cartSidebar.classList.remove('active');
      cartOverlay.classList.remove('active');
    });
  }

  if (cartOverlay) {
    cartOverlay.addEventListener('click', () => {
      cartSidebar.classList.remove('active');
      cartOverlay.classList.remove('active');
    });
  }
}

// ===== MODAL =====
function initModal() {
  // No modal to init - product detail overlay is self-contained
}

// ===== BACK TO TOP =====
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== NEWSLETTER =====
function initNewsletter() {
  document.getElementById('newsletterForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input').value;
    alert(`Thank you for subscribing with ${email}! You'll receive exclusive deals from PM Online.`);
    e.target.reset();
  });
}

// ===== HERO BANNERS =====
async function loadHeroBanners() {
  try {
    const res = await fetch('/api/hero-banners/public');
    if (!res.ok) return;
    const data = await res.json();
    const banners = data.banners || [];
    if (banners.length === 0) return;

    const container = document.getElementById('slidesContainer');
    const dotsContainer = document.getElementById('sliderDots');
    container.innerHTML = '';
    if (dotsContainer) dotsContainer.innerHTML = '';

    banners.forEach((b, i) => {
      const bgStyle = b.imageUrl
        ? `background-image: url('${b.imageUrl}'); background-size: cover; background-position: center;`
        : `background: linear-gradient(135deg, ${b.bgColor}dd 0%, ${b.bgColor} 100%);`;

      container.innerHTML += `
        <div class="slide ${i === 0 ? 'active' : ''}" style="${bgStyle}">
          <div class="slide-content">
            <span class="slide-tag">${b.subtitle || ''}</span>
            <h1>${b.title}</h1>
            ${b.buttonLink && b.buttonLink.startsWith('#')
              ? `<a href="${b.buttonLink}" class="btn btn-primary">${b.buttonText}</a>`
              : `<button class="btn btn-primary" onclick="openProductDetail('${b.buttonLink}')">${b.buttonText}</button>`
            }
          </div>
        </div>
      `;

      if (dotsContainer) {
        const dot = document.createElement('div');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => {
          currentSlide = i;
          updateSlider();
        });
        dotsContainer.appendChild(dot);
      }
    });

    if (banners.length > 1) {
      setInterval(() => {
        currentSlide = (currentSlide + 1) % banners.length;
        updateSlider();
      }, 5000);
    }
  } catch (e) {}
}

function updateSlider() {
  const slides = document.querySelectorAll('#slidesContainer .slide');
  const dots = document.querySelectorAll('.slider-dots .dot');
  slides.forEach((s, i) => s.classList.toggle('active', i === currentSlide));
  dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
}

// ===== SEARCH =====
function initSearch() {
  const searchInput = document.getElementById('searchInput');
  let dropdown = document.getElementById('searchDropdown');
  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.id = 'searchDropdown';
    dropdown.className = 'search-dropdown';
    searchInput.parentElement.appendChild(dropdown);
  }

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      dropdown.style.display = 'none';
      return;
    }

    let results = [];
    for (const [cat, items] of Object.entries(products)) {
      items.forEach(p => {
        if (p.name.toLowerCase().includes(query)) {
          results.push(p);
        }
      });
    }

    if (results.length === 0) {
      dropdown.innerHTML = '<div class="search-no-result">No products found</div>';
    } else {
      dropdown.innerHTML = results.slice(0, 8).map(p => `
        <div class="search-item" onclick="openProductDetail('${p.id}'); document.getElementById('searchDropdown').style.display='none'; document.getElementById('searchInput').value='';">
          <div class="search-item-icon"><i class="${p.icon}"></i></div>
          <div class="search-item-info">
            <span class="search-item-name">${p.name}</span>
            <span class="search-item-cat">${p.category}</span>
          </div>
          <span class="search-item-price">${formatMmk(p.price_mmk)}</span>
        </div>
      `).join('');
    }
    dropdown.style.display = 'block';
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-bar-full')) {
      dropdown.style.display = 'none';
    }
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const query = e.target.value.toLowerCase().trim();
      if (!query) return;
      dropdown.style.display = 'none';

      for (const [cat, items] of Object.entries(products)) {
        const match = items.find(p => p.name.toLowerCase().includes(query));
        if (match) {
          openProductDetail(match.id);
          searchInput.value = '';
          return;
        }
      }
      alert('No products found matching your search.');
    }
  });
}

// ===== INITIALIZE =====
// ===== LOAD SETTINGS =====
async function loadSettings() {
  try {
    const res = await fetch('/api/settings/public');
    if (!res.ok) return;
    const data = await res.json();
    const s = data.settings;

    if (s.storePhone) {
      const el = document.getElementById('topPhone');
      if (el) el.textContent = s.storePhone;
      const fp = document.getElementById('footerPhone');
      if (fp) fp.textContent = s.storePhone;
      const dp = document.getElementById('drawerPhone');
      if (dp) { dp.href = 'tel:' + s.storePhone; dp.innerHTML = '<i class="fas fa-phone"></i> ' + s.storePhone; }
    }
    if (s.storeEmail) {
      const el = document.getElementById('topEmail');
      if (el) el.textContent = s.storeEmail;
      const fe = document.getElementById('footerEmail');
      if (fe) fe.textContent = s.storeEmail;
    }
    if (s.storeAddress) {
      const el = document.getElementById('footerAddress');
      if (el) el.textContent = s.storeAddress;
    }
    const social = s.social || {};
    if (social.facebook) document.getElementById('linkFacebook').href = social.facebook;
    if (social.instagram) document.getElementById('linkInstagram').href = social.instagram;
    if (social.viber) document.getElementById('linkViber').href = social.viber;
    if (social.tiktok) document.getElementById('linkTiktok').href = social.tiktok;
  } catch (err) {}
}

document.addEventListener('DOMContentLoaded', () => {
  loadFromApi();
  loadHeroBanners();
  loadSettings();
  initNavSlider();
  initCart();
  initModal();
  initBackToTop();
  initNewsletter();
  initSearch();

  document.getElementById('heroPrev').addEventListener('click', prevSlide);
  document.getElementById('heroNext').addEventListener('click', nextSlide);
});
