import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Search, Menu, X, Zap } from 'lucide-react';

export function Navbar() {
    const { cartCount } = useCart();
    const { isSellerLoggedIn, isAdminLoggedIn } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
            setIsMobileMenuOpen(false);
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <header className="site-navbar">
            <div className="navbar-inner">
                {/* Brand Logo */}
                <Link to="/" className="navbar-brand">
                    <div className="brand-logo-icon">
                        <Zap size={20} color="#fff" fill="#fff" />
                    </div>
                    <div className="brand-text-col">
                        <div className="brand-row">
                            <span className="brand-title">Byte Tech</span>
                            <span className="brand-pill">Direct</span>
                        </div>
                        <span className="brand-sub">Authorized Hardware</span>
                    </div>
                </Link>

                {/* Desktop Search Bar */}
                <form onSubmit={handleSearchSubmit} className="nav-search-form">
                    <Search size={17} className="nav-search-icon" />
                    <input
                        type="text"
                        placeholder="Search MacBook, ThinkPad, Sony, RTX, 4K..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="nav-search-input"
                    />
                </form>

                {/* Desktop Navigation Links */}
                <nav className="nav-links-desktop">
                    <Link to="/" className={`nav-link-item ${isActive('/') ? 'active' : ''}`}>
                        Home
                    </Link>
                    <Link to="/catalog" className={`nav-link-item ${isActive('/catalog') ? 'active' : ''}`}>
                        Catalog
                    </Link>
                    <Link to="/catalog?tag=FLAGSHIP" className={`nav-link-item ${location.search.includes('FLAGSHIP') ? 'active' : ''}`}>
                        Featured Deals
                    </Link>
                    <Link to="/receipt" className={`nav-link-item ${isActive('/receipt') ? 'active' : ''}`}>
                        Track Order
                    </Link>
                </nav>

                {/* Action Buttons */}
                <div className="nav-action-btns">
                    {/* Cart Trigger */}
                    <Link to="/cart" className="nav-cart-btn" aria-label="Shopping Cart">
                        <ShoppingCart size={20} />
                        {cartCount > 0 && (
                            <span className="nav-cart-badge">
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                    </Link>

                    {/* Mobile Menu Toggle Button */}
                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="nav-mobile-toggle-btn"
                        aria-label="Toggle Navigation Menu"
                    >
                        {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {isMobileMenuOpen && (
                <div className="navbar-mobile-dropdown">
                    <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '100%', marginBottom: '16px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                        <input
                            type="text"
                            placeholder="Search hardware..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 42px',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--surface-border)',
                                background: 'var(--surface-frost)',
                                fontSize: '0.9rem'
                            }}
                        />
                    </form>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="mobile-dropdown-link">
                            🏠 Home
                        </Link>
                        <Link to="/catalog" onClick={() => setIsMobileMenuOpen(false)} className="mobile-dropdown-link">
                            ⚡ Catalog
                        </Link>
                        <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} className="mobile-dropdown-link">
                            🛒 Cart {cartCount > 0 ? `(${cartCount})` : ''}
                        </Link>
                        <Link to="/receipt" onClick={() => setIsMobileMenuOpen(false)} className="mobile-dropdown-link">
                            📄 Track Order
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}

export default Navbar;
