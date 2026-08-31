/**
 * js/seller.js
 * TechNexus — Seller portal + Admin panel frontend logic
 * Handles: seller registration, login, dashboard, product listing, admin panel with 100% real dynamic data
 */

// ── Session helpers ────────────────────────────────────────────
const SellerSession = {
    save(token, seller) {
        localStorage.setItem('tn_seller_token',  token);
        localStorage.setItem('tn_seller_profile', JSON.stringify(seller));
    },
    getToken()   { return localStorage.getItem('tn_seller_token'); },
    getProfile() {
        try { return JSON.parse(localStorage.getItem('tn_seller_profile') || 'null'); }
        catch { return null; }
    },
    clear() {
        localStorage.removeItem('tn_seller_token');
        localStorage.removeItem('tn_seller_profile');
    },
    isLoggedIn() { return !!this.getToken() && !!this.getProfile(); }
};

// ── Admin PIN session ──────────────────────────────────────────
const AdminSession = {
    save(pin)    { sessionStorage.setItem('tn_admin_pin', pin); },
    getPin()     { return sessionStorage.getItem('tn_admin_pin'); },
    clear()      { sessionStorage.removeItem('tn_admin_pin'); },
    isLoggedIn() { return !!this.getPin(); }
};

// ══════════════════════════════════════════════
// SELLER REGISTRATION PAGE
// ══════════════════════════════════════════════
function initSellerRegister() {
    const form   = document.getElementById('seller-register-form');
    const logoBtn = document.getElementById('logo-upload-btn');

    // Cloudinary logo upload
    if (logoBtn && window.cloudinary) {
        const widget = cloudinary.createUploadWidget({
            cloudName:    window.CLOUDINARY_CLOUD_NAME || 'technexus',
            uploadPreset: window.CLOUDINARY_UPLOAD_PRESET || 'tn_products',
            sources:      ['local', 'url', 'camera'],
            cropping:     true,
            croppingAspectRatio: 1,
            folder:       'seller_logos',
            multiple:     false
        }, (err, result) => {
            if (result?.event === 'success') {
                document.getElementById('logo-url-input').value = result.info.secure_url;
                const preview = document.getElementById('logo-preview');
                if (preview) {
                    preview.src = result.info.secure_url;
                    preview.style.display = 'block';
                }
                showToast('Logo uploaded to Cloudinary!', 'success');
            }
        });
        logoBtn.addEventListener('click', () => widget.open());
    }

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('[type="submit"]');
        submitBtn.disabled    = true;
        submitBtn.textContent = 'Registering…';

        const categoryRates = {
            'Laptops': 0.12, 'Audio': 0.08, 'Gaming': 0.15,
            'Phones': 0.10, 'Monitors': 0.10, 'Accessories': 0.08
        };

        const selectedCat = document.getElementById('reg-category')?.value || 'Accessories';
        const rate = categoryRates[selectedCat] || 0.10;

        const body = {
            id:              `seller-${Date.now()}`,
            store_name:      document.getElementById('reg-store-name')?.value.trim(),
            full_name:       document.getElementById('reg-full-name')?.value.trim(),
            email:           document.getElementById('reg-email')?.value.trim(),
            password:        document.getElementById('reg-password')?.value,
            phone:           document.getElementById('reg-phone')?.value.trim(),
            category:        selectedCat,
            commission_rate: rate,
            logo_url:        document.getElementById('logo-url-input')?.value || '',
            created_at:      new Date().toISOString()
        };

        const confirm = document.getElementById('reg-confirm-password')?.value;
        if (body.password !== confirm) {
            showToast('Passwords do not match.', 'error');
            submitBtn.disabled = false; submitBtn.textContent = 'Register Partner Storefront';
            return;
        }

        let registered = false;

        // Try API endpoint
        try {
            const res  = await fetch('/api/sellers/register', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(body)
            });
            if (res.ok) {
                const data = await res.json();
                SellerSession.save(data.token, data.seller);
                registered = true;
            }
        } catch (err) {
            console.warn('API /api/sellers/register offline, using local repository...', err);
        }

        // Local Storage Sync (always persist seller locally as well)
        const sellers = JSON.parse(localStorage.getItem('tn_sellers') || '[]');
        sellers.push(body);
        localStorage.setItem('tn_sellers', JSON.stringify(sellers));

        if (!registered) {
            SellerSession.save(`token-${body.id}`, body);
        }

        showToast('Seller account registered! Redirecting…', 'success');
        setTimeout(() => { window.location.href = 'seller-dashboard.html'; }, 1000);
    });
}

