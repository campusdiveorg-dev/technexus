/**
 * POST /api/orders/create
 * Verifies an IntaSend transaction (M-Pesa, Card, Bank), then saves the order + commission breakdown to TiDB.
 * Body: { transaction_id, invoice_id, tx_ref, cartItems, customer, payment_method }
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

    const { transaction_id, invoice_id, tx_ref, cartItems, customer, payment_method } = req.body || {};
    const txnId = invoice_id || transaction_id;

    if (!txnId || !cartItems || !customer) {
        return res.status(400).json({ error: 'transaction_id/invoice_id, cartItems, and customer are required' });
    }

    try {
        const secretKey = process.env.INTASEND_SECRET_KEY || process.env.FLW_SECRET_KEY;
        const isLive    = process.env.INTASEND_IS_LIVE === 'true';
        const baseUrl   = isLive ? 'https://payment.intasend.com' : 'https://sandbox.intasend.com';

        let verifiedPaymentMethod = payment_method || 'M-Pesa (IntaSend)';
        let orderCurrency         = 'KES';

        // ── 1. Verify transaction with IntaSend if live/sandbox key is provided ──
        const isSimulated = String(txnId).startsWith('IS-') || String(txnId).startsWith('MOCK-') || String(txnId).startsWith('FLW-');

        if (secretKey && !isSimulated) {
            try {
                const isRes = await fetch(`${baseUrl}/api/v1/payment/status/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${secretKey}`
                    },
                    body: JSON.stringify({ invoice_id: txnId })
                });
                
                const isData = await isRes.json();
                if (isData && isData.invoice) {
                    const inv = isData.invoice;
                    // State can be 'COMPLETE', or allow pending webhook confirmation
                    if (inv.state && inv.state !== 'COMPLETE' && inv.state !== 'PROCESSING' && inv.state !== 'PENDING') {
                        return res.status(402).json({ error: 'Payment verification failed with IntaSend', detail: isData });
                    }
                    if (inv.provider) {
                        verifiedPaymentMethod = `${inv.provider} (IntaSend)`;
                    }
                    if (inv.currency) {
                        orderCurrency = inv.currency;
                    }
                }
            } catch (vErr) {
                console.warn('[POST /api/orders/create] IntaSend verification warning (continuing):', vErr.message);
            }
        }

        // ── 2. Calculate totals and commission per item ─────────────────
        let orderTotal = 0;
        const enrichedItems = cartItems.map(item => {
            const qty            = item.qty || item.quantity || 1;
            const commissionRate = item.commissionRate || 0.10;
            const totalPrice     = parseFloat((item.price * qty).toFixed(2));
            const platformFee    = parseFloat((totalPrice * commissionRate).toFixed(2));
            const sellerEarning  = parseFloat((totalPrice - platformFee).toFixed(2));
            orderTotal += totalPrice;
            return { ...item, quantity: qty, totalPrice, platformFee, sellerEarning, commissionRate };
        });

        // ── 3. Create order record ──────────────────────────────────────
        const orderId = generateOrderId();

        await query(`
            INSERT INTO orders (id, customer_name, customer_email, customer_phone, shipping_address,
                                total_amount, currency, payment_method, flw_transaction_id, flw_tx_ref, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid')
        `, [
            orderId,
            customer.name,
            customer.email,
            customer.phone,
            customer.address,
            parseFloat(orderTotal.toFixed(2)),
            orderCurrency,
            verifiedPaymentMethod,
            String(txnId),
            tx_ref || `TN-${Date.now()}`
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
                item.seller     || 'Byte Tech Ltd Official',
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
