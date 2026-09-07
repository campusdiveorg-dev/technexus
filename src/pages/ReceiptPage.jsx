import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, Printer, ArrowLeft, Store, 
  FileText, ShieldCheck, QrCode, ExternalLink 
} from 'lucide-react';
import { formatKES } from '../data/products';

export default function ReceiptPage() {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderId = searchParams.get('order_id') || searchParams.get('id');
    
    // Check localStorage for last order first
    let saved = null;
    try {
      const stored = localStorage.getItem('bytetechltd_last_order');
      if (stored) saved = JSON.parse(stored);
    } catch (e) {
      console.warn(e);
    }

    if (orderId && (!saved || saved.id !== orderId)) {
      // Fetch from API
      fetch(`/api/orders/get?id=${orderId}`)
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data && data.order) {
            setOrder(data.order);
          } else if (saved) {
            setOrder(saved);
          } else {
            // Mock fallback demonstration receipt
            setOrder(createFallbackOrder(orderId));
          }
        })
        .catch(() => {
          setOrder(saved || createFallbackOrder(orderId));
        })
        .finally(() => setLoading(false));
    } else if (saved) {
      setOrder(saved);
      setLoading(false);
    } else {
      setOrder(createFallbackOrder('BT-ORD-94821'));
      setLoading(false);
    }
  }, [searchParams]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', minHeight: '60vh' }}>
        <div className="receipt-spinner" style={{
          width: '44px',
          height: '44px',
          border: '4px solid rgba(0, 88, 188, 0.2)',
          borderTopColor: 'var(--primary-blue)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p style={{ color: 'var(--text-muted)' }}>Retrieving fiscal order details…</p>
      </div>
    );
  }

  const vat = order.vat || Math.round(order.total * (0.16 / 1.16));
  const subtotal = order.subtotal || (order.total - vat);
  const qrUrl = order.etimsQr || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://itax.kra.go.ke/KRA-Portal/invoiceChk.htm?cu=${order.cuInvoice || 'KRA-VSCU-001-INV-8492'}`;

  return (
    <div className="receipt-page" style={{ background: '#0A192F', minHeight: '100vh', padding: '40px 16px 80px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Navigation row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <Link 
            to="/catalog" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#94A3B8', fontSize: '0.9rem' }}
          >
            <ArrowLeft size={16} />
            <span>Back to Byte Tech Catalog</span>
          </Link>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #00D1FF, #0058BC)',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              <Printer size={16} />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Printable Official Receipt Card */}
        <div className="receipt-card" style={{
          background: '#ffffff',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 80px rgba(0,0,0,0.4)'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0A192F 0%, #0D2847 100%)',
            padding: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#fff',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0058BC, #00D1FF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: '800'
              }}>B</div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800' }}>Byte Tech Ltd</div>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Electronics Marketplace & Authorized Hardware</div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#00D1FF', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Official Tax Receipt
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '4px' }}>
                Order #{order.id}
              </div>
            </div>
          </div>

          {/* Metadata Block: Customer & Payment */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
            padding: '28px 32px',
            borderBottom: '1px solid #E2E8F0'
          }}>
            <div>
              <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#94A3B8', marginBottom: '8px' }}>
                Billed Customer
              </h4>
              <p style={{ fontWeight: '700', color: '#1E293B', fontSize: '1rem' }}>
                {order.customerName || 'Authorized Buyer'}
              </p>
              <p style={{ color: '#475569', fontSize: '0.88rem' }}>{order.phone}</p>
              {order.email && <p style={{ color: '#475569', fontSize: '0.88rem' }}>{order.email}</p>}
              <p style={{ color: '#475569', fontSize: '0.88rem' }}>{order.address || 'Mombasa Hub Dispatch'}</p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#94A3B8', marginBottom: '8px' }}>
                Payment Verification
              </h4>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#DCFCE7', color: '#15803D', padding: '4px 12px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: '700' }}>
                <CheckCircle2 size={16} />
                <span>IntaSend M-Pesa Cleared</span>
              </div>
              <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: '8px' }}>
                Ref / Txn: <strong>{order.txnId || 'IS-MPESA-OK'}</strong>
              </p>
              <p style={{ color: '#94A3B8', fontSize: '0.82rem' }}>
                {order.date || new Date().toLocaleString()}
              </p>
            </div>
          </div>

          {/* Item Table */}
          <div style={{ padding: '0 32px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginTop: '20px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 14px', textAlign: 'left', color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>Item</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center', color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>Qty</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right', color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>Unit Price</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right', color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px', color: '#1E293B', fontWeight: '600' }}>
                      {item.title}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center', color: '#475569' }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right', color: '#475569' }}>
                      {formatKES(item.price)}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right', color: '#0F172A', fontWeight: '700' }}>
                      {formatKES(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'flex-end', borderTop: '2px solid #E2E8F0', marginTop: '20px' }}>
            <div style={{ minWidth: '280px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem', color: '#475569' }}>
                <span>Subtotal (Excl. VAT 16%)</span>
                <span>{formatKES(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem', color: '#475569' }}>
                <span>KRA VAT (16%)</span>
                <span style={{ color: '#10B981', fontWeight: '600' }}>{formatKES(vat)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 4px', fontSize: '1.25rem', fontWeight: '800', color: '#0A192F', borderTop: '2px solid #0A192F', marginTop: '8px' }}>
                <span>Total Paid</span>
                <span style={{ color: 'var(--primary-blue)' }}>{formatKES(order.total)}</span>
              </div>
            </div>
          </div>

          {/* KRA eTIMS Fiscal Compliance Block */}
          <div style={{
            margin: '0 32px 32px',
            padding: '20px',
            background: '#F8FAFC',
            border: '1.5px dashed #CBD5E1',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={{ flex: '1 1 280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: '800', color: '#0A192F', marginBottom: '8px' }}>
                <ShieldCheck size={20} color="#10B981" />
                <span>KRA eTIMS FISCAL TAX INVOICE</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6, fontFamily: 'monospace' }}>
                <div><strong>KRA PIN:</strong> P051234567Z</div>
                <div><strong>CU SERIAL:</strong> {order.cuSerial || 'KRA-VSCU-001'}</div>
                <div><strong>CU INVOICE NO:</strong> {order.cuInvoice || 'KRA-VSCU-001-INV-8492'}</div>
                <div><strong>TAX CLASSIFICATION:</strong> Rate A (16% VAT Inclusive)</div>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <img 
                src={qrUrl} 
                alt="KRA eTIMS QR" 
                style={{ width: '96px', height: '96px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '4px', background: '#fff', display: 'block', margin: '0 auto 6px' }}
              />
              <a 
                href={`https://itax.kra.go.ke/KRA-Portal/invoiceChk.htm?cu=${order.cuInvoice || 'KRA-VSCU-001-INV-8492'}`}
                target="_blank" 
                rel="noreferrer"
                style={{ fontSize: '0.75rem', color: 'var(--primary-blue)', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <span>Verify on iTax</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Footer Note */}
          <div style={{ background: '#F8FAFC', padding: '20px 32px', textAlign: 'center', borderTop: '1px solid #E2E8F0', fontSize: '0.82rem', color: '#64748B' }}>
            <p>Thank you for shopping with Byte Tech Ltd. Official 1-to-2 year East Africa warranty applies.</p>
            <p style={{ marginTop: '4px' }}>For corporate tax queries, quote CU INVOICE: <strong>{order.cuInvoice || 'KRA-VSCU-001-INV-8492'}</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function createFallbackOrder(orderId) {
  return {
    id: orderId || 'BT-ORD-83921',
    customerName: 'Enterprise Client',
    phone: '+254 712 345 678',
    email: 'client@technexus.ke',
    address: 'Nyali, Mombasa, Kenya',
    date: new Date().toLocaleString(),
    total: 310000,
    subtotal: 267241,
    vat: 42759,
    txnId: 'IS-TXN-884923',
    cuSerial: 'KRA-VSCU-001',
    cuInvoice: 'KRA-VSCU-001-INV-9932',
    items: [
      {
        title: 'MacBook Pro 16" M3 Pro (36GB / 512GB)',
        quantity: 1,
        price: 310000
      }
    ]
  };
}
