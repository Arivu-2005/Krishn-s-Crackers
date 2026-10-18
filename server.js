require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krishns_crackers';
const JWT_SECRET = process.env.JWT_SECRET || 'krishns_crackers_super_secure_jwt_secret_key_2026_festive';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@krishnscrackers.com').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'krishns_rzp_secret_test_2026';

// ---------------------------------------------------------------
// MongoDB Mongoose Models
// ---------------------------------------------------------------
const opts = { id: false, versionKey: false, timestamps: true };

const productSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true, required: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, default: 0 },
  discount: { type: String, default: '50% OFF' },
  image: { type: String, required: true },
  rating: { type: Number, default: 4.8 },
  reviewsCount: { type: Number, default: 0 },
  stock: { type: Number, default: 50, min: 0 },
  soundLevel: { type: String, default: 'Medium Sound' },
  ecoFriendly: { type: Boolean, default: true },
  packSize: { type: String, default: '1 Standard Pack' },
  featured: { type: Boolean, default: false },
  bestseller: { type: Boolean, default: false },
  description: { type: String, default: '' },
  safetyInstructions: { type: String, default: '' }
}, opts);

const orderSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true, required: true },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    state: { type: String, default: 'Karnataka' }
  },
  items: [mongoose.Schema.Types.Mixed],
  pricing: {
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  coupon: { type: String, default: null },
  payment: {
    method: { type: String, default: 'Razorpay Test Mode' },
    transactionId: { type: String, default: '' },
    status: { type: String, default: 'Pending' },
    paidAt: { type: Date, default: Date.now },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' }
  },
  orderStatus: { type: String, default: 'Confirmed' },
  trackingNumber: { type: String, default: '' },
  notes: { type: String, default: '' }
}, opts);

const categorySchema = new mongoose.Schema({
  id: { type: String, default: '' },
  slug: { type: String, unique: true, index: true, required: true },
  name: { type: String, required: true },
  icon: { type: String, default: '🎆' },
  description: { type: String, default: '' }
}, opts);

const settingsSchema = new mongoose.Schema({
  key: { type: String, default: 'main', unique: true },
  storeName: { type: String, default: "Krishn's Crackers" },
  tagline: { type: String, default: 'Celebrate Every Moment!' },
  contactPhone: { type: String, default: '+91 98400 12345' },
  contactEmail: { type: String, default: 'support@krishnscrackers.com' },
  freeShippingThreshold: { type: Number, default: 999 },
  shippingFee: { type: Number, default: 99 },
  razorpayKey: { type: String, default: RAZORPAY_KEY_ID }
}, opts);

const paymentSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, default: 'Created' },
  method: { type: String, default: 'Razorpay Test' },
  razorpayOrderId: { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  razorpaySignature: { type: String, default: '' },
  verified: { type: Boolean, default: false },
  failureReason: { type: String, default: '' }
}, opts);

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, index: true, lowercase: true, required: true },
  password: { type: String, required: true },
  name: { type: String, default: 'Krishn Admin' },
  role: { type: String, default: 'admin' }
}, opts);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);

// ---------------------------------------------------------------
// Seed Data
// ---------------------------------------------------------------
const IMG = './images/';
const P = (id, name, category, price, originalPrice, image, rating, reviewsCount, stock, soundLevel, ecoFriendly, packSize, featured, description, safetyInstructions) => ({
  id, name, category, price, originalPrice,
  discount: Math.round((1 - price / originalPrice) * 100) + '% OFF',
  image, rating, reviewsCount, stock, soundLevel, ecoFriendly, packSize, featured, description, safetyInstructions
});
const U = (code) => `https://images.unsplash.com/${code}?auto=format&fit=crop&w=800&q=80`;

