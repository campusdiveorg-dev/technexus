/**
 * Byte Tech Ltd - Global Application Engine
 * Handles shared cart state, dynamic catalog API sync, search, seller commissions, and interactions across all pages.
 */

// Global Product Catalog Data (in Kenyan Shillings KES with Seller & Commission fields)
const PRODUCTS = [
    {
        id: 'pro-x1-carbon',
        name: 'Pro-X1 Carbon Flagship',
        category: 'Laptops',
        price: 285000.00,
        rating: 4.9,
        reviewsCount: 128,
        tag: 'FLAGSHIP',
        description: 'Engineered for absolute performance. M4 Neural Processor, aerospace-grade carbon chassis, and Liquid Retina XDR display.',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
        specs: '16-Core M4 • 32GB RAM • 1TB SSD',
        href: 'product.html?id=pro-x1-carbon',
        seller: 'TechCore Ltd',
        sellerId: 'seller-techcore',
        commissionRate: 0.12
    },
    {
        id: 'nexus-pro-16',
        name: 'NexusBook Pro 16"',
        category: 'Laptops',
        price: 275000.00,
        rating: 4.9,
        reviewsCount: 128,
        tag: 'PRO',
        description: 'M3 Max chip, 32GB RAM, 1TB SSD. The ultimate powerhouse for software engineers and digital creators.',
        image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1000&q=80',
        specs: 'Space Gray • 32GB RAM • 1TB SSD',
        href: 'product.html?id=nexus-pro-16',
        seller: 'Apex Silicon',
        sellerId: 'seller-apex',
        commissionRate: 0.12
    },
    {
        id: 'nexus-air-13',
        name: 'NexusBook Air 13"',
        category: 'Laptops',
        price: 145000.00,
        rating: 4.8,
        reviewsCount: 342,
        tag: 'LIMITED',
        description: 'Feather-light matte design, all-day 20-hour battery life. Your ultimate mobile workstation companion.',
        image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1000&q=80',
        specs: 'Midnight Black • 16GB RAM • 512GB SSD',
        href: 'product.html?id=nexus-air-13',
        seller: 'Byte Tech Ltd Official',
        sellerId: 'seller-bytetech',
        commissionRate: 0.10
    },
    {
        id: 'flex-360',
        name: 'FlexConvert 360',
        category: 'Laptops',
        price: 195000.00,
        rating: 4.6,
        reviewsCount: 89,
        tag: '2-IN-1',
        description: 'OLED 120Hz touchscreen with versatile 360-degree precision hinge and stylus pen included.',
        image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=80',
        specs: '14" 4K OLED • Pen Included',
        href: 'product.html?id=flex-360',
        seller: 'OmniGear Labs',
        sellerId: 'seller-omnigear',
        commissionRate: 0.12
    },
    {
        id: 'aural-pro',
        name: 'Aural Pro Wireless',
        category: 'Audio',
        price: 35000.00,
        rating: 4.8,
        reviewsCount: 312,
        tag: 'ANC',
        description: 'Studio-grade acoustic architecture with active noise cancellation and 24-hour ultra-low latency playback.',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
        specs: 'Noise Cancelling • 24h Battery',
        href: 'product.html?id=aural-pro',
        seller: 'SoundWave Audio',
        sellerId: 'seller-soundwave',
        commissionRate: 0.08
    },
    {
        id: 'aura-anc',
        name: 'AuraANC Headphones',
        category: 'Audio',
        price: 42000.00,
        rating: 4.9,
        reviewsCount: 204,
        tag: 'STUDIO',
        description: 'Over-ear titanium diaphragm drivers with spatial lossless audio tuning and memory foam acoustic seals.',
        image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1000&q=80',
        specs: 'Lunar Silver • Titanium Drivers',
        href: 'product.html?id=aura-anc',
        seller: 'SoundWave Audio',
        sellerId: 'seller-soundwave',
        commissionRate: 0.08
    },
    {
        id: 'nexus-monitor',
        name: 'Nexus 27" 4K Monitor',
        category: 'Gaming',
        price: 58000.00,
        rating: 4.7,
        reviewsCount: 74,
        tag: '144Hz 4K',
        description: '32" professional Nano-IPS 4K display with 144Hz refresh rate, 1ms response, and 99% DCI-P3 color gamut.',
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=80',
        specs: 'IPS Panel • 1ms Response • 144Hz',
        href: 'product.html?id=nexus-monitor',
        seller: 'PixelForge Gaming',
        sellerId: 'seller-pixelforge',
        commissionRate: 0.15
    },
    {
        id: 'glide-mouse',
        name: 'Precision Glide Mouse',
        category: 'Accessories',
        price: 9500.00,
        rating: 4.9,
        reviewsCount: 189,
        tag: '20K DPI',
        description: 'Ultra-lightweight 58g wireless gaming & productivity mouse with optical switches and sub-1ms response.',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80',
        specs: 'Ultra-light 58g • Wireless 2.4G',
        href: 'product.html?id=glide-mouse',
        seller: 'Nexus Peripherals',
        sellerId: 'seller-nexusperi',
        commissionRate: 0.08
    },
    {
        id: 'chrono-watch',
        name: 'Chrono S2 Smartwatch',
        category: 'Wearables',
        price: 38000.00,
        rating: 4.8,
        reviewsCount: 115,
        tag: 'TITANIUM',
        description: 'Grade 5 aerospace titanium chassis with sapphire crystal, dual-frequency GPS, and medical-grade ECG biosensors.',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
        specs: 'Titanium Build • ECG & GPS',
        href: 'product.html?id=chrono-watch',
        seller: 'ChronoTech',
        sellerId: 'seller-chronotech',
        commissionRate: 0.10
    }
];

