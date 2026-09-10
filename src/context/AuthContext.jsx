import React, { createContext, useContext, useState } from 'react';
import { apiUrl } from '../lib/api';

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
        if (!token || !profile) return false;
        localStorage.setItem('tn_seller_token', token);
        localStorage.setItem('tn_seller_profile', JSON.stringify(profile));
        setSeller(profile);
        setSellerToken(token);
        return true;
    };

    const logoutSeller = () => {
        localStorage.removeItem('tn_seller_token');
        localStorage.removeItem('tn_seller_profile');
        setSeller(null);
        setSellerToken(null);
    };

    const loginAdmin = async (pin) => {
        if (!pin || typeof pin !== 'string') {
            return { success: false, error: 'Please enter a PIN.' };
        }
        const cleanPin = pin.trim();
        try {
            const res = await fetch(apiUrl('/admin/summary'), {
                headers: { 'x-admin-pin': cleanPin }
            });
            if (res.ok) {
                sessionStorage.setItem('tn_admin_pin', cleanPin);
                setAdminPin(cleanPin);
                return { success: true };
            }
            if (res.status === 403 || res.status === 401) {
                return { success: false, error: 'Invalid PIN — Access Denied.' };
            }
            return { success: false, error: `Authentication server returned status ${res.status}.` };
        } catch (err) {
            console.error('Admin authentication inquiry error:', err);
            return { success: false, error: 'Unable to reach backend server. Please verify PHP/Apache is running.' };
        }
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
