'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Tag, Copy, Loader2 } from 'lucide-react';

export default function OffersPage() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            const response = await fetch('/api/offers', {
                method: 'GET',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success && data.data) {
                setOffers(data.data);
            } else {
                toast.error('Failed to load offers');
            }
        } catch (error) {
            console.error('Failed to fetch offers:', error);
            toast.error('Failed to load offers');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        toast.success(`Copied ${code}!`, { icon: '📋' });
    };

    const getDiscountText = (offer) => {
        if (offer.type === 'fixed') {
            return `Rs. ${offer.value} OFF`;
        } else {
            const maxText = offer.maxDiscount ? ` (up to Rs. ${offer.maxDiscount})` : '';
            return `${offer.value}% OFF${maxText}`;
        }
    };

    const getGradient = (index) => {
        const gradients = [
            'bg-gradient-to-r from-red-600 to-orange-600',
            'bg-gradient-to-r from-orange-500 to-yellow-500',
            'bg-gradient-to-r from-purple-800 to-indigo-900',
            'bg-gradient-to-r from-pink-600 to-rose-600',
            'bg-gradient-to-r from-blue-600 to-cyan-600',
            'bg-gradient-to-r from-green-600 to-teal-600'
        ];
        return gradients[index % gradients.length];
    };

    if (loading) {
        return (
            <div className='container mx-auto px-4 pt-24 pb-12 min-h-screen flex items-center justify-center'>
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-ashWhite/60">Loading hot offers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='container mx-auto px-4 pt-24 pb-12 min-h-screen'>
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-ashWhite mb-4 uppercase tracking-wide flex items-center justify-center gap-3">
                    <Tag className="w-10 h-10 text-primary" />
                    Hot Offers 🔥
                </h1>
                <p className="text-ashWhite/60 text-lg">Grab these amazing deals on your favorite pizzas!</p>
            </div>

            {offers.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">😔</div>
                    <h2 className="text-2xl font-bold text-ashWhite mb-2">No Active Offers</h2>
                    <p className="text-ashWhite/60 mb-8">Check back later for exciting deals!</p>
                    <Link href="/menu" className="btn btn-lg bg-primary hover:bg-primaryHover text-white px-8 py-3 rounded-full font-bold">
                        Browse Menu
                    </Link>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offers.map((offer, index) => (
                        <div key={offer._id || offer.code} className={`${getGradient(index)} rounded-2xl p-8 relative overflow-hidden group shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl`}>
                            {/* Circle Decoration */}
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>

                            <div className="relative z-10 h-full flex flex-col justify-between min-h-[280px]">
                                <div>
                                    <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-bold text-white mb-3">
                                        {offer.type === 'fixed' ? 'FLAT DISCOUNT' : 'PERCENTAGE OFF'}
                                    </div>
                                    <h2 className="text-3xl font-bold text-white mb-2">{offer.name}</h2>
                                    {offer.description && (
                                        <p className="text-white/90 font-medium mb-4 text-sm leading-relaxed">{offer.description}</p>
                                    )}
                                    {offer.minOrderAmount > 0 && (
                                        <p className="text-white/80 text-xs mb-2">Min. order: Rs. {offer.minOrderAmount}</p>
                                    )}
                                </div>

                                <div>
                                    <div className="text-4xl font-bold text-white mb-4">{getDiscountText(offer)}</div>
                                    
                                    {/* Coupon Code Box */}
                                    <div className="flex items-center justify-between bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/20 mb-3">
                                        <span className="font-mono text-white tracking-widest font-bold text-lg">{offer.code}</span>
                                        <button
                                            onClick={() => handleCopyCode(offer.code)}
                                            className="flex items-center gap-2 text-xs bg-white text-black px-4 py-2 rounded font-bold hover:bg-white/90 active:scale-95 transition-all"
                                        >
                                            <Copy className="w-3 h-3" />
                                            COPY
                                        </button>
                                    </div>

                                    <Link 
                                        href={`/menu?coupon=${offer.code}`}
                                        className="block text-center w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-ashWhite transition-colors shadow-lg"
                                    >
                                        Order Now
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-12 text-center text-ashWhite/60 text-sm space-y-2">
                <p>*Terms and conditions apply. Offers valid while stocks last.</p>
                <p>*Coupons can be applied at checkout. Only one coupon per order.</p>
            </div>
        </div>
    );
}
