"use client";

import { useAdmin } from '../../context/AdminContext';
import { TrendingUp, ShoppingBag, DollarSign, PieChart } from 'lucide-react';

export default function AnalyticsPage() {
    const { analytics, orders, loading } = useAdmin();

    if (loading || !analytics) {
        return <div className="text-white">Loading...</div>;
    }

    // Calculate additional metrics
    const completedOrders = orders.filter(o => o.currentStage === 4).length;
    const completionRate = orders.length > 0 ? ((completedOrders / orders.length) * 100).toFixed(1) : 0;

    // Size preferences
    const sizeCounts = { small: 0, medium: 0, large: 0 };
    orders.forEach(order => {
        (order.items || []).forEach(item => {
            if (item.size === 'small') sizeCounts.small += item.amount;
            else if (item.size === 'medium') sizeCounts.medium += item.amount;
            else if (item.size === 'large') sizeCounts.large += item.amount;
        });
    });
    const totalSizes = sizeCounts.small + sizeCounts.medium + sizeCounts.large;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
                <p className="text-gray-400">Business insights and performance metrics</p>
            </div>

            {/* Key Metrics */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-6 border border-blue-500/20">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-gray-400">Total Orders</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{analytics.totalOrders}</p>
                    <p className="text-sm text-gray-400 mt-1">{completedOrders} completed</p>
                </div>

                <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-6 border border-green-500/20">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-400" />
                        </div>
                        <span className="text-gray-400">Total Revenue</span>
                    </div>
                    <p className="text-3xl font-bold text-white">${analytics.totalRevenue.toFixed(2)}</p>
                    <p className="text-sm text-gray-400 mt-1">Avg: ${analytics.avgOrderValue.toFixed(2)}/order</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-6 border border-purple-500/20">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="text-gray-400">Completion Rate</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{completionRate}%</p>
                    <p className="text-sm text-gray-400 mt-1">Orders delivered</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-xl p-6 border border-orange-500/20">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                            <PieChart className="w-5 h-5 text-orange-400" />
                        </div>
                        <span className="text-gray-400">Active Menu</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{analytics.activePizzas}</p>
                    <p className="text-sm text-gray-400 mt-1">of {analytics.totalPizzas} pizzas</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Daily Revenue Chart */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-lg font-semibold text-white mb-4">Daily Revenue (Last 7 Days)</h2>
                    <div className="space-y-3">
                        {analytics.dailyRevenue.map((day, index) => {
                            const maxRevenue = Math.max(...analytics.dailyRevenue.map(d => d.revenue), 1);
                            const width = (day.revenue / maxRevenue) * 100;
                            return (
                                <div key={index} className="flex items-center gap-4">
                                    <span className="text-gray-400 w-12 text-sm">{day.day}</span>
                                    <div className="flex-1 bg-gray-700 rounded-full h-6 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-end px-2"
                                            style={{ width: `${Math.max(width, 5)}%` }}
                                        >
                                            {width > 20 && (
                                                <span className="text-xs text-white font-medium">${day.revenue.toFixed(0)}</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-gray-400 text-sm w-16 text-right">{day.orders} orders</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Popular Pizzas */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-lg font-semibold text-white mb-4">Top Selling Pizzas</h2>
                    {analytics.popularPizzas.length > 0 ? (
                        <div className="space-y-3">
                            {analytics.popularPizzas.map((pizza, index) => {
                                const maxCount = Math.max(...analytics.popularPizzas.map(p => p.count), 1);
                                const width = (pizza.count / maxCount) * 100;
                                const colors = ['from-yellow-500 to-yellow-600', 'from-gray-400 to-gray-500', 'from-orange-600 to-orange-700', 'from-gray-500 to-gray-600', 'from-gray-500 to-gray-600'];
                                return (
                                    <div key={pizza.name} className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${colors[index]} flex items-center justify-center text-white font-bold text-sm`}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-white capitalize">{pizza.name}</span>
                                                <span className="text-gray-400">{pizza.count} sold</span>
                                            </div>
                                            <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${colors[index]} rounded-full`}
                                                    style={{ width: `${width}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500">No order data yet</p>
                    )}
                </div>

                {/* Size Preferences */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-lg font-semibold text-white mb-4">Size Preferences</h2>
                    {totalSizes > 0 ? (
                        <div className="space-y-4">
                            <div className="flex h-8 rounded-full overflow-hidden bg-gray-700">
                                <div className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${(sizeCounts.small / totalSizes) * 100}%` }}>
                                    S
                                </div>
                                <div className="bg-yellow-500 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${(sizeCounts.medium / totalSizes) * 100}%` }}>
                                    M
                                </div>
                                <div className="bg-green-500 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${(sizeCounts.large / totalSizes) * 100}%` }}>
                                    L
                                </div>
                            </div>
                            <div className="flex justify-around text-center">
                                <div>
                                    <div className="w-4 h-4 bg-blue-500 rounded mx-auto mb-1"></div>
                                    <p className="text-white font-semibold">{sizeCounts.small}</p>
                                    <p className="text-gray-400 text-sm">Small</p>
                                </div>
                                <div>
                                    <div className="w-4 h-4 bg-yellow-500 rounded mx-auto mb-1"></div>
                                    <p className="text-white font-semibold">{sizeCounts.medium}</p>
                                    <p className="text-gray-400 text-sm">Medium</p>
                                </div>
                                <div>
                                    <div className="w-4 h-4 bg-green-500 rounded mx-auto mb-1"></div>
                                    <p className="text-white font-semibold">{sizeCounts.large}</p>
                                    <p className="text-gray-400 text-sm">Large</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">No size data yet</p>
                    )}
                </div>

                {/* Order Status Distribution */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-lg font-semibold text-white mb-4">Order Status Distribution</h2>
                    <div className="grid grid-cols-5 gap-2">
                        {Object.entries(analytics.ordersByStatus).map(([status, count], index) => {
                            const colors = ['bg-blue-500', 'bg-yellow-500', 'bg-orange-500', 'bg-purple-500', 'bg-green-500'];
                            const emojis = ['✅', '👨‍🍳', '🔥', '🚴', '🎉'];
                            return (
                                <div key={status} className="text-center">
                                    <div className={`w-full aspect-square ${colors[index]} rounded-xl flex flex-col items-center justify-center`}>
                                        <span className="text-2xl">{emojis[index]}</span>
                                        <span className="text-white font-bold text-lg mt-1">{count}</span>
                                    </div>
                                    <p className="text-gray-400 text-xs mt-2 capitalize">{status}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
