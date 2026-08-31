/**
 * POST /api/orders/create
 * Verifies a Flutterwave transaction, then saves the order + commission breakdown to TiDB.
 * Body: { transaction_id, tx_ref, cartItems, customer }
 */
const fetch        = require('node-fetch');
const { query }    = require('../../lib/db');
const { cors }     = require('../../lib/cors');

function generateOrderId() {
    const date = new Date().toISOString().slice(0,10).replace(/-/g,'');
    const rand = Math.random().toString(36).substring(2,6).toUpperCase();
    return `TN-${date}-${rand}`;
}

module.exports = async (req, res) => {
    if (cors(req, res)) return;
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { transaction_id, tx_ref, cartItems, customer } = req.body || {};
    if (!transaction_id || !cartItems || !customer) {
        return res.status(400).json({ error: 'transaction_id, cartItems, and customer are required' });
    }

    try {
        // ── 1. Verify transaction with Flutterwave ──────────────────────
        const flwRes = await fetch(
            `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
            { headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` } }
        );
        const flwData = await flwRes.json();

        if (flwData.status !== 'success' || flwData.data.status !== 'successful') {
            return res.status(402).json({ error: 'Payment verification failed', flw: flwData });
        }

        const flwTx = flwData.data;

        // ── 2. Calculate totals and commission per item ─────────────────
        let orderTotal = 0;
        const enrichedItems = cartItems.map(item => {
            const commissionRate = item.commissionRate || 0.10;
            const totalPrice     = parseFloat((item.price * item.quantity).toFixed(2));
            const platformFee    = parseFloat((totalPrice * commissionRate).toFixed(2));
            const sellerEarning  = parseFloat((totalPrice - platformFee).toFixed(2));
            orderTotal += totalPrice;
            return { ...item, totalPrice, platformFee, sellerEarning, commissionRate };
        });

        // ── 3. Create order record ──────────────────────────────────────
        const orderId = generateOrderId();

        await query(`
            INSERT INTO orders (id, customer_name, customer_email, customer_phone, shipping_address,
                                total_amount, currency, payment_method, flw_transaction_id, flw_tx_ref, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid')
        `, [
            orderId,
            customer.name, customer.email, customer.phone, customer.address,
            parseFloat(orderTotal.toFixed(2)),
            flwTx.currency || 'KES',
            flwTx.payment_type || 'unknown',
            String(transaction_id),
            tx_ref || flwTx.tx_ref
        ]);

        // ── 4. Insert order items with commission breakdown ─────────────
        for (const item of enrichedItems) {
            await query(`
                INSERT INTO order_items
                    (order_id, product_id, seller_id, product_name, product_image,
                     seller_name, quantity, unit_price, total_price,
                     commission_rate, platform_fee, seller_earning)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                orderId,
                item.id         || null,
                item.sellerId   || null,
                item.name,
                item.image      || null,
                item.seller     || 'TechNexus Official',
                item.quantity,
                item.price,
                item.totalPrice,
                item.commissionRate,
                item.platformFee,
                item.sellerEarning
            ]);
        }

        res.status(201).json({ orderId, message: 'Order created successfully' });
    } catch (err) {
        console.error('[POST /api/orders/create]', err);
        res.status(500).json({ error: 'Order creation failed', detail: err.message });
    }
};
