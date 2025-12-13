'use client';

import React, { useState, useEffect } from 'react';
import { Package, Clock, MapPin, CheckCircle, Phone, ClipboardList, ChefHat, Flame, Truck } from 'lucide-react';
import Link from 'next/link';

const OrderPage = ({ params }) => {
    const { orderId } = params;
    const [status, setStatus] = useState('placed'); // placed, preparing, baking, out-for-delivery, delivered
    const timeline = ['placed', 'preparing', 'baking', 'out-for-delivery', 'delivered'];

    // Mock Real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setStatus(prev => {
                const currentIndex = timeline.indexOf(prev);
                if (currentIndex < timeline.length - 1) {
                    return timeline[currentIndex + 1];
                }
                return prev;
            });
        }, 5000); // Advance every 5 seconds for demo

        return () => clearInterval(interval);
    }, []);

    const getStatusIndex = (s) => timeline.indexOf(s);
    const currentStatusIndex = getStatusIndex(status);

    return (
        <div className='container mx-auto px-4 pt-24 pb-12 min-h-screen'>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div>
                    <span className="text-secondary font-bold uppercase tracking-widest text-sm">Order #{orderId}</span>
                    <h1 className="text-4xl font-bangers text-ashWhite">
                        {status === 'delivered' ? 'Arrived!' : 'On the way!'}
                    </h1>
                </div>
                <div className="bg-softBlack px-6 py-3 rounded-xl border border-cardBorder text-right">
                    <div className="text-xs text-ashWhite/60 uppercase font-bold tracking-widest">Estimated Delivery</div>
                    <div className="text-2xl font-bold text-primary">
                        {status === 'delivered' ? 'Delivered' : '30-40 min'}
                    </div>
                </div>
            </div>

            {/* Address */}
            <div className="text-ashWhite/60 mb-8 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>123, Pizza Street, Colombo 03</span>
            </div>

            {/* Progress Timeline */}
            <div className="bg-charcoalBlack border border-cardBorder p-8 rounded-2xl mb-8 relative overflow-hidden">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-8 right-8 h-1 bg-white/10 -translate-y-[60px] md:-translate-y-1/2 hidden md:block"></div>
                <div className="absolute top-8 bottom-8 left-[27px] w-1 bg-white/10 md:hidden"></div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
                    {timeline.map((step, index) => {
                        const isActive = index <= currentStatusIndex;
                        const isCurrent = index === currentStatusIndex;

                        const icons = {
                            'placed': ClipboardList,
                            'preparing': ChefHat,
                            'baking': Flame,
                            'out-for-delivery': Truck,
                            'delivered': CheckCircle
                        };
                        const Icon = icons[step];

                        return (
                            <div key={step} className="flex md:flex-col items-center gap-4 md:gap-3 md:text-center">
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500
                             ${isActive ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'bg-softBlack border-white/10 text-white/20'}
                             ${isCurrent ? 'scale-110' : ''}
                         `}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className={`font-bold capitalize text-sm md:text-base ${isActive ? 'text-ashWhite' : 'text-ashWhite/40'}`}>
                                        {step.replace(/-/g, ' ')}
                                    </h3>
                                    {isActive && (
                                        <span className="text-xs text-secondary font-bold block mt-1">
                                            {index === 0 ? '5:30 PM' : index === 1 ? '5:35 PM' : index === 2 ? '5:45 PM' : index === 3 ? '6:00 PM' : '6:15 PM'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Help Section */}
                <div className="lg:col-span-2">
                    <div className="bg-softBlack border border-cardBorder rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div>
                            <h3 className="text-xl font-bold text-ashWhite mb-1">Need help with your order?</h3>
                            <p className="text-ashWhite/60 text-sm">Our support team is available 24/7</p>
                        </div>
                        <div className="flex gap-4">
                            <button className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full text-ashWhite font-bold transition-all">
                                <Phone className="w-4 h-4" /> Call Support
                            </button>
                            <button
                                disabled={currentStatusIndex > 1}
                                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all border ${currentStatusIndex > 1 ? 'border-cardBorder text-ashWhite/20 cursor-not-allowed' : 'border-red-500/50 text-red-400 hover:bg-red-500/10'}`}
                            >
                                Cancel Order
                            </button>
                        </div>
                    </div>
                </div>

                {/* Order Summary (Compact) */}
                <div className="lg:col-span-1">
                    <div className="bg-charcoalBlack rounded-2xl p-6 border border-cardBorder">
                        <h3 className="font-bold text-ashWhite mb-4 border-b border-cardBorder pb-2">Order Summary</h3>
                        <div className="space-y-3 mb-4">
                            <div className="flex justify-between text-sm text-ashWhite/80">
                                <span>1x Chicken Supreme (M)</span>
                                <span>Rs. 1,800</span>
                            </div>
                            <div className="flex justify-between text-sm text-ashWhite/80">
                                <span>2x Coke</span>
                                <span>Rs. 900</span>
                            </div>
                        </div>
                        <div className="flex justify-between font-bold text-ashWhite pt-2 border-t border-cardBorder">
                            <span>Total Paid</span>
                            <span>Rs. 2,700</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderPage;