// Load locally-stored seller products from localStorage into PRODUCTS
function loadLocalSellerProducts() {
    try {
        const localProds = JSON.parse(localStorage.getItem('tn_custom_products') || '[]');
        const sellers = JSON.parse(localStorage.getItem('tn_sellers') || '[]');

        localProds.forEach(lp => {
            if (!lp.id || !lp.name || !lp.price || lp.is_active === false) return;

            // Hide products from suspended sellers
            const sellerObj = sellers.find(s => 
                (s.id && (s.id === lp.seller_id || s.id === lp.sellerId)) || 
                (s.store_name && lp.seller && s.store_name.toLowerCase() === lp.seller.toLowerCase())
            );
            if (sellerObj && sellerObj.is_active === false) return;

            const exists = PRODUCTS.find(p => p.id === lp.id);
            const formatted = {
                id: lp.id,
                name: lp.name,
                category: lp.category || 'Accessories',
                price: parseFloat(lp.price) || 0,
                rating: 5.0,
                reviewsCount: 1,
                tag: lp.tag || 'PARTNER',
                description: lp.description || '',
                image: lp.image_url || lp.image || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80',
                specs: lp.specs || 'Standard Configuration',
                href: `product.html?id=${lp.id}`,
                seller: lp.seller || lp.seller_name || 'Byte Tech Partner',
                sellerId: lp.seller_id || lp.sellerId || null,
                commissionRate: parseFloat(lp.commission_rate) || 0.10,
                is_active: true
            };
            if (!exists) {
                PRODUCTS.unshift(formatted);
            } else {
                Object.assign(exists, formatted);
            }
        });
    } catch (e) {
        console.log('[Products] No local seller products');
    }
}

// Asynchronously load seller-created products from the live database
async function loadDynamicProducts() {
    // First: merge any locally stored seller products immediately
    loadLocalSellerProducts();

    // Then: try live API for DB-backed products
    try {
        const res = await fetch('/api/products');
        if (res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.products) && data.products.length > 0) {
                data.products.forEach(dbProd => {
                    const exists = PRODUCTS.find(p => p.id === dbProd.id);
                    const formatted = {
                        id: dbProd.id,
                        name: dbProd.name,
                        category: dbProd.category || 'General',
                        price: parseFloat(dbProd.price) || 0,
                        rating: 5.0,
                        reviewsCount: 1,
                        tag: dbProd.tag || 'NEW',
                        description: dbProd.description || '',
                        image: dbProd.image_url || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
                        specs: dbProd.specs || 'Standard Configuration',
                        href: `product.html?id=${dbProd.id}`,
                        seller: dbProd.seller_name || 'Byte Tech Partner',
                        sellerId: dbProd.seller_id,
                        commissionRate: parseFloat(dbProd.commission_rate) || 0.12
                    };
                    if (!exists) {
                        PRODUCTS.unshift(formatted);
                    } else {
                        Object.assign(exists, formatted);
                    }
                });
            }
        }
    } catch (e) {
        console.log('[Products] Static catalog active');
    }

    // Notify catalog page to re-render if it is listening
    window.dispatchEvent(new CustomEvent('products-updated'));
}

// Trigger dynamic product sync
loadDynamicProducts();
window.loadLocalSellerProducts = loadLocalSellerProducts;