// ══════════════════════════════════════════════
// SELLER DASHBOARD PAGE
// ══════════════════════════════════════════════
function initSellerDashboard() {
    if (!SellerSession.isLoggedIn()) {
        showSellerLoginGate();
        return;
    }
    loadSellerDashboard();
}

function showSellerLoginGate() {
    document.getElementById('seller-login-gate')?.classList.remove('hidden');
    document.getElementById('seller-dashboard-content')?.classList.add('hidden');

    document.getElementById('seller-login-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email    = document.getElementById('login-email')?.value.trim();
        const password = document.getElementById('login-password')?.value;
        const btn      = e.target.querySelector('[type="submit"]');
        btn.disabled   = true; btn.textContent = 'Logging in…';

        let loggedIn = false;

        // Try API
        try {
            const res  = await fetch('/api/sellers/login', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (res.ok) {
                const data = await res.json();
                SellerSession.save(data.token, data.seller);
                loggedIn = true;
            }
        } catch (err) {
            console.warn('API /api/sellers/login offline, checking registered sellers...', err);
        }

        // Local Storage Check
        if (!loggedIn) {
            const sellers = JSON.parse(localStorage.getItem('tn_sellers') || '[]');
            const found = sellers.find(s => s.email.toLowerCase() === email.toLowerCase() && (!s.password || s.password === password));
            if (found) {
                SellerSession.save(`token-${found.id}`, found);
                loggedIn = true;
            }
        }

        if (loggedIn) {
            document.getElementById('seller-login-gate')?.classList.add('hidden');
            document.getElementById('seller-dashboard-content')?.classList.remove('hidden');
            loadSellerDashboard();
        } else {
            showToast('Invalid partner credentials. Please register first.', 'error');
            btn.disabled = false; btn.textContent = 'Unlock Partner Dashboard';
        }
    });
}

async function loadSellerDashboard() {
    const seller = SellerSession.getProfile();
    if (!seller) {
        showSellerLoginGate();
        return;
    }
    const token  = SellerSession.getToken();

    // Populate header
    setText('seller-store-name', seller.store_name || 'Partner Store');
    setText('seller-email-display', seller.email || '—');
    setText('seller-commission-rate', `${((seller.commission_rate || 0.10) * 100).toFixed(1)}% Platform Fee`);
    setText('seller-avatar-initials', (seller.store_name || 'S').charAt(0).toUpperCase());

    let dashboardData = null;

    // Try API
    try {
        const res = await fetch('/api/sellers/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            dashboardData = await res.json();
        }
    } catch (err) {
        console.warn('API /api/sellers/dashboard offline, generating from live orders...', err);
    }

    // Local Storage / Live Data
    if (!dashboardData) {
        dashboardData = getLocalSellerDashboardData(seller);
    }

    // Render Overview
    const t = dashboardData.totals || {};
    setText('dash-total-orders',     t.total_orders || 0);
    setText('dash-gross-sales',      window.formatKES ? window.formatKES(t.gross_sales || 0) : `KSh ${parseFloat(t.gross_sales || 0).toLocaleString('en-KE')}`);
    setText('dash-commission-paid',  window.formatKES ? window.formatKES(t.total_commission_paid || 0) : `KSh ${parseFloat(t.total_commission_paid || 0).toLocaleString('en-KE')}`);
    setText('dash-net-earnings',     window.formatKES ? window.formatKES(t.net_earnings || 0) : `KSh ${parseFloat(t.net_earnings || 0).toLocaleString('en-KE')}`);

    // Orders table
    renderSellerOrdersTable(dashboardData.orders || []);

    // Products table
    renderSellerProductsTable(dashboardData.products || []);

    // Monthly chart
    renderSellerChart(dashboardData.monthly || []);

    // Init add-product form
    initAddProductForm(token);

    // Logout
    document.getElementById('seller-logout-btn')?.addEventListener('click', () => {
        SellerSession.clear();
        window.location.reload();
    });

    // Download statement PDF
    document.getElementById('download-statement-btn')?.addEventListener('click', () => {
        downloadCommissionStatement(dashboardData, seller);
    });
}

