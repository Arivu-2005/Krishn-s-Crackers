# 🎆 Krishn’s Crackers - Premium E-Commerce Website & Admin Portal 🪔
> **“Celebrate Every Moment!”** — Authentic Factory Direct Sivakasi Green Fireworks

An enterprise-grade, modern, and mobile-responsive e-commerce platform for crackers and fireworks built with **Node.js, Express, MongoDB Atlas Cloud Database, Mongoose, Vanilla HTML5/CSS3/ES6+ JavaScript, JWT Authentication, and Razorpay Test Payment Gateway Integration**.

---

## 🌟 Executive Feature Overview

### 1. 🎨 Premium Brand Aesthetics & UI/UX
- **Color Palette**: Charcoal Black (`#0a0d14`), Metallic Gold (`#d4af37`), Festive Crimson Red (`#e11d48`), and Warm Ivory (`#fffdfa`).
- **Cinematic Loading Screen**: Atmospheric golden sparkler diwali emblem with smooth fade-out transition.
- **Interactive Canvas Fireworks Engine**:
  - Ambient glowing embers and bursts across the hero banner.
  - Interactive firework explosions upon clicking anywhere on the hero.
  - **Celebration Grand Finale** with sound upon successful order completion.
  - **Synthesized Web Audio API Sound Effects** (realistic cracker sound with zero external audio file dependencies; toggleable Mute/Unmute button).
- **Festival Countdown Timer**: Live ticking countdown (Days, Hours, Minutes, Seconds) for promotional sale urgencies.
- **Direct WhatsApp Order & Enquiry**: Click-to-chat WhatsApp button with pre-filled itemized cart details.

### 2. 📦 Product Catalogue & Shopping Cart
- **16 Complete Cracker Varieties with Real Imagery**:
  - Sky Shots & Multi-Burst Aerial Cakes (`CRK-101`, `CRK-107`, `CRK-109`)
  - Long-Burning Electric & Magic Sparklers (`CRK-102`, `CRK-111`)
  - Tri-Colour Giant Flower Pots & Anars (`CRK-103`, `CRK-110`, `CRK-114`)
  - Whistling & Butterfly Ground Chakkars (`CRK-104`, `CRK-113`)
  - Sivakasi 1000 Wala & 5000 Wala Garlands (`CRK-105`, `CRK-112`, `CRK-115`)
  - Maharaja Family VIP Gift Hampers & Kids Combos (`CRK-106`, `CRK-108`, `CRK-116`)
- **Product Attributes**: ID, Name, Category, Price in ₹ (INR), MRP, 50% Festive Discount, Stock Units, Pack Quantity, Sound & Decibel rating, CSIR-NEERI Green Cracker certification.
- **Search, Filters & Sorting**: Instant real-time search, category filter pills, price sorting, and stock indicators.
- **Slide-over Shopping Cart**:
  - Quantity stepper (`+` / `-`), remove items, instant price calculation.
  - **Free Express Shipping Progress Meter** (Progress towards ₹999 free shipping threshold).
  - **Coupon Engine**: Validates `DIWALI50` (50% OFF) and `FESTIVE20` (20% OFF).
  - **Multi-Step Checkout Flow**: Delivery address validation, payment gateway selection, and order review.

### 3. 🛡️ Secure Admin Dashboard (`admin.html`)
- **Server-Side Authentication**:
  - Password hashing via `bcryptjs` (salt rounds: 10).
  - Stateless JSON Web Tokens (`jsonwebtoken`) signed with `JWT_SECRET`.
  - Protected API routes using Bearer token verification.
  - Never exposes passwords or payment secrets in frontend code.
- **Key Metrics & Real-time Analytics**:
  - Total Revenue (₹) calculated exclusively from verified paid orders in MongoDB.
  - Total Orders, Active Cracker Varieties, and Pending Deliveries.
  - Dynamic Category Distribution Progress Bar Chart.
  - Recent Orders Feed.
- **Product CRUD Management**:
  - Add new cracker product with image URL preview, price calculations, and green cracker toggle.
  - Edit existing products with pre-filled inputs.
  - Delete products with safety confirmation and guaranteed clean JSON response.
  - Quick 1-click **In Stock / Out of Stock** toggle switch.
- **Order Lifecycle Management**:
  - View full itemized order details, customer phone number, and delivery slip.
  - Update order status (*Confirmed* ➔ *Processing* ➔ *Shipped* ➔ *Delivered* ➔ *Cancelled*).
  - Printable delivery slips and invoices.
- **Store & Gateway Settings**:
  - Manage store brand name, tagline, customer helpline, support email, free shipping threshold, and Razorpay Key ID.
