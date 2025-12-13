"use client";

import { useAdmin } from '../context/AdminContext';
import Link from 'next/link';
import { ShoppingBag, TrendingUp, Package, DollarSign, Clock, CheckCircle, Pizza } from 'lucide-react';

export default function AdminDashboard() {
    const { analytics, orders, pizzas, toppings, loading } = useAdmin();

    if (loading || !analytics) {
        return <div className="text-white">Loading...</div>;
    }

    const recentOrders = orders.slice(0, 5);
    const stageNames = ['Placed', 'Preparing', 'Baking', 'Delivery', 'Delivered'];
    const stageColors = ['bg-blue-500', 'bg-yellow-500', 'bg-orange-500', 'bg-purple-500', 'bg-green-500'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-gray-400">Welcome back! Here's what's happening.</p>
                </div>
                <Link
                    href="/admin/orders"
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Package className="w-4 h-4" />
                    View All Orders
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Total Orders</p>
                            <p className="text-2xl font-bold text-white">{analytics.totalOrders}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Total Revenue</p>
                            <p className="text-2xl font-bold text-white">${analytics.totalRevenue.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                            <Pizza className="w-6 h-6 text-secondary" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Active Pizzas</p>
                            <p className="text-2xl font-bold text-white">{analytics.activePizzas} / {analytics.totalPizzas}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Avg Order Value</p>
                            <p className="text-2xl font-bold text-white">${analytics.avgOrderValue.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders by Status */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-4">Orders by Status</h2>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {Object.entries(analytics.ordersByStatus).map(([status, count], index) => (
                        <div key={status} className="text-center">
                            <div className={`w-12 h-12 ${stageColors[index]} rounded-full flex items-center justify-center mx-auto mb-2`}>
                                <span className="text-white font-bold">{count}</span>
                            </div>
                            <p className="text-gray-400 text-sm capitalize">{status}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Popular Pizzas */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-lg font-semibold text-white mb-4">Popular Pizzas</h2>
                    {analytics.popularPizzas.length > 0 ? (
                        <div className="space-y-3">
                            {analytics.popularPizzas.map((pizza, index) => (
                                <div key={pizza.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-xs text-gray-400">
                                            {index + 1}
                                        </span>
                                        <span className="text-white capitalize">{pizza.name}</span>
                                    </div>
                                    <span className="text-gray-400">{pizza.count} orders</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No orders yet</p>
                    )}
                </div>

                {/* Recent Orders */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-lg font-semibold text-white mb-4">Recent Orders</h2>
                    {recentOrders.length > 0 ? (
                        <div className="space-y-3">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                                    <div>
                                        <p className="text-white font-medium">#{order.id.toString().slice(-6)}</p>
                                        <p className="text-gray-400 text-sm">${order.total?.toFixed(2)}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs ${stageColors[order.currentStage]} text-white`}>
                                        {stageNames[order.currentStage]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No orders yet</p>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-3 gap-4">
                <Link href="/admin/pizzas" className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 border border-gray-700 transition-colors group">
                    <Pizza className="w-8 h-8 text-primary mb-3" />
                    <h3 className="text-white font-semibold group-hover:text-primary transition-colors">Manage Pizzas</h3>
                    <p className="text-gray-400 text-sm">Add, edit, or disable pizzas</p>
                </Link>
                <Link href="/admin/toppings" className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 border border-gray-700 transition-colors group">
                    <Package className="w-8 h-8 text-secondary mb-3" />
                    <h3 className="text-white font-semibold group-hover:text-secondary transition-colors">Manage Toppings</h3>
                    <p className="text-gray-400 text-sm">Update prices & availability</p>
                </Link>
                <Link href="/admin/analytics" className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 border border-gray-700 transition-colors group">
                    <TrendingUp className="w-8 h-8 text-green-500 mb-3" />
                    <h3 className="text-white font-semibold group-hover:text-green-500 transition-colors">View Analytics</h3>
                    <p className="text-gray-400 text-sm">Revenue & performance data</p>
                </Link>
            </div>
        </div>
    );
}
