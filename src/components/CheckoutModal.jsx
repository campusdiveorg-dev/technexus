import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatKES } from '../data/products';
import { X, Smartphone, CreditCard, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, QrCode } from 'lucide-react';
import ShimmerButton from './magicui/ShimmerButton';
import confetti from 'canvas-confetti';
import { apiUrl } from '../lib/api';

const INTASEND_PUB_KEY = 'ISPubKey_live_b2d03669-6c40-4c41-a476-deb849f6a2f2';
const INTASEND_IS_LIVE = true;

export function CheckoutModal() {
    const {
        cart,
        cartTotal,
        cartSubtotal,
        cartVAT,
        checkoutCustomer,
        setCheckoutCustomer,
        isCheckoutOpen,
        closeCheckout,
        clearCart
    } = useCart();

    const navigate = useNavigate();

    const [paymentMethod, setPaymentMethod] = useState('M-PESA');
    const [phone, setPhone]     = useState(checkoutCustomer.phone   || '');
    const [name, setName]       = useState(checkoutCustomer.name    || '');
    const [email, setEmail]     = useState(checkoutCustomer.email   || '');
    const [address, setAddress] = useState(checkoutCustomer.address || '');
    const [statusText, setStatusText] = useState('');
    const [errorText,  setErrorText]  = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (checkoutCustomer.phone)   setPhone(checkoutCustomer.phone);
        if (checkoutCustomer.name)    setName(checkoutCustomer.name);
        if (checkoutCustomer.email)   setEmail(checkoutCustomer.email);
        if (checkoutCustomer.address) setAddress(checkoutCustomer.address);
    }, [checkoutCustomer]);

    if (!isCheckoutOpen) return null;

    const normalizePhone = (raw) => {
        let p = raw.replace(/\D/g, '');
        if (p.startsWith('0')) p = '254' + p.substring(1);
        if (p.startsWith('7') || p.startsWith('1')) p = '254' + p;
        return p;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setErrorText('');

        const cleanedPhone = normalizePhone(phone);
        if (!cleanedPhone || cleanedPhone.length !== 12 || !cleanedPhone.startsWith('254')) {
            setErrorText('Please enter a valid Safaricom/Airtel phone number (e.g. 0712 345 678).');
            return;
        }

        const customerPayload = {
            phone:   cleanedPhone,
            name:    name.trim()    || 'Byte Tech Customer',
            email:   email.trim()   || `${cleanedPhone}@bytetech.co.ke`,
            address: address.trim() || 'Mombasa, Kenya'
        };

        setCheckoutCustomer(customerPayload);
        setIsProcessing(true);
        setStatusText('Connecting to IntaSend M-Pesa Gateway…');

        const orderId = `TN-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).substring(2,6).toUpperCase()}`;

        // ── IntaSend Live SDK ──────────────────────────────────────────────────
        if (window.IntaSend) {
            try {
                const intasend = new window.IntaSend({
                    publicAPIKey: INTASEND_PUB_KEY,
                    live: INTASEND_IS_LIVE
                });

                intasend
                    .on('COMPLETE', async (results) => {
                        setStatusText('Payment confirmed! Generating KRA eTIMS Tax Invoice…');
                        await finalizeOrder(orderId, customerPayload, results.invoice_id || results.tracking_id || `IS-${Date.now()}`);
                    })
                    .on('FAILED', (results) => {
                        setIsProcessing(false);
                        setErrorText(results?.message || 'Payment prompt was not approved or failed. Please retry.');
                    })
                    .on('IN-PROGRESS', () => {
                        setStatusText('STK Push sent! Enter your M-Pesa PIN on your phone.');
                    });

                const [firstName, ...lastNameParts] = customerPayload.name.split(' ');
                intasend.charge({
                    first_name:   firstName || 'Customer',
                    last_name:    lastNameParts.join(' ') || 'Customer',
                    email:        customerPayload.email,
                    phone_number: customerPayload.phone,
                    amount:       cartTotal,
                    currency:     'KES',
                    api_ref:      orderId,
                    method:       paymentMethod === 'CARD' ? 'CARD-PAYMENT' : 'M-PESA'
                });
                return;
            } catch (sdkErr) {
                console.warn('[IntaSend] SDK error, falling back:', sdkErr);
                setErrorText('Could not connect to IntaSend. Please refresh and try again.');
                setIsProcessing(false);
                return;
            }
        } else {
            // SDK not loaded — surface a real error instead of silently simulating
            console.error('[IntaSend] SDK not available on window.IntaSend');
            setErrorText('Payment gateway failed to load. Please refresh the page and try again.');
            setIsProcessing(false);
            return;
        }
    };

    const finalizeOrder = async (orderId, customer, transactionId) => {
        try {
            await fetch(apiUrl('/orders/create'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transaction_id: transactionId,
                    invoice_id:     transactionId,
                    tx_ref:         orderId,
                    cartItems:      cart,
                    customer:       customer,
                    payment_method: paymentMethod === 'CARD' ? 'Card (IntaSend)' : 'M-Pesa (IntaSend)'
                })
            }).catch(() => null);

            await fetch(apiUrl('/orders/fiscalize'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id:       orderId,
                    total_amount:   cartTotal,
                    customer_name:  customer.name,
                    customer_email: customer.email,
                    payment_method: paymentMethod,
                    items:          cart
                })
            }).catch(() => null);

            const localOrder = {
                id:                 orderId,
                flw_transaction_id: transactionId,
                total_amount:       cartTotal,
                total:              cartTotal,
                subtotal:           cartSubtotal,
                vat:                cartVAT,
                customer_name:      customer.name,
                customer_phone:     customer.phone,
                customer_email:     customer.email,
                shipping_address:   customer.address,
                payment_method:     paymentMethod === 'CARD' ? 'Card (IntaSend)' : 'M-Pesa (IntaSend)',
                created_at:         new Date().toISOString(),
                items:              cart
            };
            localStorage.setItem(`tn_order_${orderId}`, JSON.stringify(localOrder));
            localStorage.setItem('bytetechltd_last_order', JSON.stringify(localOrder));

            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            clearCart();
            closeCheckout();
            navigate(`/receipt?orderId=${encodeURIComponent(orderId)}`);
        } catch (err) {
            console.error('Finalize error:', err);
            navigate(`/receipt?orderId=${encodeURIComponent(orderId)}`);
        }
    };

    // ── Shared input style following the site's light theme ───────────────────
    const inputBase = {
        width:        '100%',
        background:   'var(--surface-frost)',
        border:       '1.5px solid var(--surface-border)',
        borderRadius: 'var(--radius-md)',
        padding:      '10px 14px',
        fontSize:     '0.9rem',
        color:        'var(--text-main)',
        fontFamily:   'var(--font-body)',
        outline:      'none',
        boxSizing:    'border-box',
        transition:   'border-color 0.2s',
    };

    const labelStyle = {
        display:      'block',
        fontSize:     '0.78rem',
        fontWeight:   '700',
        color:        'var(--text-muted)',
        marginBottom: '5px',
        textTransform:'uppercase',
        letterSpacing:'0.04em',
    };

    const methodBtnStyle = (active, accent = '#0058BC', accentBg = '#EBF3FF') => ({
        flex:           1,
        padding:        '10px 12px',
        borderRadius:   'var(--radius-md)',
        border:         active ? `1.5px solid ${accent}` : '1.5px solid var(--surface-border)',
        background:     active ? accentBg : 'var(--surface-frost)',
        color:          active ? accent : 'var(--text-muted)',
        fontWeight:     '700',
        fontSize:       '0.82rem',
        cursor:         'pointer',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            '6px',
        transition:     'all 0.2s',
    });

    return (
        <>
            {/* ── Backdrop ── */}
            <div
                onClick={(e) => { if (e.target === e.currentTarget && !isProcessing) closeCheckout(); }}
                style={{
                    position:       'fixed',
                    inset:          0,
                    zIndex:         1000,
                    background:     'rgba(10, 25, 47, 0.55)',
                    backdropFilter: 'blur(6px)',
                    display:        'flex',
                    alignItems:     'flex-end',
                    justifyContent: 'center',
                    animation:      'co-fadeIn 0.2s ease',
                }}
            >
                {/* ── Sheet ── */}
                <div style={{
                    position:      'relative',
                    width:         '100%',
                    maxWidth:      '540px',
                    background:    'var(--surface-white)',
                    border:        '1px solid var(--surface-border)',
                    borderRadius:  'var(--radius-xl) var(--radius-xl) 0 0',
                    boxShadow:     '0 -12px 48px rgba(10,25,47,0.12)',
                    maxHeight:     '92vh',
                    display:       'flex',
                    flexDirection: 'column',
                    overflow:      'hidden',
                    animation:     'co-slideUp 0.3s cubic-bezier(.16,1,.3,1)',
                }}>

                    {/* Drag handle */}
                    <div style={{
                        width:'44px', height:'5px',
                        background: 'var(--surface-border)',
                        borderRadius: '999px',
                        margin: '12px auto 4px',
                        flexShrink: 0,
                    }} />

                    {/* ── Header ── */}
                    <div style={{
                        padding:       '14px 24px 16px',
                        borderBottom:  '1px solid var(--surface-border)',
                        display:       'flex',
                        alignItems:    'center',
                        justifyContent:'space-between',
                        flexShrink:    0,
                    }}>
                        <div>
                            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                                <span style={{
                                    width:'9px', height:'9px',
                                    borderRadius:'50%',
                                    background: 'var(--accent-success)',
                                    display:'inline-block',
                                    animation:'co-pulse 2s infinite',
                                }} />
                                <h2 style={{ fontSize:'1.1rem', fontWeight:'800', color:'var(--midnight-navy)', margin:0 }}>
                                    Instant M-Pesa Checkout
                                </h2>
                            </div>
                            <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', margin:'2px 0 0 17px' }}>
                                Secure payment powered by IntaSend
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={closeCheckout}
                            disabled={isProcessing}
                            style={{
                                width:'36px', height:'36px',
                                borderRadius:'50%',
                                background:'var(--surface-frost)',
                                border:'1px solid var(--surface-border)',
                                color:'var(--text-muted)',
                                cursor:'pointer',
                                display:'flex', alignItems:'center', justifyContent:'center',
                                flexShrink: 0,
                            }}
                        >
                            <X size={17} />
                        </button>
                    </div>

                    {/* ── Scrollable form ── */}
                    <form
                        onSubmit={handleFormSubmit}
                        style={{
                            padding:       '20px 24px',
                            overflowY:     'auto',
                            flex:          1,
                            display:       'flex',
                            flexDirection: 'column',
                            gap:           '18px',
                        }}
                    >

                        {/* Amount summary card */}
                        <div style={{
                            padding:      '16px 18px',
                            borderRadius: 'var(--radius-lg)',
                            background:   'linear-gradient(135deg, var(--midnight-navy) 0%, #0D2847 100%)',
                            display:      'flex',
                            alignItems:   'center',
                            justifyContent:'space-between',
                            gap:          '12px',
                        }}>
                            <div>
                                <div style={{ fontSize:'0.7rem', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.08em', color:'rgba(255,255,255,0.5)', marginBottom:'2px' }}>
                                    Total Payable
                                </div>
                                <div style={{ fontSize:'1.8rem', fontWeight:'900', color:'#ffffff', lineHeight:1.1 }}>
                                    {formatKES(cartTotal)}
                                </div>
                                <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.45)', marginTop:'3px', fontFamily:'monospace' }}>
                                    Incl. 16% VAT ({formatKES(cartVAT)})
                                </div>
                            </div>
                            <div style={{
                                padding:      '8px 12px',
                                borderRadius: 'var(--radius-md)',
                                background:   'rgba(16,185,129,0.15)',
                                border:       '1px solid rgba(16,185,129,0.3)',
                                color:        '#34D399',
                                fontWeight:   '700',
                                fontSize:     '0.75rem',
                                display:      'flex',
                                alignItems:   'center',
                                gap:          '5px',
                                flexShrink:   0,
                            }}>
                                <QrCode size={14} />
                                <span>eTIMS</span>
                            </div>
                        </div>

                        {/* Payment method */}
                        <div>
                            <label style={labelStyle}>Payment Method</label>
                            <div style={{ display:'flex', gap:'10px' }}>
                                <button type="button" onClick={() => setPaymentMethod('M-PESA')} style={methodBtnStyle(paymentMethod === 'M-PESA', '#059669', '#ECFDF5')}>
                                    <Smartphone size={15} />
                                    <span>M-Pesa STK Push</span>
                                </button>
                                <button type="button" onClick={() => setPaymentMethod('CARD')} style={methodBtnStyle(paymentMethod === 'CARD', '#0058BC', '#EBF3FF')}>
                                    <CreditCard size={15} />
                                    <span>Card (Visa / MC)</span>
                                </button>
                            </div>
                        </div>

                        {/* Phone number */}
                        <div>
                            <label style={{ ...labelStyle, textTransform:'none', letterSpacing:0, fontSize:'0.85rem', color:'var(--text-main)' }}>
                                M-Pesa Phone Number <span style={{ color:'var(--primary-blue)' }}>*</span>
                            </label>
                            <input
                                type="tel"
                                required
                                placeholder="0712 345 678"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                style={{
                                    ...inputBase,
                                    border:       '1.5px solid var(--primary-blue)',
                                    fontSize:     '1.05rem',
                                    fontWeight:   '700',
                                    fontFamily:   'var(--font-mono)',
                                    padding:      '12px 16px',
                                }}
                            />
                            <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'5px' }}>
                                A payment prompt (STK Push) will be sent to this phone.
                            </p>
                        </div>

                        {/* Optional fields */}
                        <div>
                            <div style={{
                                borderTop:  '1px solid var(--surface-border)',
                                paddingTop: '14px',
                                marginBottom:'10px',
                            }}>
                                <span style={{ ...labelStyle, margin:0 }}>Receipt &amp; Delivery Info (Optional)</span>
                            </div>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
                                <div>
                                    <label style={{ ...labelStyle, textTransform:'none', letterSpacing:0, fontSize:'0.8rem' }}>Full Name</label>
                                    <input type="text" placeholder="e.g. John Kamau" value={name} onChange={(e) => setName(e.target.value)} style={inputBase} />
                                </div>
                                <div>
                                    <label style={{ ...labelStyle, textTransform:'none', letterSpacing:0, fontSize:'0.8rem' }}>Email (PDF receipt)</label>
                                    <input type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={inputBase} />
                                </div>
                            </div>
                            <div>
                                <label style={{ ...labelStyle, textTransform:'none', letterSpacing:0, fontSize:'0.8rem' }}>Delivery Address</label>
                                <input type="text" placeholder="e.g. Nyali, Mombasa / Pick-up Station" value={address} onChange={(e) => setAddress(e.target.value)} style={inputBase} />
                            </div>
                        </div>

                        {/* Status */}
                        {statusText && (
                            <div style={{
                                padding:      '12px 14px',
                                borderRadius: 'var(--radius-md)',
                                background:   '#F0FDF4',
                                border:       '1px solid #BBF7D0',
                                color:        '#166534',
                                fontSize:     '0.84rem',
                                display:      'flex',
                                alignItems:   'center',
                                gap:          '8px',
                            }}>
                                <CheckCircle2 size={16} style={{ flexShrink:0, color:'var(--accent-success)' }} />
                                <span>{statusText}</span>
                            </div>
                        )}

                        {/* Error */}
                        {errorText && (
                            <div style={{
                                padding:      '12px 14px',
                                borderRadius: 'var(--radius-md)',
                                background:   '#FEF2F2',
                                border:       '1px solid #FCA5A5',
                                color:        '#991B1B',
                                fontSize:     '0.84rem',
                                display:      'flex',
                                alignItems:   'center',
                                gap:          '8px',
                            }}>
                                <AlertCircle size={16} style={{ flexShrink:0, color:'var(--accent-error)' }} />
                                <span>{errorText}</span>
                            </div>
                        )}

                        {/* Pay button */}
                        <ShimmerButton
                            type="submit"
                            variant="electric"
                            size="lg"
                            disabled={isProcessing}
                            style={{ width:'100%' }}
                        >
                            {isProcessing
                                ? <span>Processing Payment…</span>
                                : <><span>Pay {formatKES(cartTotal)} via M-Pesa</span><ArrowRight size={16} /></>
                            }
                        </ShimmerButton>

                        {/* Trust footer */}
                        <div style={{
                            display:        'flex',
                            alignItems:     'center',
                            justifyContent: 'center',
                            gap:            '6px',
                            fontSize:       '0.72rem',
                            color:          'var(--text-light)',
                            paddingBottom:  '4px',
                        }}>
                            <ShieldCheck size={13} color="var(--accent-success)" />
                            <span>256-bit TLS Encrypted · Official KRA eTIMS Tax Invoice Generated</span>
                        </div>

                    </form>
                </div>
            </div>

            {/* Keyframes */}
            <style>{`
                @keyframes co-fadeIn  { from { opacity:0 } to { opacity:1 } }
                @keyframes co-slideUp { from { transform:translateY(48px); opacity:0 } to { transform:translateY(0); opacity:1 } }
                @keyframes co-pulse   { 0%,100%{opacity:1} 50%{opacity:0.35} }
            `}</style>
        </>
    );
}

export default CheckoutModal;
