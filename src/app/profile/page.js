'use client';

import React from 'react';
import { User, MapPin, Package, Heart, LogOut } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ProfilePage() {
    return (
        <div className='container mx-auto px-4 pt-24 pb-12 min-h-screen'>
            <div className="grid lg:grid-cols-4 gap-8">

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-charcoalBlack rounded-2xl p-6 border border-cardBorder shadow-xl sticky top-24">
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-24 h-24 bg-softBlack rounded-full flex items-center justify-center border-2 border-primary mb-4">
                                <User className="text-ashWhite w-10 h-10" />
                            </div>
                            <h2 className="text-xl font-bold text-ashWhite">John Doe</h2>
                            <p className="text-ashWhite/60 text-sm">john.doe@example.com</p>
                        </div>

                        <nav className="space-y-2">
                            <Link href="#" className="flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-xl font-medium border border-primary/20">
                                <Package className="w-5 h-5" />
                                Orders
                            </Link>
                            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-ashWhite/70 hover:bg-white/5 hover:text-ashWhite rounded-xl transition-colors">
                                <MapPin className="w-5 h-5" />
                                Addresses
                            </Link>
                            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-ashWhite/70 hover:bg-white/5 hover:text-ashWhite rounded-xl transition-colors">
                                <Heart className="w-5 h-5" />
                                Favorites
                            </Link>
                        </nav>

                        <div className="border-t border-cardBorder my-6"></div>
                        <button className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors w-full">
                            <LogOut className="w-5 h-5" />
                            Log Out
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    <h1 className="text-3xl font-bold text-ashWhite mb-6">Order History</h1>

                    {/* Order Card 1 */}
                    <div className="bg-softBlack rounded-2xl p-6 border border-cardBorder shadow-md hover:shadow-xl transition-all">
                        <div className="flex flex-wrap justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-lg font-bold text-ashWhite">Order #123456</h3>
                                    <span className="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded font-bold uppercase border border-green-500/20">Delivered</span>
                                </div>
                                <p className="text-ashWhite/50 text-sm">Placed on Oct 12, 2025</p>
                            </div>
                            <Link href="/order/123456" className="text-primary hover:text-primaryHover text-sm font-bold underline">
                                View Details
                            </Link>
                        </div>

                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-cardBorder">
                            <div className="w-16 h-16 bg-charcoalBlack rounded-lg flex-shrink-0 relative">
                                <Image src="/pizzas/item1.jpg" width={64} height={64} alt="Pizza" className="object-contain p-1" />
                                <span className="absolute -top-2 -right-2 bg-charcoalBlack text-ashWhite border border-cardBorder w-5 h-5 flex items-center justify-center rounded-full text-xs">2</span>
                            </div>
                            <div className="w-16 h-16 bg-charcoalBlack rounded-lg flex-shrink-0">
                                <Image src="/pizzas/item2.jpg" width={64} height={64} alt="Pizza" className="object-contain p-1" />
                            </div>
                        </div>

                        <div className="border-t border-cardBorder mt-4 pt-4 flex justify-between items-center">
                            <span className="text-ashWhite/60 text-sm">3 Items</span>
                            <span className="font-bold text-ashWhite">Rs. 4,500</span>
                        </div>
                    </div>

                    {/* Order Card 2 */}
                    <div className="bg-softBlack rounded-2xl p-6 border border-cardBorder shadow-md hover:shadow-xl transition-all opacity-75">
                        <div className="flex flex-wrap justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-lg font-bold text-ashWhite">Order #123000</h3>
                                    <span className="bg-ashWhite/10 text-ashWhite/60 text-xs px-2 py-1 rounded font-bold uppercase border border-ashWhite/10">Delivered</span>
                                </div>
                                <p className="text-ashWhite/50 text-sm">Placed on Sep 28, 2025</p>
                            </div>
                            <Link href="/order/123000" className="text-primary hover:text-primaryHover text-sm font-bold underline">
                                View Details
                            </Link>
                        </div>

                        <div className="border-t border-cardBorder mt-4 pt-4 flex justify-between items-center">
                            <span className="text-ashWhite/60 text-sm">1 Item</span>
                            <span className="font-bold text-ashWhite">Rs. 1,200</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
