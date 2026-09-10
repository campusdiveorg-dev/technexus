/**
 * src/data/products.js
 * Master catalog utilities and taxonomy for Byte Tech Ltd.
 *
 * NOTE: Product items are now dynamically managed in the MySQL/TiDB database
 * and loaded via the backend API (/api/products). Static hardcoded products
 * have been migrated to the database under registered merchant accounts.
 */

export const CATEGORIES = [
    { id: 'all', label: 'All Gear' },
    { id: 'laptops', label: 'Workstations & Laptops' },
    { id: 'phones', label: 'Smartphones & Tablets' },
    { id: 'audio', label: 'Studio & ANC Audio' },
    { id: 'wearables', label: 'Wearables & GPS' },
    { id: 'accessories', label: 'Docks & Keyboards' }
];

export function formatKES(amount) {
    const val = parseFloat(amount || 0);
    return `KSh ${val.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// Fallbacks for backwards compatibility
export const INITIAL_PRODUCTS = [];
export const PRODUCTS = [];
export default PRODUCTS;
