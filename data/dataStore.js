const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, 'db.json');

// 8 Distinct Master Categories as specified
const DEFAULT_CATEGORIES = [
  { id: 'cat-pots', name: 'Flower Pots', slug: 'pots', icon: '🌋', description: 'Tri-colour 20ft fountains, golden sparks, and crackling anars' },
  { id: 'cat-sparklers', name: 'Sparklers', slug: 'sparklers', icon: '✨', description: 'Long-burning golden electric, magic color, and child-safe sparklers' },
  { id: 'cat-chakkars', name: 'Ground Chakkars', slug: 'chakkars', icon: '🌀', description: 'High-speed spinning zamin chakkars, deluxe wheels, and whistling spinners' },
  { id: 'cat-rockets', name: 'Rockets', slug: 'rockets', icon: '🚀', description: 'High-thrust sky rockets with whistling ascent and chrysanthemum bursts' },
  { id: 'cat-shots', name: 'Aerial Shots', slug: 'shots', icon: '🎆', description: 'Multi-burst high-altitude sky cakes, waterfalls, and brocade crowns' },
  { id: 'cat-garlands', name: 'Garlands', slug: 'garlands', icon: '💥', description: 'Authentic Sivakasi red garlands (1000 wala, 5000 wala) and thunder bombs' },
  { id: 'cat-hampers', name: 'Gift Hampers', slug: 'hampers', icon: '🎁', description: 'Curated luxury VIP assortment hampers for corporate and festive gifting' },
  { id: 'cat-combos', name: 'Family Combo Packs', slug: 'combos', icon: '👨‍👩‍👧‍👦', description: 'All-inclusive value packages containing complete family celebration assortments' }
];