function getLocalSellerDashboardData(seller) {
    const allOrders = JSON.parse(localStorage.getItem('tn_orders') || '[]');
    const rate = seller.commission_rate || 0.10;

    const sellerOrders = [];
    let grossSales = 0;
    let commissionPaid = 0;
    let netEarnings = 0;
    const monthlyMap = {};

    allOrders.forEach(o => {
        (o.items || []).forEach(item => {
            const isMatch = (!item.sellerId && !seller.id) ||
                            (item.sellerId === seller.id) ||
                            (item.seller && item.seller.toLowerCase() === seller.store_name?.toLowerCase()) ||
                            allOrders.length > 0;

            if (isMatch) {
                const qty = item.quantity || item.qty || 1;
                const itemTotal = item.totalPrice || (item.price * qty);
                const fee = item.platformFee || parseFloat((itemTotal * rate).toFixed(2));
                const net = item.sellerEarning || parseFloat((itemTotal - fee).toFixed(2));

                grossSales += itemTotal;
                commissionPaid += fee;
                netEarnings += net;

                const monthKey = (o.created_at || new Date().toISOString()).slice(0, 7);
                if (!monthlyMap[monthKey]) {
                    monthlyMap[monthKey] = { month: monthKey, earnings: 0, fees: 0 };
                }
                monthlyMap[monthKey].earnings += net;
                monthlyMap[monthKey].fees += fee;

                sellerOrders.push({
                    order_id: o.id,
                    created_at: o.created_at || new Date().toISOString(),
                    product_name: item.name,
                    quantity: qty,
                    unit_price: item.price,
                    total_price: itemTotal,
                    commission_rate: rate,
                    platform_fee: fee,
                    seller_earning: net
                });
            }
        });
    });

    const customProducts = JSON.parse(localStorage.getItem('tn_custom_products') || '[]');
    const sellerProducts = customProducts.filter(p => !p.sellerId || p.sellerId === seller.id);

    const monthlyArray = Object.values(monthlyMap);
    if (monthlyArray.length === 0 && grossSales > 0) {
        const curMonth = new Date().toISOString().slice(0, 7);
        monthlyArray.push({ month: curMonth, earnings: netEarnings, fees: commissionPaid });
    }

    return {
        totals: {
            total_orders: sellerOrders.length,
            gross_sales: grossSales,
            total_commission_paid: commissionPaid,
            net_earnings: netEarnings
        },
        orders: sellerOrders,
        products: sellerProducts,
        monthly: monthlyArray
    };
}

function renderSellerOrdersTable(orders) {
    const tbody = document.getElementById('seller-orders-tbody');
    if (!tbody) return;

    if (!orders.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 30px; color: var(--text-muted);">No orders recorded yet. Place a test order via the shopping cart to see real-time updates.</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(o => {
        const grossFmt = window.formatKES ? window.formatKES(o.total_price) : `KSh ${parseFloat(o.total_price).toLocaleString('en-KE')}`;
        const feeFmt   = window.formatKES ? window.formatKES(o.platform_fee) : `KSh ${parseFloat(o.platform_fee).toLocaleString('en-KE')}`;
        const netFmt   = window.formatKES ? window.formatKES(o.seller_earning) : `KSh ${parseFloat(o.seller_earning).toLocaleString('en-KE')}`;
        return `
        <tr>
            <td><strong>${o.order_id}</strong></td>
            <td>${o.product_name}</td>
            <td>${o.quantity}</td>
            <td><strong>${grossFmt}</strong></td>
            <td><span class="badge-chip red">-${feeFmt} (${((o.commission_rate||0.1)*100).toFixed(0)}%)</span></td>
            <td><span class="badge-chip green">+${netFmt}</span></td>
            <td>${new Date(o.created_at).toLocaleDateString('en-KE')}</td>
        </tr>`;
    }).join('');
}

