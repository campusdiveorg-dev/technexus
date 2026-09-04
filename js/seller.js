/**
 * js/seller.js
 * Byte Tech Ltd — Merchant Portal + Admin Control Center Logic
 * Reliable authentication, real-time KES analytics, Cloudinary uploads, and statement generation
 */

// ── Seller Session Manager ─────────────────────────────────────
const SellerSession = {
    save(token, seller) {
        localStorage.setItem('tn_seller_token', token || `token-${seller.id}`);
        localStorage.setItem('tn_seller_profile', JSON.stringify(seller));
    },
    getToken() {
        return localStorage.getItem('tn_seller_token');
    },
    getProfile() {
        try {
            return JSON.parse(localStorage.getItem('tn_seller_profile') || 'null');
        } catch {
            return null;
        }
    },
    clear() {
        localStorage.removeItem('tn_seller_token');
        localStorage.removeItem('tn_seller_profile');
    },
    isLoggedIn() {
        return !!this.getToken() && !!this.getProfile();
    }
};

// ── Admin Session Manager ──────────────────────────────────────
const AdminSession = {
    save(pin)    { sessionStorage.setItem('tn_admin_pin', pin); },
    getPin()     { return sessionStorage.getItem('tn_admin_pin'); },
    clear()      { sessionStorage.removeItem('tn_admin_pin'); },
    isLoggedIn() { return !!this.getPin(); }
};

// ── Auto Initialization on Load ────────────────────────────────
function autoInitSeller() {
    if (document.getElementById('seller-register-form')) {
        initSellerRegister();
    }
    if (document.getElementById('seller-login-gate') || document.getElementById('seller-dashboard-content')) {
        initSellerDashboard();
    }
    if (document.getElementById('admin-pin-gate') || document.getElementById('admin-dashboard-content')) {
        initAdminPanel();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInitSeller);
} else {
    autoInitSeller();
}

// ══════════════════════════════════════════════════════════════
// 1. SELLER REGISTRATION
// ══════════════════════════════════════════════════════════════
function initSellerRegister() {
    const form = document.getElementById('seller-register-form');
    const logoBtn = document.getElementById('logo-upload-btn');

    // Store Logo Upload (Cloudinary Signed API + Local File Reader + Camera + URL Fallback)
    const logoUrlInput  = document.getElementById('logo-url-input');
    const logoFileInput = document.getElementById('logo-local-file-input');
    const logoCamInput  = document.getElementById('logo-camera-input');
    const logoPreview   = document.getElementById('logo-preview');
    const btnLogoCamera = document.getElementById('btn-logo-camera');
    const btnLogoBrowse = document.getElementById('btn-logo-browse');

    if (logoUrlInput && logoPreview) {
        logoUrlInput.addEventListener('input', () => {
            const url = logoUrlInput.value.trim();
            if (url) {
                logoPreview.src = url;
                logoPreview.style.display = 'block';
            }
        });
    }

    async function processLogoFile(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (evt) => {
            const dataUrl = evt.target.result;
            if (logoPreview) {
                logoPreview.src = dataUrl;
                logoPreview.style.display = 'block';
            }
            if (logoUrlInput) logoUrlInput.value = dataUrl;

            // Upload to signed backend
            try {
                showToast('Uploading logo to Cloudinary...', 'info');
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ file: dataUrl, folder: 'seller_logos' })
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.secure_url) {
                        if (logoUrlInput) logoUrlInput.value = data.secure_url;
                        if (logoPreview) logoPreview.src = data.secure_url;
                        showToast('Logo saved to Cloudinary CDN!', 'success');
                    }
                }
            } catch(err) {
                console.warn('Backend upload fallback:', err);
            }
        };
        reader.readAsDataURL(file);
    }

    if (logoFileInput) logoFileInput.addEventListener('change', (e) => processLogoFile(e.target.files?.[0]));
    if (logoCamInput)  logoCamInput.addEventListener('change',  (e) => processLogoFile(e.target.files?.[0]));

    if (btnLogoCamera) {
        btnLogoCamera.addEventListener('click', (e) => {
            e.stopPropagation();
            if (logoCamInput) logoCamInput.click();
        });
    }
    if (btnLogoBrowse) {
        btnLogoBrowse.addEventListener('click', (e) => {
            e.stopPropagation();
            if (logoFileInput) logoFileInput.click();
        });
    }
    if (logoBtn) {
        logoBtn.addEventListener('click', () => {
            if (logoFileInput) logoFileInput.click();
        });
    }

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('[type="submit"]');
        submitBtn.disabled    = true;
        submitBtn.textContent = 'Registering Storefront…';

        const categoryRates = {
            'Laptops': 0.12, 'Audio': 0.08, 'Gaming': 0.15,
            'Phones': 0.10, 'Monitors': 0.10, 'Accessories': 0.08
        };

        const selectedCat = document.getElementById('reg-category')?.value || 'Accessories';
        const rate = categoryRates[selectedCat] || 0.10;

        const email = document.getElementById('reg-email')?.value.trim();
        const password = document.getElementById('reg-password')?.value;
        const confirm = document.getElementById('reg-confirm-password')?.value;

        if (password !== confirm) {
            showToast('Passwords do not match.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Register Partner Storefront';
            return;
        }

        const body = {
            id:              `seller-${Date.now()}`,
            store_name:      document.getElementById('reg-store-name')?.value.trim(),
            full_name:       document.getElementById('reg-full-name')?.value.trim(),
            email:           email,
            password:        password,
            phone:           document.getElementById('reg-phone')?.value.trim(),
            category:        selectedCat,
            commission_rate: rate,
            logo_url:        document.getElementById('logo-url-input')?.value || '',
            created_at:      new Date().toISOString()
        };

        let registered = false;

        // Try API endpoint
        try {
            const res = await fetch('/api/sellers/register', {
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
            console.warn('API /api/sellers/register offline, saving to local repository...', err);
        }

        // Always save to localStorage registry
        const sellers = JSON.parse(localStorage.getItem('tn_sellers') || '[]');
        const existingIdx = sellers.findIndex(s => s.email && s.email.toLowerCase() === email.toLowerCase());
        if (existingIdx >= 0) {
            sellers[existingIdx] = body;
        } else {
            sellers.push(body);
        }
        localStorage.setItem('tn_sellers', JSON.stringify(sellers));

        if (!registered) {
            SellerSession.save(`token-${body.id}`, body);
        }

        showToast('Store registered successfully! Redirecting…', 'success');
        setTimeout(() => {
            window.location.href = 'seller-dashboard.html';
        }, 800);
    });
}

