/**
 * PUT /api/admin/commission
 * Update commission rate for a product category.
 * Requires: x-admin-pin header
 * Body: { category, rate }
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

    const { category, rate } = req.body || {};
    if (!category || rate === undefined) {
        return res.status(400).json({ error: 'category and rate are required' });
    }

    const numRate = parseFloat(rate);
    if (isNaN(numRate) || numRate < 0 || numRate > 1) {
        return res.status(400).json({ error: 'rate must be a decimal between 0 and 1 (e.g. 0.12 for 12%)' });
    }

    try {
        await query(`
            INSERT INTO commission_rates (category, rate)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE rate = VALUES(rate)
        `, [category, numRate]);

        res.status(200).json({
            message: `Commission rate for ${category} updated to ${(numRate * 100).toFixed(1)}%`,
            category, rate: numRate
        });
    } catch (err) {
        console.error('[PUT /api/admin/commission]', err);
        res.status(500).json({ error: 'Failed to update commission rate', detail: err.message });
    }
};