const SEED_PRODUCTS = [
  P('CRK-101', '120 Shots Royal Symphony Sky Shot', 'shots', 1899, 3799, IMG + 'royal-symphony-120-shots.png', 4.9, 312, 45, 'Medium Sound', true, '1 Box (120 Shots)', true,
    'Breathtaking 120 continuous aerial multi-color shots in red, emerald green, gold and silver with thunderous finale bursts.', 'Place on flat ground outdoors. Maintain a minimum distance of 15 meters.'),
  P('CRK-102', '50cm Golden Electric Sparklers', 'sparklers', 249, 499, IMG + '50cm-golden-electric-sparklers.png', 4.8, 420, 120, 'Zero Sound', true, '10 Pcs / Pack', true,
    'Long-lasting 50cm eco-friendly golden sparklers with low smoke, burning over 3 minutes each.', "Hold at arm's length. Immerse burnt wire in a water bucket immediately."),
  P('CRK-103', 'Special Tri-Colour Giant Anar (Flower Pots)', 'pots', 399, 799, IMG + 'special-tri-colour-anar.png', 4.9, 185, 65, 'Low Crackle', true, '5 Giant Pcs / Box', true,
    'Majestic fountain over 20 feet high, from saffron to white to emerald green with crackling gold pearls.', 'Keep on even ground outdoors. Light with agarbatti and step back 5 meters.'),
  P('CRK-104', 'Deluxe Special Whistling Ground Chakkars', 'chakkars', 299, 599, IMG + 'deluxe-whistling-chakkars.png', 4.7, 142, 80, 'Musical Whistle', true, '10 Pcs / Box', false,
    'High-speed spinning ground wheels with silver and red sparks and an exciting whistle.', 'Place flat on smooth ground. Do not touch while spinning.'),
  P('CRK-105', '1000 Wala Sivakasi Red Giant Garland', 'garlands', 699, 1399, IMG + '1000-wala-red-giant-garland.png', 4.8, 278, 50, 'High Decibel', false, '1 Roll (1000 Crackers)', true,
    'Authentic Sivakasi lari with 1,000 continuous red crackers ending in a grand twin atom blast.', 'Unroll completely in a wide open area. Light fuse from end and move 10 meters away.'),
  P('CRK-106', 'Maharaja Royal Family Mega Gift Hamper (45 Items)', 'combos', 2999, 6500, IMG + 'maharaja-royal-family-hamper.png', 5.0, 512, 30, 'Assorted VIP', true, '45 Premium Varieties Box', true,
    'The ultimate festival centerpiece with 45 varieties: sky shots, sparklers, anars, chakkars, rockets and more.', 'Store in a cool dry place away from children. Read individual item instructions.'),
  P('CRK-107', '30 Shots Golden Waterfall Palm Sky Shot', 'shots', 999, 1999, IMG + '30-shots-golden-waterfall.png', 4.8, 96, 35, 'Medium Sound', true, '1 Box (30 Shots)', false,
    '30 high-altitude shots blooming into weeping golden willow palms with silver tips.', 'Outdoor aerial firework only. Secure the cake with bricks on the sides before lighting.'),
  P('CRK-108', 'Eco-Green Crackers Kids Special Combo (15 Items)', 'combos', 899, 1800, IMG + 'eco-green-kids-combo.png', 4.9, 215, 65, 'Zero Sound', true, '15 Safe Items Box', true,
    '100% CSIR-NEERI certified green crackers designed for young children.', 'Approved green crackers. Adult supervision always recommended.'),
  P('CRK-109', 'Whistling Moon Rockets (Pack of 10)', 'rockets', 450, 900, U('photo-1516450360452-9312f5e86fc7'), 4.7, 130, 45, 'High Whistle & Bang', false, '10 Pcs / Box', false,
    'High-thrust rockets soaring over 60 feet with a shrill whistle before a red chrysanthemum burst.', 'Always use a steady launch tube or empty glass bottle placed firmly on the ground.'),
  P('CRK-110', 'Ashoka Giant Flower Pot Fountains', 'pots', 320, 640, U('photo-1517457373958-b7bdd4587205'), 4.7, 88, 70, 'Low Crackle', true, '10 Pcs / Box', false,
    'Traditional Ashoka flower pots with a wide shower of golden stars and gentle crackles.', 'Place firmly on flat ground. Do not bend over while igniting.'),
  P('CRK-111', 'Kids Magic Pencil Sparklers (Multi-Colour)', 'sparklers', 180, 360, U('photo-1543258103-a62bdc069871'), 4.9, 210, 150, 'Zero Sound', true, '15 Pcs / Box', false,
    'Child-friendly low-heat sparklers that shift from ruby red to green, violet and yellow.', 'Safe for children above 5 under adult supervision. Keep a water bucket handy.'),
  P('CRK-112', 'Hydro Bombs & Electric Sound Crackers', 'garlands', 240, 480, U('photo-1533618561606-3b2a0766d159'), 4.7, 115, 90, 'High Decibel', false, '10 Pcs / Box', false,
    'Intense sound crackers for crisp, thunderous sound waves.', 'Never hold in hand after lighting. Use a long agarbatti to ignite.'),
  P('CRK-113', 'Rotating Helicopter & Butterfly Crackers', 'chakkars', 349, 699, U('photo-1510525009512-ad7fc0c02b28'), 4.6, 75, 60, 'Low Buzzing', true, '10 Pcs / Box', false,
    'Novelty crackers that spin on the ground then take flight like a glowing helicopter.', 'Clear a 5-meter radius on terrace or open ground before lighting.'),
  P('CRK-114', 'Color Smoke Grenades & Daytime Party Fountains', 'pots', 450, 900, U('photo-1527525443983-6e60c75fff46'), 4.9, 92, 40, 'Zero Sound', true, '5 Tubes (5 Colors)', false,
    'Dense vibrant color clouds in cyan, orange, magenta, yellow and lime green for daytime celebrations.', 'Outdoor use only. Do not inhale smoke directly.'),
  P('CRK-115', '5000 Wala Sivakasi Grand Jubilee Lari', 'garlands', 1999, 4200, U('photo-1514565131-fce0801e5785'), 4.9, 164, 25, 'High Decibel', false, '1 Giant Roll (5000 Crackers)', false,
    'Massive garland with over 8 minutes of non-stop cracking, ending with heavy thunder shells.', 'Use in an open field only. Keep away from flammable materials and parked vehicles.'),
  P('CRK-116', 'Diwali Dhamaka Deluxe Family Box (25 Items)', 'combos', 1599, 3499, IMG + 'royal-symphony-120-shots.png', 4.8, 340, 55, 'Assorted Family Friendly', true, '25 Items Box', true,
    'Best-selling mid-size family package with 25 hand-picked sparklers, anars, chakkars, rockets and pencil crackers.', 'Read instructions on individual items inside the box.')
];

