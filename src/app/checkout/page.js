'use client';

import React, { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, CreditCard, MapPin, Truck } from 'lucide-react';

const CheckoutPage = () => {
    const { cart, cartTotal } = useContext(CartContext);
    const [success, setSuccess] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [deliveryTime, setDeliveryTime] = useState('asap');

    if (cart.length === 0 && !success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-3xl font-bold text-ashWhite mb-4">Your cart is empty</h2>
                <Link href="/menu" className="text-primary hover:text-primaryHover underline">
                    Return to Menu
                </Link>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-24 pb-12">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-green-500/50 shadow-lg">
                    <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-ashWhite mb-4">Order Placed Successfully!</h1>
                <p className="text-ashWhite/70 text-lg mb-8 max-w-lg">
                    Thank you for your order. We are preparing your delicious pizza right now.
                    You can track your order status below.
                </p>
                <div className="flex gap-4">
                    <Link href="/order/123456" className="btn btn-lg bg-primary hover:bg-primaryHover text-white px-8 py-3 rounded-xl font-bold shadow-lg">
                        Track Order
                    </Link>
                    <Link href="/" className="btn btn-lg bg-softBlack text-ashWhite border border-cardBorder px-8 py-3 rounded-xl font-bold hover:bg-white/5">
                        Back to Home
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className='container mx-auto px-4 pt-24 pb-12 min-h-screen'>
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-12 text-sm font-bold uppercase tracking-widest gap-4 md:gap-8">
                <div className="text-ashWhite/40 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full border border-ashWhite/40 flex items-center justify-center">1</span>
                    Cart
                </div>
                <div className="w-8 h-px bg-ashWhite/20"></div>
                <div className="text-primary flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">2</span>
                    Checkout
                </div>
                <div className="w-8 h-px bg-ashWhite/20"></div>
                <div className="text-ashWhite/40 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full border border-ashWhite/40 flex items-center justify-center">3</span>
                    Tracking
                </div>
            </div>

            <h1 className="text-4xl font-bold mb-8 text-ashWhite uppercase tracking-wide">Checkout</h1>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column - Forms */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Delivery Details */}
                    <div className="bg-charcoalBlack rounded-2xl p-6 border border-cardBorder">
                        <div className="flex items-center gap-3 mb-6">
                            <MapPin className="text-primary w-6 h-6" />
                            <h2 className="text-xl font-bold text-ashWhite">Delivery Address</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <input type="text" placeholder="First Name" className="input w-full p-3 bg-softBlack border border-cardBorder rounded-lg text-ashWhite focus:border-primary outline-none" />
                            <input type="text" placeholder="Last Name" className="input w-full p-3 bg-softBlack border border-cardBorder rounded-lg text-ashWhite focus:border-primary outline-none" />
                            <input type="text" placeholder="Address" className="input w-full md:col-span-2 p-3 bg-softBlack border border-cardBorder rounded-lg text-ashWhite focus:border-primary outline-none" />
                            <input type="text" placeholder="City" className="input w-full p-3 bg-softBlack border border-cardBorder rounded-lg text-ashWhite focus:border-primary outline-none" />
                            <input type="text" placeholder="Phone Number" className="input w-full p-3 bg-softBlack border border-cardBorder rounded-lg text-ashWhite focus:border-primary outline-none" />
                        </div>
                    </div>

                    {/* Delivery Time */}
                    <div className="bg-charcoalBlack rounded-2xl p-6 border border-cardBorder">
                        <div className="flex items-center gap-3 mb-6">
                            <Truck className="text-primary w-6 h-6" />
                            <h2 className="text-xl font-bold text-ashWhite">Delivery Time</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <label className={`cursor-pointer border p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${deliveryTime === 'asap' ? 'border-primary bg-primary/10 text-ashWhite' : 'border-cardBorder bg-softBlack text-ashWhite/60'}`}>
                                <input type="radio" name="time" className="hidden" checked={deliveryTime === 'asap'} onChange={() => setDeliveryTime('asap')} />
                                <span>⚡ ASAP (30-45 min)</span>
                            </label>
                            <label className={`cursor-pointer border p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${deliveryTime === 'schedule' ? 'border-primary bg-primary/10 text-ashWhite' : 'border-cardBorder bg-softBlack text-ashWhite/60'}`}>
                                <input type="radio" name="time" className="hidden" checked={deliveryTime === 'schedule'} onChange={() => setDeliveryTime('schedule')} />
                                <span>📅 Schedule for Later</span>
                            </label>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-charcoalBlack rounded-2xl p-6 border border-cardBorder">
                        <div className="flex items-center gap-3 mb-6">
                            <CreditCard className="text-primary w-6 h-6" />
                            <h2 className="text-xl font-bold text-ashWhite">Payment Method</h2>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <label className={`cursor-pointer border p-4 rounded-xl flex flex-col items-center justify-center gap-2 font-bold transition-all ${paymentMethod === 'card' ? 'border-primary bg-primary/10 text-ashWhite' : 'border-cardBorder bg-softBlack text-ashWhite/60'}`}>
                                <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                                <CreditCard className="w-6 h-6" />
                                <span className="text-sm">Card</span>
                            </label>
                            <label className={`cursor-pointer border p-4 rounded-xl flex flex-col items-center justify-center gap-2 font-bold transition-all ${paymentMethod === 'cash' ? 'border-primary bg-primary/10 text-ashWhite' : 'border-cardBorder bg-softBlack text-ashWhite/60'}`}>
                                <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                                <span className="text-2xl">💵</span>
                                <span className="text-sm">Cash</span>
                            </label>
                            <label className={`cursor-pointer border p-4 rounded-xl flex flex-col items-center justify-center gap-2 font-bold transition-all ${paymentMethod === 'wallet' ? 'border-primary bg-primary/10 text-ashWhite' : 'border-cardBorder bg-softBlack text-ashWhite/60'}`}>
                                <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} />
                                <span className="text-2xl">👛</span>
                                <span className="text-sm">Wallet</span>
                            </label>
                        </div>
                    </div>

                </div>

                {/* Right Column - Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-softBlack sticky top-24 rounded-2xl p-6 border border-cardBorder shadow-xl">
                        <h3 className="text-xl font-bold text-ashWhite mb-6">Your Order</h3>
                        <div className="flex flex-col gap-4 mb-6 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary scrollbar-track-softBlack pr-2">
                            {cart.map((item, index) => (
                                <div key={index} className="flex gap-4 items-center">
                                    <div className="w-16 h-16 bg-charcoalBlack rounded-lg flex items-center justify-center relative flex-shrink-0">
                                        <Image src={item.image} alt={item.name} width={60} height={60} className="object-contain" />
                                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center border border-softBlack">
                                            {item.amount}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-ashWhite line-clamp-1">{item.name}</h4>
                                        <p className="text-xs text-ashWhite/60">{item.size}, {item.crust}</p>
                                    </div>
                                    <div className="text-sm font-bold text-secondary">
                                        Rs. {(item.price * item.amount).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-cardBorder my-4"></div>
                        <div className="flex justify-between items-center mb-2 text-ashWhite/80">
                            <span>Subtotal</span>
                            <span>Rs. {parseFloat(cartTotal).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center mb-6 text-ashWhite/80">
                            <span>Delivery Fee</span>
                            <span>Rs. 350</span>
                        </div>
                        <div className="border-t border-cardBorder mb-6"></div>
                        <div className="flex justify-between items-center mb-8 text-2xl font-bold text-ashWhite">
                            <span>Total</span>
                            <span>Rs. {(parseFloat(cartTotal) + 350).toLocaleString()}</span>
                        </div>

                        <button
                            onClick={() => setSuccess(true)}
                            className="w-full btn btn-lg bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-primary/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            Pay & Place Order
                        </button>
                        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-ashWhite/50">
                            <Truck className="w-3 h-3" />
                            <span>Secure Checkout with 256-bit Encryption</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
