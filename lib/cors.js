/**
 * lib/cors.js — CORS helper for Vercel serverless functions
 */

/**
 * Apply CORS headers and handle preflight OPTIONS requests.
 * Call at the top of every API handler.
 * Returns true if request is handled (OPTIONS preflight), false if handler should continue.
 *
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse}  res
 * @returns {boolean} — true if OPTIONS (caller should return immediately)
 */
function cors(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-admin-pin');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return true;
    }
    return false;
}

module.exports = { cors };
