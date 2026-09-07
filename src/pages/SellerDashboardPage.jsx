import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, TrendingUp, DollarSign, Plus,
  Trash2, LogOut, CheckCircle2, QrCode, X, Upload, Camera,
  Link2, BarChart3, ShieldCheck, ChevronRight, ArrowUpRight,
  Bell, Zap, Menu, Store, Inbox
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatKES } from '../data/products';

/* ─── Design tokens ─────────────────────────────────────── */
const C = {
  bg: '#F8FAFC', sidebar: '#FFFFFF', card: '#FFFFFF',
  border: '#E2E8F0', borderLight: '#F1F5F9',
  primary: '#0058BC', primaryLight: '#EFF6FF', primaryMid: '#DBEAFE',
  text: '#0F172A', textSub: '#64748B', textLight: '#94A3B8',
  success: '#16A34A', successBg: '#F0FDF4', successBorder: '#BBF7D0',
  error: '#DC2626', errorBg: '#FEF2F2',
  warning: '#D97706', warningBg: '#FFFBEB',
  shadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
  shadowMd: '0 4px 24px rgba(0,0,0,0.08)',
};

/* ─── Metric Card ────────────────────────────────────────── */
const MetricCard = ({ label, value, sub, subUp = true, icon: Icon, accent = C.primary, accentBg = C.primaryLight }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px', boxShadow: C.shadow, position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent, borderRadius: '16px 16px 0 0', opacity: 0.7 }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{label}</div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: C.text, lineHeight: 1.1 }}>{value}</div>
        {sub && <div style={{ fontSize: '0.75rem', fontWeight: 600, color: subUp ? C.success : C.textSub, marginTop: 6 }}>{sub}</div>}
      </div>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={accent} />
      </div>
    </div>
  </div>
);

/* ─── Sidebar Nav Item ───────────────────────────────────── */
const NavItem = ({ icon: Icon, label, active, badge, onClick }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10,
    width: '100%', cursor: 'pointer', textAlign: 'left',
    background: active ? C.primaryLight : 'transparent',
    border: active ? `1px solid ${C.primaryMid}` : '1px solid transparent',
    color: active ? C.primary : C.textSub,
    fontWeight: active ? 700 : 500, fontSize: '0.875rem', transition: 'all 0.15s',
  }}>
    <Icon size={16} /><span style={{ flex: 1 }}>{label}</span>
    {badge != null && <span style={{ padding: '2px 7px', borderRadius: 999, background: C.primaryMid, color: C.primary, fontSize: '0.7rem', fontWeight: 700 }}>{badge}</span>}
    {active && <ChevronRight size={13} color={C.primary} />}
  </button>
);

/* ─── Empty State ────────────────────────────────────────── */
const EmptyRow = ({ label, cols = 6 }) => (
  <tr>
    <td colSpan={cols} style={{ padding: '52px 20px', textAlign: 'center' }}>
      <Inbox size={36} style={{ margin: '0 auto 12px', display: 'block', color: C.textLight, opacity: 0.5 }} />
      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: C.textSub }}>{label}</div>
      <div style={{ fontSize: '0.78rem', color: C.textLight, marginTop: 4 }}>Add your first product to get started.</div>
    </td>
  </tr>
);