// Complete Krishn's Crackers Inventory (16 Rich Products)
const DEFAULT_PRODUCTS = [
  {
    id: 'CRK-101',
    name: '120 Shots Royal Symphony Sky Shot',
    category: 'shots',
    price: 1899,
    originalPrice: 3799,
    discount: '50% OFF',
    image: './images/royal-symphony-120-shots.png',
    rating: 4.9,
    reviewsCount: 312,
    stock: 45,
    soundLevel: 'Medium Sound',
    ecoFriendly: true,
    packSize: '1 Box (120 Shots)',
    featured: true,
    bestseller: true,
    description: 'Breathtaking 120 continuous aerial multi-color shots lighting the entire night sky in red, emerald green, glittering gold, and silver brocades with thunderous finale bursts.',
    safetyInstructions: 'Place on flat ground outdoors. Maintain a minimum distance of 15 meters.'
  },
  {
    id: 'CRK-102',
    name: '50cm Golden Electric Sparklers',
    category: 'sparklers',
    price: 249,
    originalPrice: 499,
    discount: '50% OFF',
    image: './images/50cm-golden-electric-sparklers.png',
    rating: 4.8,
    reviewsCount: 420,
    stock: 120,
    soundLevel: 'Zero Sound',
    ecoFriendly: true,
    packSize: '10 Pcs / Pack',
    featured: true,
    bestseller: true,
    description: 'Long-lasting 50cm eco-friendly golden electric sparklers with smooth, low-smoke burning lasting over 3 minutes per sparkler. Perfect and safe for kids and family photos.',
    safetyInstructions: 'Hold at arm\'s length away from body. Immerse burnt wire in a water bucket immediately.'
  },
  {
    id: 'CRK-103',
    name: 'Special Tri-Colour Giant Anar (Flower Pots)',
    category: 'pots',
    price: 399,
    originalPrice: 799,
    discount: '50% OFF',
    image: './images/special-tri-colour-anar.png',
    rating: 4.9,
    reviewsCount: 185,
    stock: 65,
    soundLevel: 'Low Crackle',
    ecoFriendly: true,
    packSize: '5 Giant Pcs / Box',
    featured: true,
    bestseller: false,
    description: 'Majestic fountain reaching over 20 feet high, transitioning seamlessly from vibrant saffron to sparkling white and brilliant emerald green with crackling gold pearls.',
    safetyInstructions: 'Keep on even cement or ground outdoors. Light with agarbatti and step back 5 meters.'
  },
  {
    id: 'CRK-104',
    name: 'Deluxe Special Whistling Ground Chakkars',
    category: 'chakkars',
    price: 299,
    originalPrice: 599,
    discount: '50% OFF',
    image: './images/deluxe-whistling-chakkars.png',
    rating: 4.7,
    reviewsCount: 142,
    stock: 80,
    soundLevel: 'Musical Whistle',
    ecoFriendly: true,
    packSize: '10 Pcs / Box',
    featured: false,
    bestseller: true,
    description: 'High-speed spinning ground wheels with bright silver and red sparks that emit an exciting whistling sound as they whirl gracefully on smooth surfaces.',
    safetyInstructions: 'Place flat on smooth ground. Do not touch while spinning.'
  },
  {
    id: 'CRK-105',
    name: '1000 Wala Sivakasi Red Giant Garland',
    category: 'garlands',
    price: 699,
    originalPrice: 1399,
    discount: '50% OFF',
    image: './images/1000-wala-red-giant-garland.png',
    rating: 4.8,
    reviewsCount: 278,
    stock: 50,
    soundLevel: 'High Decibel',
    ecoFriendly: false,
    packSize: '1 Roll (1000 Crackers)',
    featured: true,
    bestseller: true,
    description: 'Authentic Sivakasi festival lari packed with 1,000 continuous bursting red crackers ending with a resounding grand twin atom blast.',
    safetyInstructions: 'Unroll completely in a wide open area. Light fuse from end and move 10 meters away immediately.'
  },
  {
    id: 'CRK-106',
    name: 'Maharaja Royal Family Mega Gift Hamper (45 Items)',
    category: 'hampers',
    price: 2999,
    originalPrice: 6500,
    discount: '54% OFF',
    image: './images/maharaja-royal-family-hamper.png',
    rating: 5.0,
    reviewsCount: 512,
    stock: 30,
    soundLevel: 'Assorted VIP',
    ecoFriendly: true,
    packSize: '45 Premium Varieties Box',
    featured: true,
    bestseller: true,
    description: 'The ultimate festival centerpiece! Contains 45 varieties including Sky Shots, Colour Sparklers, Giant Anars, Whistling Chakkars, Rockets, Twin Sound Bombs, and festive matchsticks.',
    safetyInstructions: 'Store box in cool dry place away from children. Read individual item guidelines.'
  },
  {
    id: 'CRK-107',
    name: '30 Shots Golden Waterfall Palm Sky Shot',
    category: 'shots',
    price: 999,
    originalPrice: 1999,
    discount: '50% OFF',
    image: './images/30-shots-golden-waterfall.png',
    rating: 4.8,
    reviewsCount: 96,
    stock: 35,
    soundLevel: 'Medium Sound',
    ecoFriendly: true,
    packSize: '1 Box (30 Shots)',
    featured: false,
    bestseller: false,
    description: '30 elegant high-altitude shots blooming into weeping golden willow palms with sparkling silver tips that shimmer down like a celestial waterfall.',
    safetyInstructions: 'Outdoor aerial firework only. Secure cake with bricks on side before lighting.'
  },
  {
    id: 'CRK-108',
    name: 'Eco-Green Crackers Kids Special Combo (15 Items)',
    category: 'combos',
    price: 899,
    originalPrice: 1800,
    discount: '50% OFF',
    image: './images/eco-green-kids-combo.png',
    rating: 4.9,
    reviewsCount: 215,
    stock: 65,
    soundLevel: 'Zero Sound',
    ecoFriendly: true,
    packSize: '15 Safe Items Box',
    featured: true,
    bestseller: false,
    description: '100% CSIR-NEERI certified Green Crackers designed specifically for young children with zero toxic emissions, low decibel sounds, and glowing colors.',
    safetyInstructions: 'Approved green crackers. Adult supervision always recommended.'
  },
  {
    id: 'CRK-109',
    name: 'Whistling Moon Rockets (Pack of 10)',
    category: 'rockets',
    price: 450,
    originalPrice: 900,
    discount: '50% OFF',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    reviewsCount: 130,
    stock: 45,
    soundLevel: 'High Whistle & Bang',
    ecoFriendly: false,
    packSize: '10 Pcs / Box',
    featured: false,
    bestseller: false,
    description: 'High-thrust bottle rockets that soar over 60 feet into the clouds with an eerie shrill whistle before bursting into a red chrysanthemum shower.',
    safetyInstructions: 'Always use a steady launch tube or empty glass bottle placed firmly on the ground.'
  },
  {
    id: 'CRK-110',
    name: 'Ashoka Giant Flower Pot Fountains',
    category: 'pots',
    price: 320,
    originalPrice: 640,
    discount: '50% OFF',
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    reviewsCount: 88,
    stock: 70,
    soundLevel: 'Low Crackle',
    ecoFriendly: true,
    packSize: '10 Pcs / Box',
    featured: false,
    bestseller: false,
    description: 'Traditional Ashoka flower pots producing a wide shower of sparkling golden stars with gentle soothing crackles.',
    safetyInstructions: 'Place firmly on flat ground. Do not bend over while igniting.'
  },
  {
    id: 'CRK-111',
    name: 'Kids Magic Pencil Sparklers (Multi-Colour)',
    category: 'sparklers',
    price: 180,
    originalPrice: 360,
    discount: '50% OFF',
    image: 'https://images.unsplash.com/photo-1543258103-a62bdc069871?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 210,
    stock: 150,
    soundLevel: 'Zero Sound',
    ecoFriendly: true,
    packSize: '15 Pcs / Box',
    featured: false,
    bestseller: true,
    description: 'Child-friendly, low-heat color changing sparklers that shift colors from ruby red to fluorescent green, violet, and electric yellow.',
    safetyInstructions: 'Safe for children above 5 under adult supervision. Keep water bucket handy.'
  },
  {
    id: 'CRK-112',
    name: 'Hydro Bombs & Electric Sound Crackers',
    category: 'garlands',
    price: 240,
    originalPrice: 480,
    discount: '50% OFF',
    image: 'https://images.unsplash.com/photo-1533618561606-3b2a0766d159?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    reviewsCount: 115,
    stock: 90,
    soundLevel: 'High Decibel',
    ecoFriendly: false,
    packSize: '10 Pcs / Box',
    featured: false,
    bestseller: false,
    description: 'Intense sound crackers engineered with Sivakasi precision gunpowder for crisp, thunderous sound waves.',
    safetyInstructions: 'Never hold in hand after lighting. Use long agarbatti to ignite.'
  },
  {
    id: 'CRK-113',
    name: 'Rotating Helicopter & Butterfly Crackers',
    category: 'chakkars',
    price: 349,
    originalPrice: 699,
    discount: '50% OFF',
    image: 'https://images.unsplash.com/photo-1510525009512-ad7fc0c02b28?auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    reviewsCount: 75,
    stock: 60,
    soundLevel: 'Low Buzzing',
    ecoFriendly: true,
    packSize: '10 Pcs / Box',
    featured: false,
    bestseller: false,
    description: 'Exciting novelty crackers that spin on the ground with green and yellow embers before taking flight 15 feet in the air like a glowing helicopter.',
    safetyInstructions: 'Clear a 5-meter radius on terrace or open ground before lighting.'
  },
  {
    id: 'CRK-114',
    name: 'Color Smoke Grenades & Daytime Party Fountains',
    category: 'pots',
    price: 450,
    originalPrice: 900,
    discount: '50% OFF',
    image: 'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 92,
    stock: 40,
    soundLevel: 'Zero Sound',
    ecoFriendly: true,
    packSize: '5 Tubes (5 Colors)',
    featured: false,
    bestseller: false,
    description: 'Dense, vibrant color clouds in Cyan, Orange, Magenta, Yellow, and Lime Green for spectacular daytime festival celebrations and photography.',
    safetyInstructions: 'Outdoor use only. Do not inhale smoke directly.'
  },
  {
    id: 'CRK-115',
    name: '5000 Wala Sivakasi Grand Jubilee Lari',
    category: 'garlands',
    price: 1999,
    originalPrice: 4200,
    discount: '52% OFF',
    image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 164,
    stock: 25,
    soundLevel: 'High Decibel',
    ecoFriendly: false,
    packSize: '1 Giant Roll (5000 Crackers)',
    featured: false,
    bestseller: false,
    description: 'Massive festive garland with over 8 minutes of non-stop rhythmic cracking celebration, culminating in heavy thunder finale shells.',
    safetyInstructions: 'Use in open field only. Ensure no flammable materials or parked vehicles nearby.'
  },
  {
    id: 'CRK-116',
    name: 'Diwali Dhamaka Deluxe Family Box (25 Items)',
    category: 'combos',
    price: 1599,
    originalPrice: 3499,
    discount: '54% OFF',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewsCount: 340,
    stock: 55,
    soundLevel: 'Assorted Family Friendly',
    ecoFriendly: true,
    packSize: '25 Items Box',
    featured: true,
    bestseller: false,
    description: 'Best-selling mid-size family package containing 25 hand-picked varieties of sparklers, anars, chakkars, rockets, and pencil crackers.',
    safetyInstructions: 'Read instructions on individual items inside the box.'
  }
];

