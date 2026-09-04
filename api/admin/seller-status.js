/**
 * PUT /api/admin/seller-status
 * Toggle seller active/suspended status in the database.
 * Requires: x-admin-pin header
 * Body: { seller_id, email, is_active }
 */
const { query }          = require('../../lib/db');
const { verifyAdminPin } = require('../../lib/auth');
const { cors }           = require('../../lib/cors');

module.exports = async (req, res) => {
    if (cors(req, res)) return;
    if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

    const pin = req.headers['x-admin-pin'];
    if (!verifyAdminPin(pin)) {
        return res.status(401).json({ error: 'Invalid admin PIN' });
    }

    const { seller_id, email, is_active } = req.body || {};
    if (!seller_id && !email) {
        return res.status(400).json({ error: 'seller_id or email is required' });
    }

    const activeBool = is_active === true || is_active === 1 || is_active === 'true';

    try {
        await query(
            'UPDATE sellers SET is_active = ? WHERE id = ? OR email = ?',
            [activeBool, seller_id || '', email || '']
        );

        res.status(200).json({
            message: `Seller account status updated to ${activeBool ? 'active' : 'suspended'}`,
            seller_id,
            is_active: activeBool
        });
    } catch (err) {
        console.error('[PUT /api/admin/seller-status]', err);
        res.status(500).json({ error: 'Failed to update seller status', detail: err.message });
    }
};
