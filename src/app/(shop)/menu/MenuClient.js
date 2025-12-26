'use client';

import React, { useState, useEffect } from 'react';
import PizzaGrid from '../../components/PizzaGrid';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useSocket } from '../../context/SocketContext';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

export default function MenuClient({ initialPizzas = [] }) {
    const searchParams = useSearchParams();
    const initialFilter = searchParams.get('filter');
    const couponParam = searchParams.get('coupon');
    const { addToCart } = useCart();

    const [pizzas, setPizzas] = useState(initialPizzas);
    const [filteredPizzas, setFilteredPizzas] = useState(initialPizzas);

    // Filter States
    const [activeCategory, setActiveCategory] = useState('all');
    const [sortBy, setSortBy] = useState('popular');
    const [searchQuery, setSearchQuery] = useState('');

    // Categories
    const categories = [
        { id: 'all', label: 'All' },
        { id: 'chicken', label: 'Chicken' },
        { id: 'veg', label: 'Veg' },
        { id: 'spicy', label: 'Spicy' },
        { id: 'cheese', label: 'Cheese' },
    ];

    // Load Initial Data
    useEffect(() => {
        if (initialFilter === 'offers') {
            // Logic for offers if we had an 'offer' field
        }
        // Show toast if coupon detected from URL
        if (couponParam) {
            toast.success(`🎉 Coupon ${couponParam} selected! Add items to cart and proceed to checkout.`, {
                duration: 5000,
                position: 'top-center',
            });
        }
    }, [initialFilter, couponParam]);

    // Real-time Menu Updates
    const { socket, subscribeToMenu } = useSocket();

    useEffect(() => {
        if (socket) {
            subscribeToMenu();

            const handleUpdate = (data) => {
                console.log('🍕 Menu Update Received:', data);
                if (data.type === 'update') {
                    setPizzas(prev => prev.map(p => p.id === data.pizza.id ? data.pizza : p));
                } else if (data.type === 'add') {
                    setPizzas(prev => [data.pizza, ...prev]);
                } else if (data.type === 'delete') {
                    setPizzas(prev => prev.filter(p => p.id !== data.pizzaId));
                }
            };

            socket.on('menu_updated', handleUpdate);

            return () => {
                socket.off('menu_updated', handleUpdate);
            };
        }
    }, [socket, subscribeToMenu]);


    // Handle Filtering & Sorting
    useEffect(() => {
        let result = [...pizzas];

        // 1. Search
        if (searchQuery) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // 2. Category
        if (activeCategory !== 'all') {
            // Mock category logic based on name strings or new 'category' field if it existed
            // Since we don't have explicit categories in getPizzas data yet, we'll infer from name/desc
            result = result.filter(p => {
                const lowerName = p.name.toLowerCase();
                const lowerDesc = p.description.toLowerCase();
                if (activeCategory === 'chicken') return lowerName.includes('chicken');
                if (activeCategory === 'veg') return lowerName.includes('veggie') || lowerDesc.includes('vegetable');
                if (activeCategory === 'spicy') return lowerDesc.includes('spicy') || lowerDesc.includes('chilli');
                if (activeCategory === 'cheese') return lowerName.includes('cheese');
                return true;
            });
        }

        // 3. Sort
        if (sortBy === 'price-low') {
            result.sort((a, b) => a.priceSm - b.priceSm);
        } else if (sortBy === 'price-high') {
            result.sort((a, b) => b.priceSm - a.priceSm);
        } else if (sortBy === 'popular') {
            // Mock popularity if no field, random shuffle or keep default
        }

        setFilteredPizzas(result);
    }, [pizzas, activeCategory, sortBy, searchQuery]);


    return (
        <div className='min-h-screen bg-charcoalBlack'>

            {/* Page Header */}
            <div className="bg-softBlack border-b border-cardBorder py-4 md:py-6 sticky top-16 z-30 shadow-xl">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-3">
                        <h1 className="text-4xl font-bangers text-ashWhite tracking-wide">Our Menu</h1>

                        {/* Search & Sort Controls */}
                        <div className="flex gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ashWhite/50 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search pizzas..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-charcoalBlack border border-cardBorder rounded-lg pl-10 pr-4 py-2.5 text-ashWhite text-sm focus:border-primary outline-none"
                                />
                            </div>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none bg-charcoalBlack border border-cardBorder rounded-lg pl-4 pr-10 py-2.5 text-ashWhite text-sm focus:border-primary outline-none cursor-pointer"
                                >
                                    <option value="popular">Popular</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                </select>
                                <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 text-ashWhite/50 w-4 h-4 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-6 py-2 rounded-full whitespace-nowrap font-bold text-sm transition-all ${activeCategory === cat.id
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                    : 'bg-cardBorder/50 text-ashWhite/60 hover:bg-cardBorder hover:text-ashWhite'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="mb-6 text-ashWhite/60 text-sm font-medium">
                    Showing {filteredPizzas.length} pizzas
                </div>

                {filteredPizzas.length > 0 ? (
                    <PizzaGrid pizzas={filteredPizzas} addToCart={addToCart} />
                ) : (
                    <div className="text-center py-20 bg-softBlack/50 rounded-2xl border border-cardBorder/50 border-dashed">
                        <div className="inline-block p-4 rounded-full bg-cardBorder mb-4">
                            <Search className="w-8 h-8 text-ashWhite/40" />
                        </div>
                        <h3 className="text-xl font-bold text-ashWhite mb-2">No pizzas found</h3>
                        <p className="text-ashWhite/60 mb-6">Try adjusting your filters or search term</p>
                        <button
                            onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                            className="text-primary font-bold hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