// Default Seed Orders
const DEFAULT_ORDERS = [
  {
    id: 'ORD-2026-8841',
    customer: {
      name: 'Rohan Sharma',
      phone: '+91 98765 43210',
      email: 'rohan.sharma@example.com',
      address: 'Flat 402, Golden Palms Residency, Sector 14',
      city: 'Gurugram',
      pincode: '122001',
      state: 'Haryana'
    },
    items: [
      { productId: 'CRK-106', name: 'Maharaja Royal Family Mega Gift Hamper (45 Items)', price: 2999, quantity: 1, image: './images/maharaja-royal-family-hamper.png', total: 2999 },
      { productId: 'CRK-102', name: '50cm Golden Electric Sparklers', price: 249, quantity: 2, image: './images/50cm-golden-electric-sparklers.png', total: 498 }
    ],
    pricing: {
      subtotal: 3497,
      discount: 349.7,
      shipping: 0,
      tax: 0,
      total: 3147.30
    },
    coupon: 'DIWALI10',
    payment: {
      method: 'Razorpay Test (UPI)',
      transactionId: 'pay_rzp_test_90182834',
      status: 'Paid',
      paidAt: '2026-10-15T14:30:00.000Z'
    },
    orderStatus: 'Shipped',
    trackingNumber: 'DELHIVERY-7749281',
    createdAt: '2026-10-15T14:28:10.000Z',
    notes: 'Please ring bell upon doorstep delivery.'
  },
  {
    id: 'ORD-2026-8842',
    customer: {
      name: 'Priya Sundaram',
      phone: '+91 94432 11987',
      email: 'priya.sundaram@example.com',
      address: '14, Temple View Road, Anna Nagar',
      city: 'Chennai',
      pincode: '600040',
      state: 'Tamil Nadu'
    },
    items: [
      { productId: 'CRK-101', name: '120 Shots Royal Symphony Sky Shot', price: 1899, quantity: 2, image: './images/royal-symphony-120-shots.png', total: 3798 },
      { productId: 'CRK-103', name: 'Special Tri-Colour Giant Anar (Flower Pots)', price: 399, quantity: 2, image: './images/special-tri-colour-anar.png', total: 798 }
    ],
    pricing: {
      subtotal: 4596,
      discount: 2298,
      shipping: 0,
      tax: 0,
      total: 2298.00
    },
    coupon: 'DIWALI50',
    payment: {
      method: 'Razorpay Test (Cards)',
      transactionId: 'pay_rzp_test_88192031',
      status: 'Paid',
      paidAt: '2026-10-16T10:15:00.000Z'
    },
    orderStatus: 'Confirmed',
    trackingNumber: 'BLUEDART-9928172',
    createdAt: '2026-10-16T10:12:45.000Z',
    notes: 'Fragile package - Handle with festive care.'
  }
];

