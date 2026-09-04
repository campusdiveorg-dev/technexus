/**
 * js/checkout.js
 * Byte Tech Ltd — Streamlined 1-Step Express Checkout & IntaSend Integration
 * Direct M-Pesa STK Push, Card, and Bank Processing with Auto-Fill & Phone Normalization
 */

// ── Config ─────────────────────────────────────────────────────
const INTASEND_PUBLIC_KEY = window.INTASEND_PUBLISHABLE_KEY || window.INTASEND_PUBLIC_KEY || window.FLW_PUBLIC_KEY || 'ISPubKey_live_b2d03669-6c40-4c41-a476-deb849f6a2f2';
const INTASEND_IS_LIVE    = window.INTASEND_IS_LIVE !== undefined ? (window.INTASEND_IS_LIVE === true || window.INTASEND_IS_LIVE === 'true') : true;

// ── State ──────────────────────────────────────────────────────
let checkoutCustomer       = {};
let selectedPaymentMethod  = 'M-PESA'; // Default to M-Pesa STK Push
let currentTxRef          = '';
let intasendInstance      = null;

// ── Phone Normalization Helper for Kenya ────────────────────────
function normalizeKenyanPhone(phone) {
    if (!phone) return '';
    let clean = phone.toString().trim().replace(/[\s\-\+\(\)]/g, '');
    clean = clean.replace(/^(\+|00)/, '');

    // 07XXXXXXXX or 01XXXXXXXX (10 digits) -> 2547XXXXXXXX / 2541XXXXXXXX
    if (clean.startsWith('0') && clean.length === 10) {
        return '254' + clean.slice(1);
    }
    // 7XXXXXXXX or 1XXXXXXXX (9 digits) -> 2547XXXXXXXX / 2541XXXXXXXX
    if ((clean.startsWith('7') || clean.startsWith('1')) && clean.length === 9) {
        return '254' + clean;
    }
    // Already 12 digits starting with 254
    if (clean.startsWith('254') && clean.length === 12) {
        return clean;
    }
    return clean;
}

