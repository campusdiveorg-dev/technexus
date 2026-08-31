/**
 * GET /api/admin/orders
 * All orders with full commission breakdown for admin view.
 * Requires: x-admin-pin header
 */
const { query }          = require('../../lib/db');
const { verifyAdminPin } = require('../../lib/auth');
const { cors }           = require('../../lib/cors');

module.exports = async (req, res) => {
    if (cors(req, res)) return;
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const pin = req.headers['x-admin-pin'];
    if (!verifyAdminPin(pin)) {
        return res.status(401).json({ error: 'Invalid admin PIN' });
    }

    try {
        const orders = await query(`
            SELECT
                o.id, o.customer_name, o.customer_email, o.customer_phone,
                o.total_amount, o.currency, o.payment_method,
                o.flw_transaction_id, o.status, o.created_at,
                oi.product_name, oi.seller_name, oi.quantity,
                oi.unit_price, oi.total_price, oi.commission_rate,
                oi.platform_fee, oi.seller_earning
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            ORDER BY o.created_at DESC
            LIMIT 500
        `);

        res.status(200).json({ orders });
    } catch (err) {
        console.error('[GET /api/admin/orders]', err);
        res.status(500).json({ error: 'Failed to fetch orders', detail: err.message });
    }
};
