'use client';

import React from 'react';
import Link from 'next/link';

export default function OffersPage() {
    const offers = [
        {
            id: 1,
            title: "Family Feast",
            description: "2 Large Pizzas + Garlic Bread + Coke 1.5L",
            price: "Rs. 4500",
            bg: "bg-gradient-to-r from-red-600 to-orange-600",
            code: "FAMILY45"
        },
        {
            id: 2,
            title: "Lunch Special",
            description: "Any Small Pizza + Coke (Only 11AM - 3PM)",
            price: "Rs. 1200",
            bg: "bg-gradient-to-r from-orange-500 to-yellow-500",
            code: "LUNCH12"
        },
        {
            id: 3,
            title: "Midnight Munchies",
            description: "Get 20% OFF on all Spicy pizzas after 10PM",
            price: "20% OFF",
            bg: "bg-gradient-to-r from-purple-800 to-indigo-900",
            code: "NIGHT20"
        }
    ];

    return (
        <div className='container mx-auto px-4 pt-24 pb-12 min-h-screen'>
            <h1 className="text-4xl font-bangers text-ashWhite mb-8 uppercase tracking-wide text-center">
                Hot Offers 🔥
            </h1>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.map(offer => (
                    <div key={offer.id} className={`${offer.bg} rounded-2xl p-8 relative overflow-hidden group shadow-xl transition-all hover:scale-[1.02]`}>
                        {/* Circle Decoration */}
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>

                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">{offer.title}</h2>
                                <p className="text-white/80 font-medium mb-6">{offer.description}</p>
                            </div>

                            <div>
                                <div className="text-4xl font-bold text-white mb-4">{offer.price}</div>
                                <div className="flex items-center justify-between bg-black/20 rounded-lg p-3 border border-white/10">
                                    <span className="font-mono text-white tracking-widest font-bold">{offer.code}</span>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(offer.code)}
                                        className="text-xs bg-white text-black px-3 py-1 rounded font-bold hover:bg-white/90 active:scale-95 transition-all"
                                    >
                                        COPY
                                    </button>
                                </div>
                                <Link href="/menu" className="mt-4 block text-center w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-ashWhite transition-colors">
                                    Order Now
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 text-center text-ashWhite/60 text-sm">
                *Terms and conditions apply. Offers valid for a limited time only.
            </div>
        </div>
    );
}