const SEED_CATEGORIES = [
  { id: 'cat-shots', slug: 'shots', name: 'Aerial Shots', icon: '🚀', description: 'Multi-burst sky cakes' },
  { id: 'cat-sparklers', slug: 'sparklers', name: 'Sparklers & Phooljhadi', icon: '✨', description: 'Kid-safe and golden sparklers' },
  { id: 'cat-pots', slug: 'pots', name: 'Flower Pots & Anars', icon: '🌋', description: 'Tri-colour fountains' },
  { id: 'cat-chakkars', slug: 'chakkars', name: 'Ground Chakkars', icon: '🌀', description: 'Spinners and whistlers' },
  { id: 'cat-rockets', slug: 'rockets', name: 'Rockets & Missiles', icon: '🚀', description: 'High-altitude whistlers' },
  { id: 'cat-garlands', slug: 'garlands', name: 'Garlands & Sound', icon: '💥', description: '1000 and 5000 wala laris' },
  { id: 'cat-combos', slug: 'combos', name: 'Family Gift Boxes', icon: '🎁', description: 'Value VIP hampers' }
];

const SEED_SETTINGS = {
  key: 'main',
  storeName: "Krishn's Crackers",
  tagline: 'Celebrate Every Moment!',
  contactPhone: '+91 98400 12345',
  contactEmail: 'support@krishnscrackers.com',
  freeShippingThreshold: 999,
  shippingFee: 99,
  razorpayKey: RAZORPAY_KEY_ID
};

function seedOrders() {
  const mk = (id, name, city, pin, total, status, payStatus, items) => ({
    id,
    customer: { name, phone: '+91 98765 43210', email: 'customer@example.com', address: 'Main Road', city, pincode: pin, state: 'India' },
    items,
    pricing: { subtotal: total, discount: 0, shipping: 0, tax: 0, total },
    payment: { method: 'Razorpay Test Mode', transactionId: 'pay_rzp_test_' + Math.floor(10000000 + Math.random() * 90000000), status: payStatus, paidAt: new Date() },
    orderStatus: status,
    trackingNumber: 'INDPOST-' + Math.floor(1000000 + Math.random() * 9000000)
  });
  return [
    mk('ORD-2026-8841', 'Rajesh Khanna', 'Bengaluru', '560103', 1899, 'Shipped', 'Paid',
      [{ productId: 'CRK-101', name: '120 Shots Royal Symphony Sky Shot', price: 1899, quantity: 1, total: 1899 }]),
    mk('ORD-2026-8842', 'Sunita Patel', 'Ahmedabad', '380015', 2999, 'Processing', 'Paid',
      [{ productId: 'CRK-106', name: 'Maharaja Royal Family Mega Gift Hamper (45 Items)', price: 2999, quantity: 1, total: 2999 }]),
    mk('ORD-2026-8843', 'Arvind Menon', 'Kochi', '682001', 498, 'Confirmed', 'Pending',
      [{ productId: 'CRK-102', name: '50cm Golden Electric Sparklers', price: 249, quantity: 2, total: 498 }])
  ];
}

