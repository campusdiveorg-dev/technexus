import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, ShieldCheck, ArrowRight, Lock, Mail, Phone, User, Building, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ShimmerButton from '../components/magicui/ShimmerButton';

export default function SellerRegisterPage() {
  const navigate = useNavigate();
  const { loginSeller } = useAuth();

  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    store_name: '',
    full_name: '',
    email: '',
    password: '',
    phone: '',
    category: 'laptops'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/sellers/login' : '/api/sellers/register';
    const payload = isLogin 
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.token) {
        loginSeller(data.seller, data.token);
        navigate('/seller/dashboard');
      } else {
        // If server returned error, check if local fallback or show message
        if (data.error) {
          setError(data.error);
        } else {
          // Dev demo fallback
          handleDemoLogin();
        }
      }
    } catch (err) {
      console.warn('Backend offline, using demo merchant session:', err);
      handleDemoLogin();
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demoSeller = {
      id: `seller-${Date.now()}`,
      store_name: formData.store_name || 'Byte Tech Merchant Store',
      full_name: formData.full_name || 'Mombasa Hardware Merchant',
      email: formData.email || 'merchant@bytetech.ke',
      category: formData.category,
      commission_rate: 0.10
    };
    loginSeller(demoSeller, 'demo-jwt-token');
    navigate('/seller/dashboard');
  };

  return (
    <div className="seller-auth-page" style={{ padding: '48px 16px 80px', minHeight: '85vh', display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: '520px', width: '100%', margin: '0 auto' }}>
        <div style={{
          background: 'var(--surface-white)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--surface-border)',
          padding: '36px',
          boxShadow: 'var(--shadow-lg)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--primary-blue), #00D1FF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              margin: '0 auto 16px'
            }}>
              <Store size={28} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--midnight-navy)' }}>
              {isLogin ? 'Merchant Portal Login' : 'Register Authorized Merchant'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px' }}>
              {isLogin 
                ? 'Access your sales dashboard, payout statements, and hardware catalog.'
                : 'Join Byte Tech marketplace. Instant M-Pesa payouts and automatic KRA tax invoices.'}
            </p>
          </div>

          {/* Error notice */}
          {error && (
            <div style={{
              padding: '12px 16px',
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: 'var(--radius-md)',
              color: '#991B1B',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px'
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!isLogin && (
              <>
                <div>
                  <label className="filter-label">Store / Business Name</label>
                  <div style={{ position: 'relative' }}>
                    <Building size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                    <input 
                      type="text"
                      name="store_name"
                      required
                      placeholder="e.g. Apex Hardware Mombasa"
                      value={formData.store_name}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="filter-label">Owner Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                    <input 
                      type="text"
                      name="full_name"
                      required
                      placeholder="e.g. Kevin Mwangi"
                      value={formData.full_name}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="filter-label">M-Pesa Business Line / Phone</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                    <input 
                      type="tel"
                      name="phone"
                      placeholder="0712 345 678"
                      value={formData.phone}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="filter-label">Primary Hardware Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', background: 'var(--surface-frost)' }}
                  >
                    <option value="laptops">Laptops & Workstations (10% standard fee)</option>
                    <option value="phones">Smartphones & Tablets (10%)</option>
                    <option value="audio">Audio & Acoustics (12%)</option>
                    <option value="wearables">Smartwatches & Wearables (10%)</option>
                    <option value="accessories">Docks, Monitors & Keyboards (12%)</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="filter-label">Work Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input 
                  type="email"
                  name="email"
                  required
                  placeholder="merchant@company.ke"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}
                />
              </div>
            </div>

            <div>
              <label className="filter-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input 
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}
                />
              </div>
            </div>

            {!isLogin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <CheckCircle2 size={16} color="var(--accent-success)" />
                <span>eTIMS ready: Byte Tech handles VAT tax reporting on your sales</span>
              </div>
            )}

            <ShimmerButton
              variant="primary"
              size="lg"
              type="submit"
              disabled={loading}
              style={{ width: '100%', marginTop: '12px' }}
            >
              <span>{loading ? 'Processing...' : isLogin ? 'Sign In to Dashboard' : 'Complete Merchant Registration'}</span>
              <ArrowRight size={18} />
            </ShimmerButton>
          </form>

          {/* Switch mode */}
          <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--surface-border)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {isLogin ? (
              <span>
                Don't have a merchant account?{' '}
                <button 
                  type="button" 
                  onClick={() => setIsLogin(false)}
                  style={{ color: 'var(--primary-blue)', fontWeight: '700' }}
                >
                  Register Here
                </button>
              </span>
            ) : (
              <span>
                Already a registered seller?{' '}
                <button 
                  type="button" 
                  onClick={() => setIsLogin(true)}
                  style={{ color: 'var(--primary-blue)', fontWeight: '700' }}
                >
                  Log In
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
