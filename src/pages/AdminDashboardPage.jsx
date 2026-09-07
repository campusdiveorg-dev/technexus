import React, { useState } from 'react';
import {
  ShieldCheck, Lock, KeyRound, LayoutDashboard, Users,
  QrCode, TrendingUp, DollarSign, Package, Settings,
  Bell, ChevronRight, MoreVertical, ArrowUpRight,
  CheckCircle2, AlertCircle, LogOut, Zap, BarChart3,
  RefreshCw, Globe, Eye, EyeOff, Menu, Inbox
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatKES } from '../data/products';

/* ─── Design tokens ────────────────────────────────────── */
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

/* ─── Stat Card ─────────────────────────────────────────── */
const StatCard = ({ label, value, sub, subUp = true, icon: Icon, accent = C.primary, accentBg = C.primaryLight }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px', boxShadow: C.shadow, position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent, borderRadius: '16px 16px 0 0', opacity: 0.7 }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{label}</div>
        <div style={{ fontSize: '1.65rem', fontWeight: 800, color: C.text, lineHeight: 1.1 }}>{value}</div>
        {sub && <div style={{ fontSize: '0.75rem', fontWeight: 600, color: subUp ? C.success : C.textSub, marginTop: 6 }}>{sub}</div>}
      </div>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={accent} />
      </div>
    </div>
  </div>
);

/* ─── Sidebar Nav Item ──────────────────────────────────── */
const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10,
    width: '100%', cursor: 'pointer', textAlign: 'left',
    background: active ? C.primaryLight : 'transparent',
    border: active ? `1px solid ${C.primaryMid}` : '1px solid transparent',
    color: active ? C.primary : C.textSub,
    fontWeight: active ? 700 : 500, fontSize: '0.875rem', transition: 'all 0.15s',
  }}>
    <Icon size={16} /><span style={{ flex: 1 }}>{label}</span>
    {active && <ChevronRight size={13} color={C.primary} />}
  </button>
);

const StatusBadge = ({ status }) => {
  const ok = status === 'Active';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, fontSize: '0.73rem', fontWeight: 700, background: ok ? C.successBg : C.errorBg, color: ok ? C.success : C.error, border: `1px solid ${ok ? C.successBorder : '#FECACA'}` }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: ok ? C.success : C.error }} />{status}
    </span>
  );
};

/* ─── Empty State ───────────────────────────────────────── */
const EmptyState = ({ label }) => (
  <tr>
    <td colSpan={99} style={{ padding: '52px 20px', textAlign: 'center' }}>
      <Inbox size={36} style={{ margin: '0 auto 12px', display: 'block', color: C.textLight, opacity: 0.5 }} />
      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: C.textSub }}>{label}</div>
      <div style={{ fontSize: '0.78rem', color: C.textLight, marginTop: 4 }}>Data will appear here once connected to the database.</div>
    </td>
  </tr>
);

/* ─── PIN Gate ──────────────────────────────────────────── */
function PinGate() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [show, setShow] = useState(false);
  const { loginAdmin } = useAuth();

  const submit = (e) => {
    e.preventDefault();
    if (!loginAdmin(pin)) { setError(true); setPin(''); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg, backgroundImage: 'radial-gradient(ellipse at 30% 20%, rgba(0,88,188,0.06) 0%, transparent 60%)' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '48px 40px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, textAlign: 'center', boxShadow: C.shadowMd }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg,#0058BC,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 24px rgba(0,88,188,0.25)' }}>
          <Lock size={28} color="#fff" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.text, marginBottom: 8 }}>Admin Console</h2>
        <p style={{ fontSize: '0.875rem', color: C.textSub, marginBottom: 32, lineHeight: 1.6 }}>Byte Tech Operations Hub — Authorized Personnel Only</p>

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: 12, marginBottom: 20, background: C.errorBg, border: '1px solid #FECACA', color: C.error, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} /> Invalid PIN — Access Denied
          </div>
        )}

        <form onSubmit={submit}>
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <input type={show ? 'text' : 'password'} maxLength={8} placeholder="Enter Master PIN" value={pin} autoFocus
              onChange={e => { setPin(e.target.value); setError(false); }}
              style={{ width: '100%', padding: '14px 48px 14px 20px', borderRadius: 14, fontSize: '1.1rem', fontWeight: 700, letterSpacing: '8px', textAlign: 'center', background: C.bg, border: `1.5px solid ${error ? '#FCA5A5' : C.border}`, color: C.text, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = C.primary}
              onBlur={e => e.target.style.borderColor = error ? '#FCA5A5' : C.border}
            />
            <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: C.textLight, background: 'none', border: 'none', cursor: 'pointer' }}>
              {show ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
          <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: 14, fontSize: '0.95rem', fontWeight: 700, background: 'linear-gradient(135deg,#0058BC,#2563EB)', color: '#fff', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 6px 20px rgba(0,88,188,0.3)' }}>
            <KeyRound size={18} /> Unlock Console
          </button>
        </form>
        <p style={{ marginTop: 24, fontSize: '0.75rem', color: C.textLight }}>Dev PIN: <strong style={{ color: C.textSub }}>TN2026</strong></p>
      </div>
    </div>
  );
}

