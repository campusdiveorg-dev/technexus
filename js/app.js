/**
 * Bite Tech Ltd - Global Application Engine
 * Handles shared cart state, catalog filtering, navigation, search, seller commissions, and interactions across all pages.
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
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyXKtzLAgZmERYv3tkP4IXzbmYpuIV6ph16noF_zOGVJrRgmtVZOARZosjo5zljLlwqE9FGFUa5kCY5GmpFG0w7uemjiosf4KhyxjmCP9W25JdJHPUhHnpu-SCGUzb9tiwv9oIM2XQ72fT2XDbnAfY7NXJsIgIIVYLXAOr5H7XWHB2TrvGl34p54yu03lMK2cnmvOzjN81LQKXzbSeQkCosOvT65k8gGOg8ehukdm5SgMHBUm530RC_Q',
        specs: '16-Core M4 • 32GB RAM • 1TB SSD',
        href: 'product.html',
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
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAx-xdkK80dq8c_EF3auTMT1oiWvAZ5JgRNu3cyybjKv6KMQe5YNY12_wMlIATFa6dHGWSi12V5_COAARZsTUggGKyDOAiaJyLIZJXWUGuxhlnDNmBpmJX4-W1nBUMXKLbpJQQj9EG1KTZnNnHuuysgRtpt4ywTSX5dua1RZIv6tZtDi76Mx_blhiY8CykGbQPGRgiTOnhXphja4qgHh5L165EDRU0YH_lAxdmcbJyRdUh_LcJqb8bqKA',
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
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwZbn2lF_suhISA5hVYGC_3MjqW2Me9QLwaECX4UxOPUFur42KTpKF5doBV-Hie9eLMEcusP4vdoqIFu33kGe6-khcFEoQsZcepBu_H0_6q19agCF3AQJCyqpymMOs3S65gu8jj4JAK8YrJ7iqihyh6rnhBJn97S-J11rBWKuzJbyRVbYFMI7x3rrSPbncN5ZwkIMMQ7uB-TTOnUR_A2WctxTrZPIYdVwaqIt_gwVp_xMY55Lggitx4w',
        specs: 'Midnight Black • 16GB RAM • 512GB SSD',
        href: 'product.html?id=nexus-air-13',
        seller: 'Bite Tech Ltd Official',
        sellerId: 'seller-Bite Tech Ltd',
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
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcLk0OyAjE8gkgi81kmaiqLMgTlZDwzTW8lXDIboi42AuXttmJIaQE_gsfva58zYjqE3q4hf8QVpY3rFG5_DXzaUFgDN4U-qZLEN5FXTbRqvot7wInyZty3Tjsp8Rw4-x66IEABBm69P2QsVUZBs1VrXNNvKsU4zPQy8wLpc9JLrAV2eJHy4pUT78AqbGL3CBFh8wJVbC41UnxQ6BTKcnqzJY-KvQEYI_JTijbnNyFhjGSmMmSFJT_lQ',
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
        image: 'https://lh3.googleusercontent.com/aida/AEtjO1X0LqEuow5IRcltHFBvwx3I9ncX7ZKoVEWkm8BxqEyYbJUBhrq1QaWPelpEVpQZfel3cXceF8g5xnLi5d0uXhaDrMEknOncofxK9qT_qSIRvCwU0uR9yYO41ea7DwgDxyvcU15lQCFg19E9YB74d0rCKnEUtCOftAytLQClMwmMum6zaYN-dRjx6oK5TCezR3UvVCJaymOilaYFTC7HLcymKJ58tbOc1NWJFqiTkfg0qlnD65HWKeOTG2Rv',
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
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfeMQEyI-u4WYsrKZBRULsjdLR7aUklVVgBMLNB2loePn-DC0yKuIf1Braxv5vWYCo0em04vnVXIglR327u_fOZrdVi3D7QqBKRi3JrLU5nk1YYVRis2S3-iPk5QZTAch3uYwS5RNPYrFSWKP-OGRrEVCgXoppctlYpNeeK--qsQBFROwGuLa8m5_JSHnoOKjFJfY5jcmQLElFLgg1ytgDDzsL5D2mN0zeopUnG3-NEVLgF0qbgzeDWg',
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
        image: 'https://lh3.googleusercontent.com/aida/AEtjO1UZDGECOkupKlC_3pgwhh1sb_QxggohxEIw1QaaKezhavt1mrMz86ZeWiypjFLk75P8R7HS5ODZ3jUJ0szJRZgsb2U-YBBf1OHB-Qh-GhjDN506IDPhynPirXd_SKhLSiXiKr6NYztc4Pj-CRdk4RSUqisErcafo1B2EjZ1r-efpZkY936I9jFaDfiCGI1Fi4EkaH9V_BUTA8Hx_kRZCSXvezCPRhmEHSFC-GpRf2RTh173lUksNrmfS-0_',
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
        image: 'https://lh3.googleusercontent.com/aida/AEtjO1VxeqDPk2J1VlFcmBwz1hyJwGZadU9IddWmOV0DkYlxegFTfFfvQrbtwY4jJGzd62aQXCncdNqQ9URGvyruZpN2KD6wm_s7ccJw6KTUx0_rRYHosmK-KLLBF9qoRbvDggVMw66fEN8Pp5B5ANw5waWFNJcT_VN7qlvjWTZEbZe72JT1e6Rx-yZp_h2E2arKNHPDiw-NkaJBIF2-d5klR4BQ5AQ3SmPgj3ojCOQlVIuOYoQ6octIEuXV-PHM',
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
        image: 'https://lh3.googleusercontent.com/aida/AEtjO1XT5URHgv-judAyxtZmxTKdxtFt3GnkgrHbIV2wAZXtjJ7c47bN2bkgZog1tJCFmUrBrqiGja0lMLK2MQQ156yN-9k3vwmwZC_UaVGTZ-O_jxuujC1oOJfsFkS8Di97YBzJ2TySx8OgN0OCEBZn7O15-rXY94rdZQwOEEiSscQlhihOhwW4RDQvqobQDtYwOP0RZkBXWkMfG5l4yLmf8gheq49ICGk6NmFYvd1kD38JvaMX9kANDJRsTJU',
        specs: 'Titanium Build • ECG & GPS',
        href: 'product.html?id=chrono-watch',
        seller: 'ChronoTech',
        sellerId: 'seller-chronotech',
        commissionRate: 0.10
    }
];

// Initial empty cart for real testing
const DEFAULT_CART = [];

// Cart State Helpers
const CartManager = {
    STORAGE_KEY: 'bitetechltd_cart',

    getCart() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY) || localStorage.getItem('tn_cart');
            if (data) {
                const parsed = JSON.parse(data);
                return parsed.map(item => ({
                    ...item,
                    qty: item.qty || item.quantity || 1,
                    quantity: item.quantity || item.qty || 1,
                    seller: item.seller || 'Bite Tech Ltd Official',
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
                seller: product.seller || 'Bite Tech Ltd Official',
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

// Expose globals for other scripts
window.formatKES = formatKES;
window.CartManager = CartManager;
window.PRODUCTS = PRODUCTS;
window.BiteTechLtd = { showToast, CartManager, PRODUCTS, calcCommission, formatKES };

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
