"use client";

import { useAdmin } from '../context/AdminContext';
import { useSocket } from '../context/SocketContext';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ShoppingBag, TrendingUp, Package, DollarSign, Clock, CheckCircle, Pizza, Star } from 'lucide-react';
import AdminCard from '../components/admin/AdminCard';

export default function AdminDashboard() {
    const { analytics, orders, pizzas, toppings, loading, refreshOrders, refreshAnalytics, userRole } = useAdmin();
    const { socket, subscribeToAdminDashboard } = useSocket();

    // Subscribe to real-time updates
    useEffect(() => {
        subscribeToAdminDashboard();

        if (socket) {
            const handleNewOrder = (data) => {
                toast.success(`New Order Received! (#${data.orderId})`, {
                    icon: '🔔',
                    duration: 5000
                });
                refreshOrders();
                refreshAnalytics(); // Also refresh analytics
            };

            const handleOrderUpdate = () => {
                refreshOrders();
                refreshAnalytics(); // Also refresh analytics  
            };

            socket.on('order:created', handleNewOrder);
            socket.on('order:updated', handleOrderUpdate); // Listen to actual event from API
            socket.on('order:statusChanged', handleOrderUpdate);

            return () => {
                socket.off('order:created', handleNewOrder);
                socket.off('order:updated', handleOrderUpdate);
                socket.off('order:statusChanged', handleOrderUpdate);
            };
        }
    }, [socket, subscribeToAdminDashboard, refreshOrders, refreshAnalytics]);

    if (loading || !analytics) {
        return (
            <div className="space-y-6 animate-pulse">
                {/* Header Skeleton */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                        <div className="h-8 w-48 bg-gray-800 rounded-lg"></div>
                        <div className="h-4 w-64 bg-gray-800/50 rounded-lg"></div>
                    </div>
                    <div className="h-10 w-40 bg-gray-800 rounded-lg"></div>
                </div>

                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-gray-800 rounded-xl p-6 border border-gray-700/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                                <div className="space-y-2">
                                    <div className="h-3 w-20 bg-gray-700 rounded"></div>
                                    <div className="h-6 w-24 bg-gray-700 rounded"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Orders by Status Skeleton */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700/50">
                    <div className="h-6 w-32 bg-gray-700 rounded mb-4"></div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                                <div className="h-3 w-16 bg-gray-700 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Charts Grid Skeleton */}
                <div className="grid lg:grid-cols-2 gap-6">
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700/50 h-[300px]"></div>
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700/50 h-[300px]"></div>
                </div>

                {/* Reviews Skeleton */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700/50">
                    <div className="h-6 w-40 bg-gray-700 rounded mb-4"></div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-gray-700/30 p-4 rounded-lg h-24"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const recentOrders = (orders || []).slice(0, 5);
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
                <AdminCard
                    variant="blue"
                    title="Total Orders"
                    value={analytics?.totalOrders || 0}
                    icon={ShoppingBag}
                />
                <AdminCard
                    variant="green"
                    title="Total Revenue"
                    value={`Rs. ${(analytics?.totalRevenue || 0).toLocaleString()}`}
                    icon={DollarSign}
                />
                <AdminCard
                    variant="orange"
                    title="Active Pizzas"
                    value={`${analytics?.activePizzas || 0} / ${analytics?.totalPizzas || 0}`}
                    icon={Pizza}
                />
                <AdminCard
                    variant="purple"
                    title="Avg Order Value"
                    value={`Rs. ${(analytics?.avgOrderValue || 0).toFixed(0)}`}
                    icon={TrendingUp}
                />
            </div>

            {/* Orders by Status */}
            <AdminCard variant="blue" title="Orders by Status" className="border-gray-700">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-4">
                    {Object.entries(analytics?.ordersByStatus || {}).map(([status, count], index) => (
                        <div key={status} className="text-center">
                            <div className={`w-12 h-12 ${stageColors[index]} rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg shadow-black/20`}>
                                <span className="text-white font-bold">{count}</span>
                            </div>
                            <p className="text-gray-400 text-sm capitalize">{status}</p>
                        </div>
                    ))}
                </div>
            </AdminCard>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Popular Pizzas */}
                <AdminCard variant="orange" title="Popular Pizzas" icon={Pizza}>
                    {(analytics?.popularPizzas || []).length > 0 ? (
                        <div className="space-y-3 mt-4">
                            {(analytics?.popularPizzas || []).map((pizza, index) => (
                                <div key={pizza.name} className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5 hover:bg-black/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold ${index === 0 ? 'bg-yellow-500' : 'bg-gray-700'}`}>
                                            {index + 1}
                                        </span>
                                        <span className="text-white capitalize">{pizza.name}</span>
                                    </div>
                                    <span className="text-orange-200 font-mono">{pizza.count} orders</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 mt-4">No orders yet</p>
                    )}
                </AdminCard>

                {/* Recent Orders */}
                <AdminCard variant="blue" title="Recent Orders" icon={Clock}>
                    {recentOrders.length > 0 ? (
                        <div className="space-y-3 mt-4">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5 hover:bg-black/30 transition-colors">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-white font-bold font-mono">#{order.id.toString().slice(-6)}</p>
                                            <span className="text-xs text-gray-400">({order.items?.length || 0} items)</span>
                                        </div>
                                        <p className="text-blue-200 font-bold text-sm">Rs. {order.total?.toFixed(0)}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${stageColors[order.currentStage]} text-white shadow-sm`}>
                                        {stageNames[order.currentStage]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 mt-4">No orders yet</p>
                    )}
                </AdminCard>
            </div>

            {/* Reviews Section */}
            <AdminCard title="Recent Feedback" icon={Star} className="!bg-slate-900/40 !border-slate-700/50 !bg-none">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    {[
                        { name: 'Ruwan Perera', comment: 'Best pizza in Colombo! The cheese layer is amazing.', rating: 5, time: '2 mins ago', initial: 'R', color: 'bg-blue-600' },
                        { name: 'Fatima Rimzan', comment: 'Superb service and delicious taste. Kids loved the Cheesy Bliss!', rating: 5, time: '15 mins ago', initial: 'F', color: 'bg-pink-600' },
                        { name: 'S. Mahendran', comment: 'Authentic flavors, really good value for money. Keep it up!', rating: 5, time: '1 hour ago', initial: 'S', color: 'bg-purple-600' },
                        { name: 'Mohamed Nazeem', comment: 'Delivery was very fast. Hot and spicy just like we like it.', rating: 5, time: '2 hours ago', initial: 'M', color: 'bg-green-600' }
                    ].map((review, i) => (
                        <div key={i} className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/50 hover:bg-slate-900/60 transition-colors">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-8 h-8 rounded-full ${review.color} flex items-center justify-center text-white font-bold text-xs ring-2 ring-white/10`}>
                                    {review.initial}
                                </div>
                                <div>
                                    <div className="text-white text-sm font-medium">{review.name}</div>
                                    <div className="flex text-yellow-500">
                                        {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-300 text-xs italic line-clamp-2">"{review.comment}"</p>
                            <p className="text-gray-500 text-[10px] mt-2 text-right">{review.time}</p>
                        </div>
                    ))}
                </div>
            </AdminCard>

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-3 gap-4">
                <Link href="/admin/pizzas" className="block">
                    <AdminCard variant="orange" className="h-full hover:scale-[1.02] transition-transform cursor-pointer group">
                        <Pizza className="w-8 h-8 text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="text-white font-semibold group-hover:text-orange-400 transition-colors">Manage Pizzas</h3>
                        <p className="text-gray-400 text-sm mt-1">Add, edit, or disable pizzas</p>
                    </AdminCard>
                </Link>
                <Link href="/admin/toppings" className="block">
                    <AdminCard variant="green" className="h-full hover:scale-[1.02] transition-transform cursor-pointer group">
                        <Package className="w-8 h-8 text-green-500 mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="text-white font-semibold group-hover:text-green-400 transition-colors">Manage Toppings</h3>
                        <p className="text-gray-400 text-sm mt-1">Update prices & availability</p>
                    </AdminCard>
                </Link>
                {userRole !== 'Manager' && (
                    <Link href="/admin/analytics" className="block">
                        <AdminCard variant="purple" className="h-full hover:scale-[1.02] transition-transform cursor-pointer group">
                            <TrendingUp className="w-8 h-8 text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
                            <h3 className="text-white font-semibold group-hover:text-purple-400 transition-colors">View Analytics</h3>
                            <p className="text-gray-400 text-sm mt-1">Revenue & performance data</p>
                        </AdminCard>
                    </Link>
                )}
            </div>
        </div>
    );
}
