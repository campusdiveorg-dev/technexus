import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Home, Layers, ShoppingBag, FileText } from 'lucide-react';

export function BottomNav() {
    const { cartCount } = useCart();

    return (
        <nav className="mobile-docked-nav" aria-label="Mobile Bottom App Dock">
            <div className="mobile-dock-inner">
                {/* 1. Home */}
                <NavLink 
                    to="/" 
                    end
                    className={({ isActive }) => `dock-tab-btn ${isActive ? 'active' : ''}`}
                >
                    <div className="dock-icon-wrap">
                        <Home size={20} />
                    </div>
                    <span>Home</span>
                </NavLink>

                {/* 2. Catalog */}
                <NavLink 
                    to="/catalog" 
                    className={({ isActive }) => `dock-tab-btn ${isActive ? 'active' : ''}`}
                >
                    <div className="dock-icon-wrap">
                        <Layers size={20} />
                    </div>
                    <span>Catalog</span>
                </NavLink>

                {/* 3. Cart */}
                <NavLink 
                    to="/cart" 
                    className={({ isActive }) => `dock-tab-btn ${isActive ? 'active' : ''}`}
                >
                    <div className="dock-icon-wrap" style={{ position: 'relative' }}>
                        <ShoppingBag size={20} />
                        {cartCount > 0 && (
                            <span className="dock-badge">
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                    </div>
                    <span>Cart</span>
                </NavLink>

                {/* 4. Orders & Receipts */}
                <NavLink 
                    to="/receipt" 
                    className={({ isActive }) => `dock-tab-btn ${isActive ? 'active' : ''}`}
                >
                    <div className="dock-icon-wrap">
                        <FileText size={20} />
                    </div>
                    <span>Orders</span>
                </NavLink>
            </div>
        </nav>
    );
}

export default BottomNav;