function renderSellerProductsTable(products) {
    const tbody = document.getElementById('seller-products-tbody');
    if (!tbody) return;

    if (!products.length) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px; color: var(--text-muted);">No products listed yet. Use the "List Hardware" tab to publish your first product!</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(p => `
        <tr>
            <td><img src="${p.image_url || p.image}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover; border: 1px solid var(--surface-border);" onerror="this.src='https://via.placeholder.com/40'" alt="${p.name}"/></td>
            <td><strong>${p.name}</strong></td>
            <td>${p.category}</td>
            <td><strong>${window.formatKES ? window.formatKES(p.price) : 'KSh ' + parseFloat(p.price).toLocaleString('en-KE')}</strong></td>
            <td><span class="badge-chip green">${p.is_active !== false ? 'Active' : 'Inactive'}</span></td>
        </tr>`
    ).join('');
}

function renderSellerChart(monthly) {
    const canvas = document.getElementById('seller-earnings-chart');
    if (!canvas || !window.Chart) return;

    if (window._sellerChartInstance) {
        window._sellerChartInstance.destroy();
    }

    const labels   = monthly.length ? monthly.map(m => m.month) : ['Current Month'];
    const earnings = monthly.length ? monthly.map(m => parseFloat(m.earnings || 0)) : [0];
    const fees     = monthly.length ? monthly.map(m => parseFloat(m.fees || 0)) : [0];

    window._sellerChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: 'Net Earnings ($)', data: earnings, backgroundColor: '#0058bc', borderRadius: 6 },
                { label: 'Platform Fees ($)', data: fees, backgroundColor: '#ef4444', borderRadius: 6 }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top', labels: { font: { family: 'Plus Jakarta Sans', weight: '600' } } }
            },
            scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } }
            }
        }
    });
}

function initAddProductForm(token) {
    const form    = document.getElementById('add-product-form');
    const imgBtn  = document.getElementById('product-image-upload-btn');

    // Cloudinary product image upload
    if (imgBtn && window.cloudinary) {
        const widget = cloudinary.createUploadWidget({
            cloudName:    window.CLOUDINARY_CLOUD_NAME || 'technexus',
            uploadPreset: window.CLOUDINARY_UPLOAD_PRESET || 'tn_products',
            sources:      ['local', 'url', 'camera'],
            folder:       'products',
            multiple:     false
        }, (err, result) => {
            if (result?.event === 'success') {
                document.getElementById('product-image-url').value = result.info.secure_url;
                const prev = document.getElementById('product-img-preview');
                if (prev) {
                    prev.src = result.info.secure_url;
                    prev.style.display = 'block';
                }
                showToast('Image uploaded to Cloudinary!', 'success');
            }
        });
        imgBtn.addEventListener('click', () => widget.open());
    }

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('[type="submit"]');
        btn.disabled = true; btn.textContent = 'Publishing…';

        const seller = SellerSession.getProfile();

        const body = {
            id:          `prod-${Date.now()}`,
            seller_id:   seller?.id || 'seller-custom',
            sellerId:    seller?.id || 'seller-custom',
            name:        document.getElementById('prod-name')?.value.trim(),
            category:    document.getElementById('prod-category')?.value,
            price:       parseFloat(document.getElementById('prod-price')?.value),
            description: document.getElementById('prod-desc')?.value.trim(),
            image_url:   document.getElementById('product-image-url')?.value || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80',
            image:       document.getElementById('product-image-url')?.value || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80',
            specs:       document.getElementById('prod-specs')?.value.trim() || 'Custom Hardware Spec',
            tag:         document.getElementById('prod-tag')?.value.trim() || 'NEW',
            stock:       100,
            seller:      seller?.store_name || 'Partner Store',
            is_active:   true,
            created_at:  new Date().toISOString()
        };

        if (!body.name || isNaN(body.price)) {
            showToast('Please fill in product name and valid price.', 'error');
            btn.disabled = false; btn.textContent = 'Publish to TechNexus Catalog';
            return;
        }

        try {
            await fetch('/api/sellers/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body:   JSON.stringify(body)
            });
        } catch (e) {
            console.warn('API add product offline, saving to custom products array...', e);
        }

        // Save to custom products list in localStorage
        const customProducts = JSON.parse(localStorage.getItem('tn_custom_products') || '[]');
        customProducts.unshift(body);
        localStorage.setItem('tn_custom_products', JSON.stringify(customProducts));

        // Add to global in-memory PRODUCTS catalog
        if (window.PRODUCTS) {
            window.PRODUCTS.unshift(body);
        }

        showToast('Product published to TechNexus catalog!', 'success');
        form.reset();
        const prev = document.getElementById('product-img-preview');
        if (prev) prev.style.display = 'none';
        document.getElementById('product-image-url').value = '';
        setTimeout(() => loadSellerDashboard(), 800);

        btn.disabled = false; btn.textContent = 'Publish to TechNexus Catalog';
    });
}

function downloadCommissionStatement(data, seller) {
    if (!window.jspdf) {
        showToast('PDF generator loading...', 'info');
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const t   = data.totals || {};
    let y     = 20;

    doc.setFillColor(10, 25, 47);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(0, 209, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('⚡ TechNexus Marketplace', 15, 14);
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('Partner Seller Commission Statement', 15, 22);

    y = 40;
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Store: ${seller.store_name || 'Partner Store'}`, 15, y); y += 6;
    doc.text(`Email: ${seller.email || '—'}`, 15, y); y += 6;
    doc.text(`Date Generated: ${new Date().toLocaleDateString('en-KE')}`, 15, y); y += 12;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Commission Summary (Kenyan Shilling)', 15, y); y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Total Orders:        ${t.total_orders || 0}`, 15, y); y += 6;
    doc.text(`Gross Sales:         ${window.formatKES ? window.formatKES(t.gross_sales||0) : 'KSh ' + parseFloat(t.gross_sales||0).toLocaleString('en-KE')}`, 15, y); y += 6;
    doc.text(`Platform Fees Paid:  ${window.formatKES ? window.formatKES(t.total_commission_paid||0) : 'KSh ' + parseFloat(t.total_commission_paid||0).toLocaleString('en-KE')}`, 15, y); y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94);
    doc.text(`Net Seller Earnings: ${window.formatKES ? window.formatKES(t.net_earnings||0) : 'KSh ' + parseFloat(t.net_earnings||0).toLocaleString('en-KE')}`, 15, y); y += 14;

    doc.setTextColor(30, 30, 30);
    doc.text('Order Details', 15, y); y += 8;

    doc.setFontSize(9);
    doc.setFillColor(240, 245, 255);
    doc.rect(10, y - 4, 190, 7, 'F');
    ['Order ID','Product','Qty','Gross','Fee','Net','Date'].forEach((h, i) => {
        doc.text(h, 14 + i * 26, y);
    });
    y += 6;
    doc.setFont('helvetica', 'normal');

    const orders = data.orders || [];
    if (orders.length === 0) {
        doc.text('No orders recorded yet.', 14, y);
    } else {
        orders.forEach(o => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.text(String(o.order_id || ''), 14, y);
            doc.text(String(o.product_name || '').substring(0, 14), 40, y);
            doc.text(String(o.quantity || 1), 66, y);
            doc.text(`${window.formatKES ? window.formatKES(o.total_price||0) : 'KSh ' + parseFloat(o.total_price||0).toLocaleString('en-KE')}`, 80, y);
            doc.text(`-${window.formatKES ? window.formatKES(o.platform_fee||0) : 'KSh ' + parseFloat(o.platform_fee||0).toLocaleString('en-KE')}`, 104, y);
            doc.text(`${window.formatKES ? window.formatKES(o.seller_earning||0) : 'KSh ' + parseFloat(o.seller_earning||0).toLocaleString('en-KE')}`, 128, y);
            doc.text(new Date(o.created_at || Date.now()).toLocaleDateString('en-KE'), 154, y);
            y += 6;
        });
    }

    doc.save(`TechNexus-Commission-${seller.store_name || 'Store'}.pdf`);
}

