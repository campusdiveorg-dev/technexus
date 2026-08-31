/**
 * POST /api/sellers/register
 * Register a new seller account.
 * Body: { store_name, full_name, email, password, phone, category, commission_rate, logo_url }
 */
const bcrypt       = require('bcryptjs');
const { query }    = require('../../lib/db');
const { signToken } = require('../../lib/auth');
const { cors }     = require('../../lib/cors');

module.exports = async (req, res) => {
    if (cors(req, res)) return;
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { store_name, full_name, email, password, phone, category, commission_rate, logo_url } = req.body || {};

    if (!store_name || !full_name || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields: store_name, full_name, email, password' });
    }

    try {
        // Check duplicate email
        const existing = await query('SELECT id FROM sellers WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Get commission rate from category table if not provided
        let rate = commission_rate || 0.10;
        if (!commission_rate && category) {
            const catRate = await query(
                'SELECT rate FROM commission_rates WHERE category = ?', [category]
            );
            if (catRate.length > 0) rate = catRate[0].rate;
        }

        const password_hash = await bcrypt.hash(password, 12);
        const id = `seller-${Date.now()}`;

        await query(`
            INSERT INTO sellers (id, store_name, full_name, email, password_hash, phone, category, commission_rate, logo_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [id, store_name, full_name, email, password_hash, phone || null, category || null, rate, logo_url || null]);

        const seller = { id, store_name, full_name, email, commission_rate: rate };
        const token  = signToken(seller);

        res.status(201).json({
            message: 'Seller registered successfully',
            token,
            seller: { id, store_name, full_name, email, category, commission_rate: rate }
        });
    } catch (err) {
        console.error('[POST /api/sellers/register]', err);
        res.status(500).json({ error: 'Registration failed', detail: err.message });
    }
};
