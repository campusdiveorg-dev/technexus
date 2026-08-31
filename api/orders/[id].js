/**
 * GET /api/orders/[id]
 * Fetch a single order with its line items for the receipt page.
 * Public endpoint — order ID acts as the access token (random, unguessable).
 */
const { queryOne, query } = require('../../lib/db');
const { cors }            = require('../../lib/cors');

module.exports = async (req, res) => {
    if (cors(req, res)) return;
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Order ID is required' });

    try {
        const order = await queryOne(
            'SELECT * FROM orders WHERE id = ?', [id]
        );

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const items = await query(
            'SELECT * FROM order_items WHERE order_id = ?', [id]
        );

        // Calculate VAT (16%)
        const subtotal   = parseFloat(order.total_amount);
        const vatRate    = 0.16;
        const vatAmount  = parseFloat((subtotal * vatRate / (1 + vatRate)).toFixed(2));
        const netAmount  = parseFloat((subtotal - vatAmount).toFixed(2));

        res.status(200).json({
            order: {
                ...order,
                subtotal:  netAmount,
                vat:       vatAmount,
                total:     subtotal
            },
            items
        });
    } catch (err) {
        console.error('[GET /api/orders/:id]', err);
        res.status(500).json({ error: 'Failed to fetch order', detail: err.message });
    }
};