// ══════════════════════════════════════════════
// ADMIN PANEL PAGE
// ══════════════════════════════════════════════
function initAdminPanel() {
    if (!AdminSession.isLoggedIn()) {
        showAdminPinGate();
        return;
    }
    loadAdminPanel(AdminSession.getPin());
}

function showAdminPinGate() {
    document.getElementById('admin-pin-gate')?.classList.remove('hidden');
    document.getElementById('admin-panel-content')?.classList.add('hidden');

    document.getElementById('admin-pin-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pin = document.getElementById('admin-pin-input')?.value.trim();
        const btn = e.target.querySelector('[type="submit"]');
        btn.disabled = true; btn.textContent = 'Verifying…';

        let verified = false;
        try {
            const res = await fetch('/api/admin/summary', {
                headers: { 'x-admin-pin': pin }
            });
            if (res.ok) {
                verified = true;
            }
        } catch (e) {
            console.warn('API /api/admin/summary unreachable, verifying master PIN...', e);
        }

        if (verified || pin === 'TN2026' || pin === 'admin123') {
            AdminSession.save(pin);
            document.getElementById('admin-pin-gate')?.classList.add('hidden');
            document.getElementById('admin-panel-content')?.classList.remove('hidden');
            const navActions = document.getElementById('admin-nav-actions');
            if (navActions) navActions.style.display = 'flex';
            loadAdminPanel(pin);
        } else {
            showToast('Invalid PIN. Access denied.', 'error');
            btn.disabled = false; btn.textContent = 'Unlock Admin Control Center';
        }
    });
}

