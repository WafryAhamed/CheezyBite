"use client"

import React, { createContext, useState, useEffect, useCallback } from 'react';
import {
    loadActiveOrder,
    saveActiveOrder,
    updateOrderStatus,
    updateOrderStage,
    clearActiveOrder,
    saveToOrderHistory,
    createOrder as createOrderUtil
} from '../utils/orderManager';
import toast from 'react-hot-toast';

export const OrderContext = createContext();

const ORDER_STAGE_DURATION = 15000; // 15 seconds per stage

const STAGE_MESSAGES = [
    { name: 'Order Placed', emoji: '✅', message: 'Order confirmed!' },
    { name: 'Preparing', emoji: '👨‍🍳', message: 'Chef is preparing your pizza...' },
    { name: 'Baking', emoji: '🔥', message: 'Pizza is baking in the oven!' },
    { name: 'Out for Delivery', emoji: '🚴', message: 'Your pizza is on the way!' },
    { name: 'Delivered', emoji: '🎉', message: 'Delivered! Enjoy your meal!' }
];

export const OrderProvider = ({ children }) => {
    const [activeOrder, setActiveOrder] = useState(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const useBackend = process.env.NEXT_PUBLIC_USE_API_BACKEND === 'true';

    // Load active order on mount
    useEffect(() => {
        const loadOrder = async () => {
            if (useBackend) {
                // Check if we have an active order in DB? 
                // Maybe fetch latest active order from API
                try {
                    const { ordersService } = await import('@/services/ordersService');
                    // Need an endpoint to get active order. 
                    // GET /api/orders returns all. We can filter for active.
                    const response = await ordersService.getMyOrders();
                    if (response.success && response.data.length > 0) {
                        // Find most recent active order
                        const active = response.data.find(o => o.currentStage < 4 && o.status !== 'Cancelled');
                        if (active) {
                            setActiveOrder(active);
                            // Don't auto-open modal on reload, user might be doing something else
                        }
                    }
                } catch (e) {
                    console.error("Failed to load active order", e);
                }
            } else {
                const savedOrder = loadActiveOrder();
                if (savedOrder) {
                    setActiveOrder(savedOrder);
                    // setIsOrderModalOpen(true); // Don't force open on reload
                }
            }
        };
        loadOrder();
    }, [useBackend]);

    // Socket.IO / Polling for Updates
    useEffect(() => {
        if (!activeOrder || !useBackend || activeOrder.currentStage >= 4 || activeOrder.status === 'Cancelled') return;

        let socket = null;

        const connectSocket = async () => {
            try {
                // Dynamic import socket.io-client
                const { io } = await import('socket.io-client');
                const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
                socket = io(socketUrl);

                socket.on('connect', () => {
                    console.log('Socket connected');
                    // Join user room
                    // Need user ID. stored in activeOrder.userId
                    if (activeOrder.userId) {
                        socket.emit('join_user_room', activeOrder.userId);
                    }
                });

                socket.on('order_updated', (updatedOrder) => {
                    if (updatedOrder.id === activeOrder.id) {
                        setActiveOrder(updatedOrder);

                        // Show toast for stage change
                        const stageInfo = STAGE_MESSAGES[updatedOrder.currentStage];
                        if (stageInfo && updatedOrder.currentStage > activeOrder.currentStage) {
                            toast.success(`${stageInfo.emoji} ${stageInfo.message}`, {
                                duration: 4000,
                                position: 'top-center',
                            });
                        }

                        if (updatedOrder.currentStage === 4) {
                            // Delivered
                            setTimeout(() => {
                                clearActiveOrder(); // Clear local backup
                                setActiveOrder(null);
                                setIsOrderModalOpen(false);
                            }, 5000);
                        }
                    }
                });
            } catch (e) {
                console.error("Socket error", e);
            }
        };

        connectSocket();

        return () => {
            if (socket) socket.disconnect();
        };
    }, [activeOrder, useBackend]);

    // Auto-advance order stages (MOCK MODE ONLY)
    useEffect(() => {
        if (useBackend) return; // Disable mock simulation if using backend

        if (!activeOrder || activeOrder.currentStage >= 4) return;

        const timer = setTimeout(() => {
            const newStage = activeOrder.currentStage + 1;
            const stageInfo = STAGE_MESSAGES[newStage];

            const updatedOrder = updateOrderStage(
                activeOrder,
                newStage,
                stageInfo.message
            );

            setActiveOrder(updatedOrder);

            // Show toast notification
            toast.success(`${stageInfo.emoji} ${stageInfo.message}`, {
                duration: 4000,
                position: 'top-center',
            });

            // If delivered, save to history and clear active order
            if (newStage === 4) {
                setTimeout(() => {
                    saveToOrderHistory(updatedOrder);
                    clearActiveOrder();
                    setActiveOrder(null);
                    setIsOrderModalOpen(false);
                }, 5000);
            }
        }, ORDER_STAGE_DURATION);

        return () => clearTimeout(timer);
    }, [activeOrder, useBackend]);

    // Create new order
    const createOrder = useCallback(async (cart, cartTotal, orderDetails, onSuccess) => {
        if (useBackend) {
            try {
                const { ordersService } = await import('@/services/ordersService');
                // Construct API payload
                const orderPayload = {
                    items: cart,
                    total: cartTotal,
                    deliveryAddress: orderDetails.deliveryDetails, // Ensure structure matches
                    paymentMethod: orderDetails.paymentMethod
                };

                const response = await ordersService.create(orderPayload);
                if (response.success) {
                    const order = response.data.order;
                    setActiveOrder(order);
                    setIsOrderModalOpen(true);

                    toast.success('🎉 Order placed successfully! (Backend)', {
                        duration: 3000,
                        position: 'top-center',
                    });

                    if (onSuccess) onSuccess(order);
                    return order;
                }
            } catch (error) {
                toast.error(error.message || "Failed to place order");
                return null;
            }
        } else {
            const order = createOrderUtil(cart, cartTotal, orderDetails);
            saveActiveOrder(order);
            setActiveOrder(order);
            setIsOrderModalOpen(true);

            toast.success('🎉 Order placed successfully!', {
                duration: 3000,
                position: 'top-center',
            });

            if (onSuccess) onSuccess(order);
            return order;
        }
    }, [useBackend]);

    // Cancel order (Strict Logic)
    const cancelOrder = useCallback(async () => {
        if (!activeOrder) return;

        // ONLY ALLOW CANCEL IF STAGE IS 0 (Order Placed)
        if (activeOrder.currentStage > 0) {
            toast.error("Cannot cancel: Preparation has started!", {
                icon: '👩‍🍳',
                duration: 4000
            });
            return;
        }

        if (useBackend) {
            try {
                const { ordersService } = await import('@/services/ordersService');
                const response = await ordersService.cancel(activeOrder.id);
                if (response.success) {
                    setActiveOrder(null);
                    setIsOrderModalOpen(false);
                    toast.error('Order cancelled successfully');
                }
            } catch (e) {
                toast.error("Failed to cancel order");
            }
        } else {
            const cancelledOrder = { ...activeOrder, status: 'Cancelled', stage: -1 };
            saveToOrderHistory(cancelledOrder);
            clearActiveOrder();
            setActiveOrder(null);
            setIsOrderModalOpen(false);

            toast.error('Order cancelled successfully', {
                duration: 3000,
            });
        }
    }, [activeOrder, useBackend]);

    const value = {
        activeOrder,
        isOrderModalOpen,
        setIsOrderModalOpen,
        createOrder,
        cancelOrder,
        stageMessages: STAGE_MESSAGES
    };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};

export default OrderProvider;
