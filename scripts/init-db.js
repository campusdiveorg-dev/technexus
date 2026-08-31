/**
 * scripts/init-db.js
 * Automatically connects to TiDB Serverless, provisions tables & inserts default commission rates.
 */
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load .env manually if dotenv isn't installed
function loadEnv() {
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
        const lines = fs.readFileSync(envPath, 'utf8').split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [k, ...v] = trimmed.split('=');
                if (k && v.length > 0) {
                    process.env[k.trim()] = v.join('=').trim();
                }
            }
        }
    }
}

loadEnv();

async function init() {
    console.log('Connecting to TiDB Serverless at:', process.env.TIDB_HOST);

    // Initial connection to create database if not present
    const connection = await mysql.createConnection({
        host: process.env.TIDB_HOST,
        port: parseInt(process.env.TIDB_PORT || '4000'),
        user: process.env.TIDB_USER,
        password: process.env.TIDB_PASSWORD,
        ssl: {
            minVersion: 'TLSv1.2',
            rejectUnauthorized: true
        }
    });

    console.log('✓ Successfully connected to TiDB cluster!');

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.TIDB_DATABASE || 'technexus'}\`;`);
    await connection.query(`USE \`${process.env.TIDB_DATABASE || 'technexus'}\`;`);
    console.log(`✓ Using database: ${process.env.TIDB_DATABASE || 'technexus'}`);

    // Create sellers table
    await connection.query(`
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
    `);
    console.log('✓ Table `sellers` verified/created.');

    // Create products table
    await connection.query(`
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
    `);
    console.log('✓ Table `products` verified/created.');

    // Create commission_rates table
    await connection.query(`
        CREATE TABLE IF NOT EXISTS commission_rates (
            category      VARCHAR(50)     PRIMARY KEY,
            rate          DECIMAL(5,4)    NOT NULL,
            label         VARCHAR(100),
            updated_at    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
    `);
    console.log('✓ Table `commission_rates` verified/created.');

    // Insert default commission rates
    await connection.query(`
        INSERT IGNORE INTO commission_rates (category, rate, label) VALUES
            ('Laptops',      0.12, 'Standard Laptop Rate'),
            ('Audio',        0.08, 'Audio & Acoustics'),
            ('Gaming',       0.15, 'Gaming Rigs & Displays'),
            ('Phones',       0.10, 'Smartphones'),
            ('Accessories',  0.08, 'Accessories & Peripherals'),
            ('Monitors',     0.10, 'Displays & Monitors'),
            ('Default',      0.10, 'Default fallback rate');
    `);
    console.log('✓ Default commission rates seeded.');

    // Create orders table
    await connection.query(`
        CREATE TABLE IF NOT EXISTS orders (
            id                  VARCHAR(30)  PRIMARY KEY,
            customer_name       VARCHAR(100),
            customer_email      VARCHAR(100),
            customer_phone      VARCHAR(20),
            shipping_address    TEXT,
            total_amount        DECIMAL(10,2),
            currency            VARCHAR(5)   DEFAULT 'KES',
            payment_method      VARCHAR(30),
            flw_transaction_id  VARCHAR(100),
            flw_tx_ref          VARCHAR(100),
            status              VARCHAR(20)  DEFAULT 'paid',
            created_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✓ Table `orders` verified/created.');

    // Create order_items table
    await connection.query(`
        CREATE TABLE IF NOT EXISTS order_items (
            id              INT             AUTO_INCREMENT PRIMARY KEY,
            order_id        VARCHAR(30)     NOT NULL,
            product_id      VARCHAR(50),
            seller_id       VARCHAR(36),
            product_name    VARCHAR(200)    NOT NULL,
            product_image   TEXT,
            seller_name     VARCHAR(100),
            quantity        INT             DEFAULT 1,
            unit_price      DECIMAL(10,2)   NOT NULL,
            total_price     DECIMAL(10,2)   NOT NULL,
            commission_rate DECIMAL(5,4)    NOT NULL,
            platform_fee    DECIMAL(10,2)   NOT NULL,
            seller_earning  DECIMAL(10,2)   NOT NULL,
            created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        );
    `);
    console.log('✓ Table `order_items` verified/created.');

    await connection.end();
    console.log('\n🎉 All TiDB database tables successfully initialized and ready for production!');
}

init().catch(err => {
    console.error('❌ Database initialization error:', err);
    process.exit(1);
});
