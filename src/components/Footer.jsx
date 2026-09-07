import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Headphones, CheckCircle2, QrCode } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        {/* Trust Badges Row */}
        <div className="footer-trust-grid">
          <div className="trust-item">
            <div className="trust-icon-box">
              <ShieldCheck size={26} color="var(--primary-blue)" />
            </div>
            <div>
              <h4>Official Warranties</h4>
              <p>1-to-2 year East Africa manufacturer warranty on all items</p>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-icon-box">
              <Zap size={26} color="var(--electric-blue)" />
            </div>
            <div>
              <h4>Instant M-Pesa STK</h4>
              <p>Safe, zero-friction mobile checkout via IntaSend Payments</p>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-icon-box">
              <QrCode size={26} color="var(--accent-success)" />
            </div>
            <div>
              <h4>KRA eTIMS Invoiced</h4>
              <p>Automated fiscal tax receipts with scannable QR verification</p>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-icon-box">
              <Headphones size={26} color="var(--accent-amber)" />
            </div>
            <div>
              <h4>Mombasa Express Dispatch</h4>
              <p>Same-day courier within Mombasa, 24h countrywide across Kenya</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="footer-main-grid">
          <div className="footer-brand-col">
            <div className="brand-logo" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div className="logo-symbol" style={{
                background: 'linear-gradient(135deg, #0058BC, #00D1FF)',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: '800',
                fontSize: '18px'
              }}>B</div>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--midnight-navy)' }}>
                Byte<span style={{ color: 'var(--electric-blue)' }}>Tech</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '320px', lineHeight: '1.6' }}>
              Kenya’s premier hardware & computing ecosystem. High-performance workstations, enterprise accessories, and developer gears with instant fiscal compliance.
            </p>
            <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
              <span className="badge-etims-pill" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: '#ECFDF5',
                color: '#065F46',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: '600',
                border: '1px solid #A7F3D0'
              }}>
                <CheckCircle2 size={14} /> KRA eTIMS Active
              </span>
            </div>
          </div>

          <div className="footer-col">
            <h5 className="footer-title">Hardware Catalog</h5>
            <ul className="footer-links">
              <li><Link to="/catalog?cat=laptops">Laptops & MacBooks</Link></li>
              <li><Link to="/catalog?cat=phones">Smartphones & Tablets</Link></li>
              <li><Link to="/catalog?cat=audio">Studio & ANC Audio</Link></li>
              <li><Link to="/catalog?cat=wearables">Wearables & Smartwatches</Link></li>
              <li><Link to="/catalog?cat=accessories">Docks & Ergonomics</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5 className="footer-title">Customer Care</h5>
            <ul className="footer-links">
              <li><Link to="/cart">My Shopping Cart</Link></li>
              <li><Link to="/receipt">Order Fiscal Verification</Link></li>
              <li><Link to="/catalog">All Hardware Collections</Link></li>
              <li><Link to="/catalog?tag=FLAGSHIP">Featured Flagship Deals</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5 className="footer-title">Store & Support</h5>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>
              Biashara Plaza, 4th Floor, Suite 412<br />
              Moi Avenue, Mombasa CBD, Kenya
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>
              <strong>Support:</strong> +254 700 000 000<br />
              <strong>Fiscal PIN:</strong> P051234567Z
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom-row">
          <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
            &copy; {new Date().getFullYear()} Byte Tech Ltd. All rights reserved. Registered under Laws of Kenya.
          </p>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>eTIMS Declarations</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