/* ─── Status color helper ───────────────────────────────── */
const statusStyle = (s) => ({
  Paid:       { bg: C.successBg,    color: C.success, border: C.successBorder },
  Dispatched: { bg: '#EFF6FF',      color: '#1D4ED8',  border: '#BFDBFE' },
  Refunded:   { bg: C.errorBg,      color: C.error,   border: '#FECACA' },
}[s] || { bg: C.bg, color: C.textSub, border: C.border });

const TH = ({ children, right }) => (
  <th style={{ padding: '12px 18px', textAlign: right ? 'right' : 'left', fontSize: '0.7rem', fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{children}</th>
);

/* ─── Main Admin Dashboard ──────────────────────────────── */
export default function AdminDashboardPage() {
  const { isAdminAuthenticated, logoutAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Live data state connected to backend API ──
  const [kpis, setKpis] = useState({ gmv: 0, revenue: 0, merchants: 0, mpesaRate: '—', etimsCount: 0, orders: 0 });
  const [sellers, setSellers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const pin = sessionStorage.getItem('tn_admin_pin') || 'TN2026';
      const [sumRes, ordRes] = await Promise.all([
        fetch('/api/admin/summary', { headers: { 'x-admin-pin': pin } }).catch(() => null),
        fetch('/api/admin/orders', { headers: { 'x-admin-pin': pin } }).catch(() => null)
      ]);
      if (sumRes && sumRes.ok) {
        const sumData = await sumRes.json();
        if (sumData.platformTotals) {
          setKpis({
            gmv: Number(sumData.platformTotals.total_gmv) || 0,
            revenue: Number(sumData.platformTotals.total_platform_revenue) || 0,
            merchants: Number(sumData.platformTotals.active_sellers) || 0,
            mpesaRate: '100%',
            etimsCount: Number(sumData.platformTotals.total_orders) || 0,
            orders: Number(sumData.platformTotals.total_orders) || 0
          });
        }
        if (Array.isArray(sumData.sellers)) {
          setSellers(sumData.sellers.map(s => ({
            id: s.id,
            name: s.store_name || s.full_name,
            owner: s.full_name,
            cat: s.category || 'General',
            rate: `${((s.commission_rate || 0.1) * 100).toFixed(0)}%`,
            gmv: Number(s.gmv) || 0,
            orders: Number(s.orders_count) || 0,
            status: s.is_active ? 'Active' : 'Pending'
          })));
        }
      }
      if (ordRes && ordRes.ok) {
        const ordData = await ordRes.json();
        if (Array.isArray(ordData.orders)) {
          setRecentOrders(ordData.orders.map(o => ({
            id: o.id,
            product: o.product_name,
            merchant: o.seller_name || 'Byte Tech Direct',
            amount: Number(o.total_amount || o.total_price) || 0,
            time: o.created_at ? new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
            status: o.status === 'paid' ? 'Paid' : o.status
          })));
        }
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isAdminAuthenticated) {
      fetchAdminData();
    }
  }, [isAdminAuthenticated]);

  if (!isAdminAuthenticated) return <PinGate />;

  const tabs = [
    { id: 'overview',  icon: LayoutDashboard, label: 'Overview' },
    { id: 'merchants', icon: Users,            label: 'Merchants' },
    { id: 'orders',    icon: Package,          label: 'Orders' },
    { id: 'revenue',   icon: BarChart3,        label: 'Revenue' },
  ];
  const complianceTabs = [
    { id: 'etims',    icon: QrCode,   label: 'KRA eTIMS' },
    { id: 'mpesa',    icon: Zap,      label: 'M-Pesa STK' },
    { id: 'platform', icon: Globe,    label: 'Platform' },
  ];

  const tabLabel = activeTab === 'etims' ? 'KRA eTIMS' : activeTab === 'mpesa' ? 'M-Pesa STK' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: 'Inter,system-ui,sans-serif' }}>

      {/* ── Sidebar ── */}
      {sidebarOpen && (
        <aside style={{ width: 228, flexShrink: 0, display: 'flex', flexDirection: 'column', background: C.sidebar, borderRight: `1px solid ${C.border}`, padding: '20px 12px', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px', marginBottom: 28 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#0058BC,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#fff', flexShrink: 0 }}>B</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: C.text }}>ByteTech</div>
              <div style={{ fontSize: '0.65rem', color: C.textLight, fontWeight: 700, letterSpacing: '0.05em' }}>ADMIN CONSOLE</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
            <div style={{ fontSize: '0.68rem', color: C.textLight, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 6px 8px' }}>Main</div>
            {tabs.map(t => <NavItem key={t.id} icon={t.icon} label={t.label} active={activeTab === t.id} onClick={() => setActiveTab(t.id)} />)}
            <div style={{ fontSize: '0.68rem', color: C.textLight, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '16px 6px 8px' }}>Compliance</div>
            {complianceTabs.map(t => <NavItem key={t.id} icon={t.icon} label={t.label} active={activeTab === t.id} onClick={() => setActiveTab(t.id)} />)}
          </div>

          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', marginBottom: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#0058BC,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', color: '#fff', flexShrink: 0 }}>A</div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: C.text }}>System Admin</div>
                <div style={{ fontSize: '0.7rem', color: C.textLight }}>Mombasa, Kenya</div>
              </div>
            </div>
            <button onClick={logoutAdmin} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: '0.82rem', fontWeight: 600, color: C.error, background: C.errorBg, border: '1px solid #FECACA', cursor: 'pointer' }}>
              <LogOut size={15} /> Lock Console
            </button>
          </div>
        </aside>
      )}

      {/* ── Main Content ── */}
      <div style={{ flex: 1, overflowY: 'auto', minWidth: 0, paddingBottom: 60 }}>

        {/* Top Bar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(248,250,252,0.9)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.border}`, padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ color: C.textSub, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 6 }}>
              <Menu size={20} />
            </button>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: C.text }}>{tabLabel}</div>
              <div style={{ fontSize: '0.74rem', color: C.textLight }}>Byte Tech Operations · Mombasa, Kenya</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, background: C.successBg, border: `1px solid ${C.successBorder}`, fontSize: '0.73rem', fontWeight: 700, color: C.success }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.success }} /> All Systems Live
            </div>
            <button style={{ width: 38, height: 38, borderRadius: 10, background: C.card, border: `1px solid ${C.border}`, color: C.textSub, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={17} />
            </button>
          </div>
        </div>

        <div style={{ padding: '28px 28px' }}>

          {/* ══ OVERVIEW ══ */}
          {activeTab === 'overview' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
                <StatCard label="Platform GMV (MTD)"    value={kpis.gmv     ? formatKES(kpis.gmv)     : '—'} sub="No data yet"    subUp={false} icon={TrendingUp} accent="#16A34A"  accentBg={C.successBg} />
                <StatCard label="Total Revenue"         value={kpis.revenue ? formatKES(kpis.revenue) : '—'} sub="No data yet"    subUp={false} icon={DollarSign} accent={C.primary} accentBg={C.primaryLight} />
                <StatCard label="Active Merchants"      value={kpis.merchants || '0'}                         sub="Pending sign-ups" subUp={false} icon={Users}     accent="#7C3AED"   accentBg="#F5F3FF" />
                <StatCard label="M-Pesa Success Rate"   value={kpis.mpesaRate}                                sub="Awaiting transactions" subUp={false} icon={Zap} accent={C.warning} accentBg={C.warningBg} />
                <StatCard label="KRA eTIMS Invoices"    value={kpis.etimsCount || '0'}                        sub="No invoices yet" subUp={false} icon={QrCode}    accent="#16A34A"   accentBg={C.successBg} />
                <StatCard label="Orders (MTD)"          value={kpis.orders || '0'}                            sub="No orders yet"  subUp={false} icon={Package}    accent="#0891B2"   accentBg="#ECFEFF" />
              </div>

              {/* Recent Orders */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: C.shadow }}>
                <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: C.text }}>Recent Transactions</div>
                    <div style={{ fontSize: '0.76rem', color: C.textSub, marginTop: 2 }}>Live order activity across all merchants</div>
                  </div>
                  <button onClick={() => setActiveTab('orders')} style={{ fontSize: '0.82rem', fontWeight: 700, color: C.primary, background: C.primaryLight, border: `1px solid ${C.primaryMid}`, padding: '7px 14px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                    View All <ArrowUpRight size={13} />
                  </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                        <TH>Order ID</TH><TH>Product</TH><TH>Merchant</TH><TH right>Amount</TH><TH>Time</TH><TH>Status</TH>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.length === 0
                        ? <EmptyState label="No transactions yet" />
                        : recentOrders.map((o, i) => {
                            const ss = statusStyle(o.status);
                            return (
                              <tr key={o.id} style={{ borderBottom: i < recentOrders.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}
                                onMouseEnter={e => e.currentTarget.style.background = C.bg}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontSize: '0.82rem', color: C.textSub }}>{o.id}</td>
                                <td style={{ padding: '14px 18px', fontWeight: 600, color: C.text }}>{o.product}</td>
                                <td style={{ padding: '14px 18px', fontSize: '0.82rem', color: C.textSub }}>{o.merchant}</td>
                                <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 700, color: C.primary }}>{formatKES(o.amount)}</td>
                                <td style={{ padding: '14px 18px', fontSize: '0.78rem', color: C.textLight }}>{o.time}</td>
                                <td style={{ padding: '14px 18px' }}>
                                  <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>{o.status}</span>
                                </td>
                              </tr>
                            );
                          })
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ══ MERCHANTS ══ */}
          {activeTab === 'merchants' && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: C.shadow }}>
              <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: C.text }}>Authorized Merchant Registry</div>
                  <div style={{ fontSize: '0.76rem', color: C.textSub, marginTop: 2 }}>{sellers.length} merchants registered · Mombasa Hub</div>
                </div>
                <button onClick={fetchAdminData} disabled={loading} style={{ padding: '9px 16px', borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`, color: C.textSub, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                      <TH>#</TH><TH>Store</TH><TH>Owner</TH><TH>Category</TH>
                      <TH right>Fee</TH><TH right>GMV (MTD)</TH><TH right>Orders</TH>
                      <TH>Status</TH><TH></TH>
                    </tr>
                  </thead>
                  <tbody>
                    {sellers.length === 0
                      ? <EmptyState label="No merchants registered yet" />
                      : sellers.map((s, i) => (
                          <tr key={s.id} style={{ borderBottom: i < sellers.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}
                            onMouseEnter={e => e.currentTarget.style.background = C.bg}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '16px 18px', fontSize: '0.78rem', color: C.textLight, fontWeight: 700 }}>{String(i + 1).padStart(2, '0')}</td>
                            <td style={{ padding: '16px 18px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: `hsl(${i * 60 + 200},55%,92%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.82rem', color: `hsl(${i * 60 + 200},55%,35%)`, flexShrink: 0 }}>{s.name.charAt(0)}</div>
                                <span style={{ fontWeight: 700, color: C.text, fontSize: '0.875rem' }}>{s.name}</span>
                              </div>
                            </td>
                            <td style={{ padding: '16px 18px', fontSize: '0.85rem', color: C.textSub }}>{s.owner}</td>
                            <td style={{ padding: '16px 18px' }}>
                              <span style={{ padding: '3px 9px', borderRadius: 7, background: '#F5F3FF', color: '#7C3AED', fontSize: '0.73rem', fontWeight: 700 }}>{s.cat}</span>
                            </td>
                            <td style={{ padding: '16px 18px', textAlign: 'right', fontWeight: 700, color: C.warning }}>{s.rate}</td>
                            <td style={{ padding: '16px 18px', textAlign: 'right', fontWeight: 700, color: C.primary, whiteSpace: 'nowrap' }}>{formatKES(s.gmv)}</td>
                            <td style={{ padding: '16px 18px', textAlign: 'right', fontSize: '0.85rem', color: C.textSub }}>{s.orders}</td>
                            <td style={{ padding: '16px 18px' }}><StatusBadge status={s.status} /></td>
                            <td style={{ padding: '16px 18px' }}>
                              <button style={{ color: C.textLight, background: 'none', border: 'none', cursor: 'pointer' }}><MoreVertical size={16} /></button>
                            </td>
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ ORDERS ══ */}
          {activeTab === 'orders' && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: C.shadow }}>
              <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: C.text }}>All Platform Orders</div>
                <div style={{ fontSize: '0.76rem', color: C.textSub, marginTop: 2 }}>{recentOrders.length} orders total</div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                      <TH>Order ID</TH><TH>Product</TH><TH>Merchant</TH><TH right>Amount</TH><TH>Time</TH><TH>Status</TH>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.length === 0
                      ? <EmptyState label="No orders placed yet" />
                      : recentOrders.map((o, i) => {
                          const ss = statusStyle(o.status);
                          return (
                            <tr key={`${o.id}-${i}`} style={{ borderBottom: `1px solid ${C.borderLight}` }}
                              onMouseEnter={e => e.currentTarget.style.background = C.bg}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                              <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontSize: '0.82rem', color: C.textSub }}>{o.id}</td>
                              <td style={{ padding: '14px 18px', fontWeight: 600, color: C.text }}>{o.product}</td>
                              <td style={{ padding: '14px 18px', fontSize: '0.82rem', color: C.textSub }}>{o.merchant}</td>
                              <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 700, color: C.primary }}>{formatKES(o.amount)}</td>
                              <td style={{ padding: '14px 18px', fontSize: '0.78rem', color: C.textLight }}>{o.time}</td>
                              <td style={{ padding: '14px 18px' }}>
                                <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>{o.status}</span>
                              </td>
                            </tr>
                          );
                        })
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ ETIMS ══ */}
          {activeTab === 'etims' && (
            <div style={{ background: C.card, border: `1px solid ${C.successBorder}`, borderRadius: 16, padding: 28, boxShadow: C.shadow }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: C.successBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCode size={22} color={C.success} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: C.success, fontSize: '1rem' }}>KRA eTIMS Fiscal Engine</div>
                  <div style={{ fontSize: '0.76rem', color: C.textSub }}>Virtual Control Unit · Configure your CU credentials below</div>
                </div>
                <span style={{ marginLeft: 'auto', padding: '5px 12px', borderRadius: 999, background: C.successBg, color: C.success, fontSize: '0.73rem', fontWeight: 700, border: `1px solid ${C.successBorder}`, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.success }} /> LIVE
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(175px,1fr))', gap: 14 }}>
                {[
                  { label: 'Taxpayer PIN',         value: import.meta.env?.VITE_KRA_PIN       || 'Not configured' },
                  { label: 'Control Unit ID',       value: import.meta.env?.VITE_KRA_VSCU_ID  || 'Not configured' },
                  { label: 'VAT Classification',   value: 'Rate A — 16.0%' },
                  { label: 'Invoices Filed (MTD)', value: kpis.etimsCount || '0' },
                  { label: 'Last CU Sync',         value: '—' },
                  { label: 'Sync Status',          value: '—' },
                ].map(f => (
                  <div key={f.label} style={{ background: C.bg, padding: '16px 18px', borderRadius: 12, border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: '0.68rem', color: C.textLight, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{f.label}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 800, color: C.text }}>{f.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20 }}>
                <a href="https://itax.kra.go.ke/KRA-Portal/invoiceChk.htm" target="_blank" rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10, background: C.successBg, border: `1px solid ${C.successBorder}`, color: C.success, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
                  Open iTax Portal <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
          )}

          {/* ══ OTHER TABS ══ */}
          {!['overview', 'merchants', 'orders', 'etims'].includes(activeTab) && (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
              <Settings size={40} style={{ margin: '0 auto 16px', opacity: 0.25, display: 'block', color: C.textSub }} />
              <div style={{ fontSize: '1rem', fontWeight: 700, color: C.textSub }}>Coming Soon</div>
              <div style={{ fontSize: '0.85rem', color: C.textLight, marginTop: 6 }}>This section is under construction.</div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