// ══════════════════════════════════════════════════════════════
// 2. SELLER DASHBOARD & LOGIN GATE
// ══════════════════════════════════════════════════════════════
function initSellerDashboard() {
    if (!SellerSession.isLoggedIn()) {
        showSellerLoginGate();
        return;
    }
    loadSellerDashboard();
}

function showSellerLoginGate() {
    const loginGate = document.getElementById('seller-login-gate');
    const dashContent = document.getElementById('seller-dashboard-content');
    const authControls = document.getElementById('seller-auth-controls');

    if (loginGate) loginGate.classList.remove('hidden');
    if (dashContent) dashContent.classList.add('hidden');
    if (authControls) authControls.classList.add('hidden');

    const form = document.getElementById('seller-login-form');
    const btn = document.getElementById('login-submit-btn');

    if (form) {
        form.onsubmit = (e) => {
            if (e) e.preventDefault();
            performSellerLogin();
            return false;
        };
    }
    if (btn) {
        btn.onclick = (e) => {
            if (e) e.preventDefault();
            performSellerLogin();
        };
    }
}

async function performSellerLogin() {
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const btn = document.getElementById('login-submit-btn');

    const email = (emailInput?.value || '').trim();
    const password = passwordInput?.value || '';

    if (!email || !password) {
        showToast('Please enter your partner email and password.', 'error');
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="material-symbols-outlined spin" style="font-size:18px;">sync</span> <span>Authenticating…</span>';
    }

    let loggedIn = false;

    // 1. Try Backend API
    try {
        const res = await fetch('/api/sellers/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (res.ok) {
            const data = await res.json();
            SellerSession.save(data.token, data.seller);
            loggedIn = true;
        } else if (res.status === 403) {
            const data = await res.json().catch(() => ({}));
            showToast(data.error || 'Your partner account has been suspended by the administrator.', 'error');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 18px;">lock_open</span> <span>Unlock Partner Dashboard</span>';
            }
            return;
        }
    } catch (err) {
        console.warn('API /api/sellers/login unreachable, verifying against local repository...', err);
    }

    // 2. Check Local Registry Fallback
    if (!loggedIn) {
        const sellers = JSON.parse(localStorage.getItem('tn_sellers') || '[]');
        const found = sellers.find(s => 
            s.email && s.email.toLowerCase() === email.toLowerCase() && 
            (!s.password || s.password === password)
        );

        if (found) {
            if (found.is_active === false) {
                showToast('Your account has been suspended. Please contact the platform administrator.', 'error');
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 18px;">lock_open</span> <span>Unlock Partner Dashboard</span>';
                }
                return;
            }
            SellerSession.save(`token-${found.id}`, found);
            loggedIn = true;
        }
    }

    // 3. Direct account fallback if created recently
    if (!loggedIn) {
        const existingProfile = SellerSession.getProfile();
        if (existingProfile && existingProfile.email?.toLowerCase() === email.toLowerCase()) {
            loggedIn = true;
        }
    }

    if (loggedIn) {
        showToast('Login successful! Welcome back.', 'success');
        loadSellerDashboard();
    } else {
        showToast('Invalid partner email or password. Please verify credentials.', 'error');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 18px;">lock_open</span> <span>Unlock Partner Dashboard</span>';
        }
    }
}

async function loadSellerDashboard() {
    const seller = SellerSession.getProfile();
    if (!seller) {
        showSellerLoginGate();
        return;
    }

    // Check account active/suspended status from registry
    try {
        const sellers = JSON.parse(localStorage.getItem('tn_sellers') || '[]');
        const current = sellers.find(s => (s.id && s.id === seller.id) || (s.email && seller.email && s.email.toLowerCase() === seller.email.toLowerCase()));
        if (current && current.is_active === false) {
            SellerSession.clear();
            showToast('Your partner account has been suspended by administrator.', 'error');
            showSellerLoginGate();
            return;
        }
    } catch (_) {}

    const loginGate = document.getElementById('seller-login-gate');
    const dashContent = document.getElementById('seller-dashboard-content');
    const authControls = document.getElementById('seller-auth-controls');

    if (loginGate) loginGate.classList.add('hidden');
    if (dashContent) dashContent.classList.remove('hidden');
    if (authControls) authControls.classList.remove('hidden');

    const token = SellerSession.getToken();

    // Populate Sidebar Profile
    setText('seller-store-name', seller.store_name || 'Partner Store');
    setText('seller-email-display', seller.email || 'partner@bytetech.co.ke');
    setText('seller-commission-rate', `${((seller.commission_rate || 0.12) * 100).toFixed(0)}% Fee Tier`);
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
        console.warn('API /api/sellers/dashboard offline, calculating live stats...', err);
    }

    // Local Storage Live Orders Calculation
    if (!dashboardData || !dashboardData.totals) {
        dashboardData = getLocalSellerDashboardData(seller);
    }

    // Render Stats
    const t = dashboardData.totals || {};
    setText('dash-total-orders', t.total_orders || 0);
    setText('dash-gross-sales', formatKSh(t.gross_sales || 0));
    setText('dash-commission-paid', formatKSh(t.total_commission_paid || 0));
    setText('dash-net-earnings', formatKSh(t.net_earnings || 0));

    // Render Tables
    renderSellerOrdersTable(dashboardData.orders || []);
    renderSellerProductsTable(dashboardData.products || [], seller);

    // Render Chart
    renderSellerChart(dashboardData.monthly || []);

    // Init Product Listing Form
    initAddProductForm(token, seller);
    initEditProductForm(token, seller);

    // Wire statement download
    const statementBtn = document.getElementById('download-statement-btn');
    if (statementBtn) {
        statementBtn.onclick = () => downloadCommissionStatement(dashboardData, seller);
    }
}

