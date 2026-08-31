/**
 * GET /api/sellers/dashboard
 * Returns this seller's sales, commission breakdown, and monthly chart data.
 * Requires: Authorization: Bearer <JWT>
 */
const { query, queryOne } = require('../../lib/db');
const { requireAuth }     = require('../../lib/auth');
const { cors }            = require('../../lib/cors');

module.exports = async (req, res) => {
    if (cors(req, res)) return;
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const seller = requireAuth(req, res);
    if (!seller) return;

    const sellerId = seller.sub;

    try {
        // Overview totals
        const totals = await queryOne(`
            SELECT
                COUNT(DISTINCT oi.order_id)       AS total_orders,
                COALESCE(SUM(oi.total_price), 0)  AS gross_sales,
                COALESCE(SUM(oi.platform_fee), 0) AS total_commission_paid,
                COALESCE(SUM(oi.seller_earning), 0) AS net_earnings
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE oi.seller_id = ? AND o.status = 'paid'
        `, [sellerId]);

        // Order history
        const orders = await query(`
            SELECT
                o.id          AS order_id,
                o.created_at,
                o.payment_method,
                oi.product_name,
                oi.quantity,
                oi.unit_price,
                oi.total_price,
                oi.commission_rate,
                oi.platform_fee,
                oi.seller_earning
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE oi.seller_id = ? AND o.status = 'paid'
            ORDER BY o.created_at DESC
            LIMIT 100
        `, [sellerId]);

        // Monthly earnings (last 6 months)
        const monthly = await query(`
            SELECT
                DATE_FORMAT(o.created_at, '%Y-%m') AS month,
                COALESCE(SUM(oi.seller_earning), 0) AS earnings,
                COALESCE(SUM(oi.platform_fee), 0)   AS fees
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE oi.seller_id = ?
              AND o.status = 'paid'
              AND o.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(o.created_at, '%Y-%m')
            ORDER BY month ASC
        `, [sellerId]);

        // Seller's listed products
        const products = await query(`
            SELECT id, name, category, price, commission_rate, image_url, stock, is_active, created_at
            FROM products
            WHERE seller_id = ?
            ORDER BY created_at DESC
        `, [sellerId]);

        res.status(200).json({ totals, orders, monthly, products });
    } catch (err) {
        console.error('[GET /api/sellers/dashboard]', err);
        res.status(500).json({ error: 'Failed to load dashboard', detail: err.message });
    }
};