// ── Format Currency Helper ──────────────────────────────────────
function formatKSh(amount) {
    const val = parseFloat(amount || 0);
    return `KSh ${val.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Initialize ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Wire up all checkout trigger buttons
    document.querySelectorAll('[data-action="checkout"], #checkout-btn, .btn-checkout').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openCheckoutModal();
        });
    });

    // Close modal handlers
    document.getElementById('checkout-overlay')?.addEventListener('click', (e) => {
        if (e.target.id === 'checkout-overlay') closeCheckoutModal();
    });
    document.getElementById('checkout-close-btn')?.addEventListener('click', closeCheckoutModal);

    // Toggle collapsible cart items preview
    document.getElementById('toggle-cart-preview-btn')?.addEventListener('click', toggleCartPreview);

    // Payment Method Selection Cards
    document.querySelectorAll('.pm-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.pm-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedPaymentMethod = card.getAttribute('data-method') || '';
            updatePayButtonState();
        });
    });

    // Real-time phone cleaner & input synchronization
    const phoneInput = document.getElementById('cust-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', () => {
            document.getElementById('cust-phone-wrap')?.classList.remove('field-error');
            updatePayButtonAttributes();
        });
    }

    ['cust-name', 'cust-email', 'cust-address'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', (e) => {
            e.target.classList.remove('field-error');
            updatePayButtonAttributes();
        });
    });

    // Wire Capturing Click on #pay-btn to validate before IntaSend opens
    const payBtn = document.getElementById('pay-btn');
    if (payBtn) {
        payBtn.addEventListener('click', handlePayButtonClick, true);
    }

    // Initialize IntaSend SDK if already loaded; otherwise wait for async load callback
    if (typeof window.IntaSend === 'function') {
        initIntaSendSDK();
    } else {
        // Called by the dynamic loader in cart.html once SDK arrives
        window.__intaSendReadyCallback = function() {
            initIntaSendSDK();
        };
    }
});

// ── Initialize IntaSend SDK ────────────────────────────────────
function initIntaSendSDK() {
    if (typeof window.IntaSend === 'function') {
        try {
            intasendInstance = new window.IntaSend({
                publicAPIKey: INTASEND_PUBLIC_KEY,
                live: INTASEND_IS_LIVE
            });

            intasendInstance
                .on("COMPLETE", async (results) => {
                    console.log("[IntaSend] Payment Successful:", results);
                    const cart = getNormalizedCart();
                    const invoiceId = results.invoice_id || results.tracking_id || `IS-${Date.now()}`;
                    const txRef = results.api_ref || currentTxRef || `TN-${Date.now()}`;
                    await processOrderCreation(invoiceId, txRef, cart, results);
                })
                .on("FAILED", (results) => {
                    console.error("[IntaSend] Payment Failed:", results);
                    const msg = results?.message || 'Payment was not completed. Please try again or switch method.';
                    showToast(msg, 'error');
                    resetPayButton();
                })
                .on("IN-PROGRESS", (results) => {
                    console.log("[IntaSend] Payment In Progress:", results);
                    const payBtn = document.getElementById('pay-btn');
                    if (payBtn) {
                        payBtn.disabled = true;
                        payBtn.innerHTML = '<span class="material-symbols-outlined spin" style="font-size:1.15rem; vertical-align:middle;">sync</span> <span>Awaiting PIN prompt on phone…</span>';
                    }
                });

            console.log('[Checkout] IntaSend SDK initialized in ' + (INTASEND_IS_LIVE ? 'LIVE' : 'SANDBOX') + ' mode.');
        } catch (e) {
            console.warn('[Checkout] IntaSend initialization warning:', e);
        }
    }
}

// ── Open / Close Modal ──────────────────────────────────────────
function openCheckoutModal() {
    const cart = getNormalizedCart();
    if (!cart.length) {
        showToast('Your cart is empty! Add products before checkout.', 'error');
        return;
    }

    // Pre-populate saved customer info (1-Click Repeat Checkout)
    try {
        const saved = JSON.parse(localStorage.getItem('tn_saved_customer') || '{}');
        if (saved.name)    document.getElementById('cust-name').value = saved.name;
        if (saved.phone)   document.getElementById('cust-phone').value = saved.phone;
        if (saved.email)   document.getElementById('cust-email').value = saved.email;
        if (saved.address) document.getElementById('cust-address').value = saved.address;
    } catch (_) {}

    // Populate order summary
    renderModalSummary(cart);

    // Update dynamic button label & attributes
    updatePayButtonState();

    const overlay = document.getElementById('checkout-overlay');
    if (overlay) {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeCheckoutModal() {
    const overlay = document.getElementById('checkout-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
    document.body.style.overflow = '';
    resetPayButton();
}

function toggleCartPreview() {
    const container = document.getElementById('modal-order-items');
    const text = document.getElementById('toggle-cart-text');
    if (!container) return;

    if (container.style.display === 'none' || !container.style.display) {
        container.style.display = 'block';
        if (text) text.textContent = '(Hide items ▴)';
    } else {
        container.style.display = 'none';
        if (text) text.textContent = '(View items ▾)';
    }
}

// ── Render Modal Summary ────────────────────────────────────────
function renderModalSummary(cart) {
    const container   = document.getElementById('modal-order-items');
    const totalEl     = document.getElementById('modal-order-total');
    const countEl     = document.getElementById('express-item-count');
    const minNoticeEl = document.getElementById('ch-min-notice');

    let total = 0;
    let totalQty = 0;

    const itemsHtml = cart.map(item => {
        const qty = item.qty || item.quantity || 1;
        const lineTotal = item.price * qty;
        total += lineTotal;
        totalQty += qty;
        return `
            <div class="modal-item-row">
                <img src="${item.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=100&q=80'}" 
                     alt="${item.name}" 
                     class="modal-item-img" 
                     onerror="this.src='https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=100&q=80'"/>
                <div class="modal-item-info">
                    <span class="modal-item-name">${item.name}</span>
                    <span class="modal-item-qty">Qty: ${qty} • ${item.seller || 'Byte Tech Ltd'}</span>
                </div>
                <span class="modal-item-price">${formatKSh(lineTotal)}</span>
            </div>`;
    }).join('');

    if (container) container.innerHTML = itemsHtml;
    if (totalEl)   totalEl.textContent = formatKSh(total);
    if (countEl)   countEl.textContent = `${totalQty} Item${totalQty !== 1 ? 's' : ''}`;

    // Show minimum notice if cart is below Safaricom live STK minimum (KSh 10)
    if (minNoticeEl) {
        minNoticeEl.style.display = (total > 0 && total < 10) ? 'block' : 'none';
    }
}

// ── Dynamic Pay Button State ────────────────────────────────────
function updatePayButtonState() {
    const payBtn     = document.getElementById('pay-btn');
    const payBtnText = document.getElementById('pay-btn-text');
    const payBtnIcon = document.getElementById('pay-btn-icon');
    if (!payBtn) return;

    const cart = getNormalizedCart();
    let total = cart.reduce((s, i) => s + i.price * (i.qty || i.quantity || 1), 0);
    // Guarantee Safaricom live minimum of KSh 10 if cart has active items
    if (total > 0 && total < 10) total = 10;
    const formatted = formatKSh(total);

    if (selectedPaymentMethod === 'M-PESA') {
        payBtn.className = 'btn-step-next mpesa-btn intaSendPayButton';
        if (payBtnIcon) payBtnIcon.textContent = 'smartphone';
        if (payBtnText) payBtnText.textContent = `Pay ${formatted} via M-Pesa STK Push`;
    } else if (selectedPaymentMethod === 'CARD-PAYMENT') {
        payBtn.className = 'btn-step-next intaSendPayButton';
        if (payBtnIcon) payBtnIcon.textContent = 'credit_card';
        if (payBtnText) payBtnText.textContent = `Pay ${formatted} with Card`;
    } else {
        payBtn.className = 'btn-step-next intaSendPayButton';
        if (payBtnIcon) payBtnIcon.textContent = 'lock';
        if (payBtnText) payBtnText.textContent = `Proceed to Pay ${formatted}`;
    }

    updatePayButtonAttributes();
}

function updatePayButtonAttributes() {
    const payBtn = document.getElementById('pay-btn');
    if (!payBtn) return;

    const cart = getNormalizedCart();
    let total = cart.reduce((s, i) => s + i.price * (i.qty || i.quantity || 1), 0);
    if (total > 0 && total < 10) total = 10; // Safaricom minimum

    const nameRaw  = document.getElementById('cust-name')?.value.trim() || '';
    const emailRaw = document.getElementById('cust-email')?.value.trim() || '';
    const phoneRaw = document.getElementById('cust-phone')?.value.trim() || '';
    const cleanPhone = normalizeKenyanPhone(phoneRaw);

    const nameParts = nameRaw.split(' ');
    const firstName = nameParts[0] || 'Customer';
    const lastName  = nameParts.slice(1).join(' ') || firstName;

    if (!currentTxRef) {
        currentTxRef = `TN-${Date.now()}-${Math.random().toString(36).substring(2,6).toUpperCase()}`;
    }

    payBtn.setAttribute('data-amount', total.toFixed(2));
    payBtn.setAttribute('data-currency', 'KES');
    payBtn.setAttribute('data-email', emailRaw || 'checkout@bytetech.co.ke');
    payBtn.setAttribute('data-first_name', firstName);
    payBtn.setAttribute('data-last_name', lastName);
    payBtn.setAttribute('data-phone_number', cleanPhone || '254700000000');
    payBtn.setAttribute('data-api_ref', currentTxRef);
    payBtn.setAttribute('data-country', 'KE');

    if (selectedPaymentMethod) {
        payBtn.setAttribute('data-method', selectedPaymentMethod);
    } else {
        payBtn.removeAttribute('data-method');
    }
}

function resetPayButton() {
    const payBtn = document.getElementById('pay-btn');
    if (payBtn) {
        payBtn.disabled = false;
        updatePayButtonState();
    }
}

// ── Capturing Click Validation Handler ─────────────────────────
function handlePayButtonClick(e) {
    const nameInput    = document.getElementById('cust-name');
    const emailInput   = document.getElementById('cust-email');
    const phoneInput   = document.getElementById('cust-phone');
    const addressInput = document.getElementById('cust-address');
    const phoneWrap    = document.getElementById('cust-phone-wrap');

    const name    = nameInput?.value.trim() || '';
    const email   = emailInput?.value.trim() || '';
    const phoneRaw = phoneInput?.value.trim() || '';
    const address = addressInput?.value.trim() || '';

    let hasError = false;

    // Reset visual errors
    nameInput?.classList.remove('field-error');
    emailInput?.classList.remove('field-error');
    addressInput?.classList.remove('field-error');
    phoneWrap?.classList.remove('field-error');

    if (!name) {
        nameInput?.classList.add('field-error');
        hasError = true;
    }

    const cleanPhone = normalizeKenyanPhone(phoneRaw);
    if (!cleanPhone || cleanPhone.length !== 12 || !cleanPhone.startsWith('254')) {
        phoneWrap?.classList.add('field-error');
        hasError = true;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailInput?.classList.add('field-error');
        hasError = true;
    }

    if (!address) {
        addressInput?.classList.add('field-error');
        hasError = true;
    }

    if (hasError) {
        e.preventDefault();
        e.stopImmediatePropagation();

        if (!cleanPhone || cleanPhone.length !== 12 || !cleanPhone.startsWith('254')) {
            showToast('Please enter a valid 9-digit or 10-digit Kenyan phone number (e.g. 712 345 678).', 'error');
        } else {
            showToast('Please fill in all delivery details to complete checkout.', 'error');
        }
        return false;
    }

    // Save validated details for 1-click repeat checkout
    checkoutCustomer = { name, email, phone: cleanPhone, address };
    localStorage.setItem('tn_saved_customer', JSON.stringify({ name, email, phone: phoneRaw, address }));

    // Prepare live attributes right before IntaSend reads them
    updatePayButtonAttributes();

    // If IntaSend SDK is live, let it handle the button click natively
    if (intasendInstance) {
        // SDK is initialized — let the event bubble through to IntaSend's handler
        return true;
    }

    // IntaSend SDK not yet loaded or unavailable → run fallback
    e.preventDefault();
    e.stopImmediatePropagation();

    if (typeof window.IntaSend === 'function') {
        // SDK loaded but our instance wasn't initialized yet — init now and trigger
        initIntaSendSDK();
        const cart  = getNormalizedCart();
        const total = Math.max(cart.reduce((s, i) => s + i.price * (i.qty || i.quantity || 1), 0), 10);
        if (intasendInstance) {
            intasendInstance.run({
                method: selectedPaymentMethod || 'M-PESA',
                phone_number: cleanPhone,
                amount: total.toFixed(2),
                currency: 'KES',
                email: email || 'checkout@bytetech.co.ke',
                first_name: name.split(' ')[0],
                last_name: name.split(' ').slice(1).join(' ') || name.split(' ')[0],
                api_ref: currentTxRef
            });
        } else {
            simulateSandboxPayment(currentTxRef, getNormalizedCart(), total);
        }
    } else {
        // SDK fully unavailable — use sandbox simulation
        const cart  = getNormalizedCart();
        const total = Math.max(cart.reduce((s, i) => s + i.price * (i.qty || i.quantity || 1), 0), 10);
        simulateSandboxPayment(currentTxRef, cart, total);
    }

    return false;
}

// ── Sandbox Demo Payment Simulation (Offline Fallback) ──────────
async function simulateSandboxPayment(txRef, cart, total) {
    const payBtn = document.getElementById('pay-btn');
    if (payBtn) {
        payBtn.disabled = true;
        payBtn.innerHTML = '<span class="material-symbols-outlined spin" style="font-size:1.15rem; vertical-align:middle;">sync</span> <span>Sending M-Pesa STK Prompt…</span>';
    }

    setTimeout(async () => {
        const mockInvoiceId = `IS-${Date.now()}`;
        await processOrderCreation(mockInvoiceId, txRef, cart, {
            provider: selectedPaymentMethod || 'M-PESA',
            invoice_id: mockInvoiceId
        });
    }, 1400);
}

// ── Create Order via Backend API & Local Storage ─────────────────
async function processOrderCreation(transactionId, txRef, cart, intasendData = {}) {
    const payBtn = document.getElementById('pay-btn');
    if (payBtn) {
        payBtn.disabled = true;
        payBtn.innerHTML = '<span class="material-symbols-outlined spin" style="font-size:1.15rem; vertical-align:middle;">check_circle</span> <span>Confirmed! Creating receipt…</span>';
    }

    const enrichedItems = cart.map(item => {
        const qty = item.qty || item.quantity || 1;
        const commissionRate = item.commissionRate || 0.10;
        const totalPrice = parseFloat((item.price * qty).toFixed(2));
        const platformFee = parseFloat((totalPrice * commissionRate).toFixed(2));
        const sellerEarning = parseFloat((totalPrice - platformFee).toFixed(2));
        return {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: qty,
            qty: qty,
            totalPrice,
            platformFee,
            sellerEarning,
            image: item.image,
            seller: item.seller || 'Byte Tech Ltd Official',
            sellerId: item.sellerId || null,
            commissionRate
        };
    });

    let orderId = `TN-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).substring(2,6).toUpperCase()}`;
    const paymentProvider = intasendData?.provider || selectedPaymentMethod || 'M-PESA';
    const paymentMethodLabel = paymentProvider === 'M-PESA' ? 'M-Pesa (IntaSend)' : `${paymentProvider} (IntaSend)`;

    try {
        const res = await fetch('/api/orders/create', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                transaction_id: transactionId,
                invoice_id:     transactionId,
                tx_ref:         txRef,
                cartItems:      enrichedItems,
                customer:       checkoutCustomer,
                payment_method: paymentMethodLabel
            })
        });

        if (res.ok) {
            const data = await res.json();
            if (data.orderId) orderId = data.orderId;
        }
    } catch (e) {
        console.warn('API /api/orders/create unavailable, saving to local order repository.', e);
    }

    // Persist order locally for instant receipt rendering
    const totalAmount = enrichedItems.reduce((s, i) => s + i.totalPrice, 0);
    const orderData = {
        id: orderId,
        customer_name: checkoutCustomer.name,
        customer_email: checkoutCustomer.email,
        customer_phone: checkoutCustomer.phone,
        shipping_address: checkoutCustomer.address,
        total_amount: totalAmount,
        currency: 'KES',
        payment_method: paymentMethodLabel,
        flw_transaction_id: transactionId,
        invoice_id: transactionId,
        flw_tx_ref: txRef,
        status: 'paid',
        created_at: new Date().toISOString(),
        items: enrichedItems
    };

    saveLocalOrder(orderData);

    // Clear cart and redirect to official receipt
    if (window.CartManager) {
        window.CartManager.clearCart();
    } else {
        localStorage.removeItem('bitetechltd_cart');
        localStorage.removeItem('tn_cart');
    }

    closeCheckoutModal();
    window.location.href = `receipt.html?orderId=${orderId}`;
}

// ── Cart & Storage Helpers ───────────────────────────────────────
function getNormalizedCart() {
    if (window.CartManager && typeof window.CartManager.getCart === 'function') {
        return window.CartManager.getCart();
    }
    try {
        const raw = localStorage.getItem('bitetechltd_cart') || localStorage.getItem('tn_cart') || '[]';
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function saveLocalOrder(order) {
    try {
        const orders = JSON.parse(localStorage.getItem('tn_orders') || '[]');
        orders.unshift(order);
        localStorage.setItem('tn_orders', JSON.stringify(orders));
        localStorage.setItem(`tn_order_${order.id}`, JSON.stringify(order));
    } catch (e) {
        console.error('Error saving local order backup', e);
    }
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

// Expose openCheckoutModal globally
window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;