async function seedAll(force = false) {
  if (force) {
    await Promise.all([
      Product.deleteMany({}),
      Order.deleteMany({}),
      Category.deleteMany({}),
      Settings.deleteMany({}),
      User.deleteMany({})
    ]);
  }
  if ((await Product.countDocuments()) === 0) await Product.insertMany(SEED_PRODUCTS);
  if ((await Category.countDocuments()) === 0) await Category.insertMany(SEED_CATEGORIES);
  if ((await Settings.countDocuments()) === 0) await Settings.create(SEED_SETTINGS);
  if ((await Order.countDocuments()) === 0) await Order.insertMany(seedOrders());
  if ((await User.countDocuments({ email: ADMIN_EMAIL })) === 0) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
    await User.create({ email: ADMIN_EMAIL, password: hashedPassword, name: 'Krishn Admin', role: 'admin' });
  }
}

// ---------------------------------------------------------------
// Express App Setup
// ---------------------------------------------------------------
const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Static frontend routes
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/index.html', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/admin.html', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

const clean = (doc) => {
  if (!doc) return doc;
  const o = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  delete o._id;
  delete o.__v;
  return o;
};

// Authentication Middleware
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. Authorization token required.' });
  }
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid. Please log in again.' });
  }
}

// ---------------------------------------------------------------
// Authentication Endpoints (Support both /api/admin/login and /api/auth/login)
// ---------------------------------------------------------------
async function handleLogin(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  // Check admin user in MongoDB first
  let user = await User.findOne({ email: normalizedEmail });
  let isValid = false;

  if (user) {
    isValid = await bcrypt.compare(password, user.password);
  } else if (normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    isValid = true;
  }

  if (!isValid) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { email: normalizedEmail, role: 'admin', store: "Krishn's Crackers" },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({
    success: true,
    message: 'Authentication successful',
    token,
    admin: {
      email: normalizedEmail,
      name: user?.name || "Krishn Admin",
      role: 'admin'
    }
  });
}

app.post('/api/auth/login', handleLogin);
app.post('/api/admin/login', handleLogin);

// ---------------------------------------------------------------
// Admin Dashboard Stats Endpoint
// ---------------------------------------------------------------
app.get('/api/admin/stats', auth, async (req, res) => {
  try {
    const [orders, products, categories] = await Promise.all([
      Order.find().sort({ createdAt: -1 }),
      Product.find(),
      Category.find()
    ]);

    const totalRevenue = orders.reduce((sum, o) => {
      const isPaid = o.payment && (o.payment.status === 'Paid' || o.payment.status === 'Captured');
      return sum + (isPaid ? (o.pricing?.total || 0) : 0);
    }, 0);

    const pendingOrders = orders.filter(o => o.orderStatus === 'Confirmed' || o.orderStatus === 'Processing').length;

    const categoryDistribution = categories.map(cat => {
      const count = products.filter(p => p.category === cat.slug).length;
      return {
        slug: cat.slug,
        name: cat.name,
        icon: cat.icon || '🎆',
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
        recentOrders: orders.slice(0, 5).map(clean)
      }
    });
  } catch (err) {
    console.error('Error in /api/admin/stats:', err);
    res.status(500).json({ success: false, message: 'Error calculating dashboard stats', error: err.message });
  }
});

// ---------------------------------------------------------------
// Products Endpoints
// ---------------------------------------------------------------
const PRODUCT_FIELDS = [
  'name', 'category', 'price', 'originalPrice', 'discount', 'image', 'rating', 'reviewsCount',
  'stock', 'soundLevel', 'ecoFriendly', 'packSize', 'featured', 'bestseller', 'description', 'safetyInstructions'
];
const NUMERIC_FIELDS = ['price', 'originalPrice', 'rating', 'reviewsCount', 'stock'];

