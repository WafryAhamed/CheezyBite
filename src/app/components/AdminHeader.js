"use client";

import { useAdmin } from '../context/AdminContext';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    Pizza, Search, Bell, ChevronDown, LogOut,
    LayoutDashboard, ShoppingBag, Users, Settings, Menu
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminHeader({ onMenuToggle }) {
    const { logout, userRole, currentUser } = useAdmin();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Sync input with URL param if it changes externally
    useEffect(() => {
        setSearchTerm(searchParams.get('q') || '');
    }, [searchParams]);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Debounce URL update
        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            if (value) {
                params.set('q', value);
            } else {
                params.delete('q');
            }
            router.replace(`${pathname}?${params.toString()}`);
        }, 300);

        return () => clearTimeout(timeoutId);
    };

    const handleLogout = () => {
        logout();
        router.push('/admin/login');
    };

    return (
        <header className="bg-charcoalBlack border-b border-cardBorder h-16 fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 shadow-sm">

            {/* LEFT: Hamburger (Mobile/Tablet) + Brand */}
            <div className="flex items-center gap-4 w-64">
                {/* Hamburger Menu - Mobile/Tablet Only */}
                <button
                    onClick={onMenuToggle}
                    className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors text-ashWhite"
                    aria-label="Toggle menu"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <Link href="/admin" className="flex items-center gap-2 group">
                    <div className="w-28 h-9 relative">
                        <Image src="/logo.svg" fill alt="CheezyBite" className="object-contain" />
                    </div>
                    <div>
                        <div className="text-[10px] text-ashWhite/50 uppercase tracking-wider font-semibold border-l border-white/10 pl-2 ml-1">Admin Panel</div>
                    </div>
                </Link>
            </div>

            {/* CENTER: Navigation / Search */}
            <div className="flex-1 flex items-center justify-center gap-8 px-8">
                {/* Global Search */}
                <div className="relative w-full max-w-md hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ashWhite/30" />
                    <input
                        type="text"
                        placeholder="Search orders, products, customers..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full bg-jetBlack border border-cardBorder rounded-lg pl-10 pr-4 py-2 text-sm text-ashWhite placeholder-ashWhite/30 focus:outline-none focus:border-primary/50 transition-all"
                    />
                </div>

                {/* Quick Links (Desktop) */}
                <div className="hidden xl:flex items-center gap-1">
                    <Link href="/admin/orders" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-ashWhite/60 hover:text-ashWhite hover:bg-white/5 rounded-lg transition-colors">
                        <ShoppingBag className="w-4 h-4" />
                        Orders
                    </Link>
                    <Link href="/admin/customers" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-ashWhite/60 hover:text-ashWhite hover:bg-white/5 rounded-lg transition-colors">
                        <Users className="w-4 h-4" />
                        Customers
                    </Link>
                </div>
            </div>

            {/* RIGHT: Actions & Profile */}
            <div className="flex items-center gap-4 justify-end w-64">
                {/* Notifications */}
                <Link href="/admin/notifications">
                    <button className="relative p-2 text-ashWhite/60 hover:text-ashWhite hover:bg-white/5 rounded-full transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-charcoalBlack"></span>
                    </button>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-white/5 transition-colors border border-transparent hover:border-cardBorder"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white font-bold text-xs shadow-lg uppercase">
                            {currentUser?.username?.substring(0, 2) || (userRole === 'Super Admin' ? 'SA' : 'MA')}
                        </div>
                        <div className="hidden md:block text-left mr-1">
                            <div className="text-sm font-medium text-ashWhite leading-none mb-0.5 capitalize">{currentUser?.username || 'Admin User'}</div>
                            <div className="text-[10px] text-primary font-semibold uppercase tracking-wide">{userRole || 'Admin'}</div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-ashWhite/40 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsProfileOpen(false)}
                            />
                            <div className="absolute right-0 top-full mt-2 w-56 bg-charcoalBlack border border-cardBorder rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                                <div className="px-4 py-3 border-b border-white/5">
                                    <p className="text-sm font-medium text-ashWhite">Signed in as</p>
                                    <p className="text-xs text-ashWhite/50 truncate font-mono">{currentUser?.email || 'admin@cheezybite.com'}</p>
                                </div>
                                <div className="py-1">
                                    <Link href="/admin/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-ashWhite/70 hover:text-ashWhite hover:bg-white/5">
                                        <Settings className="w-4 h-4" />
                                        Settings
                                    </Link>
                                </div>
                                <div className="py-1 border-t border-white/5">
                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