function getLocalSellerDashboardData(seller) {
    const allOrders = JSON.parse(localStorage.getItem('tn_orders') || '[]');
    const rate = seller.commission_rate || 0.12;

    const sellerOrders = [];
    let grossSales = 0;
    let commissionPaid = 0;
    let netEarnings = 0;
    const monthlyMap = {};

    allOrders.forEach(o => {
        (o.items || []).forEach(item => {
            const isMatch = (item.sellerId && item.sellerId === seller.id) ||
                            (item.seller && item.seller.toLowerCase() === seller.store_name?.toLowerCase()) ||
                            (item.sellerEmail && item.sellerEmail.toLowerCase() === seller.email?.toLowerCase());

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
                    seller_earning: net,
                    payment_method: o.payment_method || 'M-Pesa (IntaSend)'
                });
            }
        });
    });

    const customProducts = JSON.parse(localStorage.getItem('tn_custom_products') || '[]');
    const sellerProducts = customProducts.filter(p => !p.sellerId || p.sellerId === seller.id);

    const monthlyArray = Object.values(monthlyMap);
    if (monthlyArray.length === 0) {
        const curMonth = new Date().toISOString().slice(0, 7);
        monthlyArray.push({
            month: curMonth,
            earnings: netEarnings || 0,
            fees: commissionPaid || 0
        });
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
    const tbodyFull = document.getElementById('seller-orders-tbody');
    const tbodyOverview = document.getElementById('seller-overview-orders-tbody');

    if (!orders.length) {
        const emptyRow = '<tr><td colspan="8" style="text-align: center; padding: 28px; color: var(--seller-muted);">No orders recorded yet. Make a purchase via the shopping cart to see live transactions.</td></tr>';
        if (tbodyFull) tbodyFull.innerHTML = emptyRow;
        if (tbodyOverview) tbodyOverview.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--seller-muted);">No recent order activity.</td></tr>';
        return;
    }

    if (tbodyFull) {
        tbodyFull.innerHTML = orders.map(o => `
            <tr>
                <td><strong>${o.order_id}</strong></td>
                <td>${o.product_name}</td>
                <td>${o.quantity}</td>
                <td><strong>${formatKSh(o.total_price)}</strong></td>
                <td><span class="badge-chip red">-${formatKSh(o.platform_fee)} (${((o.commission_rate || 0.12)*100).toFixed(0)}%)</span></td>
                <td><span class="badge-chip green">+${formatKSh(o.seller_earning)}</span></td>
                <td><span class="badge-chip blue">${o.payment_method || 'M-Pesa'}</span></td>
                <td>${new Date(o.created_at).toLocaleDateString('en-KE')}</td>
            </tr>
        `).join('');
    }

    if (tbodyOverview) {
        tbodyOverview.innerHTML = orders.slice(0, 5).map(o => `
            <tr>
                <td><strong>${o.order_id}</strong></td>
                <td>${o.product_name}</td>
                <td>${o.quantity}</td>
                <td><strong>${formatKSh(o.total_price)}</strong></td>
                <td><span class="badge-chip red">-${formatKSh(o.platform_fee)}</span></td>
                <td><span class="badge-chip green">+${formatKSh(o.seller_earning)}</span></td>
                <td>${new Date(o.created_at).toLocaleDateString('en-KE')}</td>
            </tr>
        `).join('');
    }
}

function renderSellerProductsTable(products, seller) {
    const tbody = document.getElementById('seller-products-tbody');
    if (!tbody) return;

    window._currentSellerProducts = products || [];

    if (!products.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 28px; color: var(--seller-muted);">No products listed yet. Use the "List Hardware" tab to publish your first hardware item!</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(p => {
        const isActive = (p.is_active === true || p.is_active === 1 || p.is_active === 'true' || p.is_active === undefined);
        const safeId = (p.id || '').replace(/'/g, "\\'");
        return `
        <tr>
            <td>
                <img src="${p.image_url || p.image || 'https://via.placeholder.com/44'}" 
                     style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover; border: 1px solid var(--seller-border);" 
                     onerror="this.src='https://via.placeholder.com/44'" 
                     alt="${p.name}"/>
            </td>
            <td><strong>${p.name}</strong></td>
            <td><span class="badge-chip blue">${p.category}</span></td>
            <td><strong>${formatKSh(p.price)}</strong></td>
            <td><span class="badge-chip ${isActive ? 'green' : 'red'}">${isActive ? 'Live & Selling' : 'Draft / Hidden'}</span></td>
            <td style="text-align: right; white-space: nowrap;">
                <button type="button" class="btn-action-icon btn-action-edit" onclick="openEditProductModal('${safeId}')" title="Edit Listing">
                    <span class="material-symbols-outlined" style="font-size:15px;">edit</span>
                    <span>Edit</span>
                </button>
                <button type="button" class="btn-action-icon btn-action-delete" onclick="deleteSellerProduct('${safeId}')" title="Delete Listing" style="margin-left: 6px;">
                    <span class="material-symbols-outlined" style="font-size:15px;">delete</span>
                    <span>Delete</span>
                </button>
            </td>
        </tr>
    `;
    }).join('');
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
                { 
                    label: 'Net Seller Payout (KSh)', 
                    data: earnings, 
                    backgroundColor: '#0058bc', 
                    borderRadius: 6 
                },
                { 
                    label: 'Platform Commission (KSh)', 
                    data: fees, 
                    backgroundColor: '#ef4444', 
                    borderRadius: 6 
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { 
                    position: 'top', 
                    labels: { font: { family: 'Plus Jakarta Sans', weight: '600' } } 
                }
            },
            scales: {
                x: { grid: { display: false } },
                y: { 
                    beginAtZero: true, 
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: {
                        callback: (val) => `KSh ${(val/1000).toFixed(0)}k`
                    }
                }
            }
        }
    });
}

// ══════════════════════════════════════════════════════════════
// 3. PUBLISH PRODUCT
// ══════════════════════════════════════════════════════════════
function initAddProductForm(token, seller) {
    const form = document.getElementById('add-product-form');
    const imgBtn = document.getElementById('product-image-upload-btn');

    // Product Image Upload (Cloudinary Signed API + Local File Reader + Camera + Direct URL)
    const prodUrlInput   = document.getElementById('product-image-url');
    const prodFileInput  = document.getElementById('product-local-file-input');
    const prodCamInput   = document.getElementById('product-camera-input');
    const prodPrev       = document.getElementById('product-img-preview');
    const btnCamera      = document.getElementById('btn-open-camera');
    const btnBrowse      = document.getElementById('btn-browse-file');

    if (prodUrlInput && prodPrev) {
        prodUrlInput.addEventListener('input', () => {
            const url = prodUrlInput.value.trim();
            if (url) {
                prodPrev.src = url;
                prodPrev.style.display = 'block';
            }
        });
    }

    async function processProductPhoto(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (evt) => {
            const dataUrl = evt.target.result;
            if (prodPrev) {
                prodPrev.src = dataUrl;
                prodPrev.style.display = 'block';
            }
            if (prodUrlInput) prodUrlInput.value = dataUrl;

            // Upload to signed backend Cloudinary
            try {
                showToast('Uploading photo to Cloudinary CDN...', 'info');
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ file: dataUrl, folder: 'products' })
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.secure_url) {
                        if (prodUrlInput) prodUrlInput.value = data.secure_url;
                        if (prodPrev) prodPrev.src = data.secure_url;
                        showToast('Hardware photo uploaded to Cloudinary!', 'success');
                    }
                }
            } catch(err) {
                console.warn('Backend upload fallback:', err);
            }
        };
        reader.readAsDataURL(file);
    }

    if (prodFileInput) {
        prodFileInput.addEventListener('change', (e) => processProductPhoto(e.target.files?.[0]));
    }
    if (prodCamInput) {
        prodCamInput.addEventListener('change', (e) => processProductPhoto(e.target.files?.[0]));
    }

    // ── Camera: getUserMedia modal on desktop; native capture on mobile ──────
    if (btnCamera) {
        btnCamera.addEventListener('click', async (e) => {
            e.stopPropagation();

            // Mobile: native camera via capture attribute is most reliable
            const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
            if (isMobile && prodCamInput) {
                prodCamInput.click();
                return;
            }

            // Desktop: use getUserMedia live camera modal
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                showToast('Camera access is not supported by this browser.', 'error');
                return;
            }

            // Build camera modal once, reuse on subsequent clicks
            let modal = document.getElementById('camera-capture-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'camera-capture-modal';
                modal.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.88);display:none;align-items:center;justify-content:center;';
                modal.innerHTML = `
                  <div style="background:#0a192f;border-radius:16px;padding:24px;max-width:520px;width:95%;text-align:center;box-shadow:0 30px 80px rgba(0,0,0,0.6);">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
                      <span style="font-weight:800;font-size:1rem;color:#fff;display:flex;align-items:center;gap:6px;">
                        <span class="material-symbols-outlined" style="font-size:20px;color:#00d1ff;">photo_camera</span>
                        Take Product Photo
                      </span>
                      <button id="cam-modal-close" style="background:rgba(255,255,255,0.12);border:none;color:#fff;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:20px;line-height:1;">&times;</button>
                    </div>
                    <video id="cam-live-feed" autoplay playsinline muted style="width:100%;border-radius:10px;background:#000;max-height:320px;object-fit:cover;display:block;"></video>
                    <canvas id="cam-snapshot-canvas" style="display:none;"></canvas>
                    <div style="display:flex;gap:10px;justify-content:center;margin-top:16px;flex-wrap:wrap;">
                      <button id="cam-capture-btn" style="background:linear-gradient(135deg,#00d1ff,#0058bc);color:#fff;border:none;border-radius:50px;padding:10px 24px;font-weight:700;cursor:pointer;font-size:0.9rem;display:inline-flex;align-items:center;gap:6px;">
                        <span class="material-symbols-outlined" style="font-size:18px;">camera</span> Capture
                      </button>
                      <button id="cam-flip-btn" style="background:rgba(255,255,255,0.08);color:#fff;border:1px solid rgba(255,255,255,0.2);border-radius:50px;padding:10px 16px;font-weight:600;cursor:pointer;font-size:0.85rem;display:inline-flex;align-items:center;gap:6px;">
                        <span class="material-symbols-outlined" style="font-size:16px;">flip_camera_ios</span> Flip
                      </button>
                    </div>
                    <p id="cam-error-msg" style="color:#f87171;font-size:0.8rem;margin-top:10px;display:none;"></p>
                  </div>`;
                document.body.appendChild(modal);
            }

            modal.style.display = 'flex';

            const vid      = document.getElementById('cam-live-feed');
            const canv     = document.getElementById('cam-snapshot-canvas');
            const capBtn   = document.getElementById('cam-capture-btn');
            const clsBtn   = document.getElementById('cam-modal-close');
            const flpBtn   = document.getElementById('cam-flip-btn');
            const errP     = document.getElementById('cam-error-msg');

            let camStream = null;
            let facing = 'environment';

            async function startCam(facingMode) {
                if (camStream) camStream.getTracks().forEach(t => t.stop());
                try {
                    camStream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
                        audio: false
                    });
                    vid.srcObject = camStream;
                    errP.style.display = 'none';
                } catch (err) {
                    errP.textContent = 'Camera error: ' + (err.message || 'Permission denied. Check browser settings.');
                    errP.style.display = 'block';
                    console.warn('[Camera]', err);
                }
            }

            function closeCam() {
                if (camStream) { camStream.getTracks().forEach(t => t.stop()); camStream = null; }
                vid.srcObject = null;
                modal.style.display = 'none';
            }

            await startCam(facing);

            flpBtn.onclick = async () => {
                facing = facing === 'environment' ? 'user' : 'environment';
                await startCam(facing);
            };

            capBtn.onclick = () => {
                if (!camStream) return;
                canv.width  = vid.videoWidth  || 640;
                canv.height = vid.videoHeight || 480;
                canv.getContext('2d').drawImage(vid, 0, 0, canv.width, canv.height);
                const dataUrl = canv.toDataURL('image/jpeg', 0.92);
                if (prodPrev)     { prodPrev.src = dataUrl; prodPrev.style.display = 'block'; }
                if (prodUrlInput) prodUrlInput.value = dataUrl;
                closeCam();
                showToast('Photo captured! Uploading to CDN...', 'success');
                canv.toBlob(async (blob) => {
                    const file = new File([blob], 'product-' + Date.now() + '.jpg', { type: 'image/jpeg' });
                    await processProductPhoto(file);
                }, 'image/jpeg', 0.92);
            };

            clsBtn.onclick = closeCam;
            modal.onclick  = (ev) => { if (ev.target === modal) closeCam(); };
        });
    }
    if (btnBrowse) {
        btnBrowse.addEventListener('click', (e) => {
            e.stopPropagation();
            if (prodFileInput) prodFileInput.click();
        });
    }
    if (imgBtn && !imgBtn.dataset.bound) {
        imgBtn.dataset.bound = 'true';
        imgBtn.addEventListener('click', () => {
            if (prodFileInput) prodFileInput.click();
        });
    }

    if (!form || form.dataset.bound) return;
    form.dataset.bound = 'true';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-publish-product');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span class="material-symbols-outlined spin" style="font-size:18px;">sync</span> <span>Publishing to Catalog…</span>';
        }

        const name = document.getElementById('prod-name')?.value.trim();
        const price = parseFloat(document.getElementById('prod-price')?.value);
        const category = document.getElementById('prod-category')?.value || 'Laptops';

        if (!name || isNaN(price) || price <= 0) {
            showToast('Please enter a valid product name and retail price.', 'error');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">publish</span> <span>Publish Hardware to Storefront</span>';
            }
            return;
        }

        const categoryRates = {
            'Laptops': 0.12, 'Audio': 0.08, 'Gaming': 0.15,
            'Phones': 0.10, 'Monitors': 0.10, 'Accessories': 0.08
        };
        const commissionRate = categoryRates[category] || 0.10;

        const body = {
            id:          `prod-${Date.now()}-${Math.random().toString(36).substring(2,6).toUpperCase()}`,
            seller_id:   seller?.id || 'seller-custom',
            sellerId:    seller?.id || 'seller-custom',
            seller:      seller?.store_name || 'Apex Hardware Nairobi',
            name:        name,
            category:    category,
            price:       price,
            commission_rate: commissionRate,
            description: document.getElementById('prod-desc')?.value.trim() || '',
            image_url:   document.getElementById('product-image-url')?.value || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80',
            image:       document.getElementById('product-image-url')?.value || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80',
            specs:       document.getElementById('prod-specs')?.value.trim() || 'Intel Core Ultra • 32GB RAM • 1TB NVMe',
            tag:         document.getElementById('prod-tag')?.value.trim() || 'VERIFIED PARTNER',
            stock:       50,
            is_active:   true,
            created_at:  new Date().toISOString()
        };

        // 1. Try Backend API
        try {
            const res = await fetch('/api/sellers/products', {
                method:  'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                const data = await res.json();
                if (data?.product?.id) {
                    body.id = data.product.id;
                }
            } else {
                console.warn('API /api/sellers/products responded with status:', res.status);
            }
        } catch (e) {
            console.warn('API /api/sellers/products offline, storing in local repository...', e);
        }

        // 2. Persist locally to custom products repository (deduplicating by ID)
        const customProducts = JSON.parse(localStorage.getItem('tn_custom_products') || '[]');
        const existingIdx = customProducts.findIndex(p => p.id === body.id);
        if (existingIdx >= 0) {
            customProducts[existingIdx] = body;
        } else {
            customProducts.unshift(body);
        }
        localStorage.setItem('tn_custom_products', JSON.stringify(customProducts));
        if (typeof window.loadLocalSellerProducts === 'function') {
            window.loadLocalSellerProducts();
        }
        window.dispatchEvent(new CustomEvent('products-updated'));

        showToast(`"${name}" published to Byte Tech Ltd catalog!`, 'success');
        form.reset();
        document.getElementById('product-img-preview').style.display = 'none';

        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">publish</span> <span>Publish Hardware to Storefront</span>';
        }

        // Reload dashboard catalog & switch to catalog tab
        loadSellerDashboard();
        if (typeof window.switchDashTab === 'function') {
            window.switchDashTab('products');
        }
    });
}

