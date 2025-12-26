"use client";

import React, { useContext, useState, useEffect, useRef } from "react";
import { CartContext } from "../context/CartContext";
import { ChevronUp, ChevronDown, ShoppingCart } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import CartItem from "./CartItem"; // Reusing existing Item component
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const SmartCart = () => {
    const {
        cart,
        cartTotal,
        itemAmount,
        isOpen,
        setIsOpen,
        toggleCart,
        closeCart
    } = useContext(CartContext);

    const [isBouncing, setIsBouncing] = useState(false);
    const router = useRouter();
    const pathname = usePathname(); // Need this for route change detection
    const prevAmount = useRef(itemAmount);

    // Touch handling for Swipe Gestures
    const touchStartY = useRef(0);
    const touchEndY = useRef(0);
    const itemsRef = useRef(null);

    // Auto-scroll logic
    useEffect(() => {
        if (cart.length >= 2) {
            itemsRef.current?.scrollTo({ top: 0 });
        }
    }, [cart.length]);

    // Pulse animation on cart update
    useEffect(() => {
        if (itemAmount > prevAmount.current) {
            setIsBouncing(true);
            setTimeout(() => setIsBouncing(false), 300);
        }
        prevAmount.current = itemAmount;
    }, [itemAmount]);

    // Close cart on route change
    useEffect(() => {
        closeCart();
    }, [pathname]);

    // Body Scroll Lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleCheckout = () => {
        if (cart.length === 0) {
            toast.error("Your cart is empty!");
            return;
        }
        router.push("/checkout");
        closeCart();
    };

    const handleTouchStart = (e) => {
        touchStartY.current = e.targetTouches[0].clientY;
    };

    const handleTouchMove = (e) => {
        touchEndY.current = e.targetTouches[0].clientY;
    };

    const handleTouchEnd = () => {
        if (!touchStartY.current || !touchEndY.current) return;
        const distance = touchStartY.current - touchEndY.current;

        // Swipe Up (Expand) - Threshold 50px
        if (distance > 50 && !isOpen) {
            setIsOpen(true);
        }
        // Swipe Down (Collapse) - Threshold 50px
        if (distance < -50 && isOpen) {
            setIsOpen(false);
        }

        // Reset
        touchStartY.current = 0;
        touchEndY.current = 0;
    };

    // Predictive CTA Text
    const getCtaText = () => {
        if (cart.length >= 2) return "Checkout • 2 mins away 🚀";
        if (cart.length > 0) return "Go to Checkout";
        return "Browse Menu";
    };

    return (
        <>
            {/* Backdrop (Only when expanded) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeCart}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />
                )}
            </AnimatePresence>

            {/* Main Container - Positions itself based on state */}
            <motion.div
                layout
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                className={`fixed z-50 bg-charcoalBlack border border-white/10 shadow-2xl overflow-hidden flex flex-col
                    ${isOpen
                        ? 'bottom-0 left-0 right-0 max-h-[85vh] lg:h-auto lg:max-h-[85dvh] lg:w-[450px] lg:bottom-4 lg:right-4 lg:left-auto rounded-t-[30px] lg:rounded-3xl'
                        : 'bottom-4 left-4 right-4 lg:left-auto lg:right-8 lg:w-auto h-16 rounded-full cursor-pointer'
                    }
                `}
                onTap={!isOpen ? toggleCart : undefined} // Tap to open when collapsed
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                // Interactive hover state only when collapsed
                whileHover={!isOpen ? { scale: 1.05 } : { scale: 1 }}
                whileTap={!isOpen ? { scale: 0.95 } : { scale: 1 }}
            >

                <AnimatePresence mode="wait">
                    {!isOpen ? (
                        /* === COLLAPSED PILL MODE === */
                        <motion.div
                            key="pill"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`flex items-center justify-between px-6 h-full w-full ${isBouncing ? 'animate-pulse' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/20 p-2 rounded-full">
                                    <ShoppingCart className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex flex-col leading-tight">
                                    <span className="text-white font-bold text-sm">
                                        {itemAmount} items
                                    </span>
                                    <span className="text-ashWhite/60 text-xs">
                                        {itemAmount > 0 ? `Rs. ${cartTotal.toLocaleString()}` : 'Cart is empty'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-primary font-bold text-sm hidden sm:block">View Cart</span>
                                <ChevronUp className="w-5 h-5 text-ashWhite" />
                            </div>
                        </motion.div>
                    ) : (
                        /* === EXPANDED CONTENT MODE === */
                        <motion.div
                            key="content"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }} // Slight delay to let container expand first
                            className="flex flex-col h-full w-full"
                        >

                            {/* Header (Drag Handle) */}
                            <div
                                className="flex items-center justify-between p-6 border-b border-white/10 shrink-0 cursor-pointer"
                                onClick={toggleCart}
                            >
                                <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-xl text-white">Your Order</h3>
                                    <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">{itemAmount}</span>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10">
                                    <ChevronDown className="w-6 h-6 text-white" />
                                </div>
                            </div>

                            {/* Scrollable List */}
                            <div ref={itemsRef} className="overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-primary scrollbar-track-transparent" style={{ maxHeight: 'calc(85vh - 300px)' }}>
                                {cart.length > 0 ? (
                                    <div className="flex flex-col gap-4">
                                        {cart.map((item, idx) => (
                                            <CartItem key={item.cartLineId || idx} pizza={item} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                                        <ShoppingCart className="w-16 h-16 text-ashWhite" />
                                        <p className="text-ashWhite font-medium">Your cart is empty 🍕</p>
                                        <button
                                            onClick={closeCart}
                                            className="text-primary font-bold uppercase text-sm border-b border-primary hover:text-white transition-colors"
                                        >
                                            Browse Menu
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Footer / Checkout */}
                            {cart.length > 0 && (
                                <div className="p-6 bg-charcoalBlack border-t border-white/10 shrink-0">
                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-ashWhite/60 text-sm">
                                            <span>Subtotal</span>
                                            <span>Rs. {cartTotal.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-ashWhite/60 text-sm">
                                            <span>Delivery Fee</span>
                                            <span>Rs. 350</span>
                                        </div>
                                        <div className="flex justify-between text-white font-bold text-lg">
                                            <span>Total</span>
                                            <span className="text-primary">Rs. {(cartTotal + 350).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCheckout}
                                        className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-between px-6 group"
                                    >
                                        <span>{getCtaText()}</span>
                                        <span className="bg-white/20 px-2 py-1 rounded text-sm group-hover:bg-white/30 transition-colors">
                                            Rs. {(cartTotal + 350).toLocaleString()}
                                        </span>
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    );
};

export default SmartCart;