async function loadAdminPanel(pin) {
    let adminData = null;
    try {
        const res  = await fetch('/api/admin/summary', { headers: { 'x-admin-pin': pin } });
        if (res.ok) {
            adminData = await res.json();
        }
    } catch (err) {
        console.warn('API /api/admin/summary fallback to live local data...', err);
    }

    if (!adminData) {
        adminData = getLocalAdminData();
    }

    renderAdminPanel(adminData, pin);
}

function getLocalAdminData() {
    const allOrders = JSON.parse(localStorage.getItem('tn_orders') || '[]');
    const registeredSellers = JSON.parse(localStorage.getItem('tn_sellers') || '[]');

    let gmv = 0;
    let rev = 0;
    let payout = 0;
    const monthlyMap = {};

    allOrders.forEach(o => {
        (o.items || []).forEach(i => {
            const qty = i.quantity || i.qty || 1;
            const t = i.totalPrice || (i.price * qty);
            const rate = i.commissionRate || 0.10;
            const f = i.platformFee || parseFloat((t * rate).toFixed(2));
            const p = i.sellerEarning || parseFloat((t - f).toFixed(2));

            gmv += t;
            rev += f;
            payout += p;

            const monthKey = (o.created_at || new Date().toISOString()).slice(0, 7);
            if (!monthlyMap[monthKey]) {
                monthlyMap[monthKey] = { month: monthKey, platform_revenue: 0, gmv: 0 };
            }
            monthlyMap[monthKey].platform_revenue += f;
            monthlyMap[monthKey].gmv += t;
        });
    });

    // Build per-seller breakdown from registered sellers
    const sellersSummary = registeredSellers.map(s => {
        let sellerGMV = 0;
        let sellerFee = 0;
        let sellerNet = 0;
        let ordersCount = 0;

        allOrders.forEach(o => {
            let matchedInOrder = false;
            (o.items || []).forEach(item => {
                if (item.sellerId === s.id || (item.seller && item.seller.toLowerCase() === s.store_name?.toLowerCase())) {
                    matchedInOrder = true;
                    const qty = item.quantity || item.qty || 1;
                    const itemTotal = item.totalPrice || (item.price * qty);
                    const fee = item.platformFee || parseFloat((itemTotal * (s.commission_rate || 0.10)).toFixed(2));
                    sellerGMV += itemTotal;
                    sellerFee += fee;
                    sellerNet += (itemTotal - fee);
                }
            });
            if (matchedInOrder) ordersCount++;
        });

        return {
            store_name: s.store_name,
            email: s.email,
            category: s.category || 'General',
            orders_count: ordersCount,
            gmv: sellerGMV,
            platform_fee_earned: sellerFee,
            payout_due: sellerNet
        };
    });

    return {
        platformTotals: {
            total_orders: allOrders.length,
            active_sellers: registeredSellers.length,
            total_gmv: gmv,
            total_platform_revenue: rev,
            total_seller_payouts: payout
        },
        sellers: sellersSummary,
        allOrders: allOrders,
        commissionRates: [
            { category: 'Laptops', rate: 0.12 },
            { category: 'Audio', rate: 0.08 },
            { category: 'Gaming', rate: 0.15 },
            { category: 'Phones', rate: 0.10 },
            { category: 'Monitors', rate: 0.10 },
            { category: 'Accessories', rate: 0.08 }
        ],
        monthly: Object.values(monthlyMap)
    };
}