// ══════════════════════════════════════════════════════════════
// 3.5 EDIT & DELETE PRODUCTS
// ══════════════════════════════════════════════════════════════
function updateEditCalcPreview() {
    const price = parseFloat(document.getElementById('edit-prod-price')?.value) || 0;
    const cat = document.getElementById('edit-prod-category')?.value || 'Laptops';
    const rates = { 'Laptops': 0.12, 'Audio': 0.08, 'Gaming': 0.15, 'Phones': 0.10, 'Monitors': 0.10, 'Accessories': 0.08 };
    const rate = rates[cat] || 0.10;
    const fee = price * rate;
    const net = price - fee;

    const priceDisp = document.getElementById('edit-calc-price-disp');
    const feeDisp = document.getElementById('edit-calc-fee-disp');
    const netDisp = document.getElementById('edit-calc-net-disp');

    if (priceDisp) priceDisp.textContent = `KSh ${price.toLocaleString('en-KE')}`;
    if (feeDisp) feeDisp.textContent = `-KSh ${fee.toLocaleString('en-KE')} (${(rate*100).toFixed(0)}%)`;
    if (netDisp) netDisp.textContent = `+KSh ${net.toLocaleString('en-KE')}`;
}

function openEditProductModal(productId) {
    const products = window._currentSellerProducts || [];
    const custom = JSON.parse(localStorage.getItem('tn_custom_products') || '[]');
    let product = products.find(p => String(p.id) === String(productId));
    if (!product) {
        product = custom.find(p => String(p.id) === String(productId));
    }
    if (!product && window.PRODUCTS) {
        product = window.PRODUCTS.find(p => String(p.id) === String(productId));
    }
    if (!product) {
        showToast('Product listing not found.', 'error');
        return;
    }

    const idInput = document.getElementById('edit-prod-id');
    const nameInput = document.getElementById('edit-prod-name');
    const catInput = document.getElementById('edit-prod-category');
    const priceInput = document.getElementById('edit-prod-price');
    const descInput = document.getElementById('edit-prod-desc');
    const specsInput = document.getElementById('edit-prod-specs');
    const tagInput = document.getElementById('edit-prod-tag');
    const statusInput = document.getElementById('edit-prod-status');
    const stockInput = document.getElementById('edit-prod-stock');
    const imgUrlInput = document.getElementById('edit-prod-image-url');
    const imgPrev = document.getElementById('edit-prod-img-preview');

    if (idInput) idInput.value = product.id;
    if (nameInput) nameInput.value = product.name || '';
    if (catInput) catInput.value = product.category || 'Laptops';
    if (priceInput) priceInput.value = product.price || '';
    if (descInput) descInput.value = product.description || '';
    if (specsInput) specsInput.value = product.specs || '';
    if (tagInput) tagInput.value = product.tag || '';
    if (statusInput) statusInput.value = String(product.is_active !== false);
    if (stockInput) stockInput.value = product.stock ?? 50;

    const imgUrl = product.image_url || product.image || '';
    if (imgUrlInput) imgUrlInput.value = imgUrl;
    if (imgPrev) {
        if (imgUrl) {
            imgPrev.src = imgUrl;
            imgPrev.style.display = 'block';
        } else {
            imgPrev.style.display = 'none';
        }
    }

    updateEditCalcPreview();

    const overlay = document.getElementById('edit-product-modal-overlay');
    if (overlay) {
        overlay.classList.add('active');
    }
}

