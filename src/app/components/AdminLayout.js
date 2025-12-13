"use client";

import { useAdmin } from '../context/AdminContext';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, PieChart, ShoppingBag, Settings, LogOut, Menu, X, Layers, Package, Pizza as PizzaIcon, Users, ShieldAlert } from 'lucide-react';
import AdminHeader from '../components/AdminHeader';

const AdminLayout = ({ children }) => {
    const { isAuthenticated, userRole, logout, loading } = useAdmin();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Full Menu
    const allNavItems = [
        { name: 'Dashboard', href: '/admin', icon: Home, roles: ['Super Admin', 'Manager'] },
        { name: 'Orders', href: '/admin/orders', icon: Package, roles: ['Super Admin', 'Manager'] },
        { name: 'Pizzas', href: '/admin/pizzas', icon: PizzaIcon, roles: ['Super Admin', 'Manager'] },
        { name: 'Toppings', href: '/admin/toppings', icon: Layers, roles: ['Super Admin', 'Manager'] },
        { name: 'Customers', href: '/admin/customers', icon: Users, roles: ['Super Admin', 'Manager'] },
        { name: 'Analytics', href: '/admin/analytics', icon: PieChart, roles: ['Super Admin'] },
        { name: 'Admin Users', href: '/admin/admin-users', icon: ShieldAlert, roles: ['Super Admin'] },
    ];

    // Filter based on Role
    const navItems = allNavItems.filter(item =>
        userRole && item.roles.includes(userRole)
    );

    // Auth & Permission Protection
    useEffect(() => {
        if (loading) return;

        if (!isAuthenticated) {
            router.push('/admin/login');
            return;
        }

        // Check for Restricted Access (Manager trying to access Super Admin pages)
        if (userRole === 'Manager') {
            const restrictedRoutes = ['/admin/analytics', '/admin/admin-users'];
            if (restrictedRoutes.some(route => pathname?.startsWith(route))) {
                router.push('/admin'); // Redirect to Dashboard
            }
        }
    }, [loading, isAuthenticated, userRole, router, pathname]);

    if (loading) {
        return (
            <div className="min-h-screen bg-jetBlack">
                <AdminHeader />
                <div className="flex pt-16 h-screen">
                    <aside className="hidden lg:flex lg:flex-col w-64 bg-charcoalBlack border-r border-cardBorder fixed left-0 top-16 bottom-0 p-4 space-y-4">
                        <div className="h-4 w-24 bg-gray-800/50 rounded animate-pulse mb-4"></div>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-10 bg-gray-800/50 rounded-lg animate-pulse" />
                        ))}
                    </aside>
                    <main className="flex-1 lg:ml-64 p-6 lg:p-8 overflow-y-auto bg-jetBlack">
                        {children}
                    </main>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-jetBlack flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-jetBlack">
            {/* Top Fixed Header */}
            <AdminHeader />

            <div className="flex pt-16 h-screen">
                {/* Sidebar - Desktop */}
                <aside className="hidden lg:flex lg:flex-col w-64 bg-charcoalBlack border-r border-cardBorder fixed left-0 top-16 bottom-0 overflow-y-auto">

                    <div className="px-4 py-6">
                        <div className="text-xs font-semibold text-ashWhite/40 uppercase tracking-widest pl-2 mb-2">Main Menu</div>
                        <nav className="space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="flex items-center gap-3 px-4 py-3 text-ashWhite/70 hover:text-ashWhite hover:bg-white/5 rounded-lg transition-all group"
                                >
                                    <item.icon className="w-5 h-5 text-ashWhite/40 group-hover:text-primary transition-colors" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="mt-auto p-4 border-t border-cardBorder">
                        <Link href="/" target="_blank" className="flex items-center gap-3 px-4 py-3 text-ashWhite/50 hover:text-ashWhite hover:bg-white/5 rounded-lg transition-colors mb-2">
                            <ShoppingBag className="w-5 h-5" />
                            <span>View Live Shop</span>
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 lg:ml-64 p-6 lg:p-8 overflow-y-auto bg-jetBlack">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