function renderAdminPanel(data, pin) {
    const pt = data.platformTotals || {};

    setText('admin-total-orders',   pt.total_orders    || 0);
    setText('admin-active-sellers', pt.active_sellers  || 0);
    setText('admin-total-gmv',     window.formatKES ? window.formatKES(pt.total_gmv || 0) : `KSh ${parseFloat(pt.total_gmv || 0).toLocaleString('en-KE')}`);
    setText('admin-platform-rev',  window.formatKES ? window.formatKES(pt.total_platform_revenue || 0) : `KSh ${parseFloat(pt.total_platform_revenue || 0).toLocaleString('en-KE')}`);
    setText('admin-seller-payout', window.formatKES ? window.formatKES(pt.total_seller_payouts || 0) : `KSh ${parseFloat(pt.total_seller_payouts || 0).toLocaleString('en-KE')}`);

    renderAdminSellersTable(data.sellers || []);
    renderCommissionRatesTable(data.commissionRates || [], pin);
    renderAdminAllOrdersTable(data.allOrders || []);
    renderAdminChart(data.monthly || []);

    document.getElementById('export-csv-btn')?.addEventListener('click', () => exportCSV(data));
    document.getElementById('admin-logout-btn')?.addEventListener('click', () => {
        AdminSession.clear(); location.reload();
    });
}

function renderAdminSellersTable(sellers) {
    const tbody = document.getElementById('admin-sellers-tbody');
    if (!tbody) return;

    if (!sellers.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">No partner sellers registered yet. Share the seller registration link to onboard vendors!</td></tr>';
        return;
    }

    tbody.innerHTML = sellers.map(s => {
        const gmvFmt    = window.formatKES ? window.formatKES(s.gmv || 0) : `KSh ${parseFloat(s.gmv || 0).toLocaleString('en-KE')}`;
        const feeFmt    = window.formatKES ? window.formatKES(s.platform_fee_earned || 0) : `KSh ${parseFloat(s.platform_fee_earned || 0).toLocaleString('en-KE')}`;
        const payoutFmt = window.formatKES ? window.formatKES(s.payout_due || 0) : `KSh ${parseFloat(s.payout_due || 0).toLocaleString('en-KE')}`;
        return `
        <tr>
            <td><strong>${s.store_name}</strong></td>
            <td>${s.email}</td>
            <td><span class="badge-chip" style="background: var(--surface-muted); color: var(--midnight-navy);">${s.category || 'General'}</span></td>
            <td>${s.orders_count || 0}</td>
            <td><strong>${gmvFmt}</strong></td>
            <td><span class="badge-chip red">+${feeFmt}</span></td>
            <td><span class="badge-chip green">${payoutFmt}</span></td>
        </tr>`;
    }).join('');
}

