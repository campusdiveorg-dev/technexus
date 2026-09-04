/**
 * js/receipt.js
 * Byte Tech Ltd — Receipt page logic + jsPDF generation
 */

document.addEventListener('DOMContentLoaded', async () => {
    const params  = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId');

    if (!orderId) {
        showError('No order ID specified. Please check your link.');
        return;
    }

    document.getElementById('receipt-order-id').textContent = orderId;

    try {
        const res  = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
            const data = await res.json();
            renderReceipt(data.order, data.items);
            return;
        }
    } catch (err) {
        console.warn('API /api/orders/:id not reachable, attempting localStorage backup fetch...', err);
    }

    // Local Storage Fallback
    try {
        const localOrderStr = localStorage.getItem(`tn_order_${orderId}`);
        if (localOrderStr) {
            const localOrder = JSON.parse(localOrderStr);
            const subtotal   = parseFloat(localOrder.total_amount || 0);
            const vatRate    = 0.16;
            const vatAmount  = parseFloat((subtotal * vatRate / (1 + vatRate)).toFixed(2));
            const netAmount  = parseFloat((subtotal - vatAmount).toFixed(2));
            renderReceipt({
                ...localOrder,
                subtotal: netAmount,
                vat: vatAmount,
                total: subtotal
            }, localOrder.items || []);
            return;
        }

        const allOrdersStr = localStorage.getItem('tn_orders');
        if (allOrdersStr) {
            const allOrders = JSON.parse(allOrdersStr);
            const found = allOrders.find(o => o.id === orderId);
            if (found) {
                const subtotal   = parseFloat(found.total_amount || 0);
                const vatRate    = 0.16;
                const vatAmount  = parseFloat((subtotal * vatRate / (1 + vatRate)).toFixed(2));
                const netAmount  = parseFloat((subtotal - vatAmount).toFixed(2));
                renderReceipt({
                    ...found,
                    subtotal: netAmount,
                    vat: vatAmount,
                    total: subtotal
                }, found.items || []);
                return;
            }
        }

        showError('Order not found. Please verify your order ID.');
    } catch (e) {
        showError('Failed to load receipt.');
        console.error(e);
    }
});

