"use client";

import { useAdmin } from '../../context/AdminContext';
import { useState, useEffect } from 'react';
import { RefreshCw, ChevronDown, ChevronUp, Clock, CheckCircle } from 'lucide-react';

export default function OrdersPage() {
    const { orders, updateOrderStatus, refreshOrders } = useAdmin();
    const [expandedOrder, setExpandedOrder] = useState(null);

    const stageNames = ['Order Placed', 'Preparing', 'Baking', 'Out for Delivery', 'Delivered'];
    const stageEmojis = ['✅', '👨‍🍳', '🔥', '🚴', '🎉'];
    const stageColors = ['bg-blue-500', 'bg-yellow-500', 'bg-orange-500', 'bg-purple-500', 'bg-green-500'];

    // Auto-refresh orders every 30 seconds
    useEffect(() => {
        const interval = setInterval(refreshOrders, 30000);
        return () => clearInterval(interval);
    }, [refreshOrders]);

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleString();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Order Management</h1>
                    <p className="text-gray-400">{orders.length} total orders</p>
                </div>
                <button
                    onClick={refreshOrders}
                    className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {orders.length === 0 ? (
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
                    <p className="text-gray-400">No orders yet. Orders will appear here when customers place them.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
                        >
                            {/* Order Header */}
                            <div
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-700/50 transition-colors"
                                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 ${stageColors[order.currentStage]} rounded-lg flex items-center justify-center`}>
                                        <span className="text-lg">{stageEmojis[order.currentStage]}</span>
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold">Order #{order.id.toString().slice(-6)}</p>
                                        <p className="text-gray-400 text-sm">{formatDate(order.createdAt || order.timestamp)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-white font-semibold">${order.total?.toFixed(2)}</p>
                                        <p className="text-gray-400 text-sm">{order.items?.length || 0} items</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm ${stageColors[order.currentStage]} text-white`}>
                                        {stageNames[order.currentStage]}
                                    </span>
                                    {expandedOrder === order.id ? (
                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedOrder === order.id && (
                                <div className="border-t border-gray-700 p-4 space-y-4">
                                    {/* Order Items */}
                                    <div>
                                        <h4 className="text-gray-400 text-sm font-medium mb-2">Order Items</h4>
                                        <div className="space-y-2">
                                            {order.items?.map((item, index) => (
                                                <div key={index} className="flex justify-between text-sm bg-gray-700/50 rounded-lg p-3">
                                                    <div>
                                                        <span className="text-white capitalize">{item.name}</span>
                                                        <span className="text-gray-400 ml-2">x{item.amount}</span>
                                                        {item.size && <span className="text-gray-500 ml-2">({item.size})</span>}
                                                    </div>
                                                    <span className="text-green-400">${(item.price * item.amount).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Status Update */}
                                    <div>
                                        <h4 className="text-gray-400 text-sm font-medium mb-2">Update Status</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {stageNames.map((stage, index) => (
                                                <button
                                                    key={stage}
                                                    onClick={() => updateOrderStatus(order.id, index)}
                                                    disabled={order.currentStage === index}
                                                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${order.currentStage === index
                                                        ? `${stageColors[index]} text-white cursor-default`
                                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                        }`}
                                                >
                                                    {stageEmojis[index]} {stage}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