- **Factory Database Reset**: 1-click button to reset inventory back to default seed data in MongoDB for testing.

### 4. 💳 Razorpay Test Payment Integration
- **Server-Created Orders**: `POST /api/payment/create-order` creates official Razorpay order payload.
- **Server-Side Signature Verification**: `POST /api/payment/verify-payment` verifies HMAC SHA-256 signatures using `crypto.createHmac('sha256', secret)`.
- **Idempotency & Fraud Prevention**: Orders are marked *Paid* only after cryptographic backend verification, never based on client messages alone.
- **Simulated Test Gateway**: Interactive checkout modal with UPI QR, Test Cards, NetBanking, and a **Simulate Bank Failure** toggle to test error handling!
- **Printable Tax Invoices**: Generates itemized PDF/print receipt with Order ID, tracking number, items, and total amount.

---

## 🗄️ Database Architecture & MongoDB Atlas Integration

The application connects directly to **MongoDB Atlas Cloud Database** (`krishns_crackers`) via Mongoose using the connection string configured in `.env`.

### MongoDB Collections:
1. **`products`**: Stores cracker varieties, descriptions, stock, sound levels, certifications, and prices.
2. **`orders`**: Stores customer shipping details, itemized cart, pricing breakdown, order status, and tracking numbers.
3. **`categories`**: Stores product categories with icons and descriptions.
4. **`settings`**: Stores store configuration, free shipping threshold, and payment gateway keys.
5. **`payments`**: Audits Razorpay transaction IDs, status, currency, and verification signatures.
6. **`users`**: Securely stores hashed administrative credentials using bcrypt.

---

## 🚀 Setup & Execution Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- Internet connection (for MongoDB Atlas cloud database connection)

### 1. Installation
```bash
npm install
```

### 2. Configure Environment (`.env`)
The `.env` file is already pre-configured with MongoDB Atlas credentials:
```env
PORT=3000
MONGODB_URI="mongodb+srv://arivazhaganmani78_db_user:TjwyDVYL3Ql4Tw45@krishnscrackers.6rudo57.mongodb.net/krishns_crackers?retryWrites=true&w=majority"
JWT_SECRET=krishns_crackers_super_secure_jwt_secret_key_2026_festive
ADMIN_EMAIL=admin@krishnscrackers.com
ADMIN_PASSWORD=admin123
RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
RAZORPAY_KEY_SECRET=krishns_rzp_secret_test_2026
```

### 3. Start the Server
Run the start command or double-click `start.bat`:
```bash
npm start
```
Or with auto-reload:
```bash
npm run dev
```

The server will automatically:
- Connect to MongoDB Atlas (`krishns_crackers`)
- Seed the initial 16 cracker varieties, categories, settings, and orders if empty
- Start listening on `http://localhost:3000`

---

## 📋 Step-by-Step Demo Guide

| Action | Where | Demo Steps & Credentials |
|---|---|---|
| **Customer Storefront** | `http://localhost:3000/` | 1. Browse 16 cracker varieties.<br>2. Filter by category (e.g. *Sky Shots*, *Sparklers*).<br>3. Search for crackers in real-time.<br>4. Click **👁️ Quick Look** for details. |
| **Cart & Free Shipping** | Storefront | 1. Click **🛒 Add to Cart** on products.<br>2. Open Cart drawer (top right).<br>3. Observe the free shipping progress meter towards ₹999.<br>4. Apply coupon code `DIWALI50` for 50% discount. |
| **Checkout & Razorpay** | Storefront Checkout | 1. Click **Proceed to Checkout**.<br>2. Fill delivery details and continue to Payment.<br>3. Choose **Razorpay Test Gateway**.<br>4. Click **Complete Payment Now**.<br>5. Celebrate with grand finale fireworks and print invoice! |
| **Order Tracking** | Storefront | 1. Click **Track Order** in navigation.<br>2. Enter Order ID (e.g. `ORD-2026-8841` or your placed order ID).<br>3. View live status: Confirmed ➔ Processing ➔ Shipped ➔ Delivered. |
| **Admin Login** | `http://localhost:3000/admin.html` | **Email:** `admin@krishnscrackers.com`<br>**Password:** `admin123`<br>Click **Authenticate & Enter Dashboard**. |
| **Admin Dashboard** | Admin Portal ➔ Dashboard | View real-time revenue, order counts, product catalog variety counts, and category distribution bar chart. |
| **Product CRUD** | Admin Portal ➔ Cracker Inventory | 1. **Add Product:** Click **+ Add New Cracker**, fill fields, click Save.<br>2. **Edit Product:** Click ✏️ icon, change price or details, save.<br>3. **Toggle Stock:** Click 1-click **Mark Out of Stock / In Stock** button.<br>4. **Delete Product:** Click 🗑️ icon and confirm. Deletion is instantaneous and guaranteed error-free. |
| **Order Management** | Admin Portal ➔ Customer Orders | 1. Change order status dropdown (*Confirmed* ➔ *Processing* ➔ *Shipped* ➔ *Delivered*).<br>2. Click **👁️ Slip** to view full order invoice and customer address. |
| **Store Settings** | Admin Portal ➔ Store Settings | Edit store name, tagline, support helpline, or free shipping threshold and click **Save Store Settings**. |

