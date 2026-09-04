/**
 * POST /api/sellers/login
 * Authenticate a seller and return a JWT.
 * Body: { email, password }
 */
const bcrypt        = require('bcryptjs');
const { queryOne }  = require('../../lib/db');
const { signToken } = require('../../lib/auth');
const { cors }      = require('../../lib/cors');

module.exports = async (req, res) => {
    if (cors(req, res)) return;
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { email, password } = req.body || {};
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = password || '';

    if (!cleanEmail || !cleanPassword) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const seller = await queryOne(
            'SELECT * FROM sellers WHERE LOWER(email) = LOWER(?)', [cleanEmail]
        );

        if (!seller) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (seller.is_active === false || seller.is_active === 0) {
            return res.status(403).json({ error: 'Your partner account has been suspended by the administrator.' });
        }

        const valid = await bcrypt.compare(cleanPassword, seller.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = signToken(seller);

        res.status(200).json({
            message: 'Login successful',
            token,
            seller: {
                id:              seller.id,
                store_name:      seller.store_name,
                full_name:       seller.full_name,
                email:           seller.email,
                category:        seller.category,
                commission_rate: parseFloat(seller.commission_rate || 0.10),
                logo_url:        seller.logo_url
            }
        });
    } catch (err) {
        console.error('[POST /api/sellers/login]', err);
        res.status(500).json({ error: 'Login failed', detail: err.message });
    }
};
