const express = require('express');
const router = express.Router();
const dataStore = require('../data/dataStore');
const authMiddleware = require('../middleware/auth');

// GET all products with optional category and search query
router.get('/', async (req, res) => {
  try {
    let products = await dataStore.getProducts();
    const { category, search, sort } = req.query;

    if (category && category !== 'all') {
      products = products.filter(p => p.category === category);
    }

    if (search) {
      const q = search.toLowerCase().trim();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.soundLevel && p.soundLevel.toLowerCase().includes(q))
      );
    }

    if (sort === 'price-low') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching products', error: err.message });
  }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await dataStore.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// POST create product (Protected Admin)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, category, price, originalPrice, stock, image } = req.body;
    if (!name || !category || price === undefined || !image) {
      return res.status(400).json({ success: false, message: 'Name, category, price, and image are required.' });
    }

    const priceNum = Number(price);
    const origPriceNum = Number(originalPrice) || (priceNum * 2);
    if (priceNum < 0) {
      return res.status(400).json({ success: false, message: 'Price cannot be negative.' });
    }

    let discount = '50% OFF';
    if (origPriceNum > priceNum) {
      discount = `${Math.round(((origPriceNum - priceNum) / origPriceNum) * 100)}% OFF`;
    }

    const newProduct = {
      id: req.body.id || ('CRK-' + Math.floor(100 + Math.random() * 900)),
      name: name.trim(),
      category: category.trim(),
      price: priceNum,
      originalPrice: origPriceNum,
      discount,
      stock: parseInt(stock, 10) || 50,
      soundLevel: req.body.soundLevel || 'Medium Sound',
      packSize: req.body.packSize || '1 Standard Pack',
      ecoFriendly: !!req.body.ecoFriendly,
      featured: !!req.body.featured,
      bestseller: !!req.body.bestseller,
      image: image.trim(),
      rating: Number(req.body.rating) || 4.9,
      reviewsCount: Number(req.body.reviewsCount) || 120,
      description: req.body.description || '',
      safetyInstructions: req.body.safetyInstructions || ''
    };

    const saved = await dataStore.createProduct(newProduct);
    res.status(201).json({ success: true, message: 'Product created successfully', data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating product', error: err.message });
  }
});

// PUT update product (Protected Admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await dataStore.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found to update' });
    }
    res.json({ success: true, message: 'Product updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating product', error: err.message });
  }
});

// PATCH quick toggle stock (Protected Admin)
router.patch('/:id/stock', authMiddleware, async (req, res) => {
  try {
    const product = await dataStore.getProductById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const newStock = product.stock > 0 ? 0 : 50;
    const updated = await dataStore.updateProduct(req.params.id, { stock: newStock });
    res.json({ success: true, message: `Stock set to ${newStock}`, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error toggling stock', error: err.message });
  }
});

// DELETE product (Protected Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await dataStore.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting product', error: err.message });
  }
});

module.exports = router;
