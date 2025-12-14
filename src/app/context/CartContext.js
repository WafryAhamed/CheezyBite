/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import { saveCart, loadCart, clearCart as clearStoredCart } from "../utils/localStorageHelper";
import { useCartSync } from "../hooks/useCartSync";
import { useUser } from "./UserContext";
import toast from 'react-hot-toast';

export const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

const CartProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useUser();
    const [cart, setCart] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [itemAmount, setItemAmount] = useState(0);
    const [lastRemovedItem, setLastRemovedItem] = useState(null);
    const [editingItem, setEditingItem] = useState(null);

    // Get user from context to handle sync
    // Note: circular dependency might be an issue if we import direct. 
    // Best way: pass user as prop or rely on a check.
    // Actually, we can use useUser() hook if we import it.

    const useBackend = process.env.NEXT_PUBLIC_USE_API_BACKEND === 'true';

    // Load cart from localStorage on mount
    useEffect(() => {
        const storedCart = loadCart();
        if (storedCart.length > 0) {
            // Migration: Ensure all items have cartLineId
            const migratedCart = storedCart.map(item => {
                if (!item.cartLineId) {
                    const hash = generateOptionsHash(item.id, item.size, item.crust, item.additionalTopping);
                    return { ...item, cartLineId: `${hash}-${Date.now()}`, optionsHash: hash };
                }
                return item;
            });
            setCart(migratedCart);
        }
    }, []);

    // HYBRID CART STRATEGY: Sync with Backend
    useEffect(() => {
        const syncCart = async () => {
            if (useBackend && user) {
                try {
                    const { cartService } = await import('@/services/cartService');

                    // On User Login (user became available), merge local cart to DB
                    // The API `/api/cart` (POST) handles merge if we send current items
                    // We need to distinguish between "Initial Load/Merge" and "Update"
                    // Simple strategy: Always push current state to server? 
                    // No, that overwrites server state if we start with empty local cart.

                    // improved strategy:
                    // 1. If we have local items, push them to merge.
                    // 2. Fetch latest cart from server to sync state.

                    if (cart.length > 0) {
                        // Merge local items to server
                        await cartService.syncCart(cart, true);
                    }

                    // Fetch unified cart from server
                    const response = await cartService.getCart();
                    if (response.success) {
                        setCart(response.data.items);
                        // Clear local storage to avoid confusion? 
                        // Or keep it as cache? Let's keep it to be safe for offline, 
                        // but `saveCart` below handles that.
                    }
                } catch (error) {
                    console.error("Cart sync failed", error);
                }
            }
        };

        // Only run this when user changes (logs in)
        if (user) {
            syncCart();
        }
    }, [user, useBackend]);

    // Persist cart to localStorage whenever it changes
    // AND sync to backend if logged in
    useEffect(() => {
        if (cart.length >= 0) {
            saveCart(cart);

            // Sync to backend if logged in (Debounce this in real app, but ok for now)
            if (useBackend && user && cart.length > 0) {
                // Use a small timeout to avoid blocking or rapid calls
                const timer = setTimeout(async () => {
                    try {
                        const { cartService } = await import('@/services/cartService');
                        // merge=false means overwrite with current state
                        await cartService.syncCart(cart, false);
                    } catch (e) {
                        console.error("Background cart sync failed", e);
                    }
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [cart, user, useBackend]);

    // Enable cross-tab sync (Only for Guest mode mostly, but keeps tabs in sync)
    useCartSync(cart, setCart);

    // Calculate totals
    useEffect(() => {
        const amount = cart.reduce((a, c) => a + c.amount, 0);
        setItemAmount(amount);

        const price = cart.reduce((a, c) => a + Number(c.price) * c.amount, 0);
        setCartTotal(price);
    }, [cart]);

    // Helper: Generate Content Hash for Merging Detection
    const generateOptionsHash = (id, size, crust, additionalTopping) => {
        const sortedToppings = [...additionalTopping].sort((a, b) => a.name.localeCompare(b.name));
        return `${id}-${size}-${crust}-${JSON.stringify(sortedToppings)}`;
    };

    const addToCart = (id, image, name, price, additionalTopping, size, crust, amount = 1) => {
        const optionsHash = generateOptionsHash(id, size, crust, additionalTopping);

        // Check if identical item exists
        const existingItemIndex = cart.findIndex(item => item.optionsHash === optionsHash);

        if (existingItemIndex !== -1) {
            // Update quantity of existing item
            const newCart = [...cart];
            newCart[existingItemIndex].amount += amount;
            setCart(newCart);
            toast.success(`Updated ${name} quantity`, { duration: 2000, position: 'bottom-right' });
        } else {
            // Create new item with unique Line ID
            const newItem = {
                cartLineId: `${optionsHash}-${Date.now()}`,
                optionsHash,
                id, image, name, price, additionalTopping, size, crust, amount
            };
            setCart([...cart, newItem]);
            toast.success(`🍕 ${name} added to cart!`, { duration: 2000, position: 'bottom-right' });
        }
        setIsOpen(true);
    };

    const removeItem = (cartLineId) => {
        const itemIndex = cart.findIndex(item => item.cartLineId === cartLineId);
        if (itemIndex !== -1) {
            const itemToRemove = cart[itemIndex];
            const newCart = [...cart];
            newCart.splice(itemIndex, 1);

            setCart(newCart);
            setLastRemovedItem(itemToRemove);

            // Toast with Undo
            toast((t) => (
                <div className="flex items-center gap-2">
                    <span>🗑️ Removed {itemToRemove.name}</span>
                    <button
                        onClick={() => {
                            restoreItem(itemToRemove);
                            toast.dismiss(t.id);
                        }}
                        className="bg-white/20 px-2 py-1 rounded text-xs font-bold hover:bg-white/30"
                    >
                        Undo
                    </button>
                </div>
            ), { duration: 4000, position: 'bottom-right', icon: null });
        }
    };

    const restoreItem = (item) => {
        setCart(prev => [...prev, item]);
        setLastRemovedItem(null);
        toast.success(`Restored ${item.name}`);
    };

    const increaseAmount = (cartLineId) => {
        const itemIndex = cart.findIndex(item => item.cartLineId === cartLineId);
        if (itemIndex !== -1) {
            const newCart = [...cart];
            newCart[itemIndex].amount += 1;
            setCart(newCart);
        }
    };

    const decreaseAmount = (cartLineId) => {
        const itemIndex = cart.findIndex(item => item.cartLineId === cartLineId);
        if (itemIndex !== -1) {
            const newCart = [...cart];
            if (newCart[itemIndex].amount > 1) {
                newCart[itemIndex].amount -= 1;
                setCart(newCart);
            } else {
                removeItem(cartLineId);
            }
        }
    };

    const editCartItem = (oldCartLineId, newItemData) => {
        // newItemData contains { size, crust, price, additionalTopping, etc. }
        // We effectively remove the old one and 'add' the new one (which might merge)
        const itemIndex = cart.findIndex(item => item.cartLineId === oldCartLineId);
        if (itemIndex === -1) return;

        const oldItem = cart[itemIndex];

        // Remove old item first (locally, to calculate new state)
        const cartWithoutOld = cart.filter(item => item.cartLineId !== oldCartLineId);

        // Prepare new item details
        const { id, image, name } = oldItem; // Keep static details
        const { price, additionalTopping, size, crust, amount } = newItemData;

        // Logic similar to addToCart but operating on cartWithoutOld
        const optionsHash = generateOptionsHash(id, size, crust, additionalTopping);
        const existingItemIndex = cartWithoutOld.findIndex(item => item.optionsHash === optionsHash);

        if (existingItemIndex !== -1) {
            // Merging with existing
            const newCart = [...cartWithoutOld];
            newCart[existingItemIndex].amount += amount;
            setCart(newCart);
        } else {
            // New line
            const newItem = {
                cartLineId: `${optionsHash}-${Date.now()}`,
                optionsHash,
                id, image, name, price, additionalTopping, size, crust, amount
            };
            setCart([...cartWithoutOld, newItem]);
        }

        toast.success('Cart updated!');
    };

    const clearCart = () => {
        setCart([]);
        clearStoredCart();
        toast.success('🛒 Cart cleared', { duration: 2000, position: 'bottom-right' });
    };

    const toggleCart = () => setIsOpen(prev => !prev);
    const closeCart = () => setIsOpen(false);
    const openCart = () => setIsOpen(true);

    return (
        <CartContext.Provider value={{
            isOpen, setIsOpen,
            toggleCart, closeCart, openCart,
            addToCart,
            cart, setCart,
            removeItem,
            increaseAmount, decreaseAmount,
            editCartItem,
            itemAmount, cartTotal,
            clearCart,
            editingItem, setEditingItem
        }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartProvider;