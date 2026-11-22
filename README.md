# Krishn's Crackers 🪔

> **"Celebrate Every Moment!"** — Authentic Factory Direct Sivakasi Green Fireworks

A modern, mobile-responsive e-commerce platform and admin portal for crackers and fireworks. Built with Node.js, Express, MongoDB Atlas (Mongoose), vanilla HTML5/CSS3/ES6+ JavaScript, JWT authentication, and Razorpay test-payment integration.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Requirements](#requirements)
- [Installation and Setup](#installation-and-setup)
- [Configuration](#configuration)
- [Usage](#usage)
- [Demo Guide](#demo-guide)
- [Technical Workflow](#technical-workflow)
- [Database Architecture](#database-architecture)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Important Notes](#important-notes)
- [Information Not Provided](#information-not-provided)

---

## Overview

Krishn's Crackers consists of two parts:

- **Customer storefront** (`index.html`): browse products, manage a cart, check out, pay via Razorpay (test mode), and track orders.
- **Admin dashboard** (`admin.html`): JWT-protected portal for analytics, product CRUD, order lifecycle management, and store settings.

The server connects to a MongoDB Atlas database (`krishns_crackers`) through Mongoose and seeds default data on first run.

---

## Features

### 1. Brand Design and User Experience

- **Color palette:** Charcoal Black `#0a0d14`, Metallic Gold `#d4af37`, Festive Crimson Red `#e11d48`, Warm Ivory `#fffdfa`.
- **Cinematic loading screen:** golden sparkler Diwali emblem with a smooth fade-out.
- **Interactive canvas fireworks engine:**
  - Ambient glowing embers and bursts across the hero banner.
  - Firework explosions on click anywhere on the hero.
  - Grand-finale celebration with sound on successful order completion.
- **Synthesized sound effects:** generated with the Web Audio API (no external audio files); includes a Mute/Unmute toggle.
- **Festival countdown timer:** live Days/Hours/Minutes/Seconds countdown for promotional sales.
- **WhatsApp ordering and enquiry:** click-to-chat button with pre-filled, itemized cart details.

### 2. Product Catalogue and Shopping Cart

**16 cracker varieties** across these groups:

| Category | Product IDs |
|---|---|
| Sky Shots and multi-burst aerial cakes | CRK-101, CRK-107, CRK-109 |
| Long-burning electric and magic sparklers | CRK-102, CRK-111 |
| Tri-colour giant flower pots and anars | CRK-103, CRK-110, CRK-114 |
| Whistling and butterfly ground chakkars | CRK-104, CRK-113 |
| Sivakasi 1000 Wala and 5000 Wala garlands | CRK-105, CRK-112, CRK-115 |
| Maharaja family VIP gift hampers and kids combos | CRK-106, CRK-108, CRK-116 |

**Product attributes:** ID, name, category, price (₹ INR), MRP, 50% festive discount, stock units, pack quantity, sound/decibel rating, and CSIR-NEERI Green Cracker certification.

**Search, filter, and sort:** real-time search, category filter pills, price sorting, and stock indicators.

**Slide-over shopping cart:**

- Quantity stepper (+ / −), item removal, instant price calculation.
- Free-shipping progress meter (threshold: ₹999).
- Coupon engine: `DIWALI50` (50% off) and `FESTIVE20` (20% off).

**Multi-step checkout:** delivery address validation, payment gateway selection, and order review.

### 3. Secure Admin Dashboard (`admin.html`)

**Authentication**

- Passwords hashed with `bcryptjs` (10 salt rounds).
- Stateless JSON Web Tokens (`jsonwebtoken`) signed with `JWT_SECRET`.
- Protected API routes using Bearer token verification.
- No passwords or payment secrets exposed in frontend code.

**Metrics and analytics**

- Total revenue (₹), calculated only from verified paid orders in MongoDB.
- Total orders, active cracker varieties, and pending deliveries.
- Category distribution progress-bar chart.
- Recent orders feed.

**Product management (CRUD)**

- Add products with image URL preview, price calculations, and green-cracker toggle.
- Edit products with pre-filled inputs.
- Delete products with a confirmation prompt and a guaranteed valid JSON response.
- One-click In Stock / Out of Stock toggle.

**Order lifecycle management**

- View itemized order details, customer phone number, and delivery slip.
- Update status: Confirmed ➔ Processing ➔ Shipped ➔ Delivered ➔ Cancelled.
- Printable delivery slips and invoices.

**Store and gateway settings**

- Manage store name, tagline, customer helpline, support email, free-shipping threshold, and Razorpay Key ID.
- **Factory Database Reset:** one-click reset of inventory to default seed data in MongoDB (for testing).

### 4. Razorpay Test Payment Integration

- **Server-created orders:** `POST /api/payment/create-order` creates the Razorpay order payload.
- **Server-side signature verification:** `POST /api/payment/verify-payment` verifies HMAC SHA-256 signatures using `crypto.createHmac('sha256', secret)`.
- **Fraud prevention:** orders are marked *Paid* only after backend cryptographic verification, never on client messages alone.
- **Simulated test gateway:** checkout modal with UPI QR, test cards, NetBanking, and a *Simulate Bank Failure* toggle for error-handling tests.
- **Printable tax invoices:** itemized PDF/print receipt with Order ID, tracking number, items, and total.

---

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas, Mongoose
- **Frontend:** Vanilla HTML5, CSS3, ES6+ JavaScript
- **Authentication:** JWT (`jsonwebtoken`), `bcryptjs`
- **Payments:** Razorpay (test mode), Node `crypto` for HMAC verification

---

## Requirements

- **Node.js** v18 or higher (recommended)
- **npm**
- **Internet connection** (required to reach MongoDB Atlas)
- A **MongoDB Atlas** database and connection string

---

## Installation and Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables** — see [Configuration](#configuration). A template is provided in `.env.example`.

3. **Start the server**

   ```bash
   npm start
   ```

   For auto-reload during development:

   ```bash
   npm run dev
   ```

   On Windows, you can also double-click `start.bat`.

On startup the server automatically:

1. Connects to MongoDB Atlas (`krishns_crackers`).
2. Seeds the initial 16 cracker varieties, categories, settings, and orders if the database is empty.
3. Listens on `http://localhost:3000`.

---

## Configuration

Create a `.env` file in the project root (use `.env.example` as a template):

```env
PORT=3000
MONGODB_URI="mongodb+srv://<db_user>:<db_password>@<cluster-host>/krishns_crackers?retryWrites=true&w=majority"
JWT_SECRET=<your_long_random_jwt_secret>
ADMIN_EMAIL=<admin_email>
ADMIN_PASSWORD=<admin_password>
RAZORPAY_KEY_ID=<your_razorpay_test_key_id>
RAZORPAY_KEY_SECRET=<your_razorpay_test_key_secret>
```

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on (default in project: `3000`) |
| `MONGODB_URI` | MongoDB Atlas connection string (database: `krishns_crackers`) |
| `JWT_SECRET` | Secret used to sign admin JSON Web Tokens |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |
| `RAZORPAY_KEY_ID` | Razorpay (test) Key ID |
| `RAZORPAY_KEY_SECRET` | Secret used for Razorpay order creation and HMAC signature verification |

> ⚠️ **Never commit `.env` or real credentials to version control.** Add `.env` to `.gitignore`.

---

## Usage

| Interface | URL |
|---|---|
| Customer storefront | `http://localhost:3000/` |
| Admin portal | `http://localhost:3000/admin.html` |

**Admin login:** use the values of `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your `.env`, then click **Authenticate & Enter Dashboard**.

---

## Demo Guide

### Customer Storefront (`http://localhost:3000/`)

**Browse and search**

1. Browse the 16 cracker varieties.
2. Filter by category (e.g., Sky Shots, Sparklers).
3. Search in real time.
4. Click 👁️ **Quick Look** for product details.

**Cart and free shipping**

1. Click 🛒 **Add to Cart** on products.
2. Open the cart drawer (top right).
3. Watch the free-shipping progress meter toward ₹999.
4. Apply coupon `DIWALI50` for a 50% discount.

**Checkout and Razorpay test payment**

1. Click **Proceed to Checkout**.
2. Fill in delivery details and continue to Payment.
3. Choose **Razorpay Test Gateway**.
4. Click **Complete Payment Now**.
5. Enjoy the grand-finale fireworks and print the invoice.

**Order tracking**

1. Click **Track Order** in the navigation.
2. Enter an Order ID (e.g., `ORD-2026-8841`, or the ID of your placed order).
3. View live status: Confirmed ➔ Processing ➔ Shipped ➔ Delivered.

### Admin Portal (`http://localhost:3000/admin.html`)

| Area | Steps |
|---|---|
| **Dashboard** | View real-time revenue, order counts, product variety counts, and the category distribution chart. |
| **Cracker Inventory** | **Add:** click **+ Add New Cracker**, fill fields, **Save**. **Edit:** click ✏️, change details, save. **Toggle stock:** click **Mark Out of Stock / In Stock**. **Delete:** click 🗑️ and confirm. |
| **Customer Orders** | Change the order status dropdown (Confirmed ➔ Processing ➔ Shipped ➔ Delivered). Click 👁️ **Slip** to view the full invoice and customer address. |
| **Store Settings** | Edit store name, tagline, support helpline, or free-shipping threshold, then click **Save Store Settings**. |

---

## Technical Workflow

### Admin Authentication

1. Admin submits credentials to `/api/admin/login` (or `/api/auth/login`; both are supported).
2. Server verifies the bcrypt-hashed password and issues a JWT signed with `JWT_SECRET`.
3. The frontend sends the token as a Bearer token on protected requests; `middleware/auth.js` validates it.

### Payment Flow

1. Client requests order creation: `POST /api/payment/create-order` (server creates the Razorpay order payload).
2. Customer completes payment in the checkout modal (simulated test gateway).
3. Client submits payment details to `POST /api/payment/verify-payment`.
4. Server verifies the HMAC SHA-256 signature using `crypto.createHmac('sha256', secret)`.
5. Only after successful verification is the order marked **Paid**. Transactions are audited in the `payments` collection.

### API Endpoints Referenced

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/admin/login` | Admin login |
| `POST` | `/api/auth/login` | Admin login (alternate route) |
| `PATCH` | `/api/products/:id/stock` | Toggle stock status |
| `DELETE` | `/api/products/:id` | Delete product (returns HTTP 200 with JSON) |
| `PUT` / `PATCH` | `/api/orders/:id/status` | Update order status |
| `POST` | `/api/payment/create-order` | Create Razorpay order |
| `POST` | `/api/payment/verify-payment` | Verify payment signature |

---

## Database Architecture

The app connects to the MongoDB Atlas database `krishns_crackers` via Mongoose.

| Collection | Contents |
|---|---|
| `products` | Cracker varieties, descriptions, stock, sound levels, certifications, prices |
| `orders` | Shipping details, itemized cart, pricing breakdown, order status, tracking numbers |
| `categories` | Product categories with icons and descriptions |
| `settings` | Store configuration, free-shipping threshold, payment gateway keys |
| `payments` | Razorpay transaction IDs, status, currency, verification signatures |
| `users` | Hashed (bcrypt) administrative credentials |

---

## Project Structure

```text
Cracker E-Commerce Website/
├── server.js               # Express entry point & MongoDB Atlas connection
├── package.json            # Dependencies & scripts
├── .env                    # Environment variables (JWT secret, DB, Razorpay)
├── .env.example            # Environment configuration template
├── start.bat               # One-click Windows server launcher
├── test-api.js             # Automated API & database test suite (15 tests)
├── README.md               # Documentation
├── models/
│   ├── Product.js          # Product schema
│   ├── Category.js         # Category schema
│   ├── User.js             # User/Admin schema with bcrypt
│   ├── Order.js            # Order & item schema
│   └── Payment.js          # Payment transaction schema
├── routes/
│   ├── productRoutes.js    # Product CRUD & filter APIs
│   ├── orderRoutes.js      # Order processing & tracking APIs
│   ├── paymentRoutes.js    # Razorpay order & HMAC verification
│   └── adminRoutes.js      # Admin login & dashboard stats APIs
├── middleware/
│   └── auth.js             # JWT Bearer token guard
├── css/
│   ├── style.css           # Storefront stylesheet
│   └── admin.css           # Admin dashboard stylesheet
├── js/
│   ├── fireworks.js        # Canvas particle engine & audio synthesizer
│   ├── admin.js            # Admin client with safe JSON parser & JWT auth
│   └── app.js              # Standalone storefront engine
├── images/                 # Cracker photography assets
│   ├── royal-symphony-120-shots.png
│   ├── 1000-wala-red-giant-garland.png
│   ├── 30-shots-golden-waterfall.png
│   ├── 50cm-golden-electric-sparklers.png
│   ├── deluxe-whistling-chakkars.png
│   ├── eco-green-kids-combo.png
│   ├── maharaja-royal-family-hamper.png
│   └── special-tri-colour-anar.png
├── index.html              # Customer storefront (hero, cart, checkout, tracking)
└── admin.html              # Admin dashboard (KPIs, CRUD, orders)
```

---

## Troubleshooting

### `SyntaxError: Unexpected end of JSON input` (Admin Portal)

**Root causes (resolved)**

1. **API route mismatch:** `js/admin.js` sent login requests to `/api/admin/login`, while `server.js` initially listened only on `/api/auth/login`. The failed login fell back to a mock token, causing later authenticated requests to fail.
2. **HTTP method and parameter inconsistencies:** the frontend called `PATCH /api/products/:id/stock` and `PATCH /api/orders/:id/status` with `{ status }`, but the backend lacked the stock-toggle endpoint and expected `PUT` with `{ orderStatus }`.
3. **Empty or non-JSON responses:** when an unhandled route or fallback server returned an empty or non-JSON body, `await res.json()` threw the error.

**Implemented fixes**

- **Unified backend:** `server.js` uses Mongoose models connected to MongoDB Atlas (`krishns_crackers`).
- **Dual-route compatibility:** both `/api/admin/login` and `/api/auth/login` are supported; order status updates accept both `PUT` and `PATCH`; the `PATCH /api/products/:id/stock` route was added.
- **Always-valid JSON responses:** every endpoint, including `DELETE /api/products/:id`, returns HTTP 200 with structured JSON:

  ```js
  res.status(200).json({ success: true, message: 'Cracker product deleted successfully', data: clean(deleted) });
  ```

- **Resilient client parser:** a `safeJson(res)` utility in `js/admin.js` handles empty or non-JSON responses without throwing unhandled exceptions.

### Other checks

- **Cannot connect to the database:** confirm you have internet access and that `MONGODB_URI` in `.env` is correct.
- **Admin login fails:** confirm `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`.

---

## Important Notes

- **Test mode only:** payments use Razorpay test credentials and a simulated gateway. Revenue is counted only from orders verified as paid on the backend.
- **Secrets:** keep `.env` out of version control. Use unique, strong values for `JWT_SECRET`, `ADMIN_PASSWORD`, `RAZORPAY_KEY_SECRET`, and the database password. Rotate any credential that has been exposed.
- **Database reset:** the admin *Factory Database Reset* restores default seed inventory in MongoDB; use it for testing only.
- **Seeding:** initial data is seeded only when the database is empty.

---

## Information Not Provided

The source text did not include the following; add them if applicable:

- **License** and repository URL
- **Contribution guidelines**
- **Command to run `test-api.js`** (the suite is described as 15 tests, but no run command was given)
- **Full dependency list** (only `bcryptjs`, `jsonwebtoken`, Mongoose, Express, and Node `crypto` are referenced; see `package.json`)
- **Full API reference** (request/response schemas, and routes for orders, tracking, and dashboard stats)
- **Image assets:** 8 image files are listed for 16 products; clarify whether other images are hosted elsewhere
- **Order status update payload:** the text says the backend expected `{ orderStatus }` while the frontend sent `{ status }`; confirm which body fields are accepted
 