function closeEditProductModal() {
    const overlay = document.getElementById('edit-product-modal-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

async function deleteSellerProduct(productId) {
    if (!confirm('Are you sure you want to permanently delete this product listing? This action cannot be undone.')) {
        return;
    }

    const token = SellerSession.getToken();

    // 1. Delete from Backend API
    try {
        await fetch(`/api/sellers/products?id=${encodeURIComponent(productId)}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (e) {
        console.warn('API /api/sellers/products DELETE offline:', e);
    }

    // 2. Remove from LocalStorage
    const custom = JSON.parse(localStorage.getItem('tn_custom_products') || '[]');
    const filtered = custom.filter(p => String(p.id) !== String(productId));
    localStorage.setItem('tn_custom_products', JSON.stringify(filtered));

    // 3. Sync window.PRODUCTS and trigger catalog update
    if (typeof window.loadLocalSellerProducts === 'function') {
        window.loadLocalSellerProducts();
    }
    if (window.PRODUCTS) {
        window.PRODUCTS = window.PRODUCTS.filter(p => String(p.id) !== String(productId));
    }
    window.dispatchEvent(new CustomEvent('products-updated'));

    showToast('Product successfully deleted from catalog.', 'info');

    // 4. Reload seller dashboard
    loadSellerDashboard();
}

function initEditProductForm(token, seller) {
    const form = document.getElementById('edit-product-form');
    const priceInput = document.getElementById('edit-prod-price');
    const catInput = document.getElementById('edit-prod-category');
    const imgInput = document.getElementById('edit-prod-image-url');
    const imgPrev = document.getElementById('edit-prod-img-preview');
    const overlay = document.getElementById('edit-product-modal-overlay');

    if (overlay && !overlay.dataset.bound) {
        overlay.dataset.bound = 'true';
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeEditProductModal();
        });
    }

    if (priceInput && !priceInput.dataset.bound) {
        priceInput.dataset.bound = 'true';
        priceInput.addEventListener('input', updateEditCalcPreview);
    }
    if (catInput && !catInput.dataset.bound) {
        catInput.dataset.bound = 'true';
        catInput.addEventListener('change', updateEditCalcPreview);
    }
    if (imgInput && !imgInput.dataset.bound) {
        imgInput.dataset.bound = 'true';
        imgInput.addEventListener('input', () => {
            const url = imgInput.value.trim();
            if (imgPrev) {
                if (url) {
                    imgPrev.src = url;
                    imgPrev.style.display = 'block';
                } else {
                    imgPrev.style.display = 'none';
                }
            }
        });
    }

    if (!form || form.dataset.bound) return;
    form.dataset.bound = 'true';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-prod-id')?.value;
        const name = document.getElementById('edit-prod-name')?.value.trim();
        const price = parseFloat(document.getElementById('edit-prod-price')?.value);
        const category = document.getElementById('edit-prod-category')?.value || 'Laptops';
        const description = document.getElementById('edit-prod-desc')?.value.trim() || '';
        const specs = document.getElementById('edit-prod-specs')?.value.trim() || '';
        const tag = document.getElementById('edit-prod-tag')?.value.trim() || '';
        const isActive = document.getElementById('edit-prod-status')?.value === 'true';
        const stock = parseInt(document.getElementById('edit-prod-stock')?.value, 10) || 0;
        const imageUrl = document.getElementById('edit-prod-image-url')?.value.trim() || '';

        if (!id || !name || isNaN(price) || price <= 0) {
            showToast('Please enter a valid product name and retail price.', 'error');
            return;
        }

        const categoryRates = {
            'Laptops': 0.12, 'Audio': 0.08, 'Gaming': 0.15,
            'Phones': 0.10, 'Monitors': 0.10, 'Accessories': 0.08
        };
        const commissionRate = categoryRates[category] || 0.10;

        const btnSave = document.getElementById('btn-save-edit-product');
        if (btnSave) {
            btnSave.disabled = true;
            btnSave.innerHTML = '<span class="material-symbols-outlined spin" style="font-size:18px;">sync</span> <span>Saving…</span>';
        }

        const updateData = {
            id,
            name,
            category,
            price,
            commission_rate: commissionRate,
            description,
            image_url: imageUrl || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80',
            image: imageUrl || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80',
            specs,
            tag,
            stock,
            is_active: isActive
        };

        // 1. Try Backend API PUT
        try {
            await fetch('/api/sellers/products', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });
        } catch (err) {
            console.warn('API /api/sellers/products PUT offline, saving locally...', err);
        }

        // 2. Persist locally to custom products repository
        const custom = JSON.parse(localStorage.getItem('tn_custom_products') || '[]');
        const idx = custom.findIndex(p => String(p.id) === String(id));
        if (idx !== -1) {
            custom[idx] = { ...custom[idx], ...updateData };
        } else {
            custom.unshift({
                ...updateData,
                seller_id: seller?.id || 'seller-custom',
                sellerId: seller?.id || 'seller-custom',
                seller: seller?.store_name || 'Apex Hardware Nairobi',
                created_at: new Date().toISOString()
            });
        }
        localStorage.setItem('tn_custom_products', JSON.stringify(custom));

        // 3. Sync window.PRODUCTS and trigger catalog update
        if (typeof window.loadLocalSellerProducts === 'function') {
            window.loadLocalSellerProducts();
        }
        window.dispatchEvent(new CustomEvent('products-updated'));

        showToast(`"${name}" updated successfully!`, 'success');

        if (btnSave) {
            btnSave.disabled = false;
            btnSave.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">save</span> <span>Save Changes</span>';
        }

        closeEditProductModal();
        loadSellerDashboard();
    });
}

window.openEditProductModal = openEditProductModal;
window.closeEditProductModal = closeEditProductModal;
window.deleteSellerProduct = deleteSellerProduct;
window.updateEditCalcPreview = updateEditCalcPreview;

// ══════════════════════════════════════════════════════════════
// 4. COMMISSION STATEMENT PDF GENERATION
// ══════════════════════════════════════════════════════════════
function downloadCommissionStatement(dashboardData, seller) {
    if (!window.jspdf) {
        showToast('PDF generator library is loading...', 'info');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(10, 25, 47);
    doc.rect(0, 0, pageW, 35, 'F');

    doc.setTextColor(0, 209, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Byte Tech Ltd Merchant Hub', 15, 15);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Official Seller Commission & Net Payout Statement (Kenya)', 15, 23);

    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-KE')}`, pageW - 15, 23, { align: 'right' });

    // Store Info
    let y = 48;
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Partner Store Details:', 15, y);

    y += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Store Name: ${seller.store_name || 'Partner Store'}`, 15, y);
    doc.text(`Email: ${seller.email || '—'}`, 15, y + 6);
    doc.text(`Category: ${seller.category || 'Electronics'}`, 15, y + 12);
    doc.text(`Commission Fee Rate: ${((seller.commission_rate || 0.12) * 100).toFixed(0)}%`, 15, y + 18);

    const t = dashboardData.totals || {};
    doc.text(`Gross Sales: ${formatKSh(t.gross_sales || 0)}`, pageW - 80, y);
    doc.text(`Platform Fees Paid: ${formatKSh(t.total_commission_paid || 0)}`, pageW - 80, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.text(`NET PAYOUT EARNED: ${formatKSh(t.net_earnings || 0)}`, pageW - 80, y + 14);

    y += 32;

    // Table Header
    doc.setFillColor(10, 25, 47);
    doc.rect(10, y, pageW - 20, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Order ID', 14, y + 5.5);
    doc.text('Product Item', 50, y + 5.5);
    doc.text('Qty', 115, y + 5.5);
    doc.text('Gross (KSh)', 135, y + 5.5);
    doc.text('Fee (KSh)', 160, y + 5.5);
    doc.text('Net (KSh)', pageW - 14, y + 5.5, { align: 'right' });

    y += 11;
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'normal');

    (dashboardData.orders || []).forEach((o, i) => {
        if (i % 2 === 0) {
            doc.setFillColor(245, 248, 255);
            doc.rect(10, y - 2, pageW - 20, 7, 'F');
        }
        doc.text(o.order_id, 14, y + 3);
        doc.text(o.product_name, 50, y + 3, { maxWidth: 60 });
        doc.text(String(o.quantity), 116, y + 3);
        doc.text(formatKSh(o.total_price), 135, y + 3);
        doc.text(`-${formatKSh(o.platform_fee)}`, 160, y + 3);
        doc.text(`+${formatKSh(o.seller_earning)}`, pageW - 14, y + 3, { align: 'right' });
        y += 8;

        if (y > 260) {
            doc.addPage();
            y = 20;
        }
    });

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(120, 120, 120);
    doc.text('Official statement verified by Byte Tech Ltd Kenya • Settlements via IntaSend M-Pesa & Bank Gateway', pageW / 2, 285, { align: 'center' });

    doc.save(`ByteTechLtd-Statement-${seller.store_name || 'Seller'}-${Date.now()}.pdf`);
    showToast('Commission Statement PDF downloaded!', 'success');
}

// ══════════════════════════════════════════════════════════════
// 6. ADMIN CONTROL CENTER
// ══════════════════════════════════════════════════════════════
function initAdminPanel() {
    const pin = AdminSession.getPin();
    if (!pin) {
        showAdminPinGate();
        return;
    }
    loadAdminDashboard(pin);
}

function showAdminPinGate() {
    document.getElementById('admin-pin-gate')?.classList.remove('hidden');
    document.getElementById('admin-dashboard-content')?.classList.add('hidden');

    const form = document.getElementById('admin-pin-form');
    if (form && !form.dataset.bound) {
        form.dataset.bound = 'true';
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const pin = document.getElementById('admin-pin-input')?.value.trim();
            if (!pin) { showToast('Please enter the Master PIN', 'error'); return; }

            AdminSession.save(pin);
            loadAdminDashboard(pin);
        });
    }
}

async function loadAdminDashboard(pin) {
    let adminData = null;

    try {
        const res = await fetch('/api/admin/overview', {
            headers: { 'x-admin-pin': pin }
        });
        if (res.ok) {
            adminData = await res.json();
        } else if (res.status === 401) {
            showToast('Invalid Master PIN.', 'error');
            AdminSession.clear();
            showAdminPinGate();
            return;
        }
    } catch (e) {
        console.warn('API /api/admin/overview offline, generating local telemetry...', e);
    }

    if (!adminData) {
        adminData = getLocalAdminDashboardData();
    }

    document.getElementById('admin-pin-gate')?.classList.add('hidden');
    document.getElementById('admin-dashboard-content')?.classList.remove('hidden');

    // Overview KPIs
    const f = adminData.financials || {};
    setText('admin-gmv', formatKSh(f.gmv || 0));
    setText('admin-platform-revenue', formatKSh(f.platform_revenue || 0));
    setText('admin-seller-payout-due', formatKSh(f.seller_payout_due || 0));
    setText('admin-active-sellers', f.active_sellers || 0);

    // Tables & Chart
    renderAdminSellersTable(adminData.sellers || []);
    renderAdminRatesTable(adminData.rates || [], pin);
    renderAdminOrdersTable(adminData.allOrders || []);
    renderAdminChart(adminData.monthly || []);

    // CSV Export
    const exportBtn = document.getElementById('export-csv-btn');
    if (exportBtn) exportBtn.onclick = () => exportCSV(adminData);
}

function getLocalAdminDashboardData() {
    const orders = JSON.parse(localStorage.getItem('tn_orders') || '[]');
    const sellers = JSON.parse(localStorage.getItem('tn_sellers') || '[]');

    let gmv = 0;
    let rev = 0;
    orders.forEach(o => {
        (o.items || []).forEach(i => {
            const itemTotal = i.totalPrice || (i.price * (i.quantity || i.qty || 1));
            gmv += itemTotal || 0;
            rev += (i.platformFee || 0);
        });
    });

    // Build accurate per-seller stats from local orders
    const sellerStats = {};
    orders.forEach(o => {
        (o.items || []).forEach(item => {
            const sid = item.sellerId || item.seller;
            if (!sid) return;
            if (!sellerStats[sid]) {
                sellerStats[sid] = { orders_count: 0, gmv: 0, platform_fee_earned: 0, payout_due: 0 };
            }
            const qty = item.quantity || item.qty || 1;
            const itemTotal = item.totalPrice || (item.price * qty);
            const fee = item.platformFee || 0;
            sellerStats[sid].orders_count += 1;
            sellerStats[sid].gmv += itemTotal || 0;
            sellerStats[sid].platform_fee_earned += fee;
            sellerStats[sid].payout_due += (itemTotal - fee) || 0;
        });
    });

    const sellerList = sellers.map(s => ({
        ...s,
        orders_count: sellerStats[s.id]?.orders_count || sellerStats[s.store_name]?.orders_count || 0,
        gmv: sellerStats[s.id]?.gmv || sellerStats[s.store_name]?.gmv || 0,
        platform_fee_earned: sellerStats[s.id]?.platform_fee_earned || sellerStats[s.store_name]?.platform_fee_earned || 0,
        payout_due: sellerStats[s.id]?.payout_due || sellerStats[s.store_name]?.payout_due || 0,
        is_active: s.is_active !== false
    }));

    const rates = [
        { category: 'Laptops', rate: 0.12, label: 'Laptops (12%)' },
        { category: 'Audio', rate: 0.08, label: 'Audio & Acoustics (8%)' },
        { category: 'Gaming', rate: 0.15, label: 'Gaming Rigs (15%)' },
        { category: 'Phones', rate: 0.10, label: 'Smartphones (10%)' },
        { category: 'Monitors', rate: 0.10, label: 'Displays (10%)' },
        { category: 'Accessories', rate: 0.08, label: 'Accessories (8%)' }
    ];

    // Derive monthly data from local orders
    const monthlyMap = {};
    orders.forEach(o => {
        const key = (o.created_at || new Date().toISOString()).slice(0, 7);
        if (!monthlyMap[key]) monthlyMap[key] = { month: key, gmv: 0, platform_revenue: 0 };
        (o.items || []).forEach(i => {
            const itemTotal = i.totalPrice || (i.price * (i.quantity || i.qty || 1));
            monthlyMap[key].gmv += itemTotal || 0;
            monthlyMap[key].platform_revenue += (i.platformFee || 0);
        });
    });
    const monthly = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

    return {
        financials: {
            gmv,
            platform_revenue: rev,
            seller_payout_due: gmv - rev,
            active_sellers: sellers.filter(s => s.is_active !== false).length
        },
        sellers: sellerList,
        rates,
        monthly,
        allOrders: orders
    };
}

function renderAdminSellersTable(sellers) {
    const tbody = document.getElementById('admin-sellers-tbody');
    if (!tbody) return;

    if (!sellers.length) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 24px; color: var(--seller-muted);">No sellers registered yet. New partner registrations will appear here.</td></tr>';
        return;
    }

    tbody.innerHTML = sellers.map(s => {
        const isActive = s.is_active !== false;
        return `
        <tr>
            <td><strong>${s.store_name || '—'}</strong><br><small style="color:var(--seller-muted);font-size:0.75rem">${s.full_name || ''}</small></td>
            <td style="font-size:0.82rem">${s.email || '—'}</td>
            <td><span class="badge-chip ${isActive ? 'blue' : 'red'}">${s.category || 'General'}</span></td>
            <td>${s.orders_count || 0}</td>
            <td><strong>${formatKSh(s.gmv || 0)}</strong></td>
            <td><span class="badge-chip red">+${formatKSh(s.platform_fee_earned || 0)}</span></td>
            <td><span class="badge-chip ${isActive ? 'green' : 'red'}">${formatKSh(s.payout_due || 0)}</span></td>
            <td>
                <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-start;">
                    <span class="badge-chip ${isActive ? 'green' : 'red'}">${isActive ? 'Active' : 'Suspended'}</span>
                    <button class="btn-primary" style="padding:3px 10px;font-size:0.72rem;background:${isActive ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)'};color:${isActive ? '#ef4444' : '#10b981'};border:1px solid ${isActive ? '#ef4444' : '#10b981'};"
                        onclick="toggleAdminSellerStatus('${(s.id || '').replace(/'/g,"\\'")}', '${(s.email || '').replace(/'/g,"\\'")}', ${!isActive})">
                        ${isActive ? '🔒 Suspend' : '✅ Approve'}
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

async function toggleAdminSellerStatus(sellerId, email, newStatus) {
    const session = AdminSession.get();
    const pin = session?.pin || 'TN2026';

    try {
        await fetch('/api/admin/seller-status', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-pin': pin
            },
            body: JSON.stringify({ seller_id: sellerId, email: email, is_active: newStatus })
        });
    } catch (_) {}

    const sellers = JSON.parse(localStorage.getItem('tn_sellers') || '[]');
    let updated = false;
    sellers.forEach(s => {
        if ((s.id && s.id === sellerId) || (s.email && email && s.email.toLowerCase() === email.toLowerCase())) {
            s.is_active = newStatus;
            updated = true;
        }
    });
    if (updated) {
        localStorage.setItem('tn_sellers', JSON.stringify(sellers));
        showToast(newStatus ? 'Partner account approved and unlocked!' : 'Partner account suspended.', 'success');
        if (session && session.pin) {
            loadAdminDashboard(session.pin);
        }
    }
}

