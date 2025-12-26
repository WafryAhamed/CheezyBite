"use client";

import { useAdmin } from '../../context/AdminContext';
import { useState, useEffect } from 'react';
import { RefreshCw, ChevronDown, ChevronUp, Clock, CheckCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { formatDateTime, formatRelativeTime } from '@/utils/dateFormatter';

export default function OrdersPage() {
    const { orders, updateOrderStatus, refreshOrders } = useAdmin();
    const searchParams = useSearchParams();
    const query = searchParams.get('q')?.toLowerCase() || '';
    const [expandedOrder, setExpandedOrder] = useState(null);

    // Filter orders
    const filteredOrders = orders.filter(order => {
        if (!query) return true;
        const id = order.id.toString().toLowerCase();
        const total = order.total?.toString();
        // Check items
        const hasItem = order.items?.some(item => item.name.toLowerCase().includes(query));

        return id.includes(query) || total.includes(query) || hasItem;
    });

    const stageNames = ['Order Placed', 'Preparing', 'Baking', 'Out for Delivery', 'Delivered'];
    const stageEmojis = ['✅', '👨‍🍳', '🔥', '🚴', '🎉'];
    const stageColors = ['bg-blue-500', 'bg-yellow-500', 'bg-orange-500', 'bg-purple-500', 'bg-green-500'];

    // Auto-refresh orders every 30 seconds
    useEffect(() => {
        const interval = setInterval(refreshOrders, 30000);
        return () => clearInterval(interval);
    }, [refreshOrders]);

    const getStageColor = (stage) => {
        if (stage === -1) return 'bg-red-500';
        return stageColors[stage] || 'bg-gray-500';
    };

    const getStageName = (stage) => {
        if (stage === -1) return 'Cancelled';
        return stageNames[stage] || 'Unknown';
    };

    const getStageEmoji = (stage) => {
        if (stage === -1) return '❌';
        return stageEmojis[stage] || '❓';
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

            {filteredOrders.length === 0 ? (
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
                    <p className="text-gray-400">No matching orders found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* API already returns orders sorted newest first (createdAt: -1) */}\n                    {filteredOrders.map((order) => (
                        <div
                            key={order.id}
                            className={`bg-gray-800 rounded-xl border overflow-hidden ${order.currentStage === -1 ? 'border-red-500/30' : 'border-gray-700'}`}
                        >
                            {/* Order Header */}
                            <div
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-700/50 transition-colors"
                                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 ${getStageColor(order.currentStage)} rounded-lg flex items-center justify-center`}>
                                        <span className="text-lg">{getStageEmoji(order.currentStage)}</span>
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold">Order #{order.id.toString().slice(-6)}</p>
                                        <div className="space-y-0.5 mt-1">
                                            <p className="text-gray-400 text-xs flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span className="text-gray-500">Placed:</span> {formatDateTime(order.createdAt)}
                                            </p>
                                            <p className="text-gray-400 text-xs flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span className="text-gray-500">Updated:</span> {formatRelativeTime(order.updatedAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-white font-semibold">Rs. {order.total?.toFixed(2)}</p>
                                        <p className="text-gray-400 text-sm">{order.items?.length || 0} items</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm ${getStageColor(order.currentStage)} text-white`}>
                                        {getStageName(order.currentStage)}
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
                                    {/* Actions for New Orders */}
                                    {order.currentStage === 0 && (
                                        <div className="flex gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateOrderStatus(order.id, 1); // Accept -> Preparing
                                                }}
                                                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                                Accept Order
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateOrderStatus(order.id, -1); // Reject -> Cancelled
                                                }}
                                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
                                            >
                                                ❌ Reject Order
                                            </button>
                                        </div>
                                    )}

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
                                                    <span className="text-green-400">Rs. {(item.price * item.amount).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Manual Status Overrides (Hidden for Cancelled) */}
                                    {order.currentStage !== -1 && (
                                        <div>
                                            <h4 className="text-gray-400 text-sm font-medium mb-2">Manual Status Override</h4>
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
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, -1)}
                                                    className="px-3 py-2 rounded-lg text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20"
                                                >
                                                    ❌ Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