// ── Render Receipt ──────────────────────────────────────────────
function renderReceipt(order, items) {
    // Header info
    setText('receipt-date',         formatDate(order.created_at));
    setText('receipt-txn-id',       order.flw_transaction_id || '—');
    setText('receipt-payment-method', formatPaymentMethod(order.payment_method));
    setText('receipt-customer-name',  order.customer_name);
    setText('receipt-customer-email', order.customer_email);
    setText('receipt-customer-phone', order.customer_phone);
    setText('receipt-shipping-address', order.shipping_address);

    // Items table
    const tbody = document.getElementById('receipt-items-tbody');
    if (tbody) {
        tbody.innerHTML = items.map((item, i) => {
            const unitPrice = parseFloat(item.unit_price || item.price || 0);
            const lineTotal = parseFloat(item.total_price || (unitPrice * (item.quantity || 1)));
            const formattedUnit = window.formatKES ? window.formatKES(unitPrice) : `KSh ${unitPrice.toLocaleString('en-KE')}`;
            const formattedTotal = window.formatKES ? window.formatKES(lineTotal) : `KSh ${lineTotal.toLocaleString('en-KE')}`;
            return `
            <tr class="receipt-item-row">
                <td class="receipt-td">${i + 1}</td>
                <td class="receipt-td">
                    <div class="receipt-product-cell">
                        <img src="${item.product_image || item.image || 'https://via.placeholder.com/40'}"
                             alt="${item.product_name || item.name}"
                             class="receipt-product-img"
                             onerror="this.src='https://via.placeholder.com/40'"/>
                        <span>${item.product_name || item.name}</span>
                    </div>
                </td>
                <td class="receipt-td">${item.seller_name || item.seller || 'Byte Tech Ltd Official'}</td>
                <td class="receipt-td receipt-td-center">${item.quantity || 1}</td>
                <td class="receipt-td receipt-td-right">${formattedUnit}</td>
                <td class="receipt-td receipt-td-right receipt-td-bold">${formattedTotal}</td>
            </tr>`;
        }).join('');
    }

    // Totals
    const subtotal = parseFloat(order.subtotal || 0);
    const vat      = parseFloat(order.vat || (subtotal * 0.16));
    const total    = parseFloat(order.total || (subtotal + vat));

    setText('receipt-subtotal', window.formatKES ? window.formatKES(subtotal) : `KSh ${subtotal.toLocaleString('en-KE')}`);
    setText('receipt-vat',      window.formatKES ? window.formatKES(vat) : `KSh ${vat.toLocaleString('en-KE')}`);
    setText('receipt-total',    window.formatKES ? window.formatKES(total) : `KSh ${total.toLocaleString('en-KE')}`);

    // KRA eTIMS Fiscalization
    const kraPin = order.kra_pin || 'P051234567Z';
    const kraCu = order.kra_cu_number || 'KRA-VSCU-001';
    const cleanId = (order.id || 'ORDER').replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase();
    const kraInvoice = order.kra_invoice_number || `KRA-ETIMS-${cleanId}`;
    const kraQrUrl = order.kra_qr_url || `https://itax.kra.go.ke/KRA-Portal/invoiceChk.htm?actionCode=loadPage&invoiceNo=${encodeURIComponent(kraInvoice)}`;

    setText('receipt-kra-pin', kraPin);
    setText('receipt-kra-cu', kraCu);
    setText('receipt-kra-invoice', kraInvoice);

    const qrImg = document.getElementById('receipt-kra-qr');
    if (qrImg) {
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(kraQrUrl)}`;
    }
    const qrLink = document.getElementById('receipt-kra-qr-link');
    if (qrLink) {
        qrLink.href = kraQrUrl;
    }

    // Show receipt (hidden during load)
    document.getElementById('receipt-loading')?.classList.add('hidden');
    document.getElementById('receipt-content')?.classList.remove('hidden');
}

// ── Generate PDF with jsPDF ─────────────────────────────────────
function downloadReceiptPDF() {
    const { jsPDF } = window.jspdf;
    const doc       = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const orderId   = document.getElementById('receipt-order-id')?.textContent || '';
    const date      = document.getElementById('receipt-date')?.textContent     || '';
    const custName  = document.getElementById('receipt-customer-name')?.textContent  || '';
    const custEmail = document.getElementById('receipt-customer-email')?.textContent || '';
    const custPhone = document.getElementById('receipt-customer-phone')?.textContent || '';
    const address   = document.getElementById('receipt-shipping-address')?.textContent || '';
    const txnId     = document.getElementById('receipt-txn-id')?.textContent   || '';
    const payMethod = document.getElementById('receipt-payment-method')?.textContent || '';
    const subtotal  = document.getElementById('receipt-subtotal')?.textContent || '';
    const vat       = document.getElementById('receipt-vat')?.textContent      || '';
    const total     = document.getElementById('receipt-total')?.textContent    || '';

    const pageW = doc.internal.pageSize.getWidth();
    let y = 15;

    // ── Header ──
    doc.setFillColor(10, 25, 47);
    doc.rect(0, 0, pageW, 35, 'F');

    doc.setTextColor(0, 209, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Byte Tech Ltd', 15, 15);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Electronics Marketplace (Kenya)', 15, 22);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('OFFICIAL TAX INVOICE', pageW - 15, 15, { align: 'right' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order ID: ${orderId}`, pageW - 15, 22, { align: 'right' });
    doc.text(`Date: ${date}`, pageW - 15, 28, { align: 'right' });

    y = 45;

    // ── Customer Info ──
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 15, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(custName,  15, y); y += 5;
    doc.text(custEmail, 15, y); y += 5;
    doc.text(custPhone, 15, y); y += 5;
    doc.text(address,   15, y, { maxWidth: 90 }); y += 10;

    // Payment info on right
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Details:', pageW - 80, 45);
    doc.setFont('helvetica', 'normal');
    doc.text(`Method: ${payMethod}`,   pageW - 80, 51);
    doc.text(`Txn Ref: ${txnId}`,      pageW - 80, 57, { maxWidth: 75 });
    doc.text(`Currency: KES (Kenyan Shilling)`, pageW - 80, 63);

    y = Math.max(y, 75);

    // ── Items Table ──
    doc.setFillColor(10, 25, 47);
    doc.rect(10, y, pageW - 20, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('#',        14, y + 5.5);
    doc.text('Product',  22, y + 5.5);
    doc.text('Seller',   85, y + 5.5);
    doc.text('Qty',     125, y + 5.5);
    doc.text('Unit Price',  140, y + 5.5);
    doc.text('Total',  pageW - 14, y + 5.5, { align: 'right' });
    y += 10;

    const rows = document.querySelectorAll('#receipt-items-tbody .receipt-item-row');
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'normal');

    rows.forEach((row, i) => {
        const cells = row.querySelectorAll('.receipt-td');
        const num      = cells[0]?.textContent.trim();
        const product  = cells[1]?.querySelector('span')?.textContent.trim() || '';
        const seller   = cells[2]?.textContent.trim();
        const qty      = cells[3]?.textContent.trim();
        const unitP    = cells[4]?.textContent.trim();
        const totalP   = cells[5]?.textContent.trim();

        if (i % 2 === 0) {
            doc.setFillColor(245, 248, 255);
            doc.rect(10, y - 2, pageW - 20, 7, 'F');
        }
        doc.text(num,    14, y + 3);
        doc.text(product, 22, y + 3, { maxWidth: 60 });
        doc.text(seller, 85, y + 3, { maxWidth: 35 });
        doc.text(qty,   127, y + 3);
        doc.text(unitP, 140, y + 3);
        doc.text(totalP, pageW - 14, y + 3, { align: 'right' });
        y += 8;

        if (y > 260) { doc.addPage(); y = 20; }
    });

    y += 5;

    // ── Totals ──
    const totalsX = pageW - 70;
    doc.setDrawColor(200, 200, 200);
    doc.line(totalsX - 5, y, pageW - 10, y);
    y += 6;

    doc.setFontSize(10);
    doc.text('Subtotal (excl. VAT):', totalsX, y); doc.text(subtotal, pageW - 14, y, { align: 'right' }); y += 6;
    doc.text('VAT (16%):',           totalsX, y); doc.text(vat,      pageW - 14, y, { align: 'right' }); y += 2;
    doc.line(totalsX - 5, y, pageW - 10, y); y += 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(10, 25, 47);
    doc.text('TOTAL PAID:',  totalsX, y);
    doc.text(total, pageW - 14, y, { align: 'right' });
    y += 12;

    // ── KRA eTIMS Fiscal Section ──
    const kraPin = document.getElementById('receipt-kra-pin')?.textContent || 'P051234567Z';
    const kraCu = document.getElementById('receipt-kra-cu')?.textContent || 'KRA-VSCU-001';
    const kraInv = document.getElementById('receipt-kra-invoice')?.textContent || '';

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.rect(15, y, pageW - 30, 20, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text('KRA eTIMS FISCAL TAX INVOICE', 20, y + 6);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`KRA PIN: ${kraPin}   |   CU SERIAL: ${kraCu}   |   CU INVOICE: ${kraInv}`, 20, y + 11);
    doc.text('Standard Rate: 16% VAT Inclusive   |   Verify online at: itax.kra.go.ke', 20, y + 16);

    // ── Footer ──
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(120, 120, 120);
    doc.text('Thank you for shopping at Byte Tech Ltd! For support: support@bytetech.co.ke', pageW / 2, 285, { align: 'center' });

    doc.save(`ByteTechLtd-Receipt-${orderId}.pdf`);
}

// ── Print ───────────────────────────────────────────────────────
function printReceipt() {
    window.print();
}

// ── Helpers ─────────────────────────────────────────────────────
function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-KE', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function formatPaymentMethod(method) {
    if (!method) return '—';
    const lower = method.toLowerCase();
    if (lower.includes('mpesa') || lower.includes('m-pesa')) return 'M-Pesa (IntaSend)';
    if (lower.includes('airtel')) return 'Airtel Money (IntaSend)';
    if (lower.includes('card')) return 'Visa / Mastercard (IntaSend)';
    if (lower.includes('bank')) return 'Bank Transfer (IntaSend)';
    const map = {
        'mpesa':        'M-Pesa',
        'card':         'Debit/Credit Card',
        'airtel_money': 'Airtel Money',
        'ussd':         'USSD / Bank',
        'bank_transfer':'Bank Transfer'
    };
    return map[method] || method;
}

function showError(msg) {
    document.getElementById('receipt-loading')?.classList.add('hidden');
    const err = document.getElementById('receipt-error');
    if (err) { err.textContent = msg; err.classList.remove('hidden'); }
}
