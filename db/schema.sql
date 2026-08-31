-- TechNexus Marketplace — TiDB Schema
-- Run this once against your TiDB Serverless cluster
-- Compatible with MySQL 8.0+

CREATE DATABASE IF NOT EXISTS technexus;
USE technexus;

-- ─────────────────────────────────────────────
-- SELLERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sellers (
    id            VARCHAR(36)     PRIMARY KEY DEFAULT (UUID()),
    store_name    VARCHAR(100)    NOT NULL,
    full_name     VARCHAR(100)    NOT NULL,
    email         VARCHAR(100)    UNIQUE NOT NULL,
    password_hash VARCHAR(255)    NOT NULL,
    phone         VARCHAR(20),
    category      VARCHAR(50),
    commission_rate DECIMAL(5,4)  NOT NULL DEFAULT 0.12,
    logo_url      TEXT,
    is_active     BOOLEAN         DEFAULT TRUE,
    created_at    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- PRODUCTS (seller-listed items)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id            VARCHAR(50)     PRIMARY KEY,
    seller_id     VARCHAR(36)     REFERENCES sellers(id),
    name          VARCHAR(200)    NOT NULL,
    category      VARCHAR(50),
    price         DECIMAL(10,2)   NOT NULL,
    commission_rate DECIMAL(5,4)  NOT NULL,
    description   TEXT,
    image_url     TEXT,
    specs         VARCHAR(255),
    tag           VARCHAR(30),
    stock         INT             DEFAULT 100,
    is_active     BOOLEAN         DEFAULT TRUE,
    created_at    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- COMMISSION RATES (per category — editable by admin)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS commission_rates (
    category      VARCHAR(50)     PRIMARY KEY,
    rate          DECIMAL(5,4)    NOT NULL,
    label         VARCHAR(100),
    updated_at    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Default commission rates by category
INSERT IGNORE INTO commission_rates (category, rate, label) VALUES
    ('Laptops',      0.12, 'Standard Laptop Rate'),
    ('Audio',        0.08, 'Audio & Accessories'),
    ('Gaming',       0.15, 'Gaming Hardware'),
    ('Phones',       0.10, 'Smartphones'),
    ('Accessories',  0.08, 'Accessories & Peripherals'),
    ('Monitors',     0.10, 'Displays & Monitors'),
    ('Default',      0.10, 'Default fallback rate');

-- ─────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id                  VARCHAR(30)  PRIMARY KEY,  -- e.g. TN-20260901-A1B2
    customer_name       VARCHAR(100),
    customer_email      VARCHAR(100),
    customer_phone      VARCHAR(20),
    shipping_address    TEXT,
    total_amount        DECIMAL(10,2),
    currency            VARCHAR(5)   DEFAULT 'KES',
    payment_method      VARCHAR(30),               -- mpesa / airtel / card / bank
    flw_transaction_id  VARCHAR(100),
    flw_tx_ref          VARCHAR(100),
    status              VARCHAR(20)  DEFAULT 'pending', -- pending / paid / failed
    created_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- ORDER ITEMS (line items with commission breakdown)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
    id              INT             AUTO_INCREMENT PRIMARY KEY,
    order_id        VARCHAR(30)     NOT NULL,
    product_id      VARCHAR(50),
    seller_id       VARCHAR(36),
    product_name    VARCHAR(200)    NOT NULL,
    product_image   TEXT,
    seller_name     VARCHAR(100),
    quantity        INT             NOT NULL,
    unit_price      DECIMAL(10,2)   NOT NULL,
    total_price     DECIMAL(10,2)   NOT NULL,
    commission_rate DECIMAL(5,4)    NOT NULL,
    platform_fee    DECIMAL(10,2)   NOT NULL,   -- total_price * commission_rate
    seller_earning  DECIMAL(10,2)   NOT NULL,   -- total_price * (1 - commission_rate)
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- INDEXES for performance
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_orders_email     ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status    ON orders(status);
CREATE INDEX IF NOT EXISTS idx_items_order      ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_items_seller     ON order_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_seller  ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