class DataStore {
  constructor() {
    this.isMongoConnected = false;
    this.memoryData = null;
    this.initFileStore();
  }

  setMongoConnected(status) {
    this.isMongoConnected = status;
  }

  initFileStore() {
    const initial = {
      products: DEFAULT_PRODUCTS,
      categories: DEFAULT_CATEGORIES,
      orders: DEFAULT_ORDERS,
      payments: [],
      admin: {
        email: process.env.ADMIN_EMAIL || 'admin@krishnscrackers.com',
        passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10),
        name: 'Krishn Admin',
        role: 'admin'
      },
      settings: {
        storeName: "Krishn's Crackers",
        tagline: "Celebrate Every Moment!",
        contactPhone: "+91 98400 12345",
        contactEmail: "support@krishnscrackers.com",
        freeShippingThreshold: 999,
        shippingFee: 99,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag'
      }
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    this.memoryData = initial;
  }

  read() {
    if (!this.memoryData) {
      if (!fs.existsSync(DB_FILE)) {
        this.initFileStore();
      } else {
        try {
          this.memoryData = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
        } catch (e) {
          this.initFileStore();
        }
      }
    }
    return this.memoryData;
  }

  write(data) {
    this.memoryData = data;
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing to db.json:', e);
    }
  }

  // --- PRODUCTS ---
  async getProducts() {
    const data = this.read();
    return data.products || [];
  }

  async getProductById(id) {
    const products = await this.getProducts();
    return products.find(p => p.id === id) || null;
  }

  async createProduct(productData) {
    const data = this.read();
    if (!productData.id) {
      productData.id = 'CRK-' + Math.floor(100 + Math.random() * 900);
    }
    data.products.unshift(productData);
    this.write(data);
    return productData;
  }

  async updateProduct(id, updates) {
    const data = this.read();
    const index = data.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    data.products[index] = { ...data.products[index], ...updates };
    this.write(data);
    return data.products[index];
  }

  async deleteProduct(id) {
    const data = this.read();
    const initialLength = data.products.length;
    data.products = data.products.filter(p => p.id !== id);
    if (data.products.length !== initialLength) {
      this.write(data);
      return true;
    }
    return false;
  }

  // --- CATEGORIES ---
  async getCategories() {
    const data = this.read();
    return data.categories || [];
  }

  // --- ORDERS ---
  async getOrders() {
    const data = this.read();
    return (data.orders || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getOrderById(id) {
    const orders = await this.getOrders();
    return orders.find(o => o.id === id) || null;
  }

  async createOrder(orderPayload) {
    const data = this.read();
    const newOrder = {
      id: 'ORD-2026-' + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toISOString(),
      orderStatus: 'Confirmed',
      trackingNumber: 'INDPOST-' + Math.floor(1000000 + Math.random() * 9000000),
      ...orderPayload
    };

    data.orders.unshift(newOrder);

    // Deduct stock for each item
    if (newOrder.items && newOrder.items.length) {
      for (const item of newOrder.items) {
        const product = data.products.find(p => p.id === item.productId);
        if (product) {
          product.stock = Math.max(0, (product.stock || 0) - item.quantity);
        }
      }
    }

    this.write(data);
    return newOrder;
  }

  async updateOrderStatus(id, newStatus) {
    const data = this.read();
    const order = data.orders.find(o => o.id === id);
    if (!order) return null;

    order.orderStatus = newStatus;
    if (newStatus === 'Delivered' && order.payment && order.payment.status !== 'Paid') {
      order.payment.status = 'Paid';
      order.payment.paidAt = new Date().toISOString();
    }

    this.write(data);
    return order;
  }

  // --- PAYMENTS ---
  async recordPayment(paymentData) {
    const data = this.read();
    if (!data.payments) data.payments = [];
    data.payments.unshift({
      id: 'PAY-' + Date.now(),
      createdAt: new Date().toISOString(),
      ...paymentData
    });
    this.write(data);
    return paymentData;
  }

  // --- ADMIN CREDENTIALS ---
  async getAdmin() {
    const data = this.read();
    return data.admin;
  }

  async verifyAdminPassword(email, password) {
    const admin = await this.getAdmin();
    const targetEmail = (email || '').trim().toLowerCase();
    const storedEmail = (admin.email || '').trim().toLowerCase();

    if (targetEmail === storedEmail || targetEmail === 'admin') {
      return bcrypt.compareSync(password, admin.passwordHash);
    }
    return false;
  }

  // --- SETTINGS ---
  async getSettings() {
    const data = this.read();
    return data.settings || {};
  }

  async saveSettings(settings) {
    const data = this.read();
    data.settings = { ...data.settings, ...settings };
    this.write(data);
    return data.settings;
  }

  // --- RESET DB ---
  async resetDatabase() {
    if (fs.existsSync(DB_FILE)) {
      fs.unlinkSync(DB_FILE);
    }
    this.initFileStore();
    return true;
  }
}

module.exports = new DataStore();
