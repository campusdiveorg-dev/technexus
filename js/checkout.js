/**
 * js/checkout.js
 * TechNexus — Flutterwave Checkout Integration
 * Multi-step checkout modal: Customer Info → Payment → Confirmation & Receipt Redirect
 */

// ── Config ─────────────────────────────────────────────────────
// Replace with your live Flutterwave PUBLIC key in production
const FLW_PUBLIC_KEY = 'FLWPUBK_TEST-SANDBOXDEMOKEY-X';

// ── State ──────────────────────────────────────────────────────
let checkoutCustomer = {};
let checkoutStep     = 1;

// ── Initialize ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Wire up all potential checkout trigger buttons
    document.querySelectorAll('[data-action="checkout"], #checkout-btn, .btn-checkout').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openCheckoutModal();
        });
    });

    // Step navigation
    document.getElementById('step1-next')?.addEventListener('click', goToStep2);
    document.getElementById('step2-back')?.addEventListener('click', () => showStep(1));
    document.getElementById('pay-btn')?.addEventListener('click', launchPayment);

    // Close modal
    document.getElementById('checkout-overlay')?.addEventListener('click', (e) => {
        if (e.target.id === 'checkout-overlay') closeCheckoutModal();
    });
    document.getElementById('checkout-close-btn')?.addEventListener('click', closeCheckoutModal);
});

// ── Open / Close Modal ──────────────────────────────────────────
function openCheckoutModal() {
    const cart = getNormalizedCart();
    if (!cart.length) {
        showToast('Your cart is empty! Add products first.', 'error');
        return;
    }

    // Populate order summary in modal
    renderModalSummary(cart);
    showStep(1);

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
    checkoutStep = 1;
}

// ── Step Navigation ─────────────────────────────────────────────
function showStep(n) {
    checkoutStep = n;
    document.querySelectorAll('.checkout-step').forEach(el => el.classList.remove('active'));
    document.getElementById(`checkout-step-${n}`)?.classList.add('active');

    // Update step indicator dots
    const dot1 = document.getElementById('dot-1');
    const dot2 = document.getElementById('dot-2');
    if (dot1 && dot2) {
        dot1.classList.toggle('active', n >= 1);
        dot2.classList.toggle('active', n >= 2);
    }
}

function goToStep2() {
    const name    = document.getElementById('cust-name')?.value.trim();
    const email   = document.getElementById('cust-email')?.value.trim();
    const phone   = document.getElementById('cust-phone')?.value.trim();
    const address = document.getElementById('cust-address')?.value.trim();

    if (!name || !email || !phone || !address) {
        showToast('Please fill in all customer delivery details.', 'error');
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('Please enter a valid email address.', 'error');
        return;
    }

    checkoutCustomer = { name, email, phone, address };

    // Show customer summary in Step 2
    setText('confirm-name', name);
    setText('confirm-email', email);
    setText('confirm-phone', phone);
    setText('confirm-address', address);

    // Refresh totals with current cart
    const cart = getNormalizedCart();
    renderModalSummary(cart);

    showStep(2);
}

// ── Render Modal Order Summary ──────────────────────────────────
function renderModalSummary(cart) {
    const container = document.getElementById('modal-order-items');
    const totalEl   = document.getElementById('modal-order-total');
    if (!container) return;

    let total = 0;
    container.innerHTML = cart.map(item => {
        const qty = item.qty || item.quantity || 1;
        const lineTotal = item.price * qty;
        total += lineTotal;
        const formattedPrice = window.formatKES ? window.formatKES(lineTotal) : `KSh ${lineTotal.toLocaleString('en-KE')}`;
        return `
            <div class="modal-item-row">
                <img src="${item.image}" alt="${item.name}" class="modal-item-img" onerror="this.src='https://via.placeholder.com/48'"/>
                <div class="modal-item-info">
                    <span class="modal-item-name">${item.name}</span>
                    <span class="modal-item-qty">Qty: ${qty} • ${item.seller || 'TechNexus'}</span>
                </div>
                <span class="modal-item-price" style="font-weight: 700; color: var(--primary-blue);">${formattedPrice}</span>
            </div>`;
    }).join('');

    if (totalEl) {
        totalEl.textContent = window.formatKES ? window.formatKES(total) : `KSh ${total.toLocaleString('en-KE')}`;
    }
}