function pickProduct(body) {
  const out = {};
  PRODUCT_FIELDS.forEach((k) => {
    if (body[k] !== undefined) {
      out[k] = NUMERIC_FIELDS.includes(k) ? Number(body[k]) : body[k];
    }
  });
  if (out.price && out.originalPrice && out.originalPrice > out.price && !body.discount) {
    out.discount = Math.round((1 - out.price / out.originalPrice) * 100) + '% OFF';
  }
  return out;
}

async function nextProductId() {
  const all = await Product.find({}, { id: 1, _id: 0 }).lean();
  const max = all.reduce((m, p) => {
    const n = parseInt(String(p.id).replace(/\D/g, ''), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 100);
  return 'CRK-' + (max + 1);
}

// GET all products (Supports category filter, search query, sorting)
app.get('/api/products', async (req, res) => {
  try {
    let query = {};
    const { category, search, sort } = req.query;

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { soundLevel: { $regex: q, $options: 'i' } }
      ];
    }

    let sortOptions = { _id: 1 };
    if (sort === 'price-low') sortOptions = { price: 1 };
    else if (sort === 'price-high') sortOptions = { price: -1 };
    else if (sort === 'rating') sortOptions = { rating: -1 };

    const list = await Product.find(query).sort(sortOptions);
    res.json({ success: true, count: list.length, data: list.map(clean) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching products', error: err.message });
  }
});

// GET product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const p = await Product.findOne({ id: req.params.id });
    if (!p) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: clean(p) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create product (Protected Admin)
app.post('/api/products', auth, async (req, res) => {
  try {
    const data = pickProduct(req.body || {});
    if (!data.name || !data.category || data.price === undefined) {
      return res.status(400).json({ success: false, message: 'Product name, category, and price are required.' });
    }
    const id = req.body.id ? String(req.body.id).trim() : await nextProductId();
    const created = await Product.create({ ...data, id });
    res.status(201).json({ success: true, message: 'Product created successfully', data: clean(created) });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ success: false, message: 'Error creating product: ' + err.message });
  }
});

// PUT update product (Protected Admin)
app.put('/api/products/:id', auth, async (req, res) => {
  try {
    const updateData = pickProduct(req.body || {});
    const updated = await Product.findOneAndUpdate(
      { id: req.params.id },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Product not found to update' });
    res.json({ success: true, message: 'Product updated successfully', data: clean(updated) });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ success: false, message: 'Error updating product: ' + err.message });
  }
});

// PATCH toggle or update stock (Protected Admin)
app.patch('/api/products/:id/stock', auth, async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    let newStock;
    if (req.body && req.body.stock !== undefined) {
      newStock = Math.max(0, parseInt(req.body.stock, 10) || 0);
    } else {
      newStock = product.stock > 0 ? 0 : 50;
    }

    product.stock = newStock;
    await product.save();

    res.json({
      success: true,
      message: `Stock ${newStock === 0 ? 'marked Out of Stock' : 'updated to ' + newStock}`,
      data: clean(product)
    });
  } catch (err) {
    console.error('Error toggling stock:', err);
    res.status(500).json({ success: false, message: 'Error toggling stock: ' + err.message });
  }
});

// DELETE product (Protected Admin) - ALWAYS replies with JSON 200 (prevents "Unexpected end of JSON input")
app.delete('/api/products/:id', auth, async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found or already deleted.' });
    }
    return res.status(200).json({
      success: true,
      message: `Cracker "${deleted.name}" deleted successfully.`,
      data: clean(deleted)
    });
  } catch (err) {
    console.error('Error deleting product:', err);
    return res.status(500).json({ success: false, message: 'Error deleting product: ' + err.message });
  }
});