// Cart State Helpers
const CartManager = {
    STORAGE_KEY: 'bytetechltd_cart',

    getCart() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY) || localStorage.getItem('bitetechltd_cart') || localStorage.getItem('tn_cart');
            if (data) {
                const parsed = JSON.parse(data);
                return parsed.map(item => ({
                    ...item,
                    qty: item.qty || item.quantity || 1,
                    quantity: item.quantity || item.qty || 1,
                    seller: item.seller || 'Byte Tech Ltd Official',
                    sellerId: item.sellerId || null,
                    commissionRate: item.commissionRate || 0.10
                }));
            }
            return [];
        } catch (e) {
            console.error('Error reading cart from localStorage', e);
            return [];
        }
    },

    saveCart(cart) {
        try {
            const normalized = cart.map(item => ({
                ...item,
                qty: item.qty || item.quantity || 1,
                quantity: item.quantity || item.qty || 1
            }));
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(normalized));
            localStorage.setItem('bitetechltd_cart', JSON.stringify(normalized));
            localStorage.setItem('tn_cart', JSON.stringify(normalized));
            this.updateBadge();
        } catch (e) {
            console.error('Error saving cart to localStorage', e);
        }
    },

    addItem(product, qty = 1) {
        const cart = this.getCart();
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            existing.qty = (existing.qty || 1) + qty;
            existing.quantity = existing.qty;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                qty: qty,
                quantity: qty,
                image: product.image,
                specs: product.specs || 'Standard Configuration',
                seller: product.seller || 'Byte Tech Ltd Official',
                sellerId: product.sellerId || null,
                commissionRate: product.commissionRate || 0.10
            });
        }
        this.saveCart(cart);
        showToast(`Added <strong>${product.name}</strong> to your cart!`, 'success');
    },

    updateQty(id, delta) {
        const cart = this.getCart();
        const index = cart.findIndex(item => item.id === id);
        if (index > -1) {
            cart[index].qty = (cart[index].qty || 1) + delta;
            cart[index].quantity = cart[index].qty;
            if (cart[index].qty <= 0) {
                cart.splice(index, 1);
            }
            this.saveCart(cart);
        }
    },

    removeItem(id) {
        let cart = this.getCart();
        const item = cart.find(i => i.id === id);
        cart = cart.filter(i => i.id !== id);
        this.saveCart(cart);
        if (item) {
            showToast(`Removed <strong>${item.name}</strong> from your cart.`, 'info');
        }
    },

    clearCart() {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem('bitetechltd_cart');
        localStorage.removeItem('tn_cart');
        this.saveCart([]);
    },

    getItemCount() {
        const cart = this.getCart();
        return cart.reduce((acc, item) => acc + (item.qty || item.quantity || 1), 0);
    },

    getSubtotal() {
        const cart = this.getCart();
        return cart.reduce((acc, item) => acc + (item.price * (item.qty || item.quantity || 1)), 0);
    },

    updateBadge() {
        const count = this.getItemCount();
        document.querySelectorAll('.cart-count-badge').forEach(badge => {
            badge.textContent = count;
            badge.classList.remove('hidden');
            if (count === 0) {
                badge.classList.add('hidden');
            } else {
                badge.classList.add('cart-badge-pop');
                setTimeout(() => badge.classList.remove('cart-badge-pop'), 400);
            }
        });
    }
};

// Commission Calculation Utility
function calcCommission(price, qty = 1, rate = 0.10) {
    const subtotal = price * qty;
    const platformFee = +(subtotal * rate).toFixed(2);
    const sellerEarning = +(subtotal - platformFee).toFixed(2);
    return { subtotal, platformFee, sellerEarning, rate };
}

// UI Notification System
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">
                ${type === 'error' ? 'error' : (type === 'info' ? 'info' : 'check_circle')}
            </span>
        </div>
        <div class="text-sm flex-grow">${message}</div>
        <a href="cart.html" class="text-electric-blue text-xs font-bold uppercase tracking-wider hover:underline ml-2">View Cart</a>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// Search & Navigation Handler
function setupSearchInputs() {
    document.querySelectorAll('.nav-search-input').forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = input.value.trim();
                if (query) {
                    window.location.href = `catalog.html?search=${encodeURIComponent(query)}`;
                }
            }
        });
    });
}

// Currency Formatter Utility (Kenyan Shillings)
function formatKES(amount) {
    return 'KSh ' + Number(amount || 0).toLocaleString('en-KE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Expose globals for all scripts
window.formatKES = formatKES;
window.CartManager = CartManager;
window.PRODUCTS = PRODUCTS;
window.loadDynamicProducts = loadDynamicProducts;
window.ByteTechLtd = { showToast, CartManager, PRODUCTS, calcCommission, formatKES, loadDynamicProducts };
window.BiteTechLtd = window.ByteTechLtd; // Backward compatibility alias

// Setup Global Navbar and Badges
document.addEventListener('DOMContentLoaded', () => {
    CartManager.updateBadge();
    setupSearchInputs();

    // Wire any data-add-to-cart buttons
    document.addEventListener('click', (e) => {
        const addBtn = e.target.closest('[data-add-to-cart]');
        if (addBtn) {
            e.preventDefault();
            const productId = addBtn.getAttribute('data-add-to-cart');
            const product = PRODUCTS.find(p => p.id === productId);
            if (product) {
                CartManager.addItem(product, 1);
            }
        }
    });

    // Mobile Menu Toggle
    const menuToggles = document.querySelectorAll('[data-menu-toggle]');
    menuToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu) {
                mobileMenu.classList.toggle('hidden');
            }
        });
    });
});