/* ─── Image Uploader ─────────────────────────────────────── */
function ImageUploader({ value, onChange }) {
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [preview, setPreview] = useState(value || '');
  const [tab, setTab] = useState('url');
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setPreview(ev.target.result); onChange(ev.target.result); };
    reader.readAsDataURL(file);
  };

  const openCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(s); setCameraActive(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = s; }, 100);
    } catch { alert('Camera permission denied or unavailable.'); }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current, video = videoRef.current;
    if (!canvas || !video) return;
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const url = canvas.toDataURL('image/jpeg', 0.85);
    setPreview(url); onChange(url); stopCamera();
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null); setCameraActive(false);
  };

  useEffect(() => () => { if (stream) stream.getTracks().forEach(t => t.stop()); }, [stream]);

  const inputBase = { width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: '0.875rem', background: C.bg, border: `1px solid ${C.border}`, color: C.text, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' };

  return (
    <div>
      {preview && (
        <div style={{ marginBottom: 12, position: 'relative' }}>
          <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 12, border: `1px solid ${C.border}`, display: 'block' }} />
          <button type="button" onClick={() => { setPreview(''); onChange(''); }} style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={12} />
          </button>
        </div>
      )}

      {cameraActive && (
        <div style={{ position: 'relative', marginBottom: 12, borderRadius: 12, overflow: 'hidden', background: '#000', border: `2px solid ${C.primary}` }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', display: 'block', maxHeight: 220, objectFit: 'cover' }} />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 10 }}>
            <button type="button" onClick={capturePhoto} style={{ padding: '9px 20px', borderRadius: 999, fontWeight: 700, fontSize: '0.85rem', background: C.primary, color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Camera size={15} /> Capture
            </button>
            <button type="button" onClick={stopCamera} style={{ padding: '9px 14px', borderRadius: 999, fontWeight: 600, fontSize: '0.85rem', background: C.errorBg, color: C.error, border: `1px solid #FECACA`, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {[['url', Link2, 'URL'], ['file', Upload, 'Upload'], ['camera', Camera, 'Camera']].map(([t, Icon, lbl]) => (
          <button key={t} type="button" onClick={() => setTab(t)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 10px', borderRadius: 9, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', background: tab === t ? C.primaryLight : C.bg, border: tab === t ? `1.5px solid ${C.primaryMid}` : `1px solid ${C.border}`, color: tab === t ? C.primary : C.textSub, transition: 'all 0.15s' }}>
            <Icon size={13} /> {lbl}
          </button>
        ))}
      </div>

      {tab === 'url' && (
        <input type="url" style={inputBase} placeholder="https://example.com/image.jpg"
          value={preview.startsWith('data:') ? '' : preview}
          onChange={e => { setPreview(e.target.value); onChange(e.target.value); }}
          onFocus={e => e.target.style.borderColor = C.primary}
          onBlur={e => e.target.style.borderColor = C.border}
        />
      )}
      {tab === 'file' && (
        <div onClick={() => fileRef.current?.click()} style={{ padding: '22px', borderRadius: 12, border: `2px dashed ${C.border}`, background: C.bg, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.background = C.primaryLight; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bg; }}>
          <Upload size={22} style={{ margin: '0 auto 8px', color: C.primary, display: 'block' }} />
          <div style={{ fontWeight: 600, color: C.textSub, fontSize: '0.85rem' }}>Click to browse files</div>
          <div style={{ fontSize: '0.73rem', color: C.textLight, marginTop: 3 }}>PNG, JPG, WEBP — max 5 MB</div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>
      )}
      {tab === 'camera' && !cameraActive && (
        <button type="button" onClick={openCamera} style={{ width: '100%', padding: '20px', borderRadius: 12, border: `2px dashed ${C.border}`, background: C.bg, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.background = C.primaryLight; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bg; }}>
          <Camera size={24} color={C.primary} />
          <span style={{ fontWeight: 600, color: C.textSub, fontSize: '0.85rem' }}>Open Camera</span>
          <span style={{ fontSize: '0.73rem', color: C.textLight }}>Tap to capture product photo</span>
        </button>
      )}
    </div>
  );
}

/* ─── Add Product Modal ──────────────────────────────────── */
function AddProductModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', category: 'laptops', price: '', stock: '', description: '', specs: '', image_url: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: C.textSub, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 7 };
  const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: 11, fontSize: '0.9rem', background: C.bg, border: `1px solid ${C.border}`, color: C.text, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' };
  const onFocus = e => e.target.style.borderColor = C.primary;
  const onBlur = e => e.target.style.borderColor = C.border;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    onAdd({ id: `p-${Date.now()}`, name: form.name, category: form.category, price: Number(form.price), stock: Number(form.stock) || 0, is_active: true, image_url: form.image_url || '' });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 580, background: C.card, borderRadius: '24px 24px 0 0', border: `1px solid ${C.border}`, borderBottom: 'none', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 -12px 60px rgba(0,0,0,0.15)' }}>

        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
          <div style={{ width: 40, height: 4, borderRadius: 99, background: C.border }} />
        </div>

        {/* Header */}
        <div style={{ position: 'sticky', top: 0, zIndex: 5, background: C.card, padding: '16px 24px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={18} color={C.primary} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: C.text, fontSize: '1rem' }}>Add New Product</div>
              <div style={{ fontSize: '0.72rem', color: C.textLight }}>Fill in the details and publish</div>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: C.bg, border: `1px solid ${C.border}`, color: C.textSub, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

            <div>
              <label style={labelStyle}>Product Photo</label>
              <ImageUploader value={form.image_url} onChange={v => set('image_url', v)} />
            </div>

            <div>
              <label style={labelStyle}>Product Name / Model *</label>
              <input type="text" required placeholder="e.g. Apple MacBook Air M3 15-inch" style={inputStyle} onFocus={onFocus} onBlur={onBlur} value={form.name} onChange={e => set('name', e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>Category</label>
                <select style={{ ...inputStyle, appearance: 'auto' }} value={form.category} onChange={e => set('category', e.target.value)} onFocus={onFocus} onBlur={onBlur}>
                  <option value="laptops">Laptops</option>
                  <option value="phones">Phones</option>
                  <option value="audio">Audio</option>
                  <option value="wearables">Wearables</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Price (KES) *</label>
                <input type="number" required min="1" placeholder="e.g. 185000" style={inputStyle} onFocus={onFocus} onBlur={onBlur} value={form.price} onChange={e => set('price', e.target.value)} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Initial Stock Quantity</label>
              <input type="number" min="0" placeholder="e.g. 10" style={inputStyle} onFocus={onFocus} onBlur={onBlur} value={form.stock} onChange={e => set('stock', e.target.value)} />
            </div>

            <div>
              <label style={labelStyle}>Description (optional)</label>
              <textarea rows={3} placeholder="Short product description…" style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} onFocus={onFocus} onBlur={onBlur} value={form.description} onChange={e => set('description', e.target.value)} />
            </div>

            <div>
              <label style={labelStyle}>Key Specs (comma-separated)</label>
              <input type="text" placeholder="M3 Pro chip, 36GB RAM, 512GB SSD" style={inputStyle} onFocus={onFocus} onBlur={onBlur} value={form.specs} onChange={e => set('specs', e.target.value)} />
            </div>

            <div style={{ padding: '14px 16px', borderRadius: 12, background: C.successBg, border: `1px solid ${C.successBorder}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <QrCode size={16} color={C.success} />
              <div style={{ fontSize: '0.78rem', color: C.success }}>
                <strong>KRA eTIMS ready</strong> — A fiscal invoice will be auto-generated at checkout (VAT 16%)
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div style={{ padding: '16px 24px 28px', display: 'flex', gap: 12, position: 'sticky', bottom: 0, background: C.card, borderTop: `1px solid ${C.border}` }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '13px', borderRadius: 13, fontWeight: 700, fontSize: '0.9rem', background: C.bg, border: `1px solid ${C.border}`, color: C.textSub, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ flex: 2, padding: '13px', borderRadius: 13, fontWeight: 800, fontSize: '0.9rem', background: 'linear-gradient(135deg,#0058BC,#2563EB)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 6px 20px rgba(0,88,188,0.28)' }}>
              <CheckCircle2 size={17} /> Publish to Byte Tech
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Main Seller Dashboard ──────────────────────────────── */
export default function SellerDashboardPage() {
  const navigate = useNavigate();
  const { currentSeller, sellerToken, isSellerAuthenticated, logoutSeller } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [addOpen, setAddOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  // ── Live state connected to database ──
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ gross_sales: 0, net_earnings: 0, platform_fee: 0, total_orders: 0 });

  const fetchSellerData = async () => {
    if (!sellerToken) return;
    try {
      setLoading(true);
      const res = await fetch('/api/sellers/dashboard', {
        headers: { 'Authorization': `Bearer ${sellerToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.totals) {
          setStats({
            gross_sales: Number(data.totals.gross_sales) || 0,
            net_earnings: Number(data.totals.net_earnings) || 0,
            platform_fee: Number(data.totals.total_commission_paid) || 0,
            total_orders: Number(data.totals.total_orders) || 0,
          });
        }
        if (Array.isArray(data.products)) {
          setProducts(data.products.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: Number(p.price),
            stock: Number(p.stock) || 0,
            image_url: p.image_url || '',
            is_active: p.is_active !== 0
          })));
        }
      }
    } catch (e) {
      console.error('Failed to load seller dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSellerAuthenticated) { 
      navigate('/seller/register'); 
    } else {
      fetchSellerData();
    }
  }, [isSellerAuthenticated, sellerToken, navigate]);

  if (!isSellerAuthenticated || !currentSeller) return null;

  const handleAdd = async (product) => {
    setProducts(p => [product, ...p]);
    setAddOpen(false);
    if (sellerToken) {
      try {
        await fetch('/api/sellers/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sellerToken}`
          },
          body: JSON.stringify({
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            stock: product.stock,
            image_url: product.image_url,
            description: product.description || '',
            specs: product.specs || ''
          })
        });
      } catch (err) {
        console.error('Failed to persist product:', err);
      }
    }
  };

  const handleDelete = async (id) => {
    setProducts(p => p.filter(x => x.id !== id));
    if (sellerToken) {
      try {
        await fetch(`/api/sellers/products?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${sellerToken}` }
        });
      } catch (err) {
        console.error('Failed to delete product from database:', err);
      }
    }
  };

  const navItems = [
    { id: 'overview',  icon: LayoutDashboard, label: 'Overview' },
    { id: 'products',  icon: Package,          label: 'My Products', badge: products.length || undefined },
    { id: 'revenue',   icon: BarChart3,        label: 'Sales & Revenue' },
  ];
  const complianceItems = [
    { id: 'etims',   icon: QrCode, label: 'KRA eTIMS' },
    { id: 'payouts', icon: Zap,    label: 'M-Pesa Payouts' },
  ];

  const tabLabel = {
    overview: 'Overview', products: 'My Products', revenue: 'Sales & Revenue',
    etims: 'KRA eTIMS', payouts: 'M-Pesa Payouts',
  }[activeTab] || activeTab;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: 'Inter,system-ui,sans-serif' }}>

      {/* ── Sidebar ── */}
      {sidebarOpen && (
        <aside style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', background: C.sidebar, borderRight: `1px solid ${C.border}`, padding: '20px 12px', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px', marginBottom: 28 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#0058BC,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, color: '#fff', flexShrink: 0 }}>B</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.875rem', color: C.text }}>ByteTech</div>
              <div style={{ fontSize: '0.65rem', color: C.textLight, fontWeight: 700, letterSpacing: '0.05em' }}>SELLER HUB</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
            <div style={{ fontSize: '0.68rem', color: C.textLight, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 6px 8px' }}>Dashboard</div>
            {navItems.map(t => <NavItem key={t.id} {...t} active={activeTab === t.id} onClick={() => setActiveTab(t.id)} />)}
            <div style={{ fontSize: '0.68rem', color: C.textLight, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '16px 6px 8px' }}>Compliance</div>
            {complianceItems.map(t => <NavItem key={t.id} {...t} active={activeTab === t.id} onClick={() => setActiveTab(t.id)} />)}
          </div>

          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, marginTop: 16 }}>
            <div style={{ padding: '8px 6px', marginBottom: 10 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: C.text, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentSeller.store_name}</div>
              <span style={{ padding: '2px 8px', borderRadius: 6, background: C.primaryLight, color: C.primary, fontWeight: 700, fontSize: '0.68rem', border: `1px solid ${C.primaryMid}` }}>
                {((currentSeller.commission_rate || 0.10) * 100).toFixed(0)}% commission
              </span>
            </div>
            <button onClick={logoutSeller} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: '0.82rem', fontWeight: 600, color: C.error, background: C.errorBg, border: '1px solid #FECACA', cursor: 'pointer' }}>
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </aside>
      )}

      {/* ── Main ── */}
      <div style={{ flex: 1, overflowY: 'auto', minWidth: 0, paddingBottom: 60 }}>

        {/* Topbar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(248,250,252,0.9)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.border}`, padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ color: C.textSub, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 6 }}>
              <Menu size={20} />
            </button>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: C.text }}>{tabLabel}</div>
              <div style={{ fontSize: '0.74rem', color: C.textLight }}>{currentSeller.full_name} · {currentSeller.email}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {activeTab === 'products' && (
              <button onClick={() => setAddOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#0058BC,#2563EB)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,88,188,0.25)' }}>
                <Plus size={15} /> Add Product
              </button>
            )}
            <button style={{ width: 38, height: 38, borderRadius: 10, background: C.card, border: `1px solid ${C.border}`, color: C.textSub, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={16} />
            </button>
          </div>
        </div>

        <div style={{ padding: '26px 28px' }}>

          {/* ══ OVERVIEW ══ */}
          {activeTab === 'overview' && (
            <>
              {/* Welcome banner */}
              <div style={{ background: 'linear-gradient(135deg,#0058BC 0%,#2563EB 100%)', borderRadius: 18, padding: '26px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24, boxShadow: '0 8px 32px rgba(0,88,188,0.2)' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.72rem', fontWeight: 700, marginBottom: 10 }}>
                    <ShieldCheck size={12} /> Verified Merchant
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                    Welcome back, {currentSeller.full_name.split(' ')[0]} 👋
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>{currentSeller.store_name} · Mombasa, Kenya</div>
                </div>
                <button onClick={() => setAddOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 12, background: '#fff', color: C.primary, fontWeight: 700, fontSize: '0.9rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', flexShrink: 0 }}>
                  <Plus size={17} /> List New Product
                </button>
              </div>

              {/* Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 16, marginBottom: 24 }}>
                <MetricCard label="Gross Sales"     value={stats.gross_sales   ? formatKES(stats.gross_sales)   : '—'} sub="No sales yet"       subUp={false} icon={TrendingUp} accent={C.success} accentBg={C.successBg} />
                <MetricCard label="Net Payout"      value={stats.net_earnings  ? formatKES(stats.net_earnings)  : '—'} sub="Disbursed via M-Pesa" subUp={false} icon={DollarSign} accent={C.primary} accentBg={C.primaryLight} />
                <MetricCard label="Platform Fee"    value={stats.platform_fee  ? formatKES(stats.platform_fee)  : '—'} sub="Incl. 16% VAT eTIMS" subUp={false} icon={Zap}        accent={C.warning} accentBg={C.warningBg} />
                <MetricCard label="Orders Fulfilled" value={stats.total_orders || '0'}                                  sub="No orders yet"       subUp={false} icon={Package}   accent="#7C3AED"   accentBg="#F5F3FF" />
              </div>

              {/* Quick links */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 14 }}>
                {[
                  { label: 'Manage Products', desc: products.length ? `${products.length} active listings` : 'No products yet', icon: Package, tab: 'products', accent: C.primary, accentBg: C.primaryLight },
                  { label: 'KRA eTIMS Status', desc: 'Configure fiscal engine', icon: QrCode, tab: 'etims', accent: C.success, accentBg: C.successBg },
                  { label: 'M-Pesa Payouts', desc: 'Connect your M-Pesa account', icon: Zap, tab: 'payouts', accent: C.warning, accentBg: C.warningBg },
                ].map(item => (
                  <button key={item.tab} onClick={() => setActiveTab(item.tab)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', borderRadius: 14, background: C.card, border: `1px solid ${C.border}`, cursor: 'pointer', textAlign: 'left', boxShadow: C.shadow, transition: 'border-color 0.15s, box-shadow 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = item.accent; e.currentTarget.style.boxShadow = `0 4px 20px ${item.accent}20`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = C.shadow; }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: item.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <item.icon size={19} color={item.accent} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: C.text, fontSize: '0.9rem' }}>{item.label}</div>
                      <div style={{ fontSize: '0.76rem', color: C.textSub, marginTop: 3 }}>{item.desc}</div>
                    </div>
                    <ArrowUpRight size={15} color={C.textLight} />
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ══ PRODUCTS ══ */}
          {activeTab === 'products' && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: C.shadow }}>
              <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, color: C.text, fontSize: '1rem' }}>Active Listings</div>
                  <div style={{ fontSize: '0.76rem', color: C.textSub, marginTop: 2 }}>{products.length} product{products.length !== 1 ? 's' : ''} published</div>
                </div>
                <button onClick={() => setAddOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: C.primaryLight, border: `1px solid ${C.primaryMid}`, color: C.primary, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                  <Plus size={14} /> Add Product
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                      {['Product', 'Category', 'Price', 'Stock', 'Status', ''].map(h => (
                        <th key={h} style={{ padding: '12px 18px', textAlign: ['Price', 'Stock'].includes(h) ? 'right' : 'left', fontSize: '0.7rem', fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0
                      ? <EmptyRow label="No products listed yet" cols={6} />
                      : products.map((item, i) => (
                          <tr key={item.id} style={{ borderBottom: i < products.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}
                            onMouseEnter={e => e.currentTarget.style.background = C.bg}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '15px 18px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                {item.image_url
                                  ? <img src={item.image_url} alt={item.name} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', background: C.bg, border: `1px solid ${C.border}`, flexShrink: 0 }} />
                                  : <div style={{ width: 44, height: 44, borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Package size={18} color={C.textLight} /></div>
                                }
                                <span style={{ fontWeight: 700, color: C.text, fontSize: '0.875rem' }}>{item.name}</span>
                              </div>
                            </td>
                            <td style={{ padding: '15px 18px' }}>
                              <span style={{ padding: '3px 9px', borderRadius: 7, background: '#F5F3FF', color: '#7C3AED', fontSize: '0.73rem', fontWeight: 700, textTransform: 'capitalize' }}>{item.category}</span>
                            </td>
                            <td style={{ padding: '15px 18px', textAlign: 'right', fontWeight: 700, color: C.primary, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{formatKES(item.price)}</td>
                            <td style={{ padding: '15px 18px', textAlign: 'right' }}>
                              <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: '0.73rem', fontWeight: 700, background: item.stock > 0 ? C.successBg : C.errorBg, color: item.stock > 0 ? C.success : C.error, border: `1px solid ${item.stock > 0 ? C.successBorder : '#FECACA'}` }}>
                                {item.stock} units
                              </span>
                            </td>
                            <td style={{ padding: '15px 18px' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', fontWeight: 700, color: C.success }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.success }} /> Published
                              </span>
                            </td>
                            <td style={{ padding: '15px 18px', textAlign: 'right' }}>
                              <button onClick={() => handleDelete(item.id)} title="Remove" style={{ color: C.textLight, background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 7, transition: 'all 0.15s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = C.errorBg; e.currentTarget.style.color = C.error; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = C.textLight; }}>
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ ETIMS ══ */}
          {activeTab === 'etims' && (
            <div style={{ background: C.card, border: `1px solid ${C.successBorder}`, borderRadius: 16, padding: 28, boxShadow: C.shadow }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: C.successBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCode size={22} color={C.success} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: C.success, fontSize: '1rem' }}>KRA eTIMS Active</div>
                  <div style={{ fontSize: '0.76rem', color: C.textSub }}>Fiscal receipts auto-generated on every sale</div>
                </div>
                <span style={{ marginLeft: 'auto', padding: '5px 12px', borderRadius: 999, background: C.successBg, color: C.success, fontSize: '0.73rem', fontWeight: 700, border: `1px solid ${C.successBorder}`, display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.success }} /> LIVE
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 14 }}>
                {[
                  { label: 'Taxpayer PIN',    value: '—' },
                  { label: 'Control Unit',    value: '—' },
                  { label: 'VAT Rate',        value: '16.0% (Rate A)' },
                  { label: 'Invoices Filed',  value: '0' },
                  { label: 'Last Sync',       value: '—' },
                  { label: 'Sync Health',     value: '—' },
                ].map(f => (
                  <div key={f.label} style={{ background: C.bg, borderRadius: 12, padding: '16px', border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: '0.68rem', color: C.textLight, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{f.label}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 800, color: C.text }}>{f.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ OTHER TABS ══ */}
          {!['overview', 'products', 'etims'].includes(activeTab) && (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
              <Store size={40} style={{ margin: '0 auto 16px', opacity: 0.25, display: 'block', color: C.textSub }} />
              <div style={{ fontSize: '1rem', fontWeight: 700, color: C.textSub }}>Coming Soon</div>
              <div style={{ fontSize: '0.85rem', color: C.textLight, marginTop: 6 }}>This section is under development.</div>
            </div>
          )}

        </div>
      </div>

      {addOpen && <AddProductModal onClose={() => setAddOpen(false)} onAdd={handleAdd} />}
    </div>
  );
}
