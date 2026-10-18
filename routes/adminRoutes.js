const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const dataStore = require('../data/dataStore');
const authMiddleware = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'krishns_crackers_super_secure_jwt_secret_key_2026_festive';

// POST /api/admin/login (Secure Authentication)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const isValid = await dataStore.verifyAdminPassword(email, password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please verify your email and password.' });
    }

    // Generate signed JWT session token (valid for 8 hours)
    const token = jwt.sign(
      {
        email: email.trim().toLowerCase(),
        role: 'admin',
        store: "Krishn's Crackers"
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      message: 'Authentication successful',
      token,
      admin: {
        email: email.trim().toLowerCase(),
        name: "Krishn Admin",
        role: 'admin'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login server error', error: err.message });
  }
});

// GET /api/admin/stats (Protected Admin Dashboard Metrics)
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const orders = await dataStore.getOrders();
    const products = await dataStore.getProducts();
    const categories = await dataStore.getCategories();

    const totalRevenue = orders.reduce((sum, o) => {
      return sum + (o.payment?.status === 'Paid' ? (o.pricing?.total || 0) : 0);
    }, 0);

    const pendingOrders = orders.filter(o => o.orderStatus === 'Confirmed' || o.orderStatus === 'Processing').length;

    // Category distribution breakdown
    const categoryDistribution = categories.map(cat => {
      const count = products.filter(p => p.category === cat.slug).length;
      return {
        slug: cat.slug,
        name: cat.name,
        icon: cat.icon,
        count
      };
    });

    res.json({
      success: true,
      data: {
        totalRevenue: Math.round(totalRevenue),
        totalOrders: orders.length,
        totalProducts: products.length,
        pendingOrders,
        categoryDistribution,
        recentOrders: orders.slice(0, 5)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error compiling stats', error: err.message });
  }
});

// POST /api/admin/reset (Protected Factory Reset)
router.post('/reset', authMiddleware, async (req, res) => {
  try {
    await dataStore.resetDatabase();
    res.json({ success: true, message: "Database reset to Krishn's Crackers default inventory." });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error resetting database', error: err.message });
  }
});

module.exports = router;
