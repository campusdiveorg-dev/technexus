import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const STORAGE_KEY = 'bytetechltd_cart';
const CUSTOMER_KEY = 'tn_saved_customer';

export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('bitetechltd_cart') || localStorage.getItem('tn_cart');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [checkoutCustomer, setCheckoutCustomer] = useState(() => {
        try {
            const saved = localStorage.getItem(CUSTOMER_KEY);
            return saved ? JSON.parse(saved) : {
                name: '',
                phone: '',
                email: '',
                address: ''
            };
        } catch {
            return { name: '', phone: '', email: '', address: '' };
        }
    });

    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        } catch (e) {
            console.warn('Cart localStorage save failed', e);
        }
    }, [cart]);

    useEffect(() => {
        try {
            if (checkoutCustomer.phone || checkoutCustomer.name) {
                localStorage.setItem(CUSTOMER_KEY, JSON.stringify(checkoutCustomer));
            }
        } catch (_) {}
    }, [checkoutCustomer]);

    const addToCart = (product, qty = 1) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => 
                    item.id === product.id 
                        ? { ...item, quantity: item.quantity + qty } 
                        : item
                );
            }
            return [...prev, {
                id: product.id,
                title: product.title || product.name,
                name: product.title || product.name,
                price: parseFloat(product.price) || 0,
                image: product.image || product.image_url,
                category: product.category,
                specs: product.specs,
                seller: product.seller || product.store_name || product.seller_name || 'Byte Tech Partner',
                sellerId: product.sellerId || product.seller_id || null,
                commissionRate: product.commissionRate || product.commission_rate || 0.10,
                quantity: qty
            }];
        });
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const updateQty = (id, newQty) => {
        if (newQty <= 0) {
            removeFromCart(id);
            return;
        }
        setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item));
    };

    const clearCart = () => {
        setCart([]);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (_) {}
    };

    const cartCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
    const cartTotal = cart.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 1)), 0);
    const vatRate = 0.16;
    const cartVAT = parseFloat((cartTotal * vatRate / (1 + vatRate)).toFixed(2));
    const cartSubtotal = parseFloat((cartTotal - cartVAT).toFixed(2));

    const value = {
        cart,
        items: cart,
        addToCart,
        removeFromCart,
        updateQty,
        updateQuantity: updateQty,
        clearCart,
        cartCount,
        cartSubtotal,
        subtotal: cartSubtotal,
        netAmount: cartSubtotal,
        cartVAT,
        vatAmount: cartVAT,
        cartTotal,
        orderTotal: cartTotal,
        deliveryFee: 0,
        checkoutCustomer,
        setCheckoutCustomer,
        isCheckoutOpen,
        openCheckout: () => setIsCheckoutOpen(true),
        closeCheckout: () => setIsCheckoutOpen(false)
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
}

export default CartProvider;
