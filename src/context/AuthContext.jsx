import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [seller, setSeller] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('tn_seller_profile') || 'null');
        } catch {
            return null;
        }
    });

    const [sellerToken, setSellerToken] = useState(() => {
        return localStorage.getItem('tn_seller_token') || null;
    });

    const [adminPin, setAdminPin] = useState(() => {
        return sessionStorage.getItem('tn_admin_pin') || null;
    });

    const loginSeller = (profile, token) => {
        const tok = token || (typeof profile === 'string' ? profile : `token-${profile?.id || Date.now()}`);
        const prof = typeof profile === 'object' ? profile : { id: 'seller-demo', store_name: 'Merchant' };
        localStorage.setItem('tn_seller_token', tok);
        localStorage.setItem('tn_seller_profile', JSON.stringify(prof));
        setSeller(prof);
        setSellerToken(tok);
    };

    const logoutSeller = () => {
        localStorage.removeItem('tn_seller_token');
        localStorage.removeItem('tn_seller_profile');
        setSeller(null);
        setSellerToken(null);
    };

    const loginAdmin = (pin) => {
        if (pin === 'TN2026' || pin === 'admin') {
            sessionStorage.setItem('tn_admin_pin', pin);
            setAdminPin(pin);
            return true;
        }
        return false;
    };

    const logoutAdmin = () => {
        sessionStorage.removeItem('tn_admin_pin');
        setAdminPin(null);
    };

    return (
        <AuthContext.Provider value={{
            seller,
            currentSeller: seller,
            sellerToken,
            isSellerLoggedIn: !!seller && !!sellerToken,
            isSellerAuthenticated: !!seller && !!sellerToken,
            loginSeller,
            logoutSeller,
            adminPin,
            isAdminLoggedIn: !!adminPin,
            isAdminAuthenticated: !!adminPin,
            loginAdmin,
            logoutAdmin
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}

export default AuthProvider;