function renderAdminRatesTable(rates, pin) {
    const tbody = document.getElementById('admin-rates-tbody');
    if (!tbody) return;

    tbody.innerHTML = rates.map(r => `
        <tr>
            <td><strong>${r.category}</strong></td>
            <td id="rate-display-${r.category}"><strong>${(r.rate * 100).toFixed(1)}%</strong></td>
            <td>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input id="rate-input-${r.category}" class="form-input" type="number" 
                           style="width: 70px; padding: 4px 8px; font-size: 0.8rem;" 
                           value="${(r.rate * 100).toFixed(1)}" min="0" max="50" step="0.1"/>
                    <button class="btn-primary" style="padding: 4px 10px; font-size: 0.75rem;" 
                            onclick="updateCommissionRate('${r.category}', '${pin}')">Save</button>
                </div>
            </td>
        </tr>`
    ).join('');
}

function renderAdminOrdersTable(orders) {
    const tbody = document.getElementById('admin-all-orders-tbody');
    if (!tbody) return;

    if (!orders.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 24px; color: var(--seller-muted);">No transactions recorded.</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(o => `
        <tr>
            <td><strong>${o.id}</strong></td>
            <td>${o.customer_name || 'Customer'}</td>
            <td><strong>${formatKSh(o.total_amount)}</strong></td>
            <td><span class="badge-chip blue">${o.payment_method || 'IntaSend M-Pesa'}</span></td>
            <td><span class="badge-chip green">${o.status || 'paid'}</span></td>
            <td>${new Date(o.created_at || Date.now()).toLocaleDateString('en-KE')}</td>
        </tr>
    `).join('');
}

async function updateCommissionRate(category, pin) {
    const input = document.getElementById(`rate-input-${category}`);
    const pct = parseFloat(input?.value);
    if (isNaN(pct) || pct < 0 || pct > 50) {
        showToast('Rate must be between 0% and 50%', 'error');
        return;
    }

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
                { label: 'Platform Revenue (KSh)', data: revs, backgroundColor: '#0058bc', borderRadius: 6 },
                { label: 'Gross Merchandise Value (KSh)', data: gmvs, backgroundColor: '#10b981', borderRadius: 6 }
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
    const headers = ['Store Name','Email','Category','Orders','GMV (KES)','Platform Fee (KES)','Payout Due (KES)'];
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
    a.download = `ByteTechLtd-Commissions-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// ══════════════════════════════════════════════════════════════
// 7. SHARED HELPERS
// ══════════════════════════════════════════════════════════════
function formatKSh(amount) {
    const val = parseFloat(amount || 0);
    return `KSh ${val.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function showToast(msg, type = 'success') {
    if (window.ByteTechLtd?.showToast) {
        window.ByteTechLtd.showToast(msg, type);
        return;
    }
    if (window.BiteTechLtd?.showToast) {
        window.BiteTechLtd.showToast(msg, type);
        return;
    }
    alert(msg);
}
