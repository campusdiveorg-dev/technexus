# ⚡ TechNexus Marketplace (Kenya Edition)

A high-performance, full-stack multi-vendor electronics & hardware marketplace built specifically for the Kenyan ecosystem with **Kenyan Shilling (KES / KSh)** pricing, **Flutterwave (M-Pesa, Airtel Money, Visa/Mastercard)** payment processing, **TiDB Serverless (MySQL)** relational storage, and **Cloudinary** media CDN.

---

## 🌟 Key Architecture & Features

### 🛍️ Customer Storefront & Checkout
- **Modern Industrial Design**: Midnight & Electric Blue theme (`#0058bc`, `#00D1FF`, `#0A192F`, `#F8FAFC`).
- **Product Catalog (`catalog.html`)**: Dynamic category filter, real-time KSh price slider (up to KSh 350,000), search bar, and rating filters.
- **Product Detail (`product.html`)**: Hardware configurator (RAM/SSD upgrades in KES), stock indicators, and instant cart integration.
- **Dynamic Cart (`cart.html`)**: Cart quantity controls, voucher system (`TECH2026` for 10% off), 16% Kenyan VAT computation, and clear cart actions.
- **Kenyan Payment Flow (`js/checkout.js`)**: 2-step checkout modal with customer contact details and Flutterwave payment modal supporting **M-Pesa**, **Airtel Money**, and **Cards**.
- **Tax Receipt & Invoice (`receipt.html`)**: Branded tax invoice with itemized line items, VAT breakdown, transaction reference, and 1-click **jsPDF client-side PDF download**.

### 💼 Partner Seller Ecosystem (`seller-register.html` & `seller-dashboard.html`)
- **Discrete Registration**: Hidden from search engine crawlers via `robots.txt`.
- **Cloudinary Integration**: Direct-to-cloud logo and hardware photography uploads.
- **Merchant Dashboard**:
  - Live Overview: Total orders, Gross Sales (KSh), Platform Commission Paid (KSh), and Net Earnings (KSh).
  - Chart.js interactive earnings vs. platform fee analytics.
  - Live order fulfillment and commission table.
  - "List Hardware" publisher form with category selection and Cloudinary image upload.
  - 1-Click PDF Commission Statement generator.

### 🛡️ Master Admin Control Center (`admin.html`)
- **PIN Protection**: Gated with Master PIN (`TN2026`).
- **Platform Financials**: Gross Merchandise Value (GMV), Total Platform Revenue, and Seller Payout Due in KSh.
- **Variable Commission Matrix**: Live inline adjustment of commission rates per category (Laptops: 12%, Audio: 8%, Gaming: 15%, Phones: 10%, Monitors: 10%, Accessories: 8%).
- **Financial Audit & CSV Export**: 1-click master order log and payout summary export to CSV.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Semantic HTML5, Vanilla CSS Design System, Vanilla JavaScript ES6+ |
| **Icons & Fonts** | Google Fonts (*Plus Jakarta Sans*, *JetBrains Mono*), Google Material Symbols |
| **Visuals & Charts** | Chart.js 4.4, jsPDF 2.5 |
| **Backend & Hosting** | Node.js Serverless Functions deployed on **Vercel** (`/api/*`) |
| **Database** | **TiDB Serverless** (Distributed ACID MySQL 8.0 compatible) with SSL |
| **Payments** | **Flutterwave Standard SDK** (KES: M-Pesa, Airtel Money, Card) |
| **Media Hosting** | **Cloudinary CDN** with Upload Widget |

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone <your-repo-url>
cd marketplace_project
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

```env
# TiDB Serverless Connection
TIDB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=<your-tidb-user>
TIDB_PASSWORD=<your-tidb-password>
TIDB_DATABASE=technexus

# Payment Gateway (Flutterwave)
FLW_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxxxxxxxxxxxxxx
FLW_SECRET_KEY=FLWSECK_TEST-xxxxxxxxxxxxxxxxxxxx
FLW_ENCRYPTION_KEY=FLWSECK_TEST_ENVxxxxxxxx

# Cloudinary (Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_UPLOAD_PRESET=technexus_uploads

# Security & Admin PIN
JWT_SECRET=super_secret_jwt_key_2026
ADMIN_PIN=TN2026
```

### 3. Initialize Database Schema
Import `db/schema.sql` into your TiDB Serverless SQL editor or via mysql CLI:
```bash
mysql -h $TIDB_HOST -P $TIDB_PORT -u $TIDB_USER -p $TIDB_DATABASE < db/schema.sql
```

### 4. Run Locally
You can run a local test server using Python or Vercel CLI:
```bash
# Option A: Static preview (utilizes offline/local fallback data seamlessly)
python -m http.server 3000

# Option B: Full serverless runtime (with local Vercel CLI)
npm i -g vercel
vercel dev
```

---

## 🚢 Deploying to Vercel

1. Push this project to GitHub / GitLab.
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New Project"**.
3. Import your repository.
4. Under **Environment Variables**, add the keys from your `.env`:
   - `TIDB_HOST`, `TIDB_PORT`, `TIDB_USER`, `TIDB_PASSWORD`, `TIDB_DATABASE`
   - `FLW_PUBLIC_KEY`, `FLW_SECRET_KEY`, `FLW_ENCRYPTION_KEY`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_UPLOAD_PRESET`
   - `JWT_SECRET`, `ADMIN_PIN`
5. Click **Deploy**. Vercel will build the frontend and serve all API endpoints in `api/` automatically according to `vercel.json`.

---

## 🔒 Security & Privacy

- **Hidden Portals**: Seller registration (`seller-register.html`), Seller dashboard (`seller-dashboard.html`), and Admin panel (`admin.html`) are marked `Disallow` in `robots.txt`.
- **JWT Authentication**: Seller dashboards verify cryptographic JWT tokens on all requests.
- **Admin PIN**: Default master PIN is `TN2026`. Change this in your Vercel Environment Variables before production.
- **ACID Transactions**: Order placements lock and register commission records atomically.

---

## 📄 License
© 2026 TechNexus Hardware Corp. All rights reserved.
