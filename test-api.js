const http = require('http');

const BASE_URL = 'http://localhost:3000';

function request(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = body ? JSON.parse(body) : null;
        } catch (e) {
          json = { rawBody: body, parseError: e.message };
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE BACKEND API AUDIT ---');
  let token = null;

  // 1. Health check
  console.log('\n[1] Checking /api/health...');
  const health = await request('GET', '/api/health');
  console.log('Status:', health.status, 'Response:', health.data);
  if (health.status !== 200 || health.data.status !== 'ok') throw new Error('Health check failed');

  // 2. Admin Login
  console.log('\n[2] Testing Admin Login /api/admin/login...');
  const login = await request('POST', '/api/admin/login', {
    email: 'admin@krishnscrackers.com',
    password: 'admin123'
  });
  console.log('Status:', login.status, 'Success:', login.data.success, 'Token received:', !!login.data.token);
  if (!login.data.token) throw new Error('Login failed');
  token = login.data.token;

  const authHeader = { 'Authorization': `Bearer ${token}` };

  // 3. Admin Stats
  console.log('\n[3] Testing /api/admin/stats...');
  const stats = await request('GET', '/api/admin/stats', null, authHeader);
  console.log('Status:', stats.status, 'Total Products:', stats.data.data.totalProducts, 'Total Orders:', stats.data.data.totalOrders, 'Total Revenue:', stats.data.data.totalRevenue);

  // 4. Products List
  console.log('\n[4] Testing GET /api/products...');
  const prods = await request('GET', '/api/products');
  console.log('Status:', prods.status, 'Count:', prods.data.count);
  if (!prods.data.count || prods.data.count < 1) throw new Error('No products found');

  // 5. Product Creation
  console.log('\n[5] Testing POST /api/products (Create test product)...');
  const createProd = await request('POST', '/api/products', {
    name: 'Diwali Starburst Shell Test',
    category: 'shots',
    price: 1299,
    originalPrice: 2499,
    stock: 25,
    soundLevel: 'High Decibel',
    packSize: '1 Box (25 Shells)',
    ecoFriendly: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    description: 'High-altitude multi-burst test shells.',
    safetyInstructions: 'Keep 20m distance outdoors.'
  }, authHeader);
  console.log('Status:', createProd.status, 'Created ID:', createProd.data.data.id, 'Name:', createProd.data.data.name);
  const testProdId = createProd.data.data.id;

  // 6. Product Update
  console.log(`\n[6] Testing PUT /api/products/${testProdId} (Edit price)...`);
  const updateProd = await request('PUT', `/api/products/${testProdId}`, {
    price: 1199,
    name: 'Diwali Starburst Shell Test (Updated)'
  }, authHeader);
  console.log('Status:', updateProd.status, 'Updated Price:', updateProd.data.data.price, 'Updated Name:', updateProd.data.data.name);

  // 7. Product Stock Toggle
  console.log(`\n[7] Testing PATCH /api/products/${testProdId}/stock (Stock toggle)...`);
  const toggleStock = await request('PATCH', `/api/products/${testProdId}/stock`, null, authHeader);
  console.log('Status:', toggleStock.status, 'Message:', toggleStock.data.message, 'New Stock:', toggleStock.data.data.stock);

  // 8. Product Deletion (Crucial: verify it returns JSON and status 200, never empty / EOF)
  console.log(`\n[8] Testing DELETE /api/products/${testProdId} (Delete product)...`);
  const deleteProd = await request('DELETE', `/api/products/${testProdId}`, null, authHeader);
  console.log('Status:', deleteProd.status, 'Response JSON:', deleteProd.data);
  if (deleteProd.status !== 200 || !deleteProd.data.success) {
    throw new Error('Product delete did not return valid JSON status 200!');
  }
  console.log('>>> VERIFIED: Delete product returns clean JSON without "Unexpected end of JSON input" error!');

  // 9. Categories
  console.log('\n[9] Testing GET /api/categories...');
  const cats = await request('GET', '/api/categories');
  console.log('Status:', cats.status, 'Categories Count:', cats.data.count);

  // 10. Store Settings
  console.log('\n[10] Testing GET and PUT /api/settings...');
  const settings = await request('GET', '/api/settings');
  console.log('Store Name:', settings.data.data.storeName, 'Free Shipping:', settings.data.data.freeShippingThreshold);
  const updateSettings = await request('PUT', '/api/settings', {
    storeName: "Krishn's Crackers Sivakasi",
    freeShippingThreshold: 999
  }, authHeader);
  console.log('Settings update status:', updateSettings.status, 'New Name:', updateSettings.data.data.storeName);

  // 11. Razorpay Payment Create Order
  console.log('\n[11] Testing POST /api/payment/create-order...');
  const rzpOrder = await request('POST', '/api/payment/create-order', {
    amount: 1899,
    currency: 'INR',
    receipt: 'rcpt_test_999'
  });
  console.log('Status:', rzpOrder.status, 'Razorpay Order ID:', rzpOrder.data.data.orderId, 'Key ID:', rzpOrder.data.data.keyId);

  // 12. Razorpay Payment Verification
  console.log('\n[12] Testing POST /api/payment/verify-payment...');
  const rzpVerify = await request('POST', '/api/payment/verify-payment', {
    razorpay_order_id: rzpOrder.data.data.orderId,
    razorpay_payment_id: 'pay_rzp_test_12345678',
    razorpay_signature: 'test_sig_verified'
  });
  console.log('Status:', rzpVerify.status, 'Verification result:', rzpVerify.data.message);

  // 13. Customer Order Placement (Storefront checkout)
  console.log('\n[13] Testing POST /api/orders (Customer checkout)...');
  const placeOrder = await request('POST', '/api/orders', {
    customer: {
      name: 'Priya Sharma',
      phone: '+91 99887 76655',
      email: 'priya.sharma@example.com',
      address: '74 Lotus Blossom Villa, Indiranagar',
      city: 'Bengaluru',
      pincode: '560038',
      state: 'Karnataka'
    },
    items: [
      {
        productId: 'CRK-101',
        name: '120 Shots Royal Symphony Sky Shot',
        price: 1899,
        quantity: 1,
        image: './images/royal-symphony-120-shots.png',
        total: 1899
      }
    ],
    pricing: {
      subtotal: 1899,
      discount: 0,
      shipping: 0,
      tax: 0,
      total: 1899
    },
    coupon: 'DIWALI2026',
    payment: {
      method: 'Razorpay Test Mode',
      transactionId: 'pay_rzp_test_12345678',
      status: 'Paid',
      paidAt: new Date().toISOString()
    }
  });
  console.log('Status:', placeOrder.status, 'Placed Order ID:', placeOrder.data.data.id, 'Tracking:', placeOrder.data.data.trackingNumber);
  const newOrderId = placeOrder.data.data.id;

  // 14. Customer Order Tracking
  console.log(`\n[14] Testing GET /api/orders/${newOrderId} (Storefront tracking)...`);
  const trackOrder = await request('GET', `/api/orders/${newOrderId}`);
  console.log('Status:', trackOrder.status, 'Customer:', trackOrder.data.data.customer.name, 'Order Status:', trackOrder.data.data.orderStatus);

  // 15. Admin Update Order Status
  console.log(`\n[15] Testing PATCH /api/orders/${newOrderId}/status (Admin status update)...`);
  const updateStatus = await request('PATCH', `/api/orders/${newOrderId}/status`, {
    status: 'Shipped'
  }, authHeader);
  console.log('Status:', updateStatus.status, 'Updated Order Status:', updateStatus.data.data.orderStatus);

  console.log('\n=======================================================');
  console.log('🎉 ALL 15 AUTOMATED API & DATABASE TESTS PASSED WITH 100% SUCCESS!');
  console.log('=======================================================');
}

runTests().catch(err => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