---

## 📁 Directory Structure
```
Cracker E-Commerce Website/
├── server.js               # Express application entry point & MongoDB Atlas connection
├── package.json            # Node.js dependencies & scripts
├── .env                    # Environment variables (JWT secret, DB, Razorpay)
├── .env.example            # Environment configuration template
├── start.bat               # 1-Click Windows Server launcher
├── test-api.js             # Automated API & Database test suite (15 tests)
├── README.md               # Documentation & technical manual
├── models/
│   ├── Product.js          # Mongoose Product schema
│   ├── Category.js         # Mongoose Category schema
│   ├── User.js             # Mongoose User/Admin schema with bcrypt
│   ├── Order.js            # Mongoose Order & Item schema
│   └── Payment.js          # Mongoose Payment transaction schema
├── routes/
│   ├── productRoutes.js    # Product CRUD & filter APIs
│   ├── orderRoutes.js      # Order processing & tracking APIs
│   ├── paymentRoutes.js    # Razorpay order & HMAC verification
│   └── adminRoutes.js      # Admin login & dashboard stats APIs
├── middleware/
│   └── auth.js             # JWT Bearer token authentication guard
├── css/
│   ├── style.css           # Storefront stylesheet (charcoal, gold, red, responsive)
│   └── admin.css           # Admin dashboard stylesheet (executive dark UI)
├── js/
│   ├── fireworks.js        # HTML5 Canvas particle engine & audio synthesizer
│   ├── admin.js            # Admin portal frontend client with safe JSON parser & JWT auth
│   └── app.js              # Standalone storefront engine
├── images/                 # High-resolution cracker photography assets
│   ├── royal-symphony-120-shots.png
│   ├── 1000-wala-red-giant-garland.png
│   ├── 30-shots-golden-waterfall.png
│   ├── 50cm-golden-electric-sparklers.png
│   ├── deluxe-whistling-chakkars.png
│   ├── eco-green-kids-combo.png
│   ├── maharaja-royal-family-hamper.png
│   └── special-tri-colour-anar.png
├── index.html              # Customer Storefront (Hero, Cart, Checkout, Tracking)
└── admin.html              # Executive Admin Dashboard (KPIs, CRUD, Orders)
```

---

## 🛠️ Root Cause & Technical Fix for "Unexpected end of JSON input"

### Root Cause
1. **API Route Mismatch:** The admin frontend in `js/admin.js` was sending login requests to `/api/admin/login`, whereas `server.js` was initially only listening on `/api/auth/login`. When login failed, the frontend defaulted to a fallback mock token, which caused subsequent authenticated requests to fail.
2. **HTTP Method & Parameter Inconsistencies:** The frontend called `PATCH /api/products/:id/stock` and `PATCH /api/orders/:id/status` with `{ status }`, while the backend was missing the stock toggle endpoint and expected `PUT` with `{ orderStatus }`.
3. **Empty / Non-JSON Response Handling:** When an unhandled route or fallback HTTP server returned an empty body or non-JSON content, the client-side `const data = await res.json();` threw `SyntaxError: Unexpected end of JSON input`.

### Implemented Fix
1. **Unified Backend Architecture:** Configured `server.js` with comprehensive MongoDB Mongoose models connected to MongoDB Atlas (`krishns_crackers`).
2. **Dual-Route Compatibility:** Supported both `/api/admin/login` and `/api/auth/login`, accepting both `PUT` and `PATCH` for order status updates, and added the dedicated `PATCH /api/products/:id/stock` route.
3. **Always-Valid JSON Responses:** Every endpoint (including `DELETE /api/products/:id`) explicitly returns HTTP 200 with structured JSON:
   ```javascript
   res.status(200).json({ success: true, message: 'Cracker product deleted successfully', data: clean(deleted) });
   ```
4. **Resilient Client Parser:** Integrated a `safeJson(res)` utility in `js/admin.js` that checks for empty responses or non-JSON payloads, gracefully handling all server responses without throwing unhandled exceptions.
