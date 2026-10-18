/**
 * DiwaliSparks - Customer Storefront Application Logic
 * Modern, responsive festival e-commerce client with Cart, Checkout, 
 * Razorpay Test Integration, Order Tracking, and Real-Time Sync.
 */

// Application State
const AppState = {
  products: [],
  categories: [],
  filteredProducts: [],
  cart: JSON.parse(localStorage.getItem('diwalisparks_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('diwalisparks_wishlist') || '[]'),
  currentCategory: 'all',
  searchQuery: '',
  sortBy: 'featured',
  activeCoupon: JSON.parse(localStorage.getItem('diwalisparks_applied_coupon') || 'null'),
  settings: null,
  currentQuickViewProduct: null,
  checkoutStep: 1,
  selectedPaymentMethod: 'razorpay'
};

// Initialize App on DOM Ready
document.addEventListener('DOMContentLoaded', async () => {
  await initApp();
  setupEventListeners();
  setupCountdownTimer();
});

// App Initialization
async function initApp() {
  try {
    // Use crackerAPI (backend-first, IndexedDB fallback)
    const db = window.crackerAPI || window.crackerDB;
    AppState.settings = await db.getSettings();
    AppState.categories = await db.getCategories();
    AppState.products = await db.getProducts();

    renderCategories();
    applyFilters();
    updateCartUI();
    updateWishlistCount();

    // Listen to real-time database updates from Admin panel
    db.subscribe((data) => {
      handleDatabaseBroadcast(data);
    });
  } catch (error) {
    console.error('Initialization error:', error);
    showToast('Failed to load store catalog. Please refresh.', 'error');
  }
}


// Handle Real-time Broadcast from Admin
async function handleDatabaseBroadcast(event) {
  if (!event || !event.type) return;
  const db = window.crackerAPI || window.crackerDB;

  if (event.type === 'PRODUCT_SAVED' || event.type === 'PRODUCT_DELETED' || event.type === 'DATABASE_RESET') {
    AppState.products = await db.getProducts();
    applyFilters();
  }
  if (event.type === 'CATEGORY_SAVED' || event.type === 'DATABASE_RESET') {
    AppState.categories = await db.getCategories();
    renderCategories();
  }
  if (event.type === 'ORDER_STATUS_UPDATED') {
    // If tracking modal is open, refresh tracking details
    const trackInput = document.getElementById('trackOrderInput');
    if (trackInput && trackInput.value.trim() === event.payload.id) {
      trackOrder(event.payload.id);
    }
  }
}


// Event Listeners Setup
function setupEventListeners() {
  // Search bar
  const searchInput = document.getElementById('headerSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      AppState.searchQuery = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }

  // Sort dropdown
  const sortSelect = document.getElementById('catalogSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      AppState.sortBy = e.target.value;
      applyFilters();
    });
  }

  // Cart Drawer open/close
  const cartTriggerBtns = document.querySelectorAll('.js-open-cart');
  cartTriggerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCartDrawer();
    });
  });

  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartOverlay = document.getElementById('cartDrawerOverlay');
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

  // Sound FX Toggle
  const soundBtn = document.getElementById('soundToggleBtn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      if (window.fireworks) {
        const isMuted = !window.fireworks.toggleSound();
        soundBtn.classList.toggle('active', !isMuted);
        soundBtn.innerHTML = !isMuted ? '🔊 Sound: ON' : '🔈 Sound: OFF';
        showToast(!isMuted ? 'Cracker Sound FX Activated!' : 'Sound muted', 'info');
      }
    });
  }

  // Coupon application
  const applyCouponBtn = document.getElementById('applyCouponBtn');
  if (applyCouponBtn) {
    applyCouponBtn.addEventListener('click', applyCouponCode);
  }

  // Proceed to Checkout button
  const checkoutProceedBtn = document.getElementById('checkoutProceedBtn');
  if (checkoutProceedBtn) {
    checkoutProceedBtn.addEventListener('click', () => {
      closeCartDrawer();
      openCheckoutModal();
    });
  }

  // Modal Closers
  document.querySelectorAll('.js-modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-overlay');
      if (modal) modal.classList.remove('active');
    });
  });
}