// ── Launch Payment (Flutterwave / Sandbox Demo) ───────────────────
function launchPayment() {
    const cart  = getNormalizedCart();
    const total = cart.reduce((s, i) => s + i.price * (i.qty || i.quantity || 1), 0);
    const txRef = `TN-${Date.now()}-${Math.random().toString(36).substring(2,6).toUpperCase()}`;

    // If Flutterwave SDK is loaded and a real key is present
    if (typeof FlutterwaveCheckout === 'function' && FLW_PUBLIC_KEY && !FLW_PUBLIC_KEY.includes('SANDBOXDEMOKEY')) {
        FlutterwaveCheckout({
            public_key:   FLW_PUBLIC_KEY,
            tx_ref:       txRef,
            amount:       parseFloat(total.toFixed(2)),
            currency:     'KES',
            payment_options: 'mpesa, card, airtel_money, ussd, bank_transfer',
            customer: {
                email:        checkoutCustomer.email,
                phone_number: checkoutCustomer.phone,
                name:         checkoutCustomer.name
            },
            customizations: {
                title:       'TechNexus Marketplace',
                description: `Order of ${cart.length} item(s)`,
                logo:        'https://res.cloudinary.com/technexus/image/upload/logo.png'
            },
            callback: async (response) => {
                if (response.status === 'successful') {
                    await processOrderCreation(response.transaction_id, txRef, cart);
                } else {
                    showToast('Payment was not completed. Please try again.', 'error');
                }
            },
            onclose: () => {
                showToast('Payment window closed.', 'info');
            }
        });
    } else {
        // Sandbox Simulation Mode (works offline/locally for seamless demo testing)
        simulateSandboxPayment(txRef, cart, total);
    }
}

// ── Sandbox Demo Payment Simulation ──────────────────────────────
async function simulateSandboxPayment(txRef, cart, total) {
    const payBtn = document.getElementById('pay-btn');
    if (payBtn) {
        payBtn.disabled = true;
        payBtn.innerHTML = '<span class="material-symbols-outlined spin" style="font-size:1.1rem;vertical-align:middle;">sync</span> Processing Payment (M-Pesa / Card)…';
    }

    // Simulate 1.5s gateway confirmation
    setTimeout(async () => {
        const mockTransactionId = `FLW-${Date.now()}`;
        await processOrderCreation(mockTransactionId, txRef, cart);
    }, 1500);
}

// ── Create Order via Backend API (or LocalStorage Fallback) ───────
async function processOrderCreation(transactionId, txRef, cart) {
    const payBtn = document.getElementById('pay-btn');
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
            seller: item.seller || 'TechNexus Official',
            sellerId: item.sellerId || null,
            commissionRate
        };
    });

    let orderId = `TN-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).substring(2,6).toUpperCase()}`;

    try {
        const res = await fetch('/api/orders/create', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                transaction_id: transactionId,
                tx_ref:         txRef,
                cartItems:      enrichedItems,
                customer:       checkoutCustomer
            })
        });

        if (res.ok) {
            const data = await res.json();
            if (data.orderId) orderId = data.orderId;
        }
    } catch (e) {
        console.warn('API /api/orders/create unavailable, saving to local order repository.', e);
    }

    // Always store order in localStorage so receipt page works even on static/offline hosts
    const totalAmount = enrichedItems.reduce((s, i) => s + i.totalPrice, 0);
    const orderData = {
        id: orderId,
        customer_name: checkoutCustomer.name,
        customer_email: checkoutCustomer.email,
        customer_phone: checkoutCustomer.phone,
        shipping_address: checkoutCustomer.address,
        total_amount: totalAmount,
        currency: 'KES',
        payment_method: 'M-Pesa / Flutterwave',
        flw_transaction_id: transactionId,
        flw_tx_ref: txRef,
        status: 'paid',
        created_at: new Date().toISOString(),
        items: enrichedItems
    };

    saveLocalOrder(orderData);

    // Clear cart and redirect
    if (window.CartManager) {
        window.CartManager.clearCart();
    } else {
        localStorage.removeItem('technexus_cart');
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
        const raw = localStorage.getItem('technexus_cart') || localStorage.getItem('tn_cart') || '[]';
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
    if (window.TechNexus?.showToast) {
        window.TechNexus.showToast(msg, type);
        return;
    }
    alert(msg);
}
