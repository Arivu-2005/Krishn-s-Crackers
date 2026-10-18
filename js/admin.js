/**
 * Krishn's Crackers - Secure Admin Dashboard Logic
 * Production-ready administration interface with JWT authentication,
 * Product CRUD operations, order status updates, and real-time storefront synchronization.
 */

const AdminState = {
  token: sessionStorage.getItem('krishns_admin_token') || null,
  isLoggedIn: !!sessionStorage.getItem('krishns_admin_token'),
  currentTab: 'dashboard',
  products: [],
  orders: [],
  categories: [],
  settings: null,
  stats: null,
  editingProductId: null,
  activeOrderFilter: 'all',
  activeProductFilter: 'all',
  productSearchQuery: '',
  orderSearchQuery: ''
};

// Base API URL
const API_BASE = window.location.origin.includes('http') ? window.location.origin : 'http://localhost:3000';

// Safe JSON parser to completely prevent "Unexpected end of JSON input"
async function safeJson(res) {
  if (!res) return { success: false, message: 'No response received from server' };
  try {
    const text = await res.text();
    if (!text || !text.trim()) {
      return { success: res.ok, message: res.ok ? 'Operation successful' : `HTTP error ${res.status}` };
    }
    return JSON.parse(text);
  } catch (err) {
    return { success: res.ok, message: res.ok ? 'Success' : `Error parsing server response: ${err.message}` };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkAdminAuth();
  setupAdminListeners();
});

// Authentication Guard
function checkAdminAuth() {
  const lockScreen = document.getElementById('authLockScreen');
  if (!AdminState.isLoggedIn) {
    if (lockScreen) lockScreen.style.display = 'flex';
  } else {
    if (lockScreen) lockScreen.style.display = 'none';
    loadDashboardData();
  }
}

// Admin Login Handler with JWT Token
window.handleAdminLogin = async function(e) {
  e.preventDefault();
  const emailInput = document.getElementById('adminEmail');
  const passwordInput = document.getElementById('adminPassword');
  const email = emailInput?.value.trim();
  const password = passwordInput?.value.trim();

  if (!email || !password) {
    showAdminToast('Please enter both email and password.', 'error');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await safeJson(res);

    if (data.success && data.token) {
      AdminState.token = data.token;
      AdminState.isLoggedIn = true;
      sessionStorage.setItem('krishns_admin_token', data.token);
      document.getElementById('authLockScreen').style.display = 'none';
      await loadDashboardData();
      showAdminToast("Welcome to Krishn's Crackers Admin Portal! Authenticated.", 'success');
    } else {
      showAdminToast(data.message || 'Invalid credentials.', 'error');
    }
  } catch (err) {
    showAdminToast('Authentication failed: ' + err.message, 'error');
  }
};

window.handleAdminLogout = function() {
  AdminState.isLoggedIn = false;
  AdminState.token = null;
  sessionStorage.removeItem('krishns_admin_token');
  document.getElementById('authLockScreen').style.display = 'flex';
  showAdminToast('Logged out securely.', 'info');
};

// Helper for authenticated API calls
async function authFetch(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(AdminState.token ? { 'Authorization': `Bearer ${AdminState.token}` } : {}),
    ...(options.headers || {})
  };
  return fetch(url, { ...options, headers });
}

