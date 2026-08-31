/**
 * GET /api/admin/summary
 * Platform-wide GMV, commission, and per-seller breakdown.
 * Requires: x-admin-pin header
 */
const { query, queryOne } = require('../../lib/db');
const { verifyAdminPin }  = require('../../lib/auth');
const { cors }            = require('../../lib/cors');

module.exports = async (req, res) => {
    if (cors(req, res)) return;
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const pin = req.headers['x-admin-pin'];
    if (!verifyAdminPin(pin)) {
        return res.status(401).json({ error: 'Invalid admin PIN' });
    }

    try {
        // Platform totals
        const platformTotals = await queryOne(`
            SELECT
                COUNT(DISTINCT o.id)                   AS total_orders,
                COUNT(DISTINCT oi.seller_id)           AS active_sellers,
                COALESCE(SUM(oi.total_price), 0)       AS total_gmv,
                COALESCE(SUM(oi.platform_fee), 0)      AS total_platform_revenue,
                COALESCE(SUM(oi.seller_earning), 0)    AS total_seller_payouts
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status = 'paid'
        `);

        // Per-seller breakdown
        const sellers = await query(`
            SELECT
                s.id, s.store_name, s.full_name, s.email, s.category, s.commission_rate,
                COUNT(DISTINCT oi.order_id)              AS orders_count,
                COALESCE(SUM(oi.total_price), 0)        AS gmv,
                COALESCE(SUM(oi.platform_fee), 0)       AS platform_fee_earned,
                COALESCE(SUM(oi.seller_earning), 0)     AS payout_due
            FROM sellers s
            LEFT JOIN order_items oi ON s.id = oi.seller_id
            LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'paid'
            GROUP BY s.id
            ORDER BY gmv DESC
        `);

        // Commission rates table
        const commissionRates = await query('SELECT * FROM commission_rates ORDER BY category');

        // Monthly platform revenue (last 6 months)
        const monthly = await query(`
            SELECT
                DATE_FORMAT(o.created_at, '%Y-%m')   AS month,
                COALESCE(SUM(oi.platform_fee), 0)    AS platform_revenue,
                COALESCE(SUM(oi.total_price), 0)     AS gmv
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status = 'paid'
              AND o.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(o.created_at, '%Y-%m')
            ORDER BY month ASC
        `);

        res.status(200).json({ platformTotals, sellers, commissionRates, monthly });
    } catch (err) {
        console.error('[GET /api/admin/summary]', err);
        res.status(500).json({ error: 'Failed to load admin summary', detail: err.message });
    }
};
