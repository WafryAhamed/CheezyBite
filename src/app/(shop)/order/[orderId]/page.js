'use client';

import React, { useContext, useEffect, useState } from 'react';
import { OrderContext } from '../../../context/OrderContext';
import { Package, Clock, MapPin, CheckCircle, Phone, ChefHat, Flame, Truck, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import SupportCard from '../../../components/SupportCard';
import { useSocket } from '../../../context/SocketContext';
import toast from 'react-hot-toast';
import { formatTime, formatRelativeTime } from '@/utils/dateFormatter';

const OrderPage = ({ params }) => {
    const { orderId } = React.use(params);

    // Fetch initial order data before any other hooks
    const [currentOrder, setCurrentOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const { activeOrder, stageMessages, cancelOrder } = useContext(OrderContext);

    // Socket.IO Integration - MUST be called before useState hooks
    const { socket, connect, subscribeToOrder, isConnected } = useSocket();

    const [orders, setOrders] = useState([]);

    // Feedback State
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                // Step 1: Check activeOrder (current context)
                if (activeOrder && activeOrder.id === orderId) {
                    setCurrentOrder(activeOrder);
                    setLoading(false);
                    return;
                }

                // Step 2: Try direct order fetch FIRST (for both logged-in and guest users)
                // This prevents race conditions where order exists but not yet in list
                try {
                    const response = await fetch(`/api/orders/${orderId}`, {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        const result = await response.json();
                        if (result.success && result.data) {
                            setCurrentOrder(result.data);
                            setLoading(false);
                            return;
                        }
                    }
                } catch (directFetchError) {
                    console.log('Direct order fetch failed, trying list endpoint', directFetchError);
                }

                // Step 3: Fallback to list endpoint (for logged-in users)
                try {
                    const response = await fetch('/api/orders', {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        const result = await response.json();
                        const orders = result.data || [];
                        const orderFromAPI = orders.find(o => o.id === orderId);

                        if (orderFromAPI) {
                            setCurrentOrder(orderFromAPI);
                            setLoading(false);
                            return;
                        }
                    }
                } catch (apiError) {
                    console.log('List API fetch failed', apiError);
                }

                // Order not found after all attempts
                console.warn(`Order ${orderId} not found`);
                setCurrentOrder(null);

            } catch (error) {
                console.error('Error fetching order:', error);
                setCurrentOrder(null);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, activeOrder]);

    useEffect(() => {
        // Only set up socket listeners if we have currentOrder
        if (!currentOrder || !orderId) return;

        // 1. Connect and Subscribe
        connect();
        subscribeToOrder(orderId);

        // 2. Polling Fallback (if socket disconnects)
        let pollingInterval = null;

        const startPolling = () => {
            // Poll every 10 seconds
            pollingInterval = setInterval(async () => {
                try {
                    const response = await fetch('/api/orders', {
                        method: 'GET',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (response.ok) {
                        const result = await response.json();
                        const orders = result.data || [];
                        const updatedOrder = orders.find(o => o.id === orderId);

                        if (updatedOrder) {
                            setCurrentOrder(prev => {
                                // Only update if status changed
                                if (prev.currentStage !== updatedOrder.currentStage) {
                                    toast.success(`Order Updated: ${updatedOrder.status}`, {
                                        icon: '🔄',
                                        duration: 3000
                                    });
                                }
                                return updatedOrder;
                            });
                        }
                    }
                } catch (error) {
                    console.error('Polling error:', error);
                }
            }, 10000); // 10 seconds
        };

        // Start polling if socket not connected
        if (!isConnected) {
            console.log('Socket not connected, starting polling fallback');
            startPolling();
        }

        // 3. Listen for Socket Updates
        if (socket && isConnected) {
            const handleUpdate = (data) => {
                console.log("Order Update Received:", data);
                setCurrentOrder(prev => ({
                    ...prev,
                    status: data.status,
                    currentStage: data.currentStage,
                    // If delivered, update delivery time
                    ...(data.currentStage === 4 ? {
                        actualDeliveryTime: data.timestamp || new Date()
                    } : {})
                }));

                toast.success(`Order Updated: ${data.status}`, {
                    icon: '🚀',
                    duration: 4000
                });
            };

            const handleDelivery = (data) => {
                setCurrentOrder(prev => ({
                    ...prev,
                    status: 'Delivered',
                    currentStage: 4,
                    actualDeliveryTime: data.timestamp
                }));
                toast.success("Order Delivered! Enjoy!", { icon: '🎉' });
            };

            socket.on('order:update', handleUpdate);
            socket.on('order:delivered', handleDelivery);
            socket.on('order:statusChanged', handleUpdate);

            return () => {
                socket.off('order:update', handleUpdate);
                socket.off('order:delivered', handleDelivery);
                socket.off('order:statusChanged', handleUpdate);
                if (pollingInterval) clearInterval(pollingInterval);
            };
        }

        return () => {
            if (pollingInterval) clearInterval(pollingInterval);
        };
    }, [orderId, socket, isConnected, connect, subscribeToOrder, currentOrder]);

    // Show loading state - all hooks already called above
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-ashWhite">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p>Loading Order #{orderId}...</p>
            </div>
        );
    }

    // Show error if order not found
    if (!currentOrder) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-ashWhite container mx-auto px-4">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-3xl font-bold mb-2">Order Not Found</h1>
                <p className="text-ashWhite/60 mb-8">
                    We couldn't find order <span className="text-primary">#{orderId}</span>
                </p>
                <Link href="/menu" className="bg-primary hover:bg-secondary text-black px-6 py-2 rounded-lg font-bold transition">
                    Back to Shop
                </Link>
            </div>
        );
    }

    const { currentStage, items, total, address } = currentOrder;
    const currentStageIndex = currentOrder.currentStage || 0;

    const handleFeedbackSubmit = () => { // Fixed hooks duplicate issue
        if (rating === 0) return;

        // Update Order with Feedback
        const updatedOrder = { ...currentOrder, feedback: { rating, comment } };

        // Update History
        const history = JSON.parse(localStorage.getItem('cheezybite_orders') || '[]');
        const updatedHistory = history.map(o => o.id === orderId ? updatedOrder : o);

        if (!history.find(o => o.id === orderId)) {
            updatedHistory.push(updatedOrder);
        }

        localStorage.setItem('cheezybite_orders', JSON.stringify(updatedHistory));
        setIsFeedbackSubmitted(true);
    };

    return (
        <div className='container mx-auto px-4 pt-24 pb-12 min-h-screen'>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div>
                    <span className="text-secondary font-bold uppercase tracking-widest text-sm">Order #{orderId}</span>
                    <h1 className="text-4xl font-bangers text-ashWhite">
                        {currentStageIndex >= 4 ? 'Delivered!' : stageMessages[currentStageIndex]?.message || 'Processing...'}
                    </h1>
                </div>
                <div className="bg-softBlack px-6 py-3 rounded-xl border border-cardBorder text-right">
                    <div className="text-xs text-ashWhite/60 uppercase font-bold tracking-widest">Status</div>
                    <div className="text-2xl font-bold text-primary">
                        {stageMessages[currentStageIndex]?.name}
                    </div>
                </div>
            </div>

            {/* Address */}
            <div className="text-ashWhite/60 mb-8 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{address?.street}, {address?.city} {address?.phone && `(${address.phone})`}</span>
            </div>

            {/* Delivery Instructions Display */}
            {currentOrder.deliveryInstructions && (
                <div className="bg-softBlack/50 border border-white/10 p-4 rounded-xl mb-8 flex items-start gap-3">
                    <span className="text-xl">📝</span>
                    <div>
                        <h4 className="text-xs font-bold text-ashWhite/60 uppercase tracking-wider mb-1">Delivery Instructions</h4>
                        <p className="text-ashWhite italic">"{currentOrder.deliveryInstructions}"</p>
                    </div>
                </div>
            )}

            {/* Progress Timeline */}
            <div className="bg-charcoalBlack border border-cardBorder p-8 rounded-2xl mb-8 relative overflow-hidden">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-8 right-8 h-1 bg-white/10 -translate-y-[60px] md:-translate-y-1/2 hidden md:block"></div>
                <div className="absolute top-8 bottom-8 left-[27px] w-1 bg-white/10 md:hidden"></div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
                    {stageMessages.map((step, index) => {
                        const isActive = index <= currentStageIndex;
                        const isCurrent = index === currentStageIndex;

                        return (
                            <div key={index} className="flex md:flex-col items-center gap-4 md:gap-3 md:text-center">
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500
                             ${isActive ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'bg-softBlack border-white/10 text-white/20'}
                             ${isCurrent ? 'scale-110 animate-pulse' : ''}
                         `}>
                                    <span className="text-xl">{step.emoji}</span>
                                </div>
                                <div>
                                    <h3 className={`font-bold capitalize text-sm md:text-base ${isActive ? 'text-ashWhite' : 'text-ashWhite/40'}`}>
                                        {step.name}
                                    </h3>
                                    {isActive && (() => {
                                        // Find timestamp from statusHistory
                                        const historyEntry = currentOrder.statusHistory?.find(h => h.stage === index);
                                        const timestamp = historyEntry?.timestamp;

                                        return (
                                            <span className="text-xs text-secondary font-bold block mt-1">
                                                {timestamp ? formatRelativeTime(timestamp) : (index === currentStageIndex ? 'Current Step' : 'Completed')}
                                            </span>
                                        );
                                    })()}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>



            {/* Feedback Section - Only if Delivered */}
            {currentStageIndex >= 4 && (
                <div className="bg-gradient-to-br from-charcoalBlack to-softBlack border border-cardBorder p-8 rounded-2xl mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {!isFeedbackSubmitted ? (
                        <>
                            <h2 className="text-2xl font-bold text-ashWhite mb-2">How was your order?</h2>
                            <p className="text-ashWhite/60 mb-6">Rate your experience to help us improve.</p>

                            <div className="flex justify-center gap-2 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`transition-all hover:scale-110 ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-ashWhite/20'}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill={rating >= star ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                    </button>
                                ))}
                            </div>

                            <textarea
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-ashWhite focus:border-primary outline-none mb-4 min-h-[100px]"
                                placeholder="Tell us what you liked..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />

                            <button
                                onClick={handleFeedbackSubmit}
                                disabled={rating === 0}
                                className="btn btn-lg bg-primary text-white font-bold py-3 px-8 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Submit Feedback
                            </button>
                        </>
                    ) : (
                        <div className="py-8">
                            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-ashWhite">Thank You!</h3>
                            <p className="text-ashWhite/60">Your feedback has been recorded.</p>
                        </div>
                    )}
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Help Section */}
                <div className="lg:col-span-2 space-y-6">
                    <SupportCard />

                    {/* Cancel Logic Section - Restored */}
                    <div className="bg-softBlack border border-cardBorder rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div>
                            <h3 className="text-xl font-bold text-ashWhite mb-1">Manage Order</h3>
                            {currentStageIndex > 0 && currentStageIndex < 4 && currentOrder.status !== 'Cancelled' && (
                                <p className="text-ashWhite/60 text-sm">
                                    Cancellation is only available before preparation begins.
                                </p>
                            )}
                        </div>
                        <div className="flex gap-4">
                            {/* Cancel Button - Only show if not delivered or cancelled */}
                            {currentStageIndex < 4 && currentOrder.status !== 'Cancelled' && (
                                <button
                                    onClick={cancelOrder}
                                    disabled={currentStageIndex > 0} // Only allow in first stage (Order Placed = 0)
                                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all border ${currentStageIndex > 0
                                        ? 'bg-transparent border-white/10 text-white/20 cursor-not-allowed'
                                        : 'bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20'
                                        }`}
                                >
                                    <AlertCircle className="w-4 h-4" />
                                    {currentStageIndex > 0 ? 'Cannot Cancel' : 'Cancel Order'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order Summary (Dynamic) */}
                <div className="lg:col-span-1">
                    <div className="bg-charcoalBlack rounded-2xl p-6 border border-cardBorder">
                        <h3 className="font-bold text-ashWhite mb-4 border-b border-cardBorder pb-2">Order Summary</h3>
                        <div className="space-y-3 mb-4 h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary">
                            {items && items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm text-ashWhite/80 border-b border-white/5 pb-2">
                                    <div className="flex flex-col">
                                        <span>{item.amount}x {item.name} <span className='text-xs text-white/40'>({item.size})</span></span>
                                        {item.additionalTopping && item.additionalTopping.length > 0 && (
                                            <span className="text-xs text-secondary">+ {item.additionalTopping.length} Toppings</span>
                                        )}
                                    </div>
                                    <span>Rs. {(item.price * item.amount).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between font-bold text-ashWhite pt-2 border-t border-cardBorder">
                            <span>Total Paid</span>
                            <span>Rs. {(parseFloat(total || 0) + 350).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderPage;
