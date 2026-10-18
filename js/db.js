/**
 * DiwaliSparks Database & State Management Layer
 * High-performance persistence using IndexedDB with automatic LocalStorage fallback.
 * Includes complete seed data for Crackers, Categories, Orders, and Coupons.
 * Provides cross-tab synchronization via BroadcastChannel.
 */

const DB_NAME = 'DiwaliSparksCrackerDB';
const DB_VERSION = 1;

// Default Seed Categories
const DEFAULT_CATEGORIES = [
  { id: 'cat-shots', name: 'Sky Shots & Aerials', slug: 'shots', icon: '🎆', description: 'Spectacular multi-color aerial shells and sky bursting fireworks' },
  { id: 'cat-sparklers', name: 'Sparklers & Phooljhadi', slug: 'sparklers', icon: '✨', description: 'Glittering golden, electric, and color sparklers for all ages' },
  { id: 'cat-pots', name: 'Flower Pots & Anars', slug: 'pots', icon: '🌋', description: 'Glorious fountains of golden sparks, tri-color and crackling anars' },
  { id: 'cat-chakkars', name: 'Ground Chakkars', slug: 'chakkars', icon: '🌀', description: 'Fast spinning zamin chakkars, deluxe wheels and whistling spinners' },
  { id: 'cat-sound', name: 'Sound Crackers & Laris', slug: 'sound', icon: '💥', description: 'Traditional Sivakasi garlands, 1000 wala, 5000 wala and thunder bombs' },
  { id: 'cat-combos', name: 'Family Mega Gift Boxes', slug: 'combos', icon: '🎁', description: 'Curated value assortments containing complete family celebrations' }
];

