/**
 * /api/sellers/products
 * GET / POST / PUT / DELETE
 * Seller product listing, editing, and deletion.
 * Requires: Authorization: Bearer <JWT>
 */
const { query, queryOne } = require('../../lib/db');
const { requireAuth }     = require('../../lib/auth');
const { cors }            = require('../../lib/cors');

module.exports = async (req, res) => {
    if (cors(req, res)) return;

    if (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const seller = requireAuth(req, res);
    if (!seller) return;

    // ── DELETE PRODUCT ───────────────────────────────────────
    if (req.method === 'DELETE') {
        const id = req.query?.id || req.body?.id;
        if (!id) return res.status(400).json({ error: 'Product ID is required' });

        try {
            await query('DELETE FROM products WHERE id = ? AND (seller_id = ? OR seller_id IS NULL)', [id, seller.sub]);
            return res.status(200).json({ message: 'Product deleted successfully', id });
        } catch (err) {
            console.error('[DELETE /api/sellers/products]', err);
            return res.status(500).json({ error: 'Failed to delete product', detail: err.message });
        }
    }

    // ── UPDATE PRODUCT (PUT) ─────────────────────────────────
    if (req.method === 'PUT') {
        const { id, name, category, price, description, image_url, specs, tag, stock, is_active } = req.body || {};
        if (!id) return res.status(400).json({ error: 'Product ID is required' });

        try {
            let commissionRate = null;
            if (category) {
                const catRate = await queryOne('SELECT rate FROM commission_rates WHERE category = ?', [category]);
                if (catRate) commissionRate = catRate.rate;
            }

            await query(`
                UPDATE products 
                SET name = COALESCE(?, name),
                    category = COALESCE(?, category),
                    price = COALESCE(?, price),
                    commission_rate = COALESCE(?, commission_rate),
                    description = COALESCE(?, description),
                    image_url = COALESCE(?, image_url),
                    specs = COALESCE(?, specs),
                    tag = COALESCE(?, tag),
                    stock = COALESCE(?, stock),
                    is_active = COALESCE(?, is_active)
                WHERE id = ? AND (seller_id = ? OR seller_id IS NULL)
            `, [
                name || null,
                category || null,
                price ? parseFloat(price) : null,
                commissionRate,
                description || null,
                image_url || null,
                specs || null,
                tag || null,
                stock ? parseInt(stock) : null,
                is_active !== undefined ? (is_active ? 1 : 0) : null,
                id,
                seller.sub
            ]);

            return res.status(200).json({ message: 'Product updated successfully', id });
        } catch (err) {
            console.error('[PUT /api/sellers/products]', err);
            return res.status(500).json({ error: 'Failed to update product', detail: err.message });
        }
    }

    // ── CREATE PRODUCT (POST) ────────────────────────────────
    const { name, category, price, description, image_url, specs, tag, stock } = req.body || {};
    if (!name || !price || !image_url) {
        return res.status(400).json({ error: 'name, price, and image_url are required' });
    }

    try {
        let commissionRate = seller.commissionRate || 0.10;
        if (category) {
            const catRate = await queryOne(
                'SELECT rate FROM commission_rates WHERE category = ?', [category]
            );
            if (catRate) commissionRate = catRate.rate;
        }

        const productId = `prd-${seller.sub.slice(-6)}-${Date.now()}`;

        await query(`
            INSERT INTO products (id, seller_id, name, category, price, commission_rate, description, image_url, specs, tag, stock)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            productId, seller.sub, name, category || 'Accessories',
            parseFloat(price), commissionRate, description || '',
            image_url, specs || '', tag || 'NEW', parseInt(stock) || 100
        ]);

        res.status(201).json({
            message: 'Product listed successfully',
            product: { id: productId, name, category, price, commission_rate: commissionRate }
        });
    } catch (err) {
        console.error('[POST /api/sellers/products]', err);
        res.status(500).json({ error: 'Failed to add product', detail: err.message });
    }
};
