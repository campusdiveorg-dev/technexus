/**
 * POST /api/orders/fiscalize
 * Fiscalize an order with KRA eTIMS and return tax compliance details.
 * Body: { order_id }
 */

const { query, queryOne } = require('../../lib/db');
const { cors }            = require('../../lib/cors');
const { fiscalizeOrder }   = require('../../lib/etims');

module.exports = async (req, res) => {
    if (cors(req, res)) return;
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { order_id } = req.body || {};
    if (!order_id) {
        return res.status(400).json({ error: 'order_id is required' });
    }

    try {
        // 1. Fetch order & items from TiDB
        let order = null;
        let items = [];

        try {
            order = await queryOne('SELECT * FROM orders WHERE id = ?', [order_id]);
            if (order) {
                items = await query('SELECT * FROM order_items WHERE order_id = ?', [order_id]);
            }
        } catch (dbErr) {
            console.warn('[DB fetch warning in fiscalize]:', dbErr.message);
        }

        // If order not yet in database (e.g. client checkout payload), allow passing body items
        if (!order) {
            order = {
                id: order_id,
                total_amount: req.body.total_amount || 0,
                customer_name: req.body.customer_name || 'Customer',
                customer_email: req.body.customer_email || '',
                payment_method: req.body.payment_method || 'M-Pesa',
                created_at: new Date().toISOString()
            };
            items = req.body.items || [];
        }

        // 2. Perform eTIMS Fiscalization
        const fiscalResult = await fiscalizeOrder(order, items);

        // 3. Persist KRA details to TiDB if order exists in DB
        try {
            await query(`
                UPDATE orders 
                SET kra_cu_number = ?,
                    kra_invoice_number = ?,
                    kra_qr_url = ?,
                    status = 'paid'
                WHERE id = ?
            `, [
                fiscalResult.cuNumber,
                fiscalResult.invoiceNumber,
                fiscalResult.qrCodeUrl,
                order_id
            ]);
        } catch (updateErr) {
            console.warn('[DB update warning in fiscalize]:', updateErr.message);
        }

        return res.status(200).json({
            success: true,
            orderId: order_id,
            etims: fiscalResult
        });
    } catch (err) {
        console.error('[POST /api/orders/fiscalize]', err);
        return res.status(500).json({ error: 'Failed to fiscalize order', detail: err.message });
    }
};
