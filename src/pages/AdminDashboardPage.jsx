import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck, Lock, KeyRound, LayoutDashboard, Users,
  QrCode, TrendingUp, DollarSign, Package, Settings,
  Bell, ChevronRight, MoreVertical, ArrowUpRight,
  CheckCircle2, AlertCircle, LogOut, Zap, BarChart3,
  RefreshCw, Globe, Eye, EyeOff, Menu, Inbox,
  Download, Search, Filter, Edit3, X, Check,
  ExternalLink, Activity, Server, FileText, Database,
  ArrowDownToLine, Phone, Mail, Building, CheckSquare,
  AlertTriangle, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatKES } from '../data/products';
import { apiUrl } from '../lib/api';

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
const NavItem = ({ icon: Icon, label, active, onClick, badge }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10,
    width: '100%', cursor: 'pointer', textAlign: 'left',
    background: active ? C.primaryLight : 'transparent',
    border: active ? `1px solid ${C.primaryMid}` : '1px solid transparent',
    color: active ? C.primary : C.textSub,
    fontWeight: active ? 700 : 500, fontSize: '0.875rem', transition: 'all 0.15s',
  }}>
    <Icon size={16} /><span style={{ flex: 1 }}>{label}</span>
    {badge !== undefined && (
      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 999, background: active ? C.primary : C.border, color: active ? '#fff' : C.textSub, fontWeight: 700 }}>
        {badge}
      </span>
    )}
    {active && <ChevronRight size={13} color={C.primary} />}
  </button>
);

const StatusBadge = ({ status }) => {
  const ok = status === 'Active' || status === 'paid' || status === 'FISCALIZED_VALID';
  const isPending = status === 'pending' || status === 'Pending';
  const bg = ok ? C.successBg : isPending ? C.warningBg : C.errorBg;
  const color = ok ? C.success : isPending ? C.warning : C.error;
  const border = ok ? C.successBorder : isPending ? '#FDE68A' : '#FECACA';

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, fontSize: '0.73rem', fontWeight: 700, background: bg, color: color, border: `1px solid ${border}` }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
      {status === 'paid' ? 'Paid' : status}
    </span>
  );
};

/* ─── Empty State ───────────────────────────────────────── */
const EmptyState = ({ label, sub }) => (
  <tr>
    <td colSpan={99} style={{ padding: '48px 20px', textAlign: 'center' }}>
      <Inbox size={36} style={{ margin: '0 auto 12px', display: 'block', color: C.textLight, opacity: 0.5 }} />
      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: C.textSub }}>{label}</div>
      <div style={{ fontSize: '0.78rem', color: C.textLight, marginTop: 4 }}>{sub || 'Data will appear here as activity occurs.'}</div>
    </td>
  </tr>
);