// Render Categories Bar & Showcase
function renderCategories() {
  const container = document.getElementById('categoriesGrid');
  if (!container) return;

  const html = AppState.categories.map(cat => {
    const count = AppState.products.filter(p => p.category === cat.slug).length;
    const isActive = AppState.currentCategory === cat.slug;
    return `
      <div class="category-card ${isActive ? 'active' : ''}" onclick="selectCategory('${cat.slug}')">
        <span class="category-icon">${cat.icon || '🎆'}</span>
        <h4 class="category-name">${cat.name}</h4>
        <span class="category-count">${count} Varieties</span>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

// Category Selection
window.selectCategory = function(slug) {
  AppState.currentCategory = slug;
  // Update category card active classes
  renderCategories();
  
  // Update quick filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    if (btn.dataset.category === slug) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  applyFilters();

  // Smooth scroll to catalog
  const catalogSection = document.getElementById('productsSection');
  if (catalogSection) {
    catalogSection.scrollIntoView({ behavior: 'smooth' });
  }
};

// Filter & Sort Products
function applyFilters() {
  let list = [...AppState.products];

  // Category Filter
  if (AppState.currentCategory && AppState.currentCategory !== 'all') {
    list = list.filter(p => p.category === AppState.currentCategory);
  }

  // Search Filter
  if (AppState.searchQuery) {
    list = list.filter(p => 
      p.name.toLowerCase().includes(AppState.searchQuery) ||
      (p.description && p.description.toLowerCase().includes(AppState.searchQuery)) ||
      (p.soundLevel && p.soundLevel.toLowerCase().includes(AppState.searchQuery))
    );
  }

  // Sorting
  if (AppState.sortBy === 'price-low') {
    list.sort((a, b) => a.price - b.price);
  } else if (AppState.sortBy === 'price-high') {
    list.sort((a, b) => b.price - a.price);
  } else if (AppState.sortBy === 'rating') {
    list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (AppState.sortBy === 'discount') {
    list.sort((a, b) => {
      const discA = ((a.originalPrice - a.price) / a.originalPrice) || 0;
      const discB = ((b.originalPrice - b.price) / b.originalPrice) || 0;
      return discB - discA;
    });
  } else {
    // Featured first
    list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  AppState.filteredProducts = list;
  renderProducts();
}

// Render Products Catalog Grid
function renderProducts() {
  const container = document.getElementById('productsGrid');
  if (!container) return;

  if (AppState.filteredProducts.length === 0) {
    container.innerHTML = `
      <div class="empty-catalog">
        <div class="empty-icon">🧨</div>
        <h3 style="color:#fff; margin-bottom: 0.5rem;">No Festive Crackers Found</h3>
        <p style="color:var(--text-muted); margin-bottom: 1rem;">Try clearing your search query or choosing another exciting category.</p>
        <button class="btn-primary" onclick="selectCategory('all')">View All Crackers</button>
      </div>
    `;
    return;
  }

  const html = AppState.filteredProducts.map(p => {
    const isOutOfStock = p.stock <= 0;
    const isWishlisted = AppState.wishlist.includes(p.id);

    return `
      <div class="product-card" id="card-${p.id}">
        <div class="product-thumb-wrap">
          <img src="${p.image}" alt="${p.name}" class="product-thumb" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=800&q=80'">
          ${p.discount ? `<span class="badge-discount">${p.discount}</span>` : ''}
          ${p.ecoFriendly ? `<span class="badge-tag badge-eco">🌱 Green Cracker</span>` : ''}
          ${p.soundLevel ? `<span class="badge-sound">${p.soundLevel}</span>` : ''}
          <button class="quick-view-hover-btn" onclick="openQuickView('${p.id}')">Quick Look</button>
        </div>

        <div class="product-info">
          <div class="product-rating">
            <span>⭐ ${p.rating || '4.9'}</span>
            <span class="count">(${p.reviewsCount || 100}+ reviews)</span>
          </div>

          <h3 class="product-title" title="${p.name}">${p.name}</h3>
          <div class="product-pack-size">📦 ${p.packSize || '1 Standard Pack'}</div>

          <div class="product-pricing">
            <span class="current-price">₹${p.price.toLocaleString('en-IN')}</span>
            ${p.originalPrice ? `<span class="old-price">₹${p.originalPrice.toLocaleString('en-IN')}</span>` : ''}
          </div>

          <button 
            class="btn-add-cart ${isOutOfStock ? 'out-of-stock' : ''}" 
            ${isOutOfStock ? 'disabled' : ''} 
            onclick="addToCart('${p.id}')"
          >
            ${isOutOfStock ? '⚠️ Out of Stock' : '🛒 Add to Cart'}
          </button>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

// Quick View Modal
window.openQuickView = function(productId) {
  const product = AppState.products.find(p => p.id === productId);
  if (!product) return;

  AppState.currentQuickViewProduct = product;
  const modal = document.getElementById('quickViewModal');
  const content = document.getElementById('quickViewContent');

  if (content) {
    content.innerHTML = `
      <div class="quick-view-grid">
        <div>
          <img src="${product.image}" alt="${product.name}" class="quick-view-img" onerror="this.src='https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=800&q=80'">
        </div>
        <div style="display:flex; flex-direction:column;">
          <div style="display:flex; gap:0.5rem; margin-bottom:0.6rem;">
            ${product.ecoFriendly ? '<span class="status-pill in-stock">🌱 CSIR-NEERI Green Certified</span>' : ''}
            <span class="status-pill shipped">🔊 ${product.soundLevel || 'Medium Sound'}</span>
          </div>

          <h2 style="font-size:1.35rem; color:#fff; font-weight:800; margin-bottom:0.5rem;">${product.name}</h2>
          <div style="color:var(--primary-gold-light); font-weight:700; font-size:0.85rem; margin-bottom:0.75rem;">
            ⭐ ${product.rating || '4.9'} rating from ${product.reviewsCount || 100}+ festive buyers
          </div>

          <div style="display:flex; align-items:baseline; gap:0.75rem; margin-bottom:1rem;">
            <span style="font-size:1.6rem; font-weight:800; color:var(--primary-gold-light);">₹${product.price.toLocaleString('en-IN')}</span>
            ${product.originalPrice ? `<span style="text-decoration:line-through; color:var(--text-muted); font-size:1.1rem;">₹${product.originalPrice.toLocaleString('en-IN')}</span>` : ''}
            <span class="badge-discount" style="position:static;">${product.discount || '50% OFF'}</span>
          </div>

          <p style="color:var(--text-sub); font-size:0.88rem; line-height:1.6; margin-bottom:1rem;">
            ${product.description}
          </p>

          <div style="background:rgba(255,255,255,0.04); border:1px dashed var(--border-color); border-radius:var(--radius-sm); padding:0.85rem; margin-bottom:1.25rem;">
            <div style="font-size:0.78rem; font-weight:800; color:var(--primary-gold-light); text-transform:uppercase; margin-bottom:4px;">
              ⚠️ Safety & Lighting Instructions:
            </div>
            <div style="font-size:0.82rem; color:var(--text-muted);">
              ${product.safetyInstructions || 'Keep safe distance outdoors. Light with long agarbatti.'}
            </div>
          </div>

          <div style="margin-top:auto;">
            <button class="btn-primary" style="width:100%; justify-content:center;" onclick="addToCart('${product.id}'); document.getElementById('quickViewModal').classList.remove('active');">
              🛒 Add to Cart Now
            </button>
          </div>
        </div>
      </div>
    `;
  }

  if (modal) modal.classList.add('active');
};

// ==========================================================================
// Shopping Cart Logic
// ==========================================================================
window.addToCart = function(productId) {
  const product = AppState.products.find(p => p.id === productId);
  if (!product) return;

  if (product.stock <= 0) {
    showToast('This item is currently out of stock.', 'error');
    return;
  }

  const existing = AppState.cart.find(item => item.productId === productId);
  if (existing) {
    if (existing.quantity >= product.stock) {
      showToast(`Only ${product.stock} items available in stock.`, 'info');
      return;
    }
    existing.quantity += 1;
    existing.total = existing.quantity * existing.price;
  } else {
    AppState.cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      total: product.price
    });
  }

  saveCart();
  updateCartUI();
  showToast(`Added ${product.name} to cart!`, 'success');

  if (window.fireworks) {
    window.fireworks.playSparkleSound();
  }
};

window.updateCartQuantity = function(productId, delta) {
  const itemIndex = AppState.cart.findIndex(i => i.productId === productId);
  if (itemIndex < 0) return;

  const item = AppState.cart[itemIndex];
  const product = AppState.products.find(p => p.id === productId);

  item.quantity += delta;
  if (item.quantity <= 0) {
    AppState.cart.splice(itemIndex, 1);
  } else {
    if (product && item.quantity > product.stock) {
      item.quantity = product.stock;
      showToast(`Max available stock is ${product.stock}`, 'info');
    }
    item.total = item.quantity * item.price;
  }

  saveCart();
  updateCartUI();
};

window.removeFromCart = function(productId) {
  AppState.cart = AppState.cart.filter(i => i.productId !== productId);
  saveCart();
  updateCartUI();
  showToast('Item removed from cart', 'info');
};

function saveCart() {
  localStorage.setItem('diwalisparks_cart', JSON.stringify(AppState.cart));
}

function calculateCartTotals() {
  const subtotal = AppState.cart.reduce((sum, item) => sum + item.total, 0);
  let discount = 0;

  if (AppState.activeCoupon && subtotal >= (AppState.activeCoupon.minOrder || 0)) {
    discount = (subtotal * AppState.activeCoupon.discountPercent) / 100;
  }

  const freeThreshold = (AppState.settings && AppState.settings.freeShippingThreshold) || 999;
  const shipping = subtotal >= freeThreshold || subtotal === 0 ? 0 : ((AppState.settings && AppState.settings.shippingFee) || 99);
  const total = Math.max(0, subtotal - discount + shipping);

  return { subtotal, discount, shipping, total, freeThreshold };
}

function updateCartUI() {
  const totalCount = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Update header badges
  const badgeCounts = document.querySelectorAll('.js-cart-count');
  badgeCounts.forEach(el => el.textContent = totalCount);

  // Update Cart Drawer List
  const listContainer = document.getElementById('cartItemsList');
  if (!listContainer) return;

  const { subtotal, discount, shipping, total, freeThreshold } = calculateCartTotals();

  // Free shipping bar progress
  const meterFill = document.getElementById('deliveryMeterFill');
  const meterText = document.getElementById('deliveryMeterText');
  if (meterFill && meterText) {
    if (subtotal >= freeThreshold) {
      meterFill.style.width = '100%';
      meterText.innerHTML = `🎉 <span>FREE Express Festive Delivery</span> Unlocked!`;
    } else {
      const remaining = freeThreshold - subtotal;
      const pct = Math.min(100, Math.round((subtotal / freeThreshold) * 100));
      meterFill.style.width = `${pct}%`;
      meterText.innerHTML = `Add <span>₹${remaining.toLocaleString('en-IN')}</span> more for FREE Delivery!`;
    }
  }

  if (AppState.cart.length === 0) {
    listContainer.innerHTML = `
      <div class="cart-empty-view">
        <div class="empty-icon">🪔</div>
        <h4 style="color:#fff; margin-bottom: 0.5rem;">Your Cart is Empty</h4>
        <p style="font-size:0.85rem;">Add sparklers, sky shots, and gift boxes to spark up your festival!</p>
      </div>
    `;
    const checkoutBtn = document.getElementById('checkoutProceedBtn');
    if (checkoutBtn) checkoutBtn.disabled = true;
  } else {
    listContainer.innerHTML = AppState.cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=800&q=80'">
        <div class="cart-item-details">
          <h4 class="cart-item-title">${item.name}</h4>
          <div class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</div>
          <div class="cart-item-controls">
            <div class="qty-stepper">
              <button onclick="updateCartQuantity('${item.productId}', -1)">-</button>
              <span class="qty-val">${item.quantity}</span>
              <button onclick="updateCartQuantity('${item.productId}', 1)">+</button>
            </div>
            <button class="btn-remove-item" onclick="removeFromCart('${item.productId}')">Remove</button>
          </div>
        </div>
      </div>
    `).join('');

    const checkoutBtn = document.getElementById('checkoutProceedBtn');
    if (checkoutBtn) checkoutBtn.disabled = false;
  }

  // Update Summary numbers
  const subtotalEl = document.getElementById('cartSubtotal');
  const discountEl = document.getElementById('cartDiscount');
  const shippingEl = document.getElementById('cartShipping');
  const totalEl = document.getElementById('cartGrandTotal');

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  if (discountEl) discountEl.textContent = `-₹${discount.toLocaleString('en-IN')}`;
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : `₹${shipping}`;
  if (totalEl) totalEl.textContent = `₹${Math.round(total).toLocaleString('en-IN')}`;

  // Update Applied coupon pill
  const couponPill = document.getElementById('appliedCouponPill');
  if (couponPill) {
    if (AppState.activeCoupon) {
      couponPill.style.display = 'flex';
      couponPill.innerHTML = `
        <span>🏷️ <b>${AppState.activeCoupon.code}</b> (${AppState.activeCoupon.discountPercent}% Off applied)</span>
        <button onclick="removeCoupon()" style="color:#ef4444; font-weight:bold; cursor:pointer;">✕</button>
      `;
    } else {
      couponPill.style.display = 'none';
    }
  }
}

// Drawer Controls
function openCartDrawer() {
  document.getElementById('cartDrawerOverlay')?.classList.add('active');
  document.getElementById('cartDrawer')?.classList.add('active');
}

function closeCartDrawer() {
  document.getElementById('cartDrawerOverlay')?.classList.remove('active');
  document.getElementById('cartDrawer')?.classList.remove('active');
}

// Coupon Management
async function applyCouponCode() {
  const input = document.getElementById('cartCouponInput');
  if (!input) return;

  const code = input.value.trim().toUpperCase();
  if (!code) {
    showToast('Please enter a coupon code', 'info');
    return;
  }

  const db = window.crackerAPI || window.crackerDB;
  const coupon = await db.getCoupon(code);
  if (!coupon) {
    showToast('Invalid coupon code. Try DIWALI50 or FESTIVE20', 'error');
    return;
  }

  const { subtotal } = calculateCartTotals();
  if (subtotal < (coupon.minOrder || 0)) {
    showToast(`Minimum order amount of ₹${coupon.minOrder} required for code ${coupon.code}`, 'info');
    return;
  }

  AppState.activeCoupon = coupon;
  localStorage.setItem('diwalisparks_applied_coupon', JSON.stringify(coupon));
  input.value = '';
  updateCartUI();
  showToast(`🎉 Coupon ${coupon.code} applied successfully!`, 'success');

  if (window.fireworks) {
    window.fireworks.playBangSound();
  }
}

window.removeCoupon = function() {
  AppState.activeCoupon = null;
  localStorage.removeItem('diwalisparks_applied_coupon');
  updateCartUI();
  showToast('Coupon removed', 'info');
};

// ==========================================================================
// Checkout & Payment Integration
// ==========================================================================
function openCheckoutModal() {
  if (AppState.cart.length === 0) {
    showToast('Your cart is empty', 'error');
    return;
  }

  AppState.checkoutStep = 1;
  updateCheckoutStepView();

  const modal = document.getElementById('checkoutModal');
  if (modal) modal.classList.add('active');
}

function updateCheckoutStepView() {
  const stepNodes = document.querySelectorAll('.step-node');
  stepNodes.forEach((node, idx) => {
    if (idx + 1 === AppState.checkoutStep) {
      node.classList.add('active');
      node.classList.remove('completed');
    } else if (idx + 1 < AppState.checkoutStep) {
      node.classList.remove('active');
      node.classList.add('completed');
    } else {
      node.classList.remove('active', 'completed');
    }
  });

  const step1 = document.getElementById('checkoutStep1');
  const step2 = document.getElementById('checkoutStep2');
  const step3 = document.getElementById('checkoutStep3');

  if (step1) step1.style.display = AppState.checkoutStep === 1 ? 'block' : 'none';
  if (step2) step2.style.display = AppState.checkoutStep === 2 ? 'block' : 'none';
  if (step3) step3.style.display = AppState.checkoutStep === 3 ? 'block' : 'none';

  // Render totals in Step 2 / 3
  const { subtotal, discount, shipping, total } = calculateCartTotals();
  const checkoutTotalEl = document.getElementById('checkoutTotalDisplay');
  if (checkoutTotalEl) checkoutTotalEl.textContent = `₹${Math.round(total).toLocaleString('en-IN')}`;
}

window.goToCheckoutStep = function(step) {
  if (step === 2) {
    // Validate form inputs
    const name = document.getElementById('custName')?.value.trim();
    const phone = document.getElementById('custPhone')?.value.trim();
    const address = document.getElementById('custAddress')?.value.trim();
    const city = document.getElementById('custCity')?.value.trim();
    const pincode = document.getElementById('custPincode')?.value.trim();

    if (!name || !phone || !address || !city || !pincode) {
      showToast('Please fill all required delivery details.', 'error');
      return;
    }
  }

  AppState.checkoutStep = step;
  updateCheckoutStepView();
};

window.selectPaymentMethod = function(method) {
  AppState.selectedPaymentMethod = method;
  document.querySelectorAll('.pay-card-option').forEach(el => {
    if (el.dataset.method === method) el.classList.add('selected');
    else el.classList.remove('selected');
  });

  const rzpBox = document.getElementById('razorpaySimulatorBox');
  if (rzpBox) {
    rzpBox.style.display = method === 'razorpay' ? 'block' : 'none';
  }
};

// Process Payment & Create Order
window.processPaymentAndOrder = async function() {
  const payBtn = document.getElementById('btnSubmitPayment');
  const originalBtnText = payBtn ? payBtn.innerHTML : 'Pay & Confirm Order';

  if (payBtn) {
    payBtn.disabled = true;
    payBtn.innerHTML = `<span>⏳ Processing Payment...</span>`;
  }

  const { subtotal, discount, shipping, total } = calculateCartTotals();

  const customerData = {
    name: document.getElementById('custName')?.value.trim() || 'Festive Customer',
    phone: document.getElementById('custPhone')?.value.trim() || '+91 98765 00000',
    email: document.getElementById('custEmail')?.value.trim() || 'customer@festive.com',
    address: document.getElementById('custAddress')?.value.trim() || 'Main Street',
    city: document.getElementById('custCity')?.value.trim() || 'Sivakasi',
    pincode: document.getElementById('custPincode')?.value.trim() || '626123',
    state: document.getElementById('custState')?.value.trim() || 'Tamil Nadu'
  };

  // Simulate Razorpay Gateway Failure toggle check
  const failCheckbox = document.getElementById('rzpSimulateFailToggle');
  const shouldSimulateFailure = failCheckbox && failCheckbox.checked;

  setTimeout(async () => {
    if (shouldSimulateFailure && AppState.selectedPaymentMethod === 'razorpay') {
      if (payBtn) {
        payBtn.disabled = false;
        payBtn.innerHTML = originalBtnText;
      }
      showToast('❌ Payment Failed: Transaction was declined by bank simulator.', 'error');
      return;
    }

    try {
      const transactionId = 'pay_rzp_test_' + Math.floor(10000000 + Math.random() * 90000000);
      const isCod = AppState.selectedPaymentMethod === 'cod';

      const orderPayload = {
        customer: customerData,
        items: [...AppState.cart],
        pricing: {
          subtotal,
          discount,
          shipping,
          tax: 0,
          total: Math.round(total)
        },
        coupon: AppState.activeCoupon ? AppState.activeCoupon.code : null,
        payment: {
          method: isCod ? 'Cash on Delivery (COD)' : 'Razorpay Test Mode (Simulated)',
          transactionId: isCod ? `cod_${Date.now()}` : transactionId,
          status: isCod ? 'Pending' : 'Paid',
          paidAt: isCod ? null : new Date().toISOString()
        },
        orderStatus: 'Confirmed',
        notes: document.getElementById('custNotes')?.value.trim() || ''
      };

      const db = window.crackerAPI || window.crackerDB;
      const newOrder = await db.createOrder(orderPayload);

      // Trigger Celebration Fireworks
      if (window.fireworks) {
        window.fireworks.celebrateOrderSuccess();
      }

      // Close checkout modal
      document.getElementById('checkoutModal')?.classList.remove('active');

      // Clear Cart
      AppState.cart = [];
      AppState.activeCoupon = null;
      localStorage.removeItem('diwalisparks_cart');
      localStorage.removeItem('diwalisparks_applied_coupon');
      updateCartUI();

      // Show Order Success Invoice Modal
      showOrderSuccessInvoice(newOrder);

    } catch (err) {
      console.error('Order creation failed:', err);
      showToast('Failed to create order: ' + err.message, 'error');
    } finally {
      if (payBtn) {
        payBtn.disabled = false;
        payBtn.innerHTML = originalBtnText;
      }
    }
  }, 1400);
};

// Show Order Success Invoice
function showOrderSuccessInvoice(order) {
  const modal = document.getElementById('orderSuccessModal');
  const detailsContainer = document.getElementById('successOrderDetails');

  if (detailsContainer) {
    const itemsListHtml = order.items.map(item => `
      <div class="invoice-row">
        <span>${item.name} × ${item.quantity}</span>
        <span>₹${item.total.toLocaleString('en-IN')}</span>
      </div>
    `).join('');

    detailsContainer.innerHTML = `
      <div class="invoice-box" id="printableInvoice">
        <div style="text-align:center; margin-bottom:1rem; border-bottom:1px solid var(--border-color); padding-bottom:0.75rem;">
          <h3 style="color:#f59e0b; font-size:1.2rem; font-weight:800;">🎆 DiwaliSparks Firework Co. 🪔</h3>
          <p style="font-size:0.75rem; color:var(--text-muted);">Sivakasi Factory Direct | 100% Green Certified</p>
        </div>

        <div class="invoice-row">
          <span>Order ID:</span>
          <span style="color:#fff; font-weight:800;">${order.id}</span>
        </div>
        <div class="invoice-row">
          <span>Tracking No:</span>
          <span style="color:#34d399; font-weight:700;">${order.trackingNumber}</span>
        </div>
        <div class="invoice-row">
          <span>Customer:</span>
          <span style="color:#fff;">${order.customer.name} (${order.customer.phone})</span>
        </div>
        <div class="invoice-row">
          <span>Delivery Address:</span>
          <span style="color:var(--text-sub); text-align:right; max-width:260px;">${order.customer.address}, ${order.customer.city} - ${order.customer.pincode}</span>
        </div>
        <div class="invoice-row">
          <span>Payment Method:</span>
          <span style="color:#38bdf8; font-weight:700;">${order.payment.method}</span>
        </div>
        <div class="invoice-row">
          <span>Transaction ID:</span>
          <span style="font-family:monospace; font-size:0.78rem;">${order.payment.transactionId}</span>
        </div>

        <div style="margin: 1rem 0; border-top: 1px dashed var(--border-color); padding-top: 0.75rem;">
          <div style="font-size:0.8rem; font-weight:700; color:#fff; margin-bottom:0.4rem;">Itemized Order Summary:</div>
          ${itemsListHtml}
        </div>

        ${order.pricing.discount > 0 ? `
          <div class="invoice-row" style="color:#34d399;">
            <span>Festive Discount Applied:</span>
            <span>-₹${order.pricing.discount.toLocaleString('en-IN')}</span>
          </div>
        ` : ''}

        <div class="invoice-row">
          <span>Delivery Charges:</span>
          <span>${order.pricing.shipping === 0 ? 'FREE' : '₹' + order.pricing.shipping}</span>
        </div>

        <div class="invoice-row bold">
          <span>Total Paid Amount:</span>
          <span style="color:#f59e0b;">₹${order.pricing.total.toLocaleString('en-IN')}</span>
        </div>
      </div>
    `;
  }

  if (modal) modal.classList.add('active');
}

// Print or Save Invoice
window.printInvoice = function() {
  window.print();
};

// ==========================================================================
// Order Tracking Modal
// ==========================================================================
window.openTrackOrderModal = function() {
  const modal = document.getElementById('trackOrderModal');
  if (modal) modal.classList.add('active');
};

window.trackOrder = async function(presetId = null) {
  const input = document.getElementById('trackOrderInput');
  const orderId = (presetId || (input ? input.value : '')).trim().toUpperCase();

  if (!orderId) {
    showToast('Please enter an Order ID', 'info');
    return;
  }

  const resultContainer = document.getElementById('trackOrderResults');
  if (!resultContainer) return;

  const db = window.crackerAPI || window.crackerDB;
  const order = await db.getOrderById(orderId);
  if (!order) {
    resultContainer.innerHTML = `
      <div style="text-align:center; padding:1.5rem; color:#ef4444;">
        <p>⚠️ No order found matching "<b>${orderId}</b>".</p>
        <p style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">Try one of the seed order IDs like <code>ORD-2026-8841</code>.</p>
      </div>
    `;
    return;
  }

  const steps = [
    { title: 'Order Confirmed', desc: 'Received & Verified at Factory Sivakasi', status: 'Confirmed' },
    { title: 'Packed in Safety Box', desc: 'Secure festive packaging with hazard seals', status: 'Processing' },
    { title: 'Shipped via Express Express', desc: `In transit | Tracking: ${order.trackingNumber}`, status: 'Shipped' },
    { title: 'Delivered', desc: 'Delivered safely to doorstep', status: 'Delivered' }
  ];

  const statusOrder = ['Confirmed', 'Processing', 'Shipped', 'Delivered'];
  const currentIndex = statusOrder.indexOf(order.orderStatus);

  const timelineHtml = steps.map((step, idx) => {
    let stateClass = '';
    if (idx < currentIndex) stateClass = 'completed';
    else if (idx === currentIndex) stateClass = 'current';

    return `
      <div class="timeline-step ${stateClass}">
        <div class="timeline-dot"></div>
        <div style="font-weight:700; color:#fff; font-size:0.9rem;">${step.title}</div>
        <div style="font-size:0.75rem; color:var(--text-muted);">${step.desc}</div>
      </div>
    `;
  }).join('');

  resultContainer.innerHTML = `
    <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1.25rem; margin-top:1rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <div>
          <span style="font-size:0.75rem; color:var(--text-muted);">Status for</span>
          <h4 style="color:#fff; font-size:1.1rem; font-weight:800;">${order.id}</h4>
        </div>
        <span class="status-pill ${order.orderStatus.toLowerCase()}">${order.orderStatus}</span>
      </div>

      <div class="timeline-track">
        ${timelineHtml}
      </div>

      <div style="margin-top:1.25rem; padding-top:1rem; border-top:1px dashed var(--border-color); font-size:0.82rem; color:var(--text-sub);">
        <div><b>Delivery Address:</b> ${order.customer.address}, ${order.customer.city} (${order.customer.pincode})</div>
        <div><b>Total Amount:</b> ₹${order.pricing.total.toLocaleString('en-IN')} (${order.payment.status})</div>
      </div>
    </div>
  `;
};

// ==========================================================================
// Countdown Timer to Diwali / Festival
// ==========================================================================
function setupCountdownTimer() {
  const daysEl = document.getElementById('countDays');
  const hoursEl = document.getElementById('countHours');
  const minsEl = document.getElementById('countMins');
  const secsEl = document.getElementById('countSecs');

  if (!daysEl) return;

  // Set target to upcoming Diwali date (November 1)
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 18);
  targetDate.setHours(20, 0, 0, 0);

  function update() {
    const now = new Date().getTime();
    const diff = targetDate.getTime() - now;

    if (diff <= 0) return;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minsEl) minsEl.textContent = String(mins).padStart(2, '0');
    if (secsEl) secsEl.textContent = String(secs).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

// Toast Notifications System
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : type === 'error' ? '⚠️' : '✨'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 50);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 3500);
}

function updateWishlistCount() {
  const badge = document.getElementById('wishlistCountBadge');
  if (badge) badge.textContent = AppState.wishlist.length;
}
