/**
 * POST /api/upload
 * Secure server-side Cloudinary signed image upload.
 * Accepts base64 data URLs or binary payloads, signs with CLOUDINARY_API_SECRET,
 * and uploads directly to Cloudinary without requiring an unsigned preset.
 */
const crypto = require('crypto');
const fetch  = require('node-fetch');
const { cors } = require('../lib/cors');

module.exports = async (req, res) => {
    if (cors(req, res)) return;
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { file, folder } = req.body || {};

    if (!file) {
        return res.status(400).json({ error: 'Missing image file data (base64 or URL)' });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'stez7ars';
    const apiKey    = process.env.CLOUDINARY_API_KEY || '123538989471877';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || 'hKAn_52NqHJYsn_vp1BF-oH7aOg';
    const uploadFolder = folder || 'marketplace_uploads';

    try {
        const timestamp = Math.round(Date.now() / 1000);
        
        // Parameters must be sorted alphabetically before signing
        const paramsToSign = `folder=${uploadFolder}&timestamp=${timestamp}${apiSecret}`;
        const signature    = crypto.createHash('sha1').update(paramsToSign).digest('hex');

        const params = new URLSearchParams();
        params.append('file', file);
        params.append('api_key', apiKey);
        params.append('timestamp', timestamp.toString());
        params.append('folder', uploadFolder);
        params.append('signature', signature);

        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method:  'POST',
            body:    params,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const data = await cloudRes.json();

        if (data.secure_url) {
            return res.status(200).json({
                success:    true,
                secure_url: data.secure_url,
                public_id:  data.public_id,
                format:     data.format,
                width:      data.width,
                height:     data.height
            });
        }

        // If Cloudinary returned an error object
        console.error('[Cloudinary Signed Upload Error]', data);
        return res.status(400).json({
            error: data.error?.message || 'Upload failed',
            detail: data
        });

    } catch (err) {
        console.error('[POST /api/upload]', err);
        return res.status(500).json({ error: 'Server error during upload', detail: err.message });
    }
};
