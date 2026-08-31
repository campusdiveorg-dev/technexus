/**
 * POST /api/sellers/products
 * Seller adds a new product listing (with Cloudinary image URL).
 * Requires: Authorization: Bearer <JWT>
 * Body: { name, category, price, description, image_url, specs, tag, stock }
 */
const { query, queryOne } = require('../../lib/db');
const { requireAuth }     = require('../../lib/auth');
const { cors }            = require('../../lib/cors');

module.exports = async (req, res) => {
    if (cors(req, res)) return;
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const seller = requireAuth(req, res);
    if (!seller) return;

    const { name, category, price, description, image_url, specs, tag, stock } = req.body || {};
    if (!name || !price || !image_url) {
        return res.status(400).json({ error: 'name, price, and image_url are required' });
    }

    try {
        // Look up commission rate for the category (or use seller's default)
        let commissionRate = seller.commissionRate || 0.10;
        if (category) {
            const catRate = await queryOne(
                'SELECT rate FROM commission_rates WHERE category = ?', [category]
            );
            if (catRate) commissionRate = catRate.rate;
        }

        const productId = `prd-${seller.sub.slice(-6)}-${Date.now()}`;

        await query(`
            INSERT INTO products (id, seller_id, name, category, price, commission_rate, description, image_url, specs, tag, stock)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            productId, seller.sub, name, category || 'Accessories',
            parseFloat(price), commissionRate, description || '',
            image_url, specs || '', tag || 'NEW', parseInt(stock) || 100
        ]);

        res.status(201).json({
            message: 'Product listed successfully',
            product: { id: productId, name, category, price, commission_rate: commissionRate }
        });
    } catch (err) {
        console.error('[POST /api/sellers/products]', err);
        res.status(500).json({ error: 'Failed to add product', detail: err.message });
    }
};
