const express = require('express');
const router = express.Router();
const dataStore = require('../data/dataStore');
const authMiddleware = require('../middleware/auth');

// GET all orders (Protected Admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await dataStore.getOrders();
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching orders', error: err.message });
  }
});

// GET order by ID (Public for Tracking)
router.get('/:id', async (req, res) => {
  try {
    const order = await dataStore.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: `No order found with ID ${req.params.id}` });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error tracking order', error: err.message });
  }
});

// POST create order (Public Checkout with Stock Validation)
router.post('/', async (req, res) => {
  try {
    const { customer, items, pricing, payment, coupon, notes } = req.body;

    if (!customer || !customer.name || !customer.phone || !customer.address) {
      return res.status(400).json({ success: false, message: 'Customer name, phone, and delivery address are required.' });
    }

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
    }

    // Validate product stock
    for (const item of items) {
      const product = await dataStore.getProductById(item.productId);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product "${item.name}" not found.` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}` 
        });
      }
    }

    const orderPayload = {
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: (customer.email || '').trim(),
        address: customer.address.trim(),
        city: (customer.city || 'Bengaluru').trim(),
        pincode: (customer.pincode || '560001').trim(),
        state: (customer.state || 'Karnataka').trim()
      },
      items,
      pricing: pricing || {
        subtotal: items.reduce((s, i) => s + (i.price * i.quantity), 0),
        discount: 0,
        shipping: 0,
        tax: 0,
        total: items.reduce((s, i) => s + (i.price * i.quantity), 0)
      },
      coupon: coupon || null,
      payment: payment || {
        method: 'Razorpay Test',
        transactionId: 'pay_rzp_' + Date.now(),
        status: 'Paid',
        paidAt: new Date().toISOString()
      },
      orderStatus: 'Confirmed',
      notes: notes || ''
    };

    const createdOrder = await dataStore.createOrder(orderPayload);
    res.status(201).json({ success: true, message: 'Order placed successfully', data: createdOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create order', error: err.message });
  }
});

// PATCH update order status (Protected Admin)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const updated = await dataStore.updateOrderStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, message: `Order status updated to ${status}`, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating order status', error: err.message });
  }
});

module.exports = router;
