'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, Search } from 'lucide-react';

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState('');
    const router = useRouter();

    const handleTrack = (e) => {
        e.preventDefault();
        if (orderId.trim()) {
            router.push(`/order/${orderId}`);
        }
    };

    return (
        <div className='container mx-auto px-4 pt-24 pb-12 min-h-screen flex flex-col items-center justify-center text-center'>
            <div className="bg-charcoalBlack max-w-lg w-full p-8 rounded-2xl border border-cardBorder shadow-2xl relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>

                <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 bg-softBlack rounded-full flex items-center justify-center border-2 border-primary/20">
                        <Truck className="w-10 h-10 text-primary" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-ashWhite mb-2">Track Your Order</h1>
                <p className="text-ashWhite/60 mb-8">Enter your Order ID to see live updates</p>

                <form onSubmit={handleTrack} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="e.g. 123456"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        className="w-full bg-softBlack border border-cardBorder rounded-xl p-4 text-center text-xl tracking-widest font-bold text-ashWhite focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="w-full btn btn-lg bg-primary hover:bg-primaryHover text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
                    >
                        <Search className="w-5 h-5" />
                        Track Now
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-cardBorder">
                    <p className="text-ashWhite/40 text-sm">
                        Need help? <a href="#" className="text-primary hover:underline">Contact Support</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
