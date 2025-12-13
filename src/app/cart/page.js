'use client';

import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import CartItem from '../components/CartItem';
import Link from 'next/link';

export default function CartPage() {
    const { cart, cartTotal, isOpen, setIsOpen } = useContext(CartContext);

    if (cart.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center container mx-auto px-4 pt-24 text-center">
                <h1 className="text-4xl font-bold mb-4 text-ashWhite">Your Cart is Empty 😔</h1>
                <p className="text-ashWhite/70 mb-8 max-w-md">Looks like you haven't added any pizzas yet. Go ahead and explore our menu!</p>
                <Link href="/menu" className="btn btn-lg bg-primary hover:bg-primaryHover text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-primary/20 transition-all">
                    Browse Menu
                </Link>
            </div>
        );
    }

    return (
        <div className='container mx-auto px-4 pt-24 pb-12 min-h-screen'>
            <h1 className="text-4xl font-bold mb-8 text-ashWhite uppercase tracking-wide">Your Cart</h1>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 bg-charcoalBlack rounded-2xl p-6 border border-cardBorder shadow-xl">
                    <div className="flex flex-col gap-y-4">
                        {cart.map((pizza, index) => (
                            <CartItem key={index} pizza={pizza} />
                        ))}
                    </div>
                </div>

                {/* Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-softBlack sticky top-24 rounded-2xl p-6 border border-cardBorder shadow-xl">
                        <h3 className="text-2xl font-bold text-ashWhite mb-6">Order Summary</h3>
                        <div className="flex justify-between items-center mb-6 text-lg text-ashWhite/80">
                            <span>Subtotal</span>
                            <span className="font-semibold text-ashWhite">Rs. {parseFloat(cartTotal).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center mb-6 text-lg text-ashWhite/80">
                            <span>Delivery</span>
                            <span className="font-semibold text-secondary">Free</span>
                        </div>

                        {/* Promo Code */}
                        <div className="mb-6">
                            <label className="text-sm text-ashWhite/60 mb-2 block">Promo Code</label>
                            <div className="flex gap-2">
                                <input type="text" placeholder="Enter code" className="input w-full p-2 text-sm bg-charcoalBlack border border-cardBorder rounded-lg text-ashWhite focus:border-primary outline-none" />
                                <button className="bg-ashWhite/10 hover:bg-ashWhite/20 text-ashWhite px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                                    Apply
                                </button>
                            </div>
                        </div>

                        {/* ETA */}
                        <div className="bg-charcoalBlack p-3 rounded-lg mb-6 flex items-center gap-3 border border-cardBorder">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            </div>
                            <div className="text-sm">
                                <div className="text-ashWhite font-bold">Estimated Delivery</div>
                                <div className="text-ashWhite/60">30-45 mins</div>
                            </div>
                        </div>

                        <div className="border-t border-cardBorder my-4"></div>
                        <div className="flex justify-between items-center mb-8 text-2xl font-bold text-ashWhite">
                            <span>Total</span>
                            <span>Rs. {parseFloat(cartTotal).toLocaleString()}</span>
                        </div>

                        <Link href="/checkout" className="w-full block text-center btn btn-lg bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-primary/20 transition-all transform hover:-translate-y-1">
                            Proceed to Checkout
                        </Link>

                        <Link href="/menu" className="block text-center mt-4 text-ashWhite/60 hover:text-ashWhite text-sm hover:underline">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recommended Add-ons */}
            <div className="mt-16">
                <h2 className="text-2xl font-bold text-ashWhite mb-6">Complete Your Meal</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Using a subset of pizzas as mock add-ons */}
                    {/* Note: In a real app, this would be drinks/sides. For now reusing pizzas or we could fetch 'drinks' if they existed */}
                </div>
                {/* Since we don't have separate drinks getPizzas logic easily available in this file scope without import, 
              we can skip rendering grid here or import getPizzas. Better to keep it clean or just show a static placeholder for drinks.
              Actually, let's keep it simple and skip duplicating the whole grid logic here to avoid clutter, 
              or just add a simple static list of "Drinks" if the user wants "Real World".
              Let's add static Drinks cards.
           */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Coke', 'Pepsi', 'Garlic Bread', 'Lava Cake'].map((item, i) => (
                        <div key={i} className="bg-softBlack p-4 rounded-xl border border-cardBorder flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-charcoalBlack rounded-full mb-3 flex items-center justify-center text-2xl">🥤</div>
                            <h4 className="text-ashWhite font-bold">{item}</h4>
                            <p className="text-secondary font-bold text-sm mt-1">Rs. 450</p>
                            <button className="mt-3 bg-white/10 hover:bg-primary hover:text-white text-ashWhite px-4 py-1.5 rounded-full text-xs font-bold transition-all">Add</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

}