// Default Seed Products (16 High-Demand Cracker Products with rich attributes)
const DEFAULT_PRODUCTS = [
  {
    id: 'CRK-101',
    name: '120 Shots Royal Symphony Sky Shot',
    category: 'shots',
    price: 1899,
    originalPrice: 3799,
    discount: '50% OFF',
    image: './assets/images/120-shots-royal-symphony.jpg',
    rating: 4.9,
    reviewsCount: 312,
    stock: 45,
    soundLevel: 'Medium Sound',
    ecoFriendly: true,
    packSize: '1 Box (120 Shots)',
    featured: true,
    description: 'Breathtaking 120 continuous aerial multi-color shots lighting the entire night sky in red, emerald green, glittering gold, and silver brocades with thunderous finale bursts.',
    safetyInstructions: 'Place on flat ground, light fuse and maintain a minimum distance of 15 meters outdoors.'
  },
  {
    id: 'CRK-102',
    name: '50cm Golden Electric Sparklers',
    category: 'sparklers',
    price: 249,
    originalPrice: 499,
    discount: '50% OFF',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewsCount: 420,
    stock: 120,
    soundLevel: 'Zero Sound',
    ecoFriendly: true,
    packSize: '10 Pcs / Pack',
    featured: true,
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
    image: 'https://images.unsplash.com/photo-1531747056595-07f6cbbe10ad?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 185,
    stock: 65,
    soundLevel: 'Low Crackle',
    ecoFriendly: true,
    packSize: '5 Giant Pcs / Box',
    featured: true,
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
    image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    reviewsCount: 142,
    stock: 80,
    soundLevel: 'Musical Whistle',
    ecoFriendly: true,
    packSize: '10 Pcs / Box',
    featured: false,
    description: 'High-speed spinning ground wheels with bright silver and red sparks that emit an exciting whistling sound as they whirl gracefully on smooth surfaces.',
    safetyInstructions: 'Place flat on smooth ground. Do not touch while spinning.'
  },
  {
    id: 'CRK-105',
    name: '1000 Wala Sivakasi Red Giant Garland',
    category: 'sound',
    price: 699,
    originalPrice: 1399,
    discount: '50% OFF',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewsCount: 278,
    stock: 50,
    soundLevel: 'High Decibel',
    ecoFriendly: false,
    packSize: '1 Roll (1000 Crackers)',
    featured: true,
    description: 'Authentic Sivakasi festival lari packed with 1,000 continuous bursting red crackers ending with a resounding grand twin atom blast.',
    safetyInstructions: 'Unroll completely in a wide open area. Light fuse from end and move 10 meters away immediately.'
  },
  {
    id: 'CRK-106',
    name: 'Maharaja Royal Family Mega Gift Hamper (45 Items)',
    category: 'combos',
    price: 2999,
    originalPrice: 6500,
    discount: '54% OFF',
    image: 'https://images.unsplash.com/photo-1576761846585-80b472504a60?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    reviewsCount: 512,
    stock: 30,
    soundLevel: 'Assorted (Low to High)',
    ecoFriendly: true,
    packSize: '45 Premium Varieties Box',
    featured: true,
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
    image: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewsCount: 96,
    stock: 35,
    soundLevel: 'Medium Sound',
    ecoFriendly: true,
    packSize: '1 Box (30 Shots)',
    featured: false,
    description: '30 elegant high-altitude shots blooming into weeping golden willow palms with sparkling silver tips that shimmer down like a celestial waterfall.',
    safetyInstructions: 'Outdoor aerial firework only. Secure cake with bricks on side before lighting.'
  },
  {
    id: 'CRK-108',
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
    description: 'Child-friendly, low-heat color changing sparklers that shift colors from ruby red to fluorescent green, violet, and electric yellow.',
    safetyInstructions: 'Safe for children above 5 under adult supervision. Keep water bucket handy.'
  },
  {
    id: 'CRK-109',
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
    description: 'Traditional Ashoka flower pots producing a wide shower of sparkling golden stars with gentle soothing crackles.',
    safetyInstructions: 'Place firmly on flat ground. Do not bend over while igniting.'
  },
  {
    id: 'CRK-110',
    name: '5000 Wala Sivakasi Grand Jubilee Lari',
    category: 'sound',
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
    description: 'Massive festive garland with over 8 minutes of non-stop rhythmic cracking celebration, culminating in heavy thunder finale shells.',
    safetyInstructions: 'Use in open field only. Ensure no flammable materials or parked vehicles nearby.'
  },
  {
    id: 'CRK-111',
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
    description: 'Exciting novelty crackers that spin on the ground with green and yellow embers before taking flight 15 feet in the air like a glowing helicopter.',
    safetyInstructions: 'Clear a 5-meter radius on terrace or open ground before lighting.'
  },
  {
    id: 'CRK-112',
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
    description: 'Best-selling mid-size family package containing 25 hand-picked varieties of sparklers, anars, chakkars, rockets, and pencil crackers.',
    safetyInstructions: 'Read instructions on individual items inside the box.'
  },
  {
    id: 'CRK-113',
    name: 'Hydro Bombs & Electric Sound Crackers',
    category: 'sound',
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
    description: 'Intense sound crackers engineered with Sivakasi precision gunpowder for crisp, thunderous sound waves.',
    safetyInstructions: 'Never hold in hand after lighting. Use long agarbatti to ignite.'
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
    description: 'Dense, vibrant color clouds in Cyan, Orange, Magenta, Yellow, and Lime Green for spectacular daytime festival celebrations and photography.',
    safetyInstructions: 'Outdoor use only. Do not inhale smoke directly.'
  },
  {
    id: 'CRK-115',
    name: 'Whistling Moon Rockets (Pack of 10)',
    category: 'shots',
    price: 420,
    originalPrice: 850,
    discount: '51% OFF',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewsCount: 130,
    stock: 45,
    soundLevel: 'High Whistle & Bang',
    ecoFriendly: false,
    packSize: '10 Pcs / Box',
    featured: false,
    description: 'High-thrust bottle rockets that soar over 60 feet into the clouds with an eerie shrill whistle before bursting into a red chrysanthemum shower.',
    safetyInstructions: 'Always use a steady launch tube or empty glass bottle placed firmly on the ground.'
  },
  {
    id: 'CRK-116',
    name: 'Eco-Green Crackers Kids Special Combo (15 Items)',
    category: 'combos',
    price: 899,
    originalPrice: 1800,
    discount: '50% OFF',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 215,
    stock: 65,
    soundLevel: 'Low Sound / Safe',
    ecoFriendly: true,
    packSize: '15 Safe Items Box',
    featured: true,
    description: '100% CSIR-NEERI certified Green Crackers designed specifically for young children with zero toxic emissions, low decibel sounds, and glowing colors.',
    safetyInstructions: 'Approved green crackers. Adult supervision always recommended.'
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
      { productId: 'CRK-106', name: 'Maharaja Royal Family Mega Gift Hamper (45 Items)', price: 2999, quantity: 1, image: 'https://images.unsplash.com/photo-1576761846585-80b472504a60?auto=format&fit=crop&w=800&q=80', total: 2999 },
      { productId: 'CRK-102', name: '50cm Golden Electric Sparklers', price: 249, quantity: 2, image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80', total: 498 }
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
      { productId: 'CRK-101', name: '120 Shots Royal Symphony Sky Shot', price: 1899, quantity: 2, image: 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=800&q=80', total: 3798 },
      { productId: 'CRK-103', name: 'Special Tri-Colour Giant Anar (Flower Pots)', price: 399, quantity: 2, image: 'https://images.unsplash.com/photo-1531747056595-07f6cbbe10ad?auto=format&fit=crop&w=800&q=80', total: 798 }
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
  },
  {
    id: 'ORD-2026-8843',
    customer: {
      name: 'Ananya Mukherjee',
      phone: '+91 98300 55412',
      email: 'ananya.m@example.com',
      address: 'Plot 88, Salt Lake City, Sector 2',
      city: 'Kolkata',
      pincode: '700091',
      state: 'West Bengal'
    },
    items: [
      { productId: 'CRK-116', name: 'Eco-Green Crackers Kids Special Combo (15 Items)', price: 899, quantity: 1, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80', total: 899 },
      { productId: 'CRK-104', name: 'Deluxe Special Whistling Ground Chakkars', price: 299, quantity: 1, image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80', total: 299 }
    ],
    pricing: {
      subtotal: 1198,
      discount: 239.6,
      shipping: 0,
      tax: 0,
      total: 958.40
    },
    coupon: 'FESTIVE20',
    payment: {
      method: 'Cash on Delivery (COD)',
      transactionId: 'cod_pending_8843',
      status: 'Pending',
      paidAt: null
    },
    orderStatus: 'Processing',
    trackingNumber: 'EKART-4432109',
    createdAt: '2026-10-16T13:40:00.000Z',
    notes: 'Call before delivery.'
  }
];

// Active Coupons
const DEFAULT_COUPONS = [
  { code: 'DIWALI50', discountPercent: 50, minOrder: 999, description: 'Flat 50% Grand Festive Discount' },
  { code: 'FESTIVE20', discountPercent: 20, minOrder: 499, description: '20% Extra Festival Celebration Off' },
  { code: 'SPARKLE10', discountPercent: 10, minOrder: 299, description: '10% Welcome Discount' }
];

// Default App Settings
const DEFAULT_SETTINGS = {
  storeName: 'DiwaliSparks Firework Co.',
  tagline: 'Authentic Sivakasi Direct Factory Green Fireworks',
  contactPhone: '+91 98400 12345',
  contactEmail: 'support@diwalisparks.com',
  freeShippingThreshold: 999,
  shippingFee: 99,
  razorpayKeyId: 'rzp_test_1DP5mmOlF5G5ag', // Default test key ID for demonstration
  currencySymbol: '₹',
  isSoundEnabled: true
};

// Database Implementation class
class CrackerDatabase {
  constructor() {
    this.db = null;
    this.broadcastChannel = null;
    this.subscribers = new Set();
    this.initPromise = this.init();
  }

  async init() {
    // Setup cross-tab sync channel
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.broadcastChannel = new BroadcastChannel('diwalisparks_channel');
        this.broadcastChannel.onmessage = (event) => {
          this.notifySubscribers(event.data);
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel not supported:', e);
    }

    // Try IndexedDB first
    try {
      if ('indexedDB' in window) {
        this.db = await this.openIndexedDB();
        await this.ensureSeedDataIndexedDB();
        return;
      }
    } catch (e) {
      console.warn('IndexedDB initialization failed, falling back to LocalStorage:', e);
    }

    // Fallback to LocalStorage
    this.ensureSeedDataLocalStorage();
  }

  openIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('orders')) {
          db.createObjectStore('orders', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('coupons')) {
          db.createObjectStore('coupons', { keyPath: 'code' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async ensureSeedDataIndexedDB() {
    const productsCount = await this.countStore('products');
    if (productsCount === 0) {
      const tx = this.db.transaction(['products', 'categories', 'orders', 'coupons', 'settings'], 'readwrite');
      
      const pStore = tx.objectStore('products');
      DEFAULT_PRODUCTS.forEach(p => pStore.put(p));

      const cStore = tx.objectStore('categories');
      DEFAULT_CATEGORIES.forEach(c => cStore.put(c));

      const oStore = tx.objectStore('orders');
      DEFAULT_ORDERS.forEach(o => oStore.put(o));

      const cpStore = tx.objectStore('coupons');
      DEFAULT_COUPONS.forEach(cp => cpStore.put(cp));

      const sStore = tx.objectStore('settings');
      sStore.put({ key: 'appSettings', value: DEFAULT_SETTINGS });

      return new Promise((resolve) => {
        tx.oncomplete = () => resolve();
      });
    }
  }

  countStore(storeName) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  ensureSeedDataLocalStorage() {
    if (!localStorage.getItem('diwalisparks_products')) {
      localStorage.setItem('diwalisparks_products', JSON.stringify(DEFAULT_PRODUCTS));
    }
    if (!localStorage.getItem('diwalisparks_categories')) {
      localStorage.setItem('diwalisparks_categories', JSON.stringify(DEFAULT_CATEGORIES));
    }
    if (!localStorage.getItem('diwalisparks_orders')) {
      localStorage.setItem('diwalisparks_orders', JSON.stringify(DEFAULT_ORDERS));
    }
    if (!localStorage.getItem('diwalisparks_coupons')) {
      localStorage.setItem('diwalisparks_coupons', JSON.stringify(DEFAULT_COUPONS));
    }
    if (!localStorage.getItem('diwalisparks_settings')) {
      localStorage.setItem('diwalisparks_settings', JSON.stringify(DEFAULT_SETTINGS));
    }
  }

  // Reactive subscription
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers(data) {
    this.subscribers.forEach(cb => {
      try { cb(data); } catch (e) { console.error('Subscriber error:', e); }
    });
  }

  broadcast(type, payload) {
    const data = { type, payload, timestamp: Date.now() };
    this.notifySubscribers(data);
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(data);
      } catch (e) {
        console.warn('Broadcast failed:', e);
      }
    }
  }

  // --- PRODUCTS CRUD ---
  async getProducts() {
    await this.initPromise;
    if (this.db) {
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction('products', 'readonly');
        const req = tx.objectStore('products').getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    } else {
      return JSON.parse(localStorage.getItem('diwalisparks_products') || '[]');
    }
  }

  async getProductById(id) {
    const products = await this.getProducts();
    return products.find(p => p.id === id) || null;
  }

  async saveProduct(product) {
    await this.initPromise;
    if (!product.id) {
      product.id = 'CRK-' + Math.floor(100 + Math.random() * 900);
    }
    if (this.db) {
      await new Promise((resolve, reject) => {
        const tx = this.db.transaction('products', 'readwrite');
        const req = tx.objectStore('products').put(product);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } else {
      const products = await this.getProducts();
      const index = products.findIndex(p => p.id === product.id);
      if (index >= 0) products[index] = product;
      else products.unshift(product);
      localStorage.setItem('diwalisparks_products', JSON.stringify(products));
    }
    this.broadcast('PRODUCT_SAVED', product);
    return product;
  }

  async deleteProduct(id) {
    await this.initPromise;
    if (this.db) {
      await new Promise((resolve, reject) => {
        const tx = this.db.transaction('products', 'readwrite');
        const req = tx.objectStore('products').delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } else {
      let products = await this.getProducts();
      products = products.filter(p => p.id !== id);
      localStorage.setItem('diwalisparks_products', JSON.stringify(products));
    }
    this.broadcast('PRODUCT_DELETED', { id });
    return true;
  }

  // --- CATEGORIES CRUD ---
  async getCategories() {
    await this.initPromise;
    if (this.db) {
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction('categories', 'readonly');
        const req = tx.objectStore('categories').getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    } else {
      return JSON.parse(localStorage.getItem('diwalisparks_categories') || '[]');
    }
  }

  async saveCategory(category) {
    await this.initPromise;
    if (!category.id) {
      category.id = 'cat-' + (category.slug || Date.now());
    }
    if (this.db) {
      await new Promise((resolve, reject) => {
        const tx = this.db.transaction('categories', 'readwrite');
        const req = tx.objectStore('categories').put(category);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } else {
      const cats = await this.getCategories();
      const index = cats.findIndex(c => c.id === category.id);
      if (index >= 0) cats[index] = category;
      else cats.push(category);
      localStorage.setItem('diwalisparks_categories', JSON.stringify(cats));
    }
    this.broadcast('CATEGORY_SAVED', category);
    return category;
  }

  // --- ORDERS CRUD ---
  async getOrders() {
    await this.initPromise;
    if (this.db) {
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction('orders', 'readonly');
        const req = tx.objectStore('orders').getAll();
        req.onsuccess = () => {
          // Sort newest first
          const sorted = req.result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          resolve(sorted);
        };
        req.onerror = () => reject(req.error);
      });
    } else {
      const orders = JSON.parse(localStorage.getItem('diwalisparks_orders') || '[]');
      return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }

  async getOrderById(id) {
    const orders = await this.getOrders();
    return orders.find(o => o.id === id) || null;
  }

  async createOrder(orderData) {
    await this.initPromise;
    const newOrder = {
      id: 'ORD-2026-' + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toISOString(),
      orderStatus: 'Confirmed',
      trackingNumber: 'INDPOST-' + Math.floor(1000000 + Math.random() * 9000000),
      ...orderData
    };

    if (this.db) {
      await new Promise((resolve, reject) => {
        const tx = this.db.transaction('orders', 'readwrite');
        const req = tx.objectStore('orders').put(newOrder);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } else {
      const orders = await this.getOrders();
      orders.unshift(newOrder);
      localStorage.setItem('diwalisparks_orders', JSON.stringify(orders));
    }

    // Deduct stock for purchased items
    await this.deductProductStock(newOrder.items);

    this.broadcast('ORDER_CREATED', newOrder);
    return newOrder;
  }

  async deductProductStock(items) {
    if (!items || !items.length) return;
    for (const item of items) {
      const product = await this.getProductById(item.productId);
      if (product) {
        product.stock = Math.max(0, (product.stock || 0) - item.quantity);
        await this.saveProduct(product);
      }
    }
  }

  async updateOrderStatus(id, newStatus) {
    await this.initPromise;
    const order = await this.getOrderById(id);
    if (!order) throw new Error('Order not found');

    order.orderStatus = newStatus;
    if (newStatus === 'Delivered' && order.payment && order.payment.status !== 'Paid') {
      order.payment.status = 'Paid';
      order.payment.paidAt = new Date().toISOString();
    }

    if (this.db) {
      await new Promise((resolve, reject) => {
        const tx = this.db.transaction('orders', 'readwrite');
        const req = tx.objectStore('orders').put(order);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } else {
      const orders = await this.getOrders();
      const index = orders.findIndex(o => o.id === id);
      if (index >= 0) {
        orders[index] = order;
        localStorage.setItem('diwalisparks_orders', JSON.stringify(orders));
      }
    }

    this.broadcast('ORDER_STATUS_UPDATED', order);
    return order;
  }

  // --- COUPONS ---
  async getCoupon(code) {
    await this.initPromise;
    const normalized = (code || '').trim().toUpperCase();
    if (this.db) {
      return new Promise((resolve) => {
        const tx = this.db.transaction('coupons', 'readonly');
        const req = tx.objectStore('coupons').get(normalized);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } else {
      const coupons = JSON.parse(localStorage.getItem('diwalisparks_coupons') || '[]');
      return coupons.find(c => c.code === normalized) || null;
    }
  }

  // --- SETTINGS ---
  async getSettings() {
    await this.initPromise;
    if (this.db) {
      return new Promise((resolve) => {
        const tx = this.db.transaction('settings', 'readonly');
        const req = tx.objectStore('settings').get('appSettings');
        req.onsuccess = () => resolve(req.result ? req.result.value : DEFAULT_SETTINGS);
        req.onerror = () => resolve(DEFAULT_SETTINGS);
      });
    } else {
      const data = localStorage.getItem('diwalisparks_settings');
      return data ? JSON.parse(data) : DEFAULT_SETTINGS;
    }
  }

  async saveSettings(settings) {
    await this.initPromise;
    if (this.db) {
      await new Promise((resolve, reject) => {
        const tx = this.db.transaction('settings', 'readwrite');
        const req = tx.objectStore('settings').put({ key: 'appSettings', value: settings });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } else {
      localStorage.setItem('diwalisparks_settings', JSON.stringify(settings));
    }
    this.broadcast('SETTINGS_UPDATED', settings);
    return settings;
  }

  // --- RESET TO SEED DATA ---
  async resetDatabase() {
    await this.initPromise;
    if (this.db) {
      const tx = this.db.transaction(['products', 'categories', 'orders', 'coupons', 'settings'], 'readwrite');
      tx.objectStore('products').clear();
      tx.objectStore('categories').clear();
      tx.objectStore('orders').clear();
      tx.objectStore('coupons').clear();
      tx.objectStore('settings').clear();

      DEFAULT_PRODUCTS.forEach(p => tx.objectStore('products').put(p));
      DEFAULT_CATEGORIES.forEach(c => tx.objectStore('categories').put(c));
      DEFAULT_ORDERS.forEach(o => tx.objectStore('orders').put(o));
      DEFAULT_COUPONS.forEach(cp => tx.objectStore('coupons').put(cp));
      tx.objectStore('settings').put({ key: 'appSettings', value: DEFAULT_SETTINGS });

      await new Promise(res => { tx.oncomplete = res; });
    }
    localStorage.setItem('diwalisparks_products', JSON.stringify(DEFAULT_PRODUCTS));
    localStorage.setItem('diwalisparks_categories', JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem('diwalisparks_orders', JSON.stringify(DEFAULT_ORDERS));
    localStorage.setItem('diwalisparks_coupons', JSON.stringify(DEFAULT_COUPONS));
    localStorage.setItem('diwalisparks_settings', JSON.stringify(DEFAULT_SETTINGS));

    this.broadcast('DATABASE_RESET', {});
    return true;
  }
}

// Global Database Instance
window.crackerDB = new CrackerDatabase();
