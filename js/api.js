/**
 * Krishn's Crackers — Backend API Bridge
 * Connects the customer storefront and admin panel to the Node.js/Express backend.
 * Automatically falls back to the browser IndexedDB if the server is offline.
 */

const API_BASE = window.location.origin;

// ─── Helper: Fetch with timeout ───────────────────────────────────────────────
async function apiFetch(path, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ─── Server Health Check ──────────────────────────────────────────────────────
let _serverOnline = null;
async function isServerOnline() {
  if (_serverOnline !== null) return _serverOnline;
  try {
    const res = await apiFetch('/api/products', {}, 3000);
    _serverOnline = res.ok;
  } catch {
    _serverOnline = false;
  }
  // Re-check every 30 seconds
  setTimeout(() => { _serverOnline = null; }, 30000);
  return _serverOnline;
}

// ─── Products ─────────────────────────────────────────────────────────────────
async function getProductsFromServer() {
  const res = await apiFetch('/api/products');
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

async function getProductByIdFromServer(id) {
  const res = await apiFetch(`/api/products/${id}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

// ─── Categories ───────────────────────────────────────────────────────────────
async function getCategoriesFromServer() {
  const res = await apiFetch('/api/categories');
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

// ─── Orders ───────────────────────────────────────────────────────────────────
async function createOrderOnServer(orderPayload) {
  const res = await apiFetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderPayload)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

async function getOrderByIdFromServer(orderId) {
  const res = await apiFetch(`/api/orders/${encodeURIComponent(orderId)}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

// ─── Settings ─────────────────────────────────────────────────────────────────
async function getSettingsFromServer() {
  // Settings live in admin API, fall back to IndexedDB
  if (window.crackerDB) return window.crackerDB.getSettings();
  return {};
}

// ─── Coupons ──────────────────────────────────────────────────────────────────
async function getCouponFromServer(code) {
  // Coupons are validated in IndexedDB (client-side only for now)
  if (window.crackerDB) return window.crackerDB.getCoupon(code);
  return null;
}

/**
 * crackerAPI — Unified data access layer for the storefront.
 * Tries the backend REST API first; falls back to window.crackerDB (IndexedDB).
 */
window.crackerAPI = {

  async getProducts() {
    try {
      const online = await isServerOnline();
      if (online) return await getProductsFromServer();
    } catch (e) {
      console.warn('[API] Products fallback to IndexedDB:', e.message);
    }
    if (window.crackerDB) return window.crackerDB.getProducts();
    return [];
  },

  async getProductById(id) {
    try {
      const online = await isServerOnline();
      if (online) return await getProductByIdFromServer(id);
    } catch (e) {
      console.warn('[API] Product by ID fallback to IndexedDB:', e.message);
    }
    if (window.crackerDB) return window.crackerDB.getProductById(id);
    return null;
  },

  async getCategories() {
    try {
      const online = await isServerOnline();
      if (online) return await getCategoriesFromServer();
    } catch (e) {
      console.warn('[API] Categories fallback to IndexedDB:', e.message);
    }
    if (window.crackerDB) return window.crackerDB.getCategories();
    return [];
  },

  async getSettings() {
    return getSettingsFromServer();
  },

  async getCoupon(code) {
    return getCouponFromServer(code);
  },

  async createOrder(orderPayload) {
    try {
      const online = await isServerOnline();
      if (online) {
        const order = await createOrderOnServer(orderPayload);
        // Also save to local IndexedDB for offline tracking
        if (window.crackerDB) {
          try { await window.crackerDB.createOrder(order); } catch (_) {}
        }
        return order;
      }
    } catch (e) {
      console.warn('[API] Order fallback to IndexedDB:', e.message);
    }
    if (window.crackerDB) return window.crackerDB.createOrder(orderPayload);
    throw new Error('Could not create order — server and local DB both unavailable.');
  },

  async getOrderById(id) {
    try {
      const online = await isServerOnline();
      if (online) return await getOrderByIdFromServer(id);
    } catch (e) {
      console.warn('[API] Order tracking fallback to IndexedDB:', e.message);
    }
    if (window.crackerDB) return window.crackerDB.getOrderById(id);
    return null;
  },

  subscribe(callback) {
    // Delegate real-time cross-tab sync to IndexedDB layer
    if (window.crackerDB) return window.crackerDB.subscribe(callback);
    return () => {};
  }
};