// Load Dashboard Data from MongoDB Server
async function loadDashboardData() {
  // 1. Fetch Stats
  try {
    const statsRes = await authFetch(`${API_BASE}/api/admin/stats`);
    const statsJson = await safeJson(statsRes);
    if (statsJson.success && statsJson.data) {
      AdminState.stats = statsJson.data;
      renderStats(statsJson.data);
    }
  } catch (e) {
    console.warn('Stats API error:', e.message);
  }

  // 2. Fetch Products
  try {
    const prodRes = await fetch(`${API_BASE}/api/products`);
    const prodJson = await safeJson(prodRes);
    if (prodJson.success && Array.isArray(prodJson.data)) {
      AdminState.products = prodJson.data;
      renderProductsTable();
    }
  } catch (err) {
    console.warn('Products API error:', err.message);
  }

  // 3. Fetch Orders
  try {
    const ordersRes = await authFetch(`${API_BASE}/api/orders`);
    const ordersJson = await safeJson(ordersRes);
    if (ordersJson.success && Array.isArray(ordersJson.data)) {
      AdminState.orders = ordersJson.data;
      renderOrdersTable();
    }
  } catch (e) {
    console.warn('Orders API error:', e.message);
  }

  // 4. Fetch Categories
  try {
    const catRes = await fetch(`${API_BASE}/api/categories`);
    const catJson = await safeJson(catRes);
    if (catJson.success && Array.isArray(catJson.data)) {
      AdminState.categories = catJson.data;
      renderCategoriesTable();
      populateCategorySelect();
    }
  } catch (e) {
    console.warn('Categories API error:', e.message);
  }

  // 5. Fetch Store Settings
  try {
    const setRes = await fetch(`${API_BASE}/api/settings`);
    const setJson = await safeJson(setRes);
    if (setJson.success && setJson.data) {
      AdminState.settings = setJson.data;
      populateSettingsForm(setJson.data);
    }
  } catch (e) {
    console.warn('Settings API error:', e.message);
  }
}

// Setup Event Listeners
function setupAdminListeners() {
  document.querySelectorAll('.sidebar-link[data-tab]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(link.dataset.tab);
    });
  });

  const menuToggle = document.getElementById('adminMenuToggle');
  const sidebar = document.getElementById('adminSidebar');
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Search inputs
  document.getElementById('adminProductSearch')?.addEventListener('input', (e) => {
    AdminState.productSearchQuery = e.target.value.toLowerCase().trim();
    renderProductsTable();
  });

  document.getElementById('adminOrderSearch')?.addEventListener('input', (e) => {
    AdminState.orderSearchQuery = e.target.value.toLowerCase().trim();
    renderOrdersTable();
  });

  // Image preview live update
  document.getElementById('prodImageInput')?.addEventListener('input', (e) => {
    const val = e.target.value || './images/royal-symphony-120-shots.png';
    const preview = document.getElementById('prodImgPreview');
    if (preview) preview.src = val;
  });
}

function switchTab(tabName) {
  AdminState.currentTab = tabName;
  document.querySelectorAll('.sidebar-link[data-tab]').forEach(l => l.classList.toggle('active', l.dataset.tab === tabName));
  document.querySelectorAll('.admin-view').forEach(v => v.classList.toggle('active', v.id === `view-${tabName}`));

  const titles = {
    dashboard: 'Dashboard Overview',
    products: 'Cracker Inventory Management',
    orders: 'Customer Orders & Shipments',
    categories: 'Categories & Types',
    settings: 'Store & Payment Settings'
  };
  const titleEl = document.getElementById('currentViewTitle');
  if (titleEl) titleEl.textContent = titles[tabName] || 'Admin Portal';
}

