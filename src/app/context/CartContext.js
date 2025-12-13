/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import React, { createContext, useEffect, useState } from "react";
import { saveCart, loadCart, clearCart as clearStoredCart } from "../utils/localStorageHelper";
import { useCartSync } from "../hooks/useCartSync";
import toast from 'react-hot-toast';

export const CartContext = createContext();

const CartProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [cart, setCart] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [itemAmount, setItemAmount] = useState(0);

    // Load cart from localStorage on mount
    useEffect(() => {
        const storedCart = loadCart();
        if (storedCart.length > 0) {
            setCart(storedCart);
        }
    }, []);

    // Persist cart to localStorage whenever it changes
    useEffect(() => {
        if (cart.length >= 0) {
            saveCart(cart);
        }
    }, [cart]);

    // Enable cross-tab sync
    useCartSync(cart, setCart);

    useEffect(() => {
        const amount = cart.reduce((a, c) => {
            return a + c.amount;
        }, 0);
        setItemAmount(amount);
    });

    useEffect(() => {
        const price = cart.reduce((a, c) => {
            return a + Number(c.price) * c.amount;
        }, 0);
        setCartTotal(price);
    }, [cart]);

    const addToCart = (id, image, name, price, additionalTopping, size, crust, amount = 1) => {
        additionalTopping.sort((a, b) => a.name.localeCompare(b.name));

        const newItem = {
            id, image, name, price, additionalTopping, size, crust, amount: amount
        };

        const cartItemIndex = cart.findIndex(
            (item) =>
                item.id === id &&
                item.price === price &&
                item.size === size &&
                JSON.stringify(item.additionalTopping) ===
                JSON.stringify(additionalTopping) &&
                item.crust === crust
        );

        if (cartItemIndex === -1) {
            setCart([...cart, newItem]);
            // Show toast for new item
            toast.success(`🍕 ${name} added to cart!`, {
                duration: 2000,
                position: 'bottom-right',
            });
        } else {
            const newCart = [...cart];
            newCart[cartItemIndex].amount += amount;
            setCart(newCart);
            // Show toast for quantity update
            toast.success(`Updated ${name} quantity`, {
                duration: 2000,
                position: 'bottom-right',
            });
        }

        setIsOpen(true);
    };

    const removeItem = (id, price, crust) => {
        const itemIndex = cart.findIndex(
            (item) => item.id === id && item.price === price && item.crust === crust
        );
        if (itemIndex !== -1) {
            const itemName = cart[itemIndex].name;
            const newCart = [...cart];
            newCart.splice(itemIndex, 1);
            setCart(newCart);

            // Show toast
            toast.error(`🗑️ ${itemName} removed from cart`, {
                duration: 2000,
                position: 'bottom-right',
            });
        }
    };

    const increaseAmount = (id, price) => {
        const itemIndex = cart.findIndex(
            (item) => item.id === id && item.price === price
        );

        if (itemIndex !== -1) {
            const newCart = [...cart];
            newCart[itemIndex].amount += 1;
            setCart(newCart);
        }
    };

    const decreaseAmount = (id, price) => {
        const itemIndex = cart.findIndex(
            (item) => item.id === id && item.price === price
        );

        if (itemIndex !== -1) {
            const newCart = [...cart];
            if (newCart[itemIndex].amount > 1) {
                newCart[itemIndex].amount -= 1;  // BUG FIX: Changed from >= to -=
            }
            setCart(newCart);
        }
    };

    const clearCart = () => {
        setCart([]);
        clearStoredCart();
        toast.success('🛒 Cart cleared', {
            duration: 2000,
            position: 'bottom-right',
        });
    };

    return (
        <CartContext.Provider value={{ isOpen, setIsOpen, addToCart, cart, setCart, removeItem, increaseAmount, decreaseAmount, itemAmount, cartTotal, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartProvider;