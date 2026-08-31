/**
 * GET /api/products
 * Returns all active seller-listed products from TiDB.
 * Frontend merges these with hardcoded catalog items.
 */
const { query } = require('../../lib/db');
const { cors }  = require('../../lib/cors');

module.exports = async (req, res) => {
    if (cors(req, res)) return;
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const products = await query(`
            SELECT
                p.id, p.name, p.category, p.price, p.commission_rate,
                p.description, p.image_url, p.specs, p.tag, p.stock,
                s.store_name AS seller_name, s.id AS seller_id
            FROM products p
            LEFT JOIN sellers s ON p.seller_id = s.id
            WHERE p.is_active = TRUE
            ORDER BY p.created_at DESC
        `);
        res.status(200).json({ products });
    } catch (err) {
        console.error('[GET /api/products]', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};