// Render Stats & KPIs
function renderStats(stats) {
  if (!stats) return;
  const revEl = document.getElementById('statTotalRevenue');
  if (revEl) revEl.textContent = `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`;
  const ordEl = document.getElementById('statTotalOrders');
  if (ordEl) ordEl.textContent = stats.totalOrders || 0;
  const prodEl = document.getElementById('statTotalProducts');
  if (prodEl) prodEl.textContent = stats.totalProducts || 0;
  const pendEl = document.getElementById('statPendingOrders');
  if (pendEl) pendEl.textContent = stats.pendingOrders || 0;

  // Render Category distribution bars
  const chart = document.getElementById('categorySalesChart');
  if (chart && Array.isArray(stats.categoryDistribution)) {
    const maxCount = Math.max(...stats.categoryDistribution.map(c => c.count), 1);
    chart.innerHTML = stats.categoryDistribution.map(cat => {
      const pct = Math.round((cat.count / maxCount) * 100);
      return `
        <div class="chart-bar-item">
          <div class="bar-item-info">
            <span>${cat.icon || '🚀'} ${cat.name}</span>
            <span>${cat.count} Varieties (${pct}%)</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${pct}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render recent orders
  const recentContainer = document.getElementById('recentOrdersWidget');
  if (recentContainer && Array.isArray(stats.recentOrders)) {
    if (stats.recentOrders.length === 0) {
      recentContainer.innerHTML = `<div style="color:var(--text-muted); padding:1rem; text-align:center;">No recent orders recorded yet.</div>`;
    } else {
      recentContainer.innerHTML = stats.recentOrders.map(o => `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:0.75rem 0; border-bottom:1px solid rgba(255,255,255,0.05); font-size:0.85rem;">
          <div>
            <div style="font-weight:700; color:#fff;">${o.id}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${o.customer?.name || 'Customer'} • ${(o.items || []).length} items</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:800; color:var(--admin-gold);">₹${(o.pricing?.total || 0).toLocaleString('en-IN')}</div>
            <span class="status-pill ${(o.orderStatus || 'confirmed').toLowerCase()}" style="font-size:0.68rem; padding:2px 6px;">${o.orderStatus || 'Confirmed'}</span>
          </div>
        </div>
      `).join('');
    }
  }
}

// ==========================================================================
// Products Table & CRUD Operations
// ==========================================================================
function renderProductsTable() {
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;

  let list = [...AdminState.products];

  if (AdminState.activeProductFilter !== 'all') {
    list = list.filter(p => p.category === AdminState.activeProductFilter);
  }

  if (AdminState.productSearchQuery) {
    list = list.filter(p => 
      (p.name && p.name.toLowerCase().includes(AdminState.productSearchQuery)) ||
      (p.id && p.id.toLowerCase().includes(AdminState.productSearchQuery))
    );
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">No crackers found matching your criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(p => {
    const isOutOfStock = (p.stock || 0) <= 0;
    const catObj = AdminState.categories.find(c => c.slug === p.category);
    const catName = catObj ? catObj.name : p.category;

    return `
      <tr>
        <td>
          <div class="table-product-cell">
            <img src="${p.image}" alt="${p.name}" class="table-img" onerror="this.src='./images/royal-symphony-120-shots.png'">
            <div>
              <div style="font-weight:700; color:#fff;">${p.name}</div>
              <div style="font-size:0.72rem; color:var(--text-muted); font-family:monospace;">${p.id}</div>
            </div>
          </div>
        </td>
        <td><span style="font-size:0.8rem; background:rgba(255,255,255,0.06); padding:3px 8px; border-radius:4px;">${catName}</span></td>
        <td style="font-weight:800; color:var(--admin-gold);">₹${Number(p.price || 0).toLocaleString('en-IN')}</td>
        <td>
          <span class="status-pill ${isOutOfStock ? 'out-of-stock' : 'in-stock'}">
            ${isOutOfStock ? 'Out of Stock' : `${p.stock} units`}
          </span>
        </td>
        <td>
          <span style="font-size:0.75rem; color:${p.ecoFriendly ? '#34d399' : '#f87171'};">
            ${p.ecoFriendly ? '🌱 Eco Green' : '💥 Standard'}
          </span>
        </td>
        <td>
          <button 
            style="font-size:0.72rem; padding:4px 9px; border-radius:4px; background:${isOutOfStock ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}; color:${isOutOfStock ? '#34d399' : '#f87171'}; border:1px solid ${isOutOfStock ? '#10b981' : '#ef4444'}; cursor:pointer;"
            onclick="quickToggleStock('${p.id}')"
          >
            ${isOutOfStock ? 'Mark In Stock' : 'Mark Out of Stock'}
          </button>
        </td>
        <td>
          <div class="table-actions">
            <button class="btn-table-action" onclick="openEditProductModal('${p.id}')" title="Edit Cracker">✏️</button>
            <button class="btn-table-action delete" onclick="confirmDeleteProduct('${p.id}')" title="Delete Cracker">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

window.filterAdminProducts = function(category) {
  AdminState.activeProductFilter = category;
  document.querySelectorAll('.btn-prod-filter').forEach(b => b.classList.toggle('active', b.dataset.cat === category));
  renderProductsTable();
};

window.quickToggleStock = async function(id) {
  try {
    const res = await authFetch(`${API_BASE}/api/products/${id}/stock`, { method: 'PATCH' });
    const data = await safeJson(res);
    if (data.success) {
      showAdminToast(data.message || 'Stock updated', 'success');
      await loadDashboardData();
    } else {
      showAdminToast(data.message || 'Stock update failed', 'error');
    }
  } catch (err) {
    showAdminToast('Stock toggle failed: ' + err.message, 'error');
  }
};

window.openAddProductModal = function() {
  AdminState.editingProductId = null;
  document.getElementById('productModalTitle').textContent = "Add New Cracker to Krishn's Inventory";
  document.getElementById('productForm').reset();
  document.getElementById('prodIdField').value = '';
  document.getElementById('prodImgPreview').src = './images/royal-symphony-120-shots.png';
  document.getElementById('productModalOverlay').classList.add('active');
};

window.openEditProductModal = function(id) {
  const product = AdminState.products.find(p => p.id === id);
  if (!product) return;

  AdminState.editingProductId = id;
  document.getElementById('productModalTitle').textContent = `Edit Cracker: ${product.name}`;
  document.getElementById('prodIdField').value = product.id;
  document.getElementById('prodNameField').value = product.name;
  document.getElementById('prodCategoryField').value = product.category;
  document.getElementById('prodPriceField').value = product.price;
  document.getElementById('prodOriginalPriceField').value = product.originalPrice || (product.price * 2);
  document.getElementById('prodStockField').value = product.stock;
  document.getElementById('prodSoundLevelField').value = product.soundLevel || 'Medium Sound';
  document.getElementById('prodPackSizeField').value = product.packSize || '1 Standard Pack';
  document.getElementById('prodEcoField').checked = !!product.ecoFriendly;
  document.getElementById('prodFeaturedField').checked = !!product.featured;
  document.getElementById('prodImageInput').value = product.image;
  document.getElementById('prodImgPreview').src = product.image;
  document.getElementById('prodDescField').value = product.description || '';
  document.getElementById('prodSafetyField').value = product.safetyInstructions || '';

  document.getElementById('productModalOverlay').classList.add('active');
};

window.handleSaveProduct = async function(e) {
  e.preventDefault();

  const id = document.getElementById('prodIdField').value.trim();
  const name = document.getElementById('prodNameField').value.trim();
  const category = document.getElementById('prodCategoryField').value;
  const price = parseFloat(document.getElementById('prodPriceField').value) || 0;
  const originalPrice = parseFloat(document.getElementById('prodOriginalPriceField').value) || (price * 2);
  const stock = parseInt(document.getElementById('prodStockField').value, 10) || 0;
  const soundLevel = document.getElementById('prodSoundLevelField').value;
  const packSize = document.getElementById('prodPackSizeField').value.trim() || '1 Standard Pack';
  const ecoFriendly = document.getElementById('prodEcoField').checked;
  const featured = document.getElementById('prodFeaturedField').checked;
  const image = document.getElementById('prodImageInput').value.trim() || './images/royal-symphony-120-shots.png';
  const description = document.getElementById('prodDescField').value.trim();
  const safetyInstructions = document.getElementById('prodSafetyField').value.trim();

  const payload = {
    id: id || undefined,
    name,
    category,
    price,
    originalPrice,
    stock,
    soundLevel,
    packSize,
    ecoFriendly,
    featured,
    image,
    description,
    safetyInstructions
  };

  try {
    const isEdit = !!AdminState.editingProductId;
    const url = isEdit ? `${API_BASE}/api/products/${AdminState.editingProductId}` : `${API_BASE}/api/products`;
    const method = isEdit ? 'PUT' : 'POST';

    const res = await authFetch(url, {
      method,
      body: JSON.stringify(payload)
    });
    const data = await safeJson(res);

    if (data.success) {
      document.getElementById('productModalOverlay').classList.remove('active');
      showAdminToast(`Product "${name}" saved successfully!`, 'success');
      await loadDashboardData();
    } else {
      showAdminToast(data.message || 'Save failed', 'error');
    }
  } catch (err) {
    showAdminToast('Error saving product: ' + err.message, 'error');
  }
};

window.confirmDeleteProduct = async function(id) {
  const product = AdminState.products.find(p => p.id === id);
  if (!product) return;

  if (confirm(`Are you sure you want to permanently delete "${product.name}"?`)) {
    try {
      const res = await authFetch(`${API_BASE}/api/products/${id}`, { method: 'DELETE' });
      const data = await safeJson(res);
      if (data.success) {
        showAdminToast(`Cracker "${product.name}" deleted successfully.`, 'info');
        await loadDashboardData();
      } else {
        showAdminToast(data.message || 'Delete failed', 'error');
      }
    } catch (err) {
      showAdminToast('Error deleting product: ' + err.message, 'error');
    }
  }
};

function formatDateTime(isoString) {
  const d = isoString ? new Date(isoString) : new Date();
  const timeStr = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return { timeStr, dateStr, full: `${dateStr} at ${timeStr}` };
}

// ==========================================================================
// Order Management
// ==========================================================================
function renderOrdersTable() {
  const tbody = document.getElementById('ordersTableBody');
  if (!tbody) return;

  let list = [...AdminState.orders];

  if (AdminState.activeOrderFilter !== 'all') {
    list = list.filter(o => o.orderStatus && o.orderStatus.toLowerCase() === AdminState.activeOrderFilter.toLowerCase());
  }

  if (AdminState.orderSearchQuery) {
    list = list.filter(o => 
      (o.id && o.id.toLowerCase().includes(AdminState.orderSearchQuery)) ||
      (o.customer?.name && o.customer.name.toLowerCase().includes(AdminState.orderSearchQuery)) ||
      (o.customer?.phone && o.customer.phone.includes(AdminState.orderSearchQuery))
    );
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">No orders found matching this filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(o => {
    const isPaid = o.payment && (o.payment.status === 'Paid' || o.payment.status === 'Captured');
    const { timeStr, dateStr } = formatDateTime(o.createdAt);
    return `
      <tr>
        <td>
          <code style="font-weight:800; color:#fff; font-size:0.92rem;">${o.id}</code>
          <div style="margin-top:4px;">
            <span class="order-time-badge">🕒 ${timeStr}</span>
          </div>
          <div style="font-size:0.73rem; color:#94a3b8; margin-top:3px;">${dateStr}</div>
        </td>
        <td>
          <div style="font-weight:700; color:#fff;">${o.customer?.name || 'Customer'}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${o.customer?.phone || ''}</div>
          <div style="font-size:0.72rem; color:var(--text-sub);">${o.customer?.city || ''}, ${o.customer?.pincode || ''}</div>
        </td>
        <td style="font-size:0.82rem;">
          <b>${(o.items || []).length} Fireworks</b><br>
          <span style="font-size:0.75rem; color:var(--text-muted);">${(o.items || []).map(i => i.name).slice(0, 2).join(', ')}${(o.items || []).length > 2 ? '...' : ''}</span>
        </td>
        <td style="font-weight:800; color:var(--admin-gold);">₹${Number(o.pricing?.total || 0).toLocaleString('en-IN')}</td>
        <td>
          <div style="font-size:0.78rem; font-weight:700; color:${isPaid ? '#34d399' : '#f59e0b'};">
            ${isPaid ? '● Paid' : '○ Pending'}
          </div>
          <div style="font-size:0.7rem; color:var(--text-muted);">${o.payment?.method || 'Razorpay Test'}</div>
        </td>
        <td>
          <select 
            class="status-select-badge ${String(o.orderStatus || 'Confirmed').toLowerCase()}" 
            onchange="updateOrderStatus('${o.id}', this.value)"
          >
            <option value="Confirmed" ${o.orderStatus === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="Processing" ${o.orderStatus === 'Processing' ? 'selected' : ''}>Processing</option>
            <option value="Shipped" ${o.orderStatus === 'Shipped' ? 'selected' : ''}>Shipped</option>
            <option value="Delivered" ${o.orderStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
            <option value="Cancelled" ${o.orderStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
        <td>
          <button class="btn-table-action" onclick="viewOrderDetails('${o.id}')" title="View Full Invoice & Customer Details">
            👁️ Slip
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.filterAdminOrders = function(status) {
  AdminState.activeOrderFilter = status;
  document.querySelectorAll('.btn-order-filter').forEach(b => b.classList.toggle('active', b.dataset.status === status));
  renderOrdersTable();
};

window.updateOrderStatus = async function(id, status) {
  try {
    const res = await authFetch(`${API_BASE}/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    const data = await safeJson(res);
    if (data.success) {
      showAdminToast(`Order ${id} status updated to ${status}`, 'success');
      await loadDashboardData();
    } else {
      showAdminToast(data.message || 'Status update failed', 'error');
    }
  } catch (err) {
    showAdminToast('Error updating status: ' + err.message, 'error');
  }
};

window.viewOrderDetails = function(orderId) {
  const order = AdminState.orders.find(o => o.id === orderId);
  if (!order) return;

  const content = document.getElementById('orderDetailModalContent');
  if (!content) return;

  const itemsHtml = (order.items || []).map(item => `
    <div class="order-detail-row">
      <div style="display:flex; align-items:center; gap:0.75rem;">
        <img src="${item.image}" style="width:40px; height:40px; border-radius:4px; object-fit:cover;" onerror="this.src='./images/royal-symphony-120-shots.png'">
        <div>
          <div style="font-weight:700; color:#fff;">${item.name}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">₹${item.price} × ${item.quantity} units</div>
        </div>
      </div>
      <div style="font-weight:800; color:var(--admin-gold);">₹${Number(item.total || (item.price * item.quantity)).toLocaleString('en-IN')}</div>
    </div>
  `).join('');

  const { timeStr, dateStr } = formatDateTime(order.createdAt);

  content.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; padding-bottom:0.75rem; border-bottom:1px solid var(--admin-border);">
      <div>
        <h3 style="color:#fff; font-size:1.15rem; font-weight:800;">${order.id}</h3>
        <p style="font-size:0.8rem; color:#fbbf24; font-weight:700; margin-top:3px;">
          🕒 Placed on ${dateStr} at ${timeStr}
        </p>
      </div>
      <span class="status-pill ${String(order.orderStatus || 'Confirmed').toLowerCase()}">${order.orderStatus || 'Confirmed'}</span>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem; background:rgba(255,255,255,0.02); padding:1rem; border-radius:var(--radius-sm); border:1px solid var(--admin-border);">
      <div>
        <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">CUSTOMER INFO:</div>
        <div style="color:#fff; font-weight:700; margin-top:2px;">${order.customer?.name || 'N/A'}</div>
        <div style="font-size:0.82rem; color:var(--text-sub);">${order.customer?.phone || 'N/A'}</div>
        <div style="font-size:0.82rem; color:var(--text-sub);">${order.customer?.email || 'N/A'}</div>
      </div>
      <div>
        <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">DELIVERY ADDRESS:</div>
        <div style="font-size:0.82rem; color:var(--text-sub); margin-top:2px;">
          ${order.customer?.address || ''},<br>
          ${order.customer?.city || ''}, ${order.customer?.state || 'India'} - <b>${order.customer?.pincode || ''}</b>
        </div>
      </div>
    </div>

    <div style="margin-bottom:1rem;">
      <div style="font-size:0.8rem; font-weight:700; color:var(--text-sub); margin-bottom:0.5rem;">ORDERED FIREWORKS:</div>
      <div class="order-detail-items">
        ${itemsHtml}
      </div>
    </div>

    <div style="background:rgba(255,255,255,0.03); border:1px solid var(--admin-border); border-radius:var(--radius-sm); padding:1rem;">
      <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:4px; color:var(--text-sub);">
        <span>Subtotal:</span>
        <span>₹${Number(order.pricing?.subtotal || 0).toLocaleString('en-IN')}</span>
      </div>
      ${(order.pricing?.discount || 0) > 0 ? `
        <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:4px; color:#34d399;">
          <span>Coupon Discount:</span>
          <span>-₹${Number(order.pricing.discount).toLocaleString('en-IN')}</span>
        </div>
      ` : ''}
      <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:4px; color:var(--text-sub);">
        <span>Delivery Fee:</span>
        <span>${order.pricing?.shipping === 0 ? 'FREE' : '₹' + (order.pricing?.shipping || 0)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:1.1rem; font-weight:800; color:#fff; border-top:1px dashed var(--admin-border); padding-top:6px; margin-top:6px;">
        <span>Total Paid:</span>
        <span style="color:var(--admin-gold);">₹${Number(order.pricing?.total || 0).toLocaleString('en-IN')}</span>
      </div>
    </div>

    <div style="margin-top:1rem; font-size:0.78rem; color:var(--text-muted);">
      <div><b>Payment Method:</b> ${order.payment?.method || 'Razorpay Test'} (${order.payment?.status || 'Paid'})</div>
      <div><b>Transaction ID:</b> <code>${order.payment?.transactionId || 'N/A'}</code></div>
      <div><b>Tracking No:</b> <code>${order.trackingNumber || 'INDPOST-771289'}</code></div>
    </div>
  `;

  document.getElementById('orderDetailModalOverlay').classList.add('active');
};

// ==========================================================================
// Categories Table & Settings
// ==========================================================================
function renderCategoriesTable() {
  const tbody = document.getElementById('categoriesTableBody');
  if (!tbody) return;

  tbody.innerHTML = AdminState.categories.map(c => {
    const count = AdminState.products.filter(p => p.category === c.slug).length;
    return `
      <tr>
        <td style="font-size:1.5rem;">${c.icon || '🚀'}</td>
        <td style="font-weight:700; color:#fff;">${c.name}</td>
        <td><code>${c.slug}</code></td>
        <td><span class="status-pill in-stock">${count} Varieties</span></td>
        <td style="font-size:0.82rem; color:var(--text-sub);">${c.description || ''}</td>
      </tr>
    `;
  }).join('');
}

function populateCategorySelect() {
  const sel = document.getElementById('prodCategoryField');
  if (!sel) return;
  sel.innerHTML = AdminState.categories.map(c => `<option value="${c.slug}">${c.name}</option>`).join('');
}

// Store Settings Form Populator & Handler
function populateSettingsForm(settings) {
  if (!settings) return;
  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  };
  setEl('setStoreName', settings.storeName || "Krishn's Crackers");
  setEl('setTagline', settings.tagline || 'Celebrate Every Moment!');
  setEl('setContactPhone', settings.contactPhone || '+91 98400 12345');
  setEl('setContactEmail', settings.contactEmail || 'support@krishnscrackers.com');
  setEl('setFreeShipping', settings.freeShippingThreshold !== undefined ? settings.freeShippingThreshold : 999);
  setEl('setRazorpayKey', settings.razorpayKey || 'rzp_test_1DP5mmOlF5G5ag');
}

window.handleSaveSettings = async function(e) {
  e.preventDefault();
  const getVal = (id) => document.getElementById(id)?.value?.trim();

  const payload = {
    storeName: getVal('setStoreName'),
    tagline: getVal('setTagline'),
    contactPhone: getVal('setContactPhone'),
    contactEmail: getVal('setContactEmail'),
    freeShippingThreshold: Number(getVal('setFreeShipping')) || 999,
    razorpayKey: getVal('setRazorpayKey')
  };

  try {
    const res = await authFetch(`${API_BASE}/api/settings`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    const data = await safeJson(res);
    if (data.success) {
      showAdminToast('Store & payment settings saved to MongoDB successfully!', 'success');
      AdminState.settings = data.data;
    } else {
      showAdminToast(data.message || 'Failed to save settings', 'error');
    }
  } catch (err) {
    showAdminToast('Error saving settings: ' + err.message, 'error');
  }
};

window.handleResetDatabase = async function() {
  if (confirm("Restore Krishn's Crackers factory default inventory? All custom changes will be reset to defaults in MongoDB.")) {
    try {
      const res = await authFetch(`${API_BASE}/api/admin/reset`, { method: 'POST' });
      const data = await safeJson(res);
      if (data.success) {
        showAdminToast(data.message || 'Database reset successfully', 'success');
        await loadDashboardData();
      } else {
        showAdminToast(data.message || 'Reset failed', 'error');
      }
    } catch (err) {
      showAdminToast('Reset error: ' + err.message, 'error');
    }
  }
};

function showAdminToast(message, type = 'info') {
  let container = document.getElementById('adminToastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'adminToastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : type === 'error' ? '⚠️' : '⚡'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 50);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 3500);
}