// ---------------------------------------------------------------
// Categories Endpoints
// ---------------------------------------------------------------
app.get('/api/categories', async (req, res) => {
  try {
    const list = await Category.find().sort({ _id: 1 });
    res.json({ success: true, count: list.length, data: list.map(clean) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/categories', auth, async (req, res) => {
  try {
    const { slug, name, icon, description } = req.body || {};
    if (!slug || !name) {
      return res.status(400).json({ success: false, message: 'Category slug and name are required.' });
    }
    const cat = await Category.findOneAndUpdate(
      { slug: slug.trim().toLowerCase() },
      { $set: { name: name.trim(), icon: icon || '🎆', description: description || '' } },
      { returnDocument: 'after', upsert: true }
    );
    res.json({ success: true, message: 'Category saved', data: clean(cat) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------------------------------------------------------
// Orders Endpoints
// ---------------------------------------------------------------
async function uniqueOrderId() {
  for (let i = 0; i < 15; i++) {
    const id = 'ORD-2026-' + Math.floor(1000 + Math.random() * 9000);
    if (!(await Order.exists({ id }))) return id;
  }
  return 'ORD-2026-' + Date.now().toString().slice(-4);
}

// Public: Place an order
app.post('/api/orders', async (req, res) => {
  try {
    const { customer, items, pricing, coupon, payment, notes } = req.body || {};
    if (!customer || !customer.name || !customer.phone || !customer.address) {
      return res.status(400).json({ success: false, message: 'Customer name, phone, and address are required.' });
    }
    if (!Array.isArray(items) || items.length === 0 || !pricing) {
      return res.status(400).json({ success: false, message: 'Cart items and pricing details are required.' });
    }

    const orderId = await uniqueOrderId();
    const trackingNumber = 'INDPOST-' + Math.floor(1000000 + Math.random() * 9000000);

    const order = await Order.create({
      id: orderId,
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
      pricing: {
        subtotal: Number(pricing.subtotal) || 0,
        discount: Number(pricing.discount) || 0,
        shipping: Number(pricing.shipping) || 0,
        tax: Number(pricing.tax) || 0,
        total: Number(pricing.total) || 0
      },
      coupon: coupon || null,
      payment: payment || {
        method: 'Razorpay Test Mode',
        transactionId: 'pay_rzp_' + Date.now(),
        status: 'Paid',
        paidAt: new Date()
      },
      orderStatus: 'Confirmed',
      trackingNumber,
      notes: notes || ''
    });

    // Best-effort inventory reduction
    await Promise.all(items.map((i) =>
      Product.updateOne({ id: i.productId, stock: { $gte: i.quantity } }, { $inc: { stock: -i.quantity } })
    ));

    res.status(201).json({ success: true, message: 'Order created successfully', data: clean(order) });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ success: false, message: 'Failed to place order: ' + err.message });
  }
});

// Admin: List all orders
app.get('/api/orders', auth, async (req, res) => {
  try {
    const list = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, count: list.length, data: list.map(clean) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Public: Track an order by ID (Case-insensitive)
app.get('/api/orders/:id', async (req, res) => {
  try {
    const o = await Order.findOne({ id: new RegExp('^' + req.params.id.trim() + '$', 'i') });
    if (!o) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: clean(o) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Update order status (Supports both PATCH and PUT, and accepts both status and orderStatus)
async function handleUpdateOrderStatus(req, res) {
  try {
    const newStatus = req.body?.status || req.body?.orderStatus;
    const validStatuses = ['Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status "${newStatus}". Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const update = { orderStatus: newStatus };
    if (newStatus === 'Delivered') {
      update['payment.status'] = 'Paid';
    }

    const o = await Order.findOneAndUpdate(
      { id: req.params.id },
      { $set: update },
      { returnDocument: 'after' }
    );

    if (!o) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: `Order status updated to ${newStatus}`, data: clean(o) });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}

app.patch('/api/orders/:id/status', auth, handleUpdateOrderStatus);
app.put('/api/orders/:id/status', auth, handleUpdateOrderStatus);

// ---------------------------------------------------------------
// Store Settings Endpoints
// ---------------------------------------------------------------
app.get('/api/settings', async (req, res) => {
  try {
    let s = await Settings.findOne({ key: 'main' });
    if (!s) s = await Settings.create(SEED_SETTINGS);
    res.json({ success: true, data: clean(s) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/settings', auth, async (req, res) => {
  try {
    const b = req.body || {};
    const set = {};
    ['storeName', 'tagline', 'contactPhone', 'contactEmail', 'razorpayKey'].forEach((k) => {
      if (b[k] !== undefined) set[k] = String(b[k]).trim();
    });
    if (b.freeShippingThreshold !== undefined) set.freeShippingThreshold = Number(b.freeShippingThreshold);
    if (b.shippingFee !== undefined) set.shippingFee = Number(b.shippingFee);

    const s = await Settings.findOneAndUpdate({ key: 'main' }, { $set: set }, { returnDocument: 'after', upsert: true });
    res.json({ success: true, message: 'Settings saved successfully', data: clean(s) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------------------------------------------------------
// Razorpay Payment Gateway (Test Mode Verification)
// ---------------------------------------------------------------
async function handleCreatePaymentOrder(req, res) {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body || {};
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payment amount is required.' });
    }

    const amountInPaise = Math.round(Number(amount) * 100);
    const orderReceipt = receipt || ('rcpt_' + Math.floor(100000 + Math.random() * 900000));
    const rzpOrderId = 'order_' + crypto.randomBytes(8).toString('hex');

    await Payment.create({
      orderId: orderReceipt,
      amount: Number(amount),
      currency,
      status: 'Created',
      method: 'Razorpay Test Mode',
      razorpayOrderId: rzpOrderId
    });

    res.json({
      success: true,
      data: {
        orderId: rzpOrderId,
        amount: amountInPaise,
        currency,
        keyId: RAZORPAY_KEY_ID,
        receipt: orderReceipt
      }
    });
  } catch (err) {
    console.error('Error creating payment order:', err);
    res.status(500).json({ success: false, message: 'Error initiating payment order: ' + err.message });
  }
}

async function handleVerifyPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ success: false, message: 'Missing order_id or payment_id' });
    }

    let isAuthentic = false;

    if (razorpay_signature) {
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      isAuthentic = (expectedSignature === razorpay_signature) ||
                    razorpay_signature.startsWith('test_sig_') ||
                    razorpay_payment_id.startsWith('pay_rzp_test_');
    } else {
      isAuthentic = razorpay_payment_id.startsWith('pay_rzp_test_');
    }

    if (!isAuthentic) {
      await Payment.create({
        orderId: order_id || razorpay_order_id,
        amount: 0,
        status: 'Failed',
        failureReason: 'Cryptographic signature mismatch',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id
      });
      return res.status(400).json({ success: false, message: 'Payment verification failed: Invalid signature' });
    }

    await Payment.create({
      orderId: order_id || razorpay_order_id,
      amount: Number(req.body.amount || 0),
      status: 'Captured',
      verified: true,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature || 'verified_test_sig'
    });

    res.json({ success: true, message: 'Payment verified successfully', paymentId: razorpay_payment_id });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ success: false, message: 'Verification error: ' + err.message });
  }
}

app.post('/api/payment/create-order', handleCreatePaymentOrder);
app.post('/api/payments/create-order', handleCreatePaymentOrder);
app.post('/api/payment/verify-payment', handleVerifyPayment);
app.post('/api/payments/verify-payment', handleVerifyPayment);

// ---------------------------------------------------------------
// Admin Reset Endpoint
// ---------------------------------------------------------------
app.post('/api/admin/reset', auth, async (req, res) => {
  try {
    await seedAll(true);
    res.json({ success: true, message: "Database reset to Krishn's Crackers default inventory." });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error resetting database', error: err.message });
  }
});

// ---------------------------------------------------------------
// Health Check Endpoint
// ---------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    databaseName: mongoose.connection.name,
    timestamp: new Date().toISOString()
  });
});

// Unknown API routes return JSON
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

// ---------------------------------------------------------------
// Server Start with MongoDB Connection
// ---------------------------------------------------------------
mongoose.connect(MONGO_URI, { dbName: 'krishns_crackers' })
  .then(async () => {
    console.log(`[MongoDB] Connected successfully to database: ${mongoose.connection.name}`);
    await seedAll(false);
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`KRISHN'S CRACKERS - "Celebrate Every Moment!"`);
      console.log(`=======================================================`);
      console.log(`Customer Storefront: http://localhost:${PORT}/`);
      console.log(`Admin Portal:        http://localhost:${PORT}/admin.html`);
      console.log(`API Health:          http://localhost:${PORT}/api/health`);
      console.log(`Connected Database:  ${mongoose.connection.name}`);
      console.log(`Admin Credentials:   ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
      console.log(`=======================================================`);
    });
  })
  .catch((err) => {
    console.error('[MongoDB] Connection failed:', err.message);
    process.exit(1);
  });