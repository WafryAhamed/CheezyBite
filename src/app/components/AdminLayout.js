"use client";

import { useAdmin } from '../context/AdminContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, PieChart, ShoppingBag, Settings, LogOut, Menu, X, Layers, Package, Pizza } from 'lucide-react';

const AdminLayout = ({ children }) => {
    const { isAuthenticated, logout, login, loading } = useAdmin();
    const [password, setPassword] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();

    const navItems = [
        { name: 'Dashboard', href: '/admin', icon: Home },
        { name: 'Pizzas', href: '/admin/pizzas', icon: Pizza },
        { name: 'Toppings', href: '/admin/toppings', icon: Layers },
        { name: 'Orders', href: '/admin/orders', icon: Package },
        { name: 'Analytics', href: '/admin/analytics', icon: PieChart },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-deepBlack flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Login Screen
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-deepBlack flex items-center justify-center p-4">
                <div className="bg-cardGrey rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/10">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
                            <Pizza className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">CheezyBite Admin</h1>
                        <p className="text-softGrey mt-2">Enter password to access dashboard</p>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); login(password); }} className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full px-4 py-3 bg-darkGrey border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-primary transition-all"
                        />
                        <button
                            type="submit"
                            className="w-full py-3 bg-primary hover:bg-primaryHover text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-primary/20"
                        >
                            Login
                        </button>
                    </form>

                    <p className="text-center text-softGrey text-sm mt-6">
                        Hint: password is <code className="text-white/60">admin123</code>
                    </p>

                    <Link href="/" className="block text-center text-primary hover:text-primaryHover mt-4">
                        ← Back to Store
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-deepBlack flex">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex lg:flex-col w-64 bg-darkGrey border-r border-white/10">
                <div className="p-6 border-b border-white/10">
                    <Link href="/admin" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                            <Pizza className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <div className="font-bold text-white">CheezyBite</div>
                            <div className="text-xs text-softGrey">Admin Panel</div>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors mb-2">
                        <ShoppingBag className="w-5 h-5" />
                        <span>View Store</span>
                    </Link>
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors w-full"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-darkGrey border-b border-white/10 px-4 py-3 flex items-center justify-between">
                <Link href="/admin" className="flex items-center gap-2">
                    <Pizza className="w-6 h-6 text-primary" />
                    <span className="font-bold text-white">Admin</span>
                </Link>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 text-softGrey hover:text-white"
                >
                    {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)}>
                    <aside className="w-64 h-full bg-darkGrey p-4" onClick={(e) => e.stopPropagation()}>
                        <nav className="space-y-1 mt-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.name}</span>
                                </Link>
                            ))}
                        </nav>
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-red-400 w-full">
                                <LogOut className="w-5 h-5" />
                                <span className="">Logout</span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 lg:pt-0 pt-14 overflow-auto">
                <div className="p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