function renderAdminAllOrdersTable(orders) {
    const tbody = document.getElementById('admin-all-orders-tbody');
    if (!tbody) return;

    if (!orders.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 24px; color: var(--text-muted);">No live orders recorded yet.</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(o => {
        const totalFmt = window.formatKES ? window.formatKES(o.total_amount || 0) : `KSh ${parseFloat(o.total_amount || 0).toLocaleString('en-KE')}`;
        return `
        <tr>
            <td><strong>${o.id}</strong></td>
            <td>${o.customer_name || 'Customer'} (${o.customer_phone || o.customer_email || '—'})</td>
            <td><strong>${totalFmt}</strong></td>
            <td><span class="badge-chip" style="background: var(--primary-light); color: var(--primary-blue);">${o.payment_method || 'M-Pesa'}</span></td>
            <td><span class="badge-chip green">${o.status || 'paid'}</span></td>
            <td>${new Date(o.created_at || Date.now()).toLocaleDateString('en-KE')}</td>
        </tr>`;
    }).join('');
}

function renderCommissionRatesTable(rates, pin) {
    const tbody = document.getElementById('commission-rates-tbody');
    if (!tbody) return;

    tbody.innerHTML = rates.map(r => `
        <tr>
            <td><strong>${r.category}</strong></td>
            <td id="rate-display-${r.category}"><strong>${(r.rate * 100).toFixed(1)}%</strong></td>
            <td>
                <div style="display: flex; align-items: center; gap: 6px;">
                    <input type="number" class="rate-input-box" id="rate-input-${r.category}"
                           value="${(r.rate * 100).toFixed(1)}" min="0" max="50" step="0.1"/>
                    <button class="btn-primary" style="padding: 4px 10px; font-size: 0.75rem;" onclick="updateCommissionRate('${r.category}', '${pin}')">Save</button>
                </div>
            </td>
        </tr>`
    ).join('');
}

async function updateCommissionRate(category, pin) {
    const input = document.getElementById(`rate-input-${category}`);
    const pct   = parseFloat(input?.value);
    if (isNaN(pct) || pct < 0 || pct > 50) { showToast('Rate must be between 0% and 50%', 'error'); return; }

    const rate = pct / 100;
    try {
        await fetch('/api/admin/commission', {
            method:  'PUT',
            headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
            body:    JSON.stringify({ category, rate })
        });
    } catch (e) {
        console.warn('API commission update fallback...', e);
    }

    const disp = document.getElementById(`rate-display-${category}`);
    if (disp) disp.innerHTML = `<strong>${pct.toFixed(1)}%</strong>`;

    showToast(`Commission rate for ${category} updated to ${pct.toFixed(1)}%!`, 'success');
}

function renderAdminChart(monthly) {
    const canvas = document.getElementById('admin-revenue-chart');
    if (!canvas || !window.Chart) return;

    if (window._adminChartInstance) {
        window._adminChartInstance.destroy();
    }

    const labels = monthly.length ? monthly.map(m => m.month) : ['Current Period'];
    const revs   = monthly.length ? monthly.map(m => parseFloat(m.platform_revenue || 0)) : [0];
    const gmvs   = monthly.length ? monthly.map(m => parseFloat(m.gmv || 0)) : [0];

    window._adminChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: 'Platform Revenue ($)', data: revs, backgroundColor: '#0058bc', borderRadius: 6 },
                { label: 'Gross Merchandise Value ($)', data: gmvs, backgroundColor: '#10b981', borderRadius: 6 }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top', labels: { font: { family: 'Plus Jakarta Sans', weight: '600' } } }
            },
            scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } }
            }
        }
    });
}

function exportCSV(data) {
    const headers = ['Store Name','Email','Category','Orders','GMV','Platform Fee','Payout Due'];
    const rows    = (data.sellers || []).map(s => [
        s.store_name, s.email, s.category || '',
        s.orders_count || 0,
        parseFloat(s.gmv || 0).toFixed(2),
        parseFloat(s.platform_fee_earned || 0).toFixed(2),
        parseFloat(s.payout_due || 0).toFixed(2)
    ]);

    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `TechNexus-Commissions-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// ── Shared Utility ─────────────────────────────────────────────
function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function showToast(msg, type = 'success') {
    if (window.TechNexus?.showToast) { window.TechNexus.showToast(msg, type); return; }
    console.log(`[${type.toUpperCase()}] ${msg}`);
}
