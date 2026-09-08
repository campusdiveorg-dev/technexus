import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import ReceiptPage from './pages/ReceiptPage';
import SellerRegisterPage from './pages/SellerRegisterPage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';

// Auto scroll-to-top component on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

export default function App() {
  const { pathname } = useLocation();
  const isDashboard = pathname.startsWith('/admin') || pathname.startsWith('/seller/dashboard');

  useEffect(() => {
    if (isDashboard) {
      document.body.style.paddingTop = '0px';
    } else {
      document.body.style.paddingTop = 'var(--nav-height)';
    }
  }, [isDashboard]);

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ScrollToTop />
      
      {/* Universal Desktop & Mobile Header - Removed on Admin & Seller Dashboards */}
      {!isDashboard && <Navbar />}

      {/* Main Routed Content */}
      <main className="main-content" style={{ flex: '1 0 auto' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/receipt" element={<ReceiptPage />} />
          <Route path="/receipt/:id" element={<ReceiptPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/seller/register" element={<SellerRegisterPage />} />
          <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      {/* Footer - Removed on Admin & Seller Dashboards */}
      {!isDashboard && <Footer />}

      {/* Docked Mobile App Bottom Navigation Bar */}
      {!isDashboard && <BottomNav />}
    </div>
  );
}
