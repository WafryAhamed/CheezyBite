'use client';

import React, { useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, ShieldCheck, Truck, Star, ArrowRight, Flame } from 'lucide-react';
import PizzaGrid from './PizzaGrid'; // Re-use existing grid for Best Sellers logic if passed props, or handled internally
import { CartContext } from '../context/CartContext';

// 1. Highlights Strip
export const Highlights = () => {
    const highlights = [
        { icon: Clock, text: "Fast Delivery", highlight: "30-Min Delivery", sub: "Hot pizza delivered fast." },
        { icon: LeafIcon, text: "Quality You Can Taste", highlight: "Fresh Ingredients", sub: "Prepared daily with care." },
        { icon: ShieldCheck, text: "Pay With Confidence", highlight: "Secure Payments", sub: "Safe and trusted checkout." },
        { icon: TrophyIcon, text: "Loved by Pizza Fans", highlight: "Customer Favourite", sub: "Trusted by thousands." },
    ];

    return (
        <section className="bg-charcoalBlack border-y border-cardBorder py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {highlights.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 justify-center lg:justify-start">
                            <div className="w-12 h-12 rounded-full bg-softBlack border border-cardBorder flex items-center justify-center text-primary">
                                <item.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-ashWhite leading-tight">{item.text}</h3>
                                <p className="text-xs uppercase tracking-wide mt-1">
                                    <span className="text-red-500 font-bold block">{item.highlight}</span>
                                    <span className="text-ashWhite block opacity-60 mt-0.5">{item.sub}</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// 2. Best Sellers (Wrapper around PizzaGrid or custom carousel)
export const BestSellers = ({ pizzas }) => {
    const { addToCart } = useContext(CartContext);

    // Slice to max 4 items for best sellers
    const bestSellerPizzas = pizzas ? pizzas.slice(0, 4) : [];

    return (
        <section className="py-20 bg-jetBlack">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <span className="text-secondary font-bold uppercase tracking-widest text-sm">Customer Favorites</span>
                        <h2 className="text-4xl font-bangers text-ashWhite mt-2">Top Selling Pizzas</h2>
                    </div>
                    <Link href="/menu" className="hidden sm:flex items-center gap-2 text-ashWhite font-bold hover:text-primary transition-colors">
                        View Full Menu <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                <PizzaGrid pizzas={bestSellerPizzas} addToCart={addToCart} />

                <div className="mt-12 text-center sm:hidden">
                    <Link href="/menu" className="btn btn-lg bg-softBlack border border-cardBorder text-white w-full flex justify-center">
                        View All Pizzas
                    </Link>
                </div>
            </div>
        </section>
    );
};

// 3. Offers Banner
export const OffersBanner = () => {
    const [featuredOffer, setFeaturedOffer] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetchFeaturedOffer();
    }, []);

    const fetchFeaturedOffer = async () => {
        try {
            const response = await fetch('/api/offers', {
                method: 'GET',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success && data.data && data.data.length > 0) {
                // Get the first active offer as featured
                setFeaturedOffer(data.data[0]);
            }
        } catch (error) {
            console.error('Failed to fetch featured offer:', error);
        } finally {
            setLoading(false);
        }
    };

    // Don't show banner if no offers available
    if (loading) {
        return null; // Or a loading skeleton
    }

    if (!featuredOffer) {
        return null; // Hide banner if no offers
    }

    const getDiscountText = () => {
        if (featuredOffer.type === 'fixed') {
            return `Get Rs. ${featuredOffer.value} OFF`;
        } else {
            const maxText = featuredOffer.maxDiscount ? ` (up to Rs. ${featuredOffer.maxDiscount})` : '';
            return `Get ${featuredOffer.value}% OFF${maxText}`;
        }
    };

    const getSubtext = () => {
        if (featuredOffer.minOrderAmount > 0) {
            return `On orders above Rs. ${featuredOffer.minOrderAmount}`;
        }
        return featuredOffer.description || 'On your next order';
    };

    return (
        <section className="container mx-auto px-4 mb-20">
            <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-8 lg:p-12 relative overflow-hidden shadow-2xl">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>

                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="text-center lg:text-left text-white max-w-xl">
                        <span className="bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide mb-4 inline-block border border-white/30">
                            Limited Time Offer
                        </span>
                        <h2 className="text-4xl lg:text-6xl font-bangers mb-4">
                            {getDiscountText()}
                            <span className="block text-2xl lg:text-3xl font-robotoCondensed font-normal mt-2 opacity-90">{getSubtext()}</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
                            <div className="bg-white/10 border border-white/20 border-dashed rounded-lg p-3 px-6 text-center">
                                <span className="text-xs uppercase opacity-70 block mb-1">Use Code</span>
                                <span className="text-2xl font-bold tracking-widest font-mono">{featuredOffer.code}</span>
                            </div>
                            <Link href="/menu" className="bg-white text-primary hover:bg-ashWhite px-8 py-3 rounded-full font-bold shadow-lg transition-transform transform hover:scale-105">
                                Order Now
                            </Link>
                        </div>
                    </div>
                    {/* Image illustration would go here */}
                    <div className="hidden lg:block relative w-64 h-64">
                        <Flame className="w-full h-full text-white/20 animate-pulse" />
                    </div>
                </div>
            </div>
        </section>
    )
}

// 4. How it Works
export const HowItWorks = () => {
    const steps = [
        { num: "01", title: "Choose Your Favorite", text: "Browse our menu and select from our handcrafted pizzas." },
        { num: "02", title: "Customize It", text: "Add your favorite toppings, choose your crust and size." },
        { num: "03", title: "Fast Delivery", text: "We deliver hot and fresh to your doorstep in 30 mins." },
    ];

    return (
        <section className="py-20 bg-softBlack border-t border-cardBorder">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <span className="text-primary font-bold uppercase tracking-widest text-sm">Easy Steps</span>
                    <h2 className="text-4xl font-bangers text-ashWhite mt-2">How It Works</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="relative bg-charcoalBlack p-8 rounded-2xl border border-cardBorder text-center group hover:-translate-y-2 transition-transform duration-300">
                            <div className="text-6xl font-bangers text-white/5 absolute -top-6 left-1/2 -translate-x-1/2 group-hover:text-primary/10 transition-colors">
                                {step.num}
                            </div>
                            <h3 className="text-xl font-bold text-ashWhite mb-3 relative">{step.title}</h3>
                            <p className="text-ashWhite/60 leading-relaxed relative">{step.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// 5. Social Proof (Reviews)
export const SocialProof = () => {
    const reviews = [
        { name: "Ruwan Perera", role: "Pizza Lover", text: "Best pizza in Colombo! The crust is perfection.", rating: 5 },
        { name: "Fatima Rimzan", role: "Verified Buyer", text: "Delivery was super fast. Pizza arrived hot.", rating: 5 },
        { name: "S. Mahendran", role: "Regular Customer", text: "Love the spicy chicken option. Highly recommended!", rating: 5 },
    ];

    return (
        <section className="py-20 bg-charcoalBlack border-y border-cardBorder">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="flex justify-center gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-6 h-6 text-secondary fill-secondary" />)}
                    </div>
                    <h2 className="text-3xl font-bold text-ashWhite">Trusted by 10,000+ Happy Eaters</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {reviews.map((review, index) => (
                        <div key={index} className="bg-softBlack p-6 rounded-xl border border-cardBorder">
                            <p className="text-ashWhite/80 italic mb-6">"{review.text}"</p>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                                    {review.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-ashWhite text-sm">{review.name}</h4>
                                    <span className="text-xs text-ashWhite/40">{review.role}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// Helper Icons
const LeafIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.77 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>;
const TrophyIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>;