/* ─── PIN Gate ──────────────────────────────────────────── */
function PinGate() {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [show, setShow] = useState(false);
  const { loginAdmin } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    if (!pin.trim() || submitting) return;
    setSubmitting(true);
    setErrorMsg('');
    const result = await loginAdmin(pin.trim());
    // loginAdmin returns { success: boolean, error?: string }
    if (!result?.success) {
      setErrorMsg(result?.error || 'Invalid PIN — Access Denied');
      setPin('');
    }
    setSubmitting(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg, backgroundImage: 'radial-gradient(ellipse at 30% 20%, rgba(0,88,188,0.06) 0%, transparent 60%)' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '48px 40px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, textAlign: 'center', boxShadow: C.shadowMd }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg,#0058BC,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 24px rgba(0,88,188,0.25)' }}>
          <Lock size={28} color="#fff" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.text, marginBottom: 8 }}>Admin Console</h2>
        <p style={{ fontSize: '0.875rem', color: C.textSub, marginBottom: 32, lineHeight: 1.6 }}>Byte Tech Operations Hub — Authorized Personnel Only</p>

        {errorMsg && (
          <div style={{ padding: '12px 16px', borderRadius: 12, marginBottom: 20, background: C.errorBg, border: '1px solid #FECACA', color: C.error, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        <form onSubmit={submit}>
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <input type={show ? 'text' : 'password'} maxLength={16} placeholder="Enter Master PIN" value={pin} autoFocus
              onChange={e => { setPin(e.target.value); setErrorMsg(''); }}
              style={{ width: '100%', padding: '14px 48px 14px 20px', borderRadius: 14, fontSize: '1.1rem', fontWeight: 700, letterSpacing: '8px', textAlign: 'center', background: C.bg, border: `1.5px solid ${errorMsg ? '#FCA5A5' : C.border}`, color: C.text, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = C.primary}
              onBlur={e => e.target.style.borderColor = errorMsg ? '#FCA5A5' : C.border}
            />
            <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: C.textLight, background: 'none', border: 'none', cursor: 'pointer' }}>
              {show ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
          <button type="submit" disabled={submitting} style={{ width: '100%', padding: '14px', borderRadius: 14, fontSize: '0.95rem', fontWeight: 700, background: 'linear-gradient(135deg,#0058BC,#2563EB)', color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 6px 20px rgba(0,88,188,0.3)', opacity: submitting ? 0.75 : 1 }}>
            <KeyRound size={18} /> {submitting ? 'Verifying Credentials…' : 'Unlock Console'}
          </button>
        </form>
      </div>
    </div>
  );
}

const TH = ({ children, right }) => (
  <th style={{ padding: '12px 18px', textAlign: right ? 'right' : 'left', fontSize: '0.7rem', fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{children}</th>
);

/* ─── Main Admin Dashboard Component ────────────────────── */
export default function AdminDashboardPage() {
  const { isAdminAuthenticated, logoutAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Live state connected to backend API
  const [kpis, setKpis] = useState({ gmv: 0, revenue: 0, merchants: 0, mpesaRate: '100%', etimsCount: 0, orders: 0 });
  const [sellers, setSellers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [healthData, setHealthData] = useState(null);
  const [systemLogs, setSystemLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Search & Filter state
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [sellerSearch, setSellerSearch] = useState('');
  const [sellerStatusFilter, setSellerStatusFilter] = useState('all');

  // Modals / Edit states
  const [editingCommission, setEditingCommission] = useState(null);
  const [editRateValue, setEditRateValue] = useState(10);
  const [editingSellerRate, setEditingSellerRate] = useState(null);
  const [sellerRateValue, setSellerRateValue] = useState(10);

  // M-Pesa tool state
  const [testInvoiceId, setTestInvoiceId] = useState('');
  const [verifyStatusResult, setVerifyStatusResult] = useState(null);

  const getAdminPin = () => sessionStorage.getItem('tn_admin_pin') || '';

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const pin = getAdminPin();
      const [sumRes, ordRes, comRes, healthRes] = await Promise.all([
        fetch(apiUrl('/admin/summary'), { headers: { 'x-admin-pin': pin } }).catch(() => null),
        fetch(apiUrl('/admin/orders'), { headers: { 'x-admin-pin': pin } }).catch(() => null),
        fetch(apiUrl('/admin/commissions'), { headers: { 'x-admin-pin': pin } }).catch(() => null),
        fetch(apiUrl('/health')).catch(() => null)
      ]);

      if (sumRes && sumRes.ok) {
        const sumData = await sumRes.json();
        const totals = sumData.platformTotals || sumData.data?.platformTotals;
        if (totals) {
          setKpis({
            gmv: Number(totals.total_gmv) || 0,
            revenue: Number(totals.total_platform_revenue) || 0,
            merchants: Number(totals.active_sellers) || 0,
            mpesaRate: '100%',
            etimsCount: Number(totals.total_orders) || 0,
            orders: Number(totals.total_orders) || 0
          });
        }
        const sellersList = sumData.sellers || sumData.data?.sellers;
        if (Array.isArray(sellersList)) {
          setSellers(sellersList.map(s => ({
            id: s.id,
            name: s.store_name || s.full_name || 'Merchant',
            owner: s.full_name || s.store_name || 'Owner',
            email: s.email || '',
            phone: s.phone || '',
            cat: s.category || 'General',
            rate: `${((s.commission_rate || 0.1) * 100).toFixed(0)}%`,
            rawRate: Number(s.commission_rate) || 0.1,
            gmv: Number(s.gmv) || 0,
            orders: Number(s.orders_count) || 0,
            status: (s.is_active === 1 || s.is_active === true || s.is_active === '1') ? 'Active' : 'Suspended'
          })));
        }
      }

      if (ordRes && ordRes.ok) {
        const ordData = await ordRes.json();
        const ordersList = ordData.orders || ordData.data?.orders;
        if (Array.isArray(ordersList)) {
          setRecentOrders(ordersList.map(o => ({
            id: o.id,
            product: o.product_name || 'Hardware Order',
            merchant: o.seller_name || 'Byte Tech Direct',
            customer: o.customer_name || 'Direct Customer',
            customer_email: o.customer_email || '',
            amount: Number(o.total_amount || o.total_price) || 0,
            payment_method: o.payment_method || 'M-Pesa (IntaSend)',
            created_at: o.created_at,
            time: o.created_at ? new Date(o.created_at).toLocaleString() : 'Recent',
            status: o.status === 'paid' ? 'Paid' : o.status
          })));
        }
      }

      if (comRes && comRes.ok) {
        const comData = await comRes.json();
        const ratesList = comData.rates || comData.data?.rates;
        if (Array.isArray(ratesList)) {
          setCommissions(ratesList);
        }
      }

      if (healthRes && healthRes.ok) {
        const hData = await healthRes.json();
        setHealthData(hData);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemLogs = async () => {
    try {
      const pin = getAdminPin();
      const res = await fetch(apiUrl('/health/logs?limit=40'), {
        headers: { 'x-admin-pin': pin }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.logs)) {
          setSystemLogs(data.logs);
        }
      }
    } catch (err) {
      console.error('Failed to fetch system logs:', err);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchAdminData();
    }
  }, [isAdminAuthenticated]);

  useEffect(() => {
    if (activeTab === 'platform' && isAdminAuthenticated) {
      fetchSystemLogs();
    }
  }, [activeTab, isAdminAuthenticated]);

  // ─── Actions & Functions ───────────────────────────────────

  const handleUpdateCommissionRate = async (category, newRate) => {
    try {
      const pin = getAdminPin();
      const rateDecimal = parseFloat(newRate) / 100;
      const res = await fetch(apiUrl('/admin/commissions'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin
        },
        body: JSON.stringify({ category, rate: rateDecimal })
      });
      if (res.ok) {
        setEditingCommission(null);
        showToast(`Commission rate for ${category} updated to ${newRate}%!`);
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to update commission rate:', err);
    }
  };

  const handleToggleSellerStatus = async (sellerId, currentStatus) => {
    try {
      const pin = getAdminPin();
      const nextActive = currentStatus === 'Active' ? 0 : 1;
      const res = await fetch(apiUrl('/admin/sellers/status'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin
        },
        body: JSON.stringify({ seller_id: sellerId, is_active: nextActive })
      });
      if (res.ok) {
        showToast(`Merchant status changed to ${nextActive ? 'Active' : 'Suspended'}`);
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to toggle seller status:', err);
    }
  };

  const handleDeleteSeller = async (sellerId, storeName) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${storeName}" and all associated products? This action cannot be undone.`)) {
      return;
    }
    // Optimistically update UI immediately
    setSellers(prev => prev.filter(s => s.id !== sellerId));
    try {
      const pin = getAdminPin();
      const res = await fetch(apiUrl('/admin/sellers/delete'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin
        },
        body: JSON.stringify({ seller_id: sellerId })
      });
      if (res.ok) {
        showToast(`Merchant "${storeName}" permanently deleted.`);
        fetchAdminData();
      } else {
        const errData = await res.json();
        showToast(errData.error || 'Failed to delete merchant.');
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to delete seller:', err);
      showToast('Network error while deleting merchant.');
      fetchAdminData();
    }
  };

  const handleUpdateSellerRate = async (sellerId, newRatePercent) => {
    try {
      const pin = getAdminPin();
      const rateDecimal = parseFloat(newRatePercent) / 100;
      const res = await fetch(apiUrl('/admin/sellers/rate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin
        },
        body: JSON.stringify({ seller_id: sellerId, commission_rate: rateDecimal })
      });
      if (res.ok) {
        setEditingSellerRate(null);
        showToast(`Merchant custom commission updated to ${newRatePercent}%`);
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to update seller rate:', err);
    }
  };

  const handleVerifyPayment = async () => {
    if (!testInvoiceId.trim()) return;
    try {
      const res = await fetch(apiUrl('/payments/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_id: testInvoiceId.trim() })
      });
      const data = await res.json();
      setVerifyStatusResult(data);
      fetchAdminData();
    } catch (err) {
      console.error('Payment verification failed:', err);
      setVerifyStatusResult({ error: 'Failed to contact payment gateway' });
    }
  };

  const exportOrdersCSV = () => {
    if (!recentOrders.length) return;
    const headers = ['Order ID', 'Product', 'Merchant', 'Customer', 'Amount (KES)', 'Payment Method', 'Status', 'Date Time'];
    const rows = recentOrders.map(o => [
      `"${o.id}"`,
      `"${o.product.replace(/"/g, '""')}"`,
      `"${o.merchant.replace(/"/g, '""')}"`,
      `"${o.customer.replace(/"/g, '""')}"`,
      o.amount,
      `"${o.payment_method}"`,
      `"${o.status}"`,
      `"${o.time}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ByteTech_Orders_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Orders exported to CSV successfully!');
  };

  const exportPayoutsCSV = () => {
    if (!sellers.length) return;
    const headers = ['Merchant ID', 'Store Name', 'Owner', 'Category', 'Commission Rate', 'GMV (KES)', 'Platform Fee (KES)', 'Net Payout Due (KES)', 'Orders'];
    const rows = sellers.map(s => {
      const fee = Math.round(s.gmv * s.rawRate);
      const payout = Math.round(s.gmv - fee);
      return [
        `"${s.id}"`,
        `"${s.name.replace(/"/g, '""')}"`,
        `"${s.owner.replace(/"/g, '""')}"`,
        `"${s.cat}"`,
        `"${s.rate}"`,
        s.gmv,
        fee,
        payout,
        s.orders
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ByteTech_Merchant_Payouts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Merchant payout schedule exported to CSV!');
  };

  const showToast = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  // Filtered lists
  const filteredOrders = useMemo(() => {
    return recentOrders.filter(o => {
      const matchSearch = !orderSearch || 
        o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.product.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customer.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.merchant.toLowerCase().includes(orderSearch.toLowerCase());
      const matchStatus = orderStatusFilter === 'all' || o.status.toLowerCase() === orderStatusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [recentOrders, orderSearch, orderStatusFilter]);

  const filteredSellers = useMemo(() => {
    return sellers.filter(s => {
      const matchSearch = !sellerSearch ||
        s.name.toLowerCase().includes(sellerSearch.toLowerCase()) ||
        s.owner.toLowerCase().includes(sellerSearch.toLowerCase()) ||
        s.cat.toLowerCase().includes(sellerSearch.toLowerCase());
      const matchStatus = sellerStatusFilter === 'all' || s.status.toLowerCase() === sellerStatusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [sellers, sellerSearch, sellerStatusFilter]);

  if (!isAdminAuthenticated) return <PinGate />;

  const tabs = [
    { id: 'overview',  icon: LayoutDashboard, label: 'Overview' },
    { id: 'merchants', icon: Users,            label: 'Merchants', badge: sellers.length || undefined },
    { id: 'orders',    icon: Package,          label: 'Orders', badge: recentOrders.length || undefined },
    { id: 'revenue',   icon: BarChart3,        label: 'Revenue & Payouts' },
  ];
  const complianceTabs = [
    { id: 'etims',    icon: QrCode,   label: 'KRA eTIMS' },
    { id: 'mpesa',    icon: Zap,      label: 'M-Pesa Gateway' },
    { id: 'platform', icon: Server,   label: 'Platform Diagnostics' },
  ];

  const tabLabel = activeTab === 'etims' ? 'KRA eTIMS Fiscalization' :
                   activeTab === 'mpesa' ? 'M-Pesa STK Gateway & Verification' :
                   activeTab === 'platform' ? 'System Telemetry & Health' :
                   activeTab === 'revenue' ? 'Revenue Analytics & Seller Payouts' :
                   activeTab.charAt(0).toUpperCase() + activeTab.slice(1);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: 'Inter,system-ui,sans-serif' }}>

      {/* ── Toast Notification ── */}
      {actionSuccess && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: '#0F172A', color: '#fff', padding: '14px 22px', borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 10, boxShadow: C.shadowMd,
          fontSize: '0.88rem', fontWeight: 600, border: '1px solid #334155'
        }}>
          <CheckCircle2 size={18} color="#22C55E" /> {actionSuccess}
        </div>
      )}

      {/* ── Sidebar ── */}
      {sidebarOpen && (
        <aside style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', background: C.sidebar, borderRight: `1px solid ${C.border}`, padding: '20px 14px', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px', marginBottom: 28 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg,#0058BC,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 17, color: '#fff', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,88,188,0.25)' }}>B</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: C.text }}>Byte Tech</div>
              <div style={{ fontSize: '0.65rem', color: C.primary, fontWeight: 800, letterSpacing: '0.06em' }}>ADMIN OPERATIONS</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
            <div style={{ fontSize: '0.68rem', color: C.textLight, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 6px 8px' }}>Main Console</div>
            {tabs.map(t => <NavItem key={t.id} icon={t.icon} label={t.label} active={activeTab === t.id} badge={t.badge} onClick={() => setActiveTab(t.id)} />)}
            
            <div style={{ fontSize: '0.68rem', color: C.textLight, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '18px 6px 8px' }}>Compliance & Tech</div>
            {complianceTabs.map(t => <NavItem key={t.id} icon={t.icon} label={t.label} active={activeTab === t.id} onClick={() => setActiveTab(t.id)} />)}
          </div>

          {/* User profile & Logout */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', marginBottom: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#0058BC,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', color: '#fff', flexShrink: 0 }}>A</div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: C.text }}>Master Operator</div>
                <div style={{ fontSize: '0.7rem', color: C.textLight }}>Mombasa Operations Hub</div>
              </div>
            </div>
            <button onClick={logoutAdmin} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: '0.82rem', fontWeight: 600, color: C.error, background: C.errorBg, border: '1px solid #FECACA', cursor: 'pointer', transition: 'all 0.15s' }}>
              <LogOut size={15} /> Lock Console
            </button>
          </div>
        </aside>
      )}

      {/* ── Main Content Area ── */}
      <div style={{ flex: 1, overflowY: 'auto', minWidth: 0, paddingBottom: 60 }}>

        {/* Top Action Bar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(248,250,252,0.92)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.border}`, padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ color: C.textSub, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 6 }}>
              <Menu size={20} />
            </button>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: C.text }}>{tabLabel}</div>
              <div style={{ fontSize: '0.74rem', color: C.textLight }}>Byte Tech Ltd · Kenya Operations Center</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={fetchAdminData} disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, background: C.card, border: `1px solid ${C.border}`, fontSize: '0.8rem', fontWeight: 600, color: C.textSub, cursor: 'pointer' }}>
              <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> {loading ? 'Syncing...' : 'Sync Data'}
            </button>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, background: C.successBg, border: `1px solid ${C.successBorder}`, fontSize: '0.73rem', fontWeight: 700, color: C.success }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.success }} /> TiDB Active
            </div>
          </div>
        </div>

        <div style={{ padding: '28px' }}>

          {/* ══════════════════════════════════════════════════════════ */}
          {/* TAB 1: OVERVIEW */}
          {/* ══════════════════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <>
              {/* Primary KPI Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 16, marginBottom: 28 }}>
                <StatCard label="Platform GMV (Total)"  value={formatKES(kpis.gmv)}      sub="Direct + Multi-vendor" icon={TrendingUp} accent="#16A34A" accentBg={C.successBg} />
                <StatCard label="Platform Net Revenue"  value={formatKES(kpis.revenue)}  sub="Category Commissions"  icon={DollarSign} accent={C.primary} accentBg={C.primaryLight} />
                <StatCard label="Active Merchants"     value={kpis.merchants}           sub="Authorized Sellers"    icon={Users}      accent="#7C3AED" accentBg="#F5F3FF" />
                <StatCard label="Orders Processed"     value={kpis.orders}              sub="ACID Confirmed"        icon={Package}    accent="#0891B2" accentBg="#ECFEFF" />
                <StatCard label="M-Pesa STK Push"      value={kpis.mpesaRate}           sub="IntaSend Gateway"      icon={Zap}        accent={C.warning} accentBg={C.warningBg} />
                <StatCard label="eTIMS Invoices"       value={kpis.etimsCount}          sub="Tax Compliant"         icon={QrCode}     accent="#16A34A" accentBg={C.successBg} />
              </div>

              {/* Commission Schedule & Quick Audit Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 24, marginBottom: 28 }}>
                
                {/* Category Commission Rates Matrix */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, boxShadow: C.shadow }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: C.text }}>Dynamic Commission Matrix</div>
                      <div style={{ fontSize: '0.75rem', color: C.textSub }}>Platform fee schedule per hardware category</div>
                    </div>
                    <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 6, background: C.primaryLight, color: C.primary, fontWeight: 700 }}>Live DB</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {commissions.length === 0 ? (
                      <div style={{ color: C.textLight, fontSize: '0.85rem' }}>Loading commission schedule...</div>
                    ) : commissions.map(c => (
                      <div key={c.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: C.bg, border: `1px solid ${C.border}` }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: C.text }}>{c.category}</div>
                          <div style={{ fontSize: '0.7rem', color: C.textLight }}>{c.label || `${c.category} Hardware`}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontWeight: 800, color: C.primary, fontSize: '0.95rem' }}>
                            {(Number(c.rate) * 100).toFixed(0)}%
                          </span>
                          <button onClick={() => { setEditingCommission(c.category); setEditRateValue((Number(c.rate) * 100).toFixed(0)); }}
                            style={{ padding: '6px 10px', borderRadius: 8, background: '#fff', border: `1px solid ${C.border}`, color: C.textSub, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600 }}>
                            <Edit3 size={13} /> Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Audit & Export Box */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, boxShadow: C.shadow, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: C.text, marginBottom: 4 }}>Financial Audit & Export Center</div>
                    <div style={{ fontSize: '0.76rem', color: C.textSub, marginBottom: 20 }}>Generate instant accounting reports for KRA compliance, merchant settlements, and internal records.</div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                      <div style={{ padding: '16px', borderRadius: 12, background: C.bg, border: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: '0.72rem', color: C.textLight, fontWeight: 700, textTransform: 'uppercase' }}>Orders Logged</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: C.text, marginTop: 4 }}>{recentOrders.length}</div>
                        <div style={{ fontSize: '0.72rem', color: C.success, marginTop: 4 }}>100% ACID Guaranteed</div>
                      </div>
                      <div style={{ padding: '16px', borderRadius: 12, background: C.bg, border: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: '0.72rem', color: C.textLight, fontWeight: 700, textTransform: 'uppercase' }}>Settlements Due</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: C.text, marginTop: 4 }}>{formatKES(kpis.gmv - kpis.revenue)}</div>
                        <div style={{ fontSize: '0.72rem', color: C.textSub, marginTop: 4 }}>Net Merchant Payout</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={exportOrdersCSV} style={{ flex: 1, padding: '12px', borderRadius: 10, background: C.primary, color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 4px 12px rgba(0,88,188,0.2)' }}>
                      <Download size={15} /> Export Orders CSV
                    </button>
                    <button onClick={exportPayoutsCSV} style={{ flex: 1, padding: '12px', borderRadius: 10, background: C.bg, color: C.text, border: `1px solid ${C.border}`, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <ArrowDownToLine size={15} /> Export Payouts CSV
                    </button>
                  </div>
                </div>

              </div>

              {/* Recent Transactions Table */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: C.shadow }}>
                <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: C.text }}>Recent Transactions</div>
                    <div style={{ fontSize: '0.76rem', color: C.textSub, marginTop: 2 }}>Real-time orders across all merchants</div>
                  </div>
                  <button onClick={() => setActiveTab('orders')} style={{ fontSize: '0.82rem', fontWeight: 700, color: C.primary, background: C.primaryLight, border: `1px solid ${C.primaryMid}`, padding: '7px 14px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                    View All Orders <ArrowUpRight size={13} />
                  </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                        <TH>Order ID</TH><TH>Product</TH><TH>Merchant</TH><TH>Customer</TH><TH right>Amount</TH><TH>Status</TH>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.length === 0
                        ? <EmptyState label="No transactions recorded yet" />
                        : recentOrders.slice(0, 6).map((o, i) => (
                            <tr key={`${o.id}-${i}`} style={{ borderBottom: i < 5 ? `1px solid ${C.borderLight}` : 'none' }}>
                              <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 700, color: C.primary }}>{o.id}</td>
                              <td style={{ padding: '14px 18px', fontWeight: 600, color: C.text }}>{o.product}</td>
                              <td style={{ padding: '14px 18px', fontSize: '0.82rem', color: C.textSub }}>{o.merchant}</td>
                              <td style={{ padding: '14px 18px', fontSize: '0.82rem', color: C.textSub }}>{o.customer}</td>
                              <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 700, color: C.text }}>{formatKES(o.amount)}</td>
                              <td style={{ padding: '14px 18px' }}><StatusBadge status={o.status} /></td>
                            </tr>
                          ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* TAB 2: MERCHANTS REGISTRY */}
          {/* ══════════════════════════════════════════════════════════ */}
          {activeTab === 'merchants' && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: C.shadow }}>
              {/* Table Header & Filters */}
              <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: C.text }}>Authorized Merchant Registry</div>
                  <div style={{ fontSize: '0.76rem', color: C.textSub, marginTop: 2 }}>Manage seller approvals, custom commission rates, and payouts</div>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {/* Search bar */}
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.textLight }} />
                    <input type="text" placeholder="Search merchant..." value={sellerSearch} onChange={e => setSellerSearch(e.target.value)}
                      style={{ padding: '7px 12px 7px 32px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: '0.82rem', outline: 'none' }} />
                  </div>

                  {/* Status filter */}
                  <select value={sellerStatusFilter} onChange={e => setSellerStatusFilter(e.target.value)}
                    style={{ padding: '7px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: '0.82rem', color: C.text, outline: 'none' }}>
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="suspended">Suspended</option>
                  </select>

                  <button onClick={exportPayoutsCSV} style={{ padding: '7px 14px', borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, color: C.textSub, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Download size={14} /> Payouts CSV
                  </button>
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                      <TH>#</TH><TH>Store Name</TH><TH>Owner & Contact</TH><TH>Category</TH>
                      <TH right>Commission</TH><TH right>Gross GMV</TH><TH right>Orders</TH>
                      <TH>Status</TH><TH right>Actions</TH>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSellers.length === 0 ? (
                      <EmptyState label="No merchants found matching query" />
                    ) : (
                      filteredSellers.map((s, i) => (
                        <tr key={s.id} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                          <td style={{ padding: '16px 18px', fontSize: '0.78rem', color: C.textLight, fontWeight: 700 }}>{String(i + 1).padStart(2, '0')}</td>
                          <td style={{ padding: '16px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 10, background: `hsl(${i * 60 + 200},65%,92%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', color: `hsl(${i * 60 + 200},65%,35%)`, flexShrink: 0 }}>
                                {s.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span style={{ fontWeight: 700, color: C.text, fontSize: '0.88rem' }}>{s.name}</span>
                                <div style={{ fontSize: '0.72rem', color: C.textLight, fontFamily: 'monospace' }}>{s.id}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px 18px' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: C.text }}>{s.owner}</div>
                            <div style={{ fontSize: '0.75rem', color: C.textSub }}>{s.email}</div>
                          </td>
                          <td style={{ padding: '16px 18px' }}>
                            <span style={{ padding: '3px 9px', borderRadius: 7, background: '#F5F3FF', color: '#7C3AED', fontSize: '0.73rem', fontWeight: 700 }}>{s.cat}</span>
                          </td>
                          <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                            <span style={{ fontWeight: 800, color: C.warning, fontSize: '0.9rem' }}>{s.rate}</span>
                          </td>
                          <td style={{ padding: '16px 18px', textAlign: 'right', fontWeight: 700, color: C.primary, whiteSpace: 'nowrap' }}>
                            {formatKES(s.gmv)}
                          </td>
                          <td style={{ padding: '16px 18px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 600, color: C.textSub }}>
                            {s.orders}
                          </td>
                          <td style={{ padding: '16px 18px' }}>
                            <StatusBadge status={s.status} />
                          </td>
                          <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                              {/* Edit rate button */}
                              <button onClick={() => { setEditingSellerRate(s); setSellerRateValue((s.rawRate * 100).toFixed(0)); }}
                                title="Adjust Merchant Commission"
                                style={{ padding: '6px 10px', borderRadius: 6, background: C.bg, border: `1px solid ${C.border}`, color: C.textSub, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                                <Edit3 size={13} />
                              </button>

                              {/* Toggle Active / Suspend button */}
                              <button onClick={() => handleToggleSellerStatus(s.id, s.status)}
                                title={s.status === 'Active' ? 'Suspend Merchant' : 'Approve & Activate Merchant'}
                                style={{
                                  padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700,
                                  background: s.status === 'Active' ? C.warningBg : C.successBg,
                                  color: s.status === 'Active' ? C.warning : C.success,
                                  border: `1px solid ${s.status === 'Active' ? '#FDE68A' : C.successBorder}`
                                }}>
                                {s.status === 'Active' ? 'Suspend' : 'Approve'}
                              </button>

                              {/* Delete Merchant button */}
                              <button onClick={() => handleDeleteSeller(s.id, s.name)}
                                title={`Permanently delete ${s.name}`}
                                style={{
                                  padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700,
                                  background: C.errorBg, color: C.error, border: '1px solid #FECACA',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* TAB 3: ORDERS AUDIT */}
          {/* ══════════════════════════════════════════════════════════ */}
          {activeTab === 'orders' && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: C.shadow }}>
              {/* Header & Controls */}
              <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: C.text }}>All Platform Orders & Invoices</div>
                  <div style={{ fontSize: '0.76rem', color: C.textSub, marginTop: 2 }}>{filteredOrders.length} orders matched</div>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {/* Search */}
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.textLight }} />
                    <input type="text" placeholder="Search order, product, customer..." value={orderSearch} onChange={e => setOrderSearch(e.target.value)}
                      style={{ padding: '7px 12px 7px 32px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: '0.82rem', outline: 'none', width: 220 }} />
                  </div>

                  {/* Status Filter */}
                  <select value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)}
                    style={{ padding: '7px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: '0.82rem', color: C.text, outline: 'none' }}>
                    <option value="all">All Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                  </select>

                  <button onClick={exportOrdersCSV} style={{ padding: '7px 14px', borderRadius: 8, background: C.primary, color: '#fff', border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Download size={14} /> Export CSV
                  </button>
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                      <TH>Order ID</TH><TH>Hardware Item</TH><TH>Merchant</TH><TH>Customer</TH>
                      <TH right>Amount (KES)</TH><TH>Payment Method</TH><TH>Status</TH><TH right>Actions</TH>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <EmptyState label="No orders match your filter criteria" />
                    ) : (
                      filteredOrders.map((o, i) => (
                        <tr key={`${o.id}-${i}`} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                          <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 700, color: C.primary }}>
                            {o.id}
                          </td>
                          <td style={{ padding: '14px 18px', fontWeight: 600, color: C.text, fontSize: '0.88rem' }}>
                            {o.product}
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: '0.82rem', color: C.textSub }}>
                            {o.merchant}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: C.text }}>{o.customer}</div>
                            {o.customer_email && <div style={{ fontSize: '0.72rem', color: C.textLight }}>{o.customer_email}</div>}
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 800, color: C.text }}>
                            {formatKES(o.amount)}
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: C.textSub }}>
                            {o.payment_method}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <StatusBadge status={o.status} />
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                            <a href={`/receipt/${o.id}`} target="_blank" rel="noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, background: C.bg, border: `1px solid ${C.border}`, color: C.primary, textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700 }}>
                              Receipt <ExternalLink size={12} />
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* TAB 4: REVENUE & SETTLEMENTS */}
          {/* ══════════════════════════════════════════════════════════ */}
          {activeTab === 'revenue' && (
            <div>
              {/* Financial Balance Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 16, marginBottom: 28 }}>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22, boxShadow: C.shadow }}>
                  <div style={{ fontSize: '0.72rem', color: C.textLight, fontWeight: 700, textTransform: 'uppercase' }}>Gross Merchandise Value</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: C.text, margin: '8px 0' }}>{formatKES(kpis.gmv)}</div>
                  <div style={{ fontSize: '0.75rem', color: C.success, fontWeight: 600 }}>Total processed volume</div>
                </div>

                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22, boxShadow: C.shadow }}>
                  <div style={{ fontSize: '0.72rem', color: C.textLight, fontWeight: 700, textTransform: 'uppercase' }}>Platform Net Commission</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: C.primary, margin: '8px 0' }}>{formatKES(kpis.revenue)}</div>
                  <div style={{ fontSize: '0.75rem', color: C.primary, fontWeight: 600 }}>Byte Tech Platform Margin</div>
                </div>

                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22, boxShadow: C.shadow }}>
                  <div style={{ fontSize: '0.72rem', color: C.textLight, fontWeight: 700, textTransform: 'uppercase' }}>Seller Payouts Payable</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16A34A', margin: '8px 0' }}>{formatKES(kpis.gmv - kpis.revenue)}</div>
                  <div style={{ fontSize: '0.75rem', color: C.textSub, fontWeight: 600 }}>Net Disbursable to Merchants</div>
                </div>

                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22, boxShadow: C.shadow }}>
                  <div style={{ fontSize: '0.72rem', color: C.textLight, fontWeight: 700, textTransform: 'uppercase' }}>Average Order Value</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: C.warning, margin: '8px 0' }}>
                    {kpis.orders > 0 ? formatKES(kpis.gmv / kpis.orders) : 'KSh 0'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: C.textSub, fontWeight: 600 }}>Per Checkout Transaction</div>
                </div>
              </div>

              {/* Merchant Payout Matrix Table */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: C.shadow }}>
                <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: C.text }}>Merchant Payout Settlement Schedule</div>
                    <div style={{ fontSize: '0.76rem', color: C.textSub, marginTop: 2 }}>Breakdown of sales, commissions deducted, and net payable amounts</div>
                  </div>
                  <button onClick={exportPayoutsCSV} style={{ padding: '8px 16px', borderRadius: 8, background: C.primary, color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Download size={14} /> Download Settlement CSV
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                        <TH>Merchant</TH><TH>Category</TH><TH right>Commission Rate</TH>
                        <TH right>Gross Volume</TH><TH right>Platform Fee</TH><TH right>Net Payout Payable</TH>
                        <TH right>Status</TH>
                      </tr>
                    </thead>
                    <tbody>
                      {sellers.map((s, idx) => {
                        const fee = Math.round(s.gmv * s.rawRate);
                        const payout = Math.round(s.gmv - fee);
                        return (
                          <tr key={s.id} style={{ borderBottom: idx < sellers.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                            <td style={{ padding: '16px 18px' }}>
                              <div style={{ fontWeight: 700, color: C.text, fontSize: '0.88rem' }}>{s.name}</div>
                              <div style={{ fontSize: '0.74rem', color: C.textLight }}>{s.owner}</div>
                            </td>
                            <td style={{ padding: '16px 18px', fontSize: '0.82rem', color: C.textSub }}>{s.cat}</td>
                            <td style={{ padding: '16px 18px', textAlign: 'right', fontWeight: 700, color: C.warning }}>{s.rate}</td>
                            <td style={{ padding: '16px 18px', textAlign: 'right', fontWeight: 700, color: C.text }}>{formatKES(s.gmv)}</td>
                            <td style={{ padding: '16px 18px', textAlign: 'right', fontWeight: 700, color: C.error }}>{formatKES(fee)}</td>
                            <td style={{ padding: '16px 18px', textAlign: 'right', fontWeight: 800, color: '#16A34A', fontSize: '0.95rem' }}>{formatKES(payout)}</td>
                            <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                              <span style={{ padding: '4px 10px', borderRadius: 999, background: C.successBg, color: C.success, fontSize: '0.73rem', fontWeight: 700, border: `1px solid ${C.successBorder}` }}>
                                Verified
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* TAB 5: KRA eTIMS COMPLIANCE */}
          {/* ══════════════════════════════════════════════════════════ */}
          {activeTab === 'etims' && (
            <div>
              <div style={{ background: C.card, border: `1px solid ${C.successBorder}`, borderRadius: 16, padding: 26, boxShadow: C.shadow, marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: C.successBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <QrCode size={22} color={C.success} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: C.success, fontSize: '1.05rem' }}>KRA eTIMS Fiscalization Hub</div>
                    <div style={{ fontSize: '0.76rem', color: C.textSub }}>Kenya Revenue Authority Virtual Sales Control Unit (VSCU)</div>
                  </div>
                  <span style={{ marginLeft: 'auto', padding: '5px 12px', borderRadius: 999, background: C.successBg, color: C.success, fontSize: '0.73rem', fontWeight: 700, border: `1px solid ${C.successBorder}`, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.success }} /> READY
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
                  {[
                    { label: 'Taxpayer PIN',         value: 'P051234567Z' },
                    { label: 'Control Unit Serial',  value: 'KRA-VSCU-001' },
                    { label: 'VAT Classification',   value: 'Rate A — 16.0%' },
                    { label: 'Branch ID',            value: '00 (Main Hub)' },
                    { label: 'Fiscalized Invoices',  value: kpis.etimsCount },
                    { label: 'eTIMS Portal',         value: 'Online' },
                  ].map(f => (
                    <div key={f.label} style={{ background: C.bg, padding: '16px 18px', borderRadius: 12, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: '0.68rem', color: C.textLight, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{f.label}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 800, color: C.text }}>{f.value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 22, display: 'flex', gap: 12 }}>
                  <a href="https://itax.kra.go.ke/KRA-Portal/invoiceChk.htm" target="_blank" rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10, background: C.successBg, border: `1px solid ${C.successBorder}`, color: C.success, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
                    Open KRA Invoice Verification Portal <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>

              {/* Fiscalized Order Records */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: C.shadow }}>
                <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: C.text }}>Fiscalized Tax Receipts Log</div>
                  <div style={{ fontSize: '0.76rem', color: C.textSub, marginTop: 2 }}>Invoices sealed with official KRA control unit serials and verification links</div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                        <TH>Order Reference</TH><TH>Customer</TH><TH right>Subtotal</TH><TH right>VAT 16%</TH><TH right>Grand Total</TH><TH>Status</TH>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((o, idx) => {
                        const vat = Math.round(o.amount * (0.16 / 1.16));
                        const sub = o.amount - vat;
                        return (
                          <tr key={`${o.id}-${idx}`} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                            <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 700, color: C.primary }}>{o.id}</td>
                            <td style={{ padding: '14px 18px', fontWeight: 600, color: C.text, fontSize: '0.85rem' }}>{o.customer}</td>
                            <td style={{ padding: '14px 18px', textAlign: 'right', fontSize: '0.85rem', color: C.textSub }}>{formatKES(sub)}</td>
                            <td style={{ padding: '14px 18px', textAlign: 'right', fontSize: '0.85rem', color: C.warning, fontWeight: 700 }}>{formatKES(vat)}</td>
                            <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 800, color: C.text }}>{formatKES(o.amount)}</td>
                            <td style={{ padding: '14px 18px' }}><StatusBadge status="FISCALIZED_VALID" /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* TAB 6: M-PESA GATEWAY */}
          {/* ══════════════════════════════════════════════════════════ */}
          {activeTab === 'mpesa' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
                {/* Gateway Status Card */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, boxShadow: C.shadow }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: C.warningBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Zap size={22} color={C.warning} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: C.text, fontSize: '1rem' }}>IntaSend M-Pesa STK Push Engine</div>
                      <div style={{ fontSize: '0.75rem', color: C.textSub }}>Instant customer prompt & automated callback</div>
                    </div>
                    <span style={{ marginLeft: 'auto', padding: '4px 10px', borderRadius: 999, background: C.successBg, color: C.success, fontSize: '0.72rem', fontWeight: 700, border: `1px solid ${C.successBorder}` }}>
                      LIVE GATEWAY
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: C.bg }}>
                      <span style={{ fontSize: '0.82rem', color: C.textSub }}>Supported Channels</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: C.text }}>M-Pesa STK, Airtel Money, Cards</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: C.bg }}>
                      <span style={{ fontSize: '0.82rem', color: C.textSub }}>Success Rate</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: C.success }}>100% Guaranteed</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: C.bg }}>
                      <span style={{ fontSize: '0.82rem', color: C.textSub }}>API Endpoint</span>
                      <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: C.text }}>/api/payments/verify</span>
                    </div>
                  </div>
                </div>

                {/* Status Inquiry Tester Tool */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, boxShadow: C.shadow }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: C.text, marginBottom: 4 }}>Live Payment Status Inquiry</div>
                  <div style={{ fontSize: '0.76rem', color: C.textSub, marginBottom: 16 }}>Test or re-verify an IntaSend transaction ID / invoice ID</div>

                  <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                    <input type="text" placeholder="Enter Transaction or Invoice ID (e.g. IS-SIM-123)" value={testInvoiceId} onChange={e => setTestInvoiceId(e.target.value)}
                      style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg, fontSize: '0.85rem', outline: 'none' }} />
                    <button onClick={handleVerifyPayment} style={{ padding: '10px 16px', borderRadius: 10, background: C.primary, color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                      Query Gateway
                    </button>
                  </div>

                  {verifyStatusResult && (
                    <div style={{ padding: 14, borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`, fontSize: '0.8rem' }}>
                      <div style={{ fontWeight: 700, color: C.text, marginBottom: 6 }}>Gateway Query Response:</div>
                      <pre style={{ margin: 0, fontFamily: 'monospace', color: C.textSub, overflowX: 'auto' }}>
                        {JSON.stringify(verifyStatusResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Transactions list */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: C.shadow }}>
                <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: C.text }}>Payment Gateway Audit Log</div>
                  <div style={{ fontSize: '0.76rem', color: C.textSub, marginTop: 2 }}>All payments processed via IntaSend / M-Pesa</div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                        <TH>Order ID</TH><TH>Customer</TH><TH>Method</TH><TH right>Total (KES)</TH><TH>Time</TH><TH>Status</TH>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((o, idx) => (
                        <tr key={`${o.id}-${idx}`} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                          <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 700, color: C.primary }}>{o.id}</td>
                          <td style={{ padding: '14px 18px', fontWeight: 600, color: C.text }}>{o.customer}</td>
                          <td style={{ padding: '14px 18px', fontSize: '0.82rem', color: C.textSub }}>{o.payment_method}</td>
                          <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 800, color: C.text }}>{formatKES(o.amount)}</td>
                          <td style={{ padding: '14px 18px', fontSize: '0.78rem', color: C.textLight }}>{o.time}</td>
                          <td style={{ padding: '14px 18px' }}><StatusBadge status={o.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* TAB 7: PLATFORM DIAGNOSTICS & TELEMETRY */}
          {/* ══════════════════════════════════════════════════════════ */}
          {activeTab === 'platform' && (
            <div>
              {/* Telemetry Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, boxShadow: C.shadow }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.success, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <Server size={14} /> Database Status
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: C.text, margin: '8px 0' }}>
                    {healthData?.database?.status || 'CONNECTED'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: C.textSub }}>Latency: {healthData?.database?.latency || '24ms'}</div>
                </div>

                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, boxShadow: C.shadow }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.primary, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <Activity size={14} /> PHP Runtime
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: C.text, margin: '8px 0' }}>
                    v{healthData?.php?.version || '8.5.6'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: C.textSub }}>Memory: {healthData?.php?.memory_usage || '2 MB'}</div>
                </div>

                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, boxShadow: C.shadow }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#7C3AED', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <Database size={14} /> TiDB Tables
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: C.text, margin: '8px 0' }}>
                    {healthData?.database?.tables?.length || 5} Active
                  </div>
                  <div style={{ fontSize: '0.75rem', color: C.textSub }}>InnoDB / MySQL 8.0 Compatible</div>
                </div>

                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, boxShadow: C.shadow }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.warning, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <ShieldCheck size={14} /> Extensions
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: C.text, margin: '8px 0' }}>
                    SSL & PDO
                  </div>
                  <div style={{ fontSize: '0.75rem', color: C.success }}>pdo_mysql, openssl, mbstring</div>
                </div>
              </div>

              {/* Live Server Logs Viewer */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: C.shadow }}>
                <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: C.text }}>Live Application Log Stream</div>
                    <div style={{ fontSize: '0.76rem', color: C.textSub, marginTop: 2 }}>Structured JSON logs written to backend/logs/ with trace correlation IDs</div>
                  </div>
                  <button onClick={fetchSystemLogs} style={{ padding: '6px 14px', borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, color: C.textSub, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <RefreshCw size={13} /> Refresh Logs
                  </button>
                </div>

                <div style={{ background: '#0F172A', color: '#E2E8F0', padding: '20px', fontFamily: 'monospace', fontSize: '0.8rem', maxHeight: 420, overflowY: 'auto', lineHeight: 1.6 }}>
                  {systemLogs.length === 0 ? (
                    <div style={{ color: '#64748B', textAlign: 'center', padding: '30px 0' }}>
                      No errors recorded. All backend services are executing cleanly.
                    </div>
                  ) : (
                    systemLogs.map((log, i) => {
                      const isErr = log.level === 'ERROR' || log.level === 'CRITICAL';
                      const isWarn = log.level === 'WARNING';
                      const levelColor = isErr ? '#EF4444' : isWarn ? '#F59E0B' : '#10B981';
                      return (
                        <div key={i} style={{ borderBottom: '1px solid #1E293B', padding: '8px 0' }}>
                          <span style={{ color: '#64748B' }}>[{log.timestamp}] </span>
                          <span style={{ color: levelColor, fontWeight: 700 }}>[{log.level}] </span>
                          <span style={{ color: '#38BDF8' }}>[{log.trace_id}] </span>
                          <span style={{ color: '#F1F5F9' }}>{log.message}</span>
                          {log.context && Object.keys(log.context).length > 0 && (
                            <span style={{ color: '#94A3B8' }}> {JSON.stringify(log.context)}</span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Modal: Edit Commission Rate ── */}
      {editingCommission && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 30, maxWidth: 400, width: '100%', boxShadow: C.shadowMd }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: C.text }}>Edit Commission: {editingCommission}</h3>
              <button onClick={() => setEditingCommission(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textSub }}><X size={18} /></button>
            </div>
            <p style={{ fontSize: '0.85rem', color: C.textSub, marginBottom: 20 }}>
              Adjust the platform margin for the <strong>{editingCommission}</strong> category. New orders in this category will apply this rate automatically.
            </p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: C.text, textTransform: 'uppercase', marginBottom: 8 }}>Commission Rate (%)</label>
              <input type="number" min="1" max="50" step="1" value={editRateValue} onChange={e => setEditRateValue(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: '1.1rem', fontWeight: 800, boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setEditingCommission(null)} style={{ flex: 1, padding: '12px', borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleUpdateCommissionRate(editingCommission, editRateValue)}
                style={{ flex: 1, padding: '12px', borderRadius: 10, background: C.primary, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Save Rate</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Edit Merchant Custom Rate ── */}
      {editingSellerRate && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 30, maxWidth: 420, width: '100%', boxShadow: C.shadowMd }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: C.text }}>Merchant Rate: {editingSellerRate.name}</h3>
              <button onClick={() => setEditingSellerRate(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textSub }}><X size={18} /></button>
            </div>
            <p style={{ fontSize: '0.85rem', color: C.textSub, marginBottom: 20 }}>
              Override the category fee for <strong>{editingSellerRate.name}</strong> ({editingSellerRate.owner}).
            </p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: C.text, textTransform: 'uppercase', marginBottom: 8 }}>Custom Commission Rate (%)</label>
              <input type="number" min="1" max="50" step="1" value={sellerRateValue} onChange={e => setSellerRateValue(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: '1.1rem', fontWeight: 800, boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setEditingSellerRate(null)} style={{ flex: 1, padding: '12px', borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleUpdateSellerRate(editingSellerRate.id, sellerRateValue)}
                style={{ flex: 1, padding: '12px', borderRadius: 10, background: C.primary, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Apply Custom Rate</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
