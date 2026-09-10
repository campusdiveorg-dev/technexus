/**
 * src/lib/api.js
 * Central API configuration for Byte Tech marketplace.
 *
 * Set VITE_API_URL in your environment (Vercel → Settings → Environment Variables)
 * to point at your PHP backend, e.g.:
 *   VITE_API_URL=https://api.bytetech.co.ke
 *
 * Falls back to an empty string so relative /api/... paths still work
 * if the PHP backend is served on the same domain.
 */

export const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Convenience wrapper — prepends API_URL to a path.
 * Usage: apiUrl('/sellers/login') → 'https://api.bytetech.co.ke/sellers/login'
 */
export function apiUrl(path) {
    return `${API_URL}/api${path}`;
}

/**
 * Authenticated fetch — injects seller JWT from localStorage.
 */
export async function authFetch(path, options = {}) {
    const token = localStorage.getItem('tn_seller_token');
    return fetch(apiUrl(path), {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    });
}

/**
 * Admin fetch — injects admin PIN from sessionStorage.
 */
export async function adminFetch(path, options = {}) {
    const pin = sessionStorage.getItem('tn_admin_pin') || '';
    return fetch(apiUrl(path), {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'x-admin-pin': pin,
            ...(options.headers || {}),
        },
    });
}
