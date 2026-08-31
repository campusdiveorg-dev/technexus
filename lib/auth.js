/**
 * lib/auth.js — JWT utilities for seller authentication
 */
const jwt = require('jsonwebtoken');

const JWT_SECRET  = process.env.JWT_SECRET || 'change-me-in-production';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Sign a JWT token for a seller.
 * @param {{ id, email, storeName, commissionRate }} seller
 */
function signToken(seller) {
    return jwt.sign(
        {
            sub:          seller.id,
            email:        seller.email,
            storeName:    seller.store_name,
            commissionRate: seller.commission_rate
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
    );
}

/**
 * Verify a JWT from the Authorization header.
 * Returns decoded payload or throws.
 * @param {import('http').IncomingMessage} req
 */
function verifyToken(req) {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token) throw new Error('No token provided');
    return jwt.verify(token, JWT_SECRET);
}

/**
 * Middleware-style check — returns seller payload or sends 401.
 */
function requireAuth(req, res) {
    try {
        return verifyToken(req);
    } catch (err) {
        res.status(401).json({ error: 'Unauthorized', message: err.message });
        return null;
    }
}

/**
 * Verify admin PIN against env variable.
 */
function verifyAdminPin(pin) {
    return pin === (process.env.ADMIN_PIN || 'TN2026');
}

module.exports = { signToken, verifyToken, requireAuth, verifyAdminPin };
