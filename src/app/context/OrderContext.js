"use client"

import React, { createContext, useState, useEffect, useCallback } from 'react';
import {
    saveGuestOrderId,
    getGuestOrderId,
    clearGuestOrderId,
    createOrder as createOrderUtil // Deprecated but kept for reference if needed
} from '../utils/orderManager';
import { ordersService } from '@/services/ordersService';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';

import { STAGE_MESSAGES, ORDER_STAGES } from '../utils/orderConstants';

export const OrderContext = createContext();

const POLLING_INTERVAL = 10000; // Poll every 10s if socket fails

export const OrderProvider = ({ children }) => {
    const [activeOrder, setActiveOrder] = useState(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load active order on mount
    useEffect(() => {
        const loadOrder = async () => {
            setLoading(true);
            try {
                // Check if user is authenticated
                const authCheck = await authService.getCurrentUser();

                if (authCheck.success) {
                    // Authenticated User: Get latest active order
                    const response = await ordersService.getMyOrders();
                    if (response.success && response.data.length > 0) {
                        const active = response.data.find(o => o.currentStage < ORDER_STAGES.DELIVERED && o.status !== 'Cancelled');
                        if (active) setActiveOrder(active);
                    }
                } else {
                    // Guest User: Check for locally stored Order ID
                    const guestOrderId = getGuestOrderId();
                    if (guestOrderId) {
                        const response = await ordersService.getById(guestOrderId);
                        if (response.success && response.data) {
                            const order = response.data;
                            if (order.currentStage < ORDER_STAGES.DELIVERED && order.status !== 'Cancelled') {
                                setActiveOrder(order);
                            } else {
                                // Order delivered or cancelled, clear local ID
                                clearGuestOrderId();
                            }
                        } else {
                            // Invalid ID or not found
                            clearGuestOrderId();
                        }
                    }
                }
            } catch (e) {
                // Squelch 401/403/404 errors (expected if not logged in or no active order)
                const isExpectedError = e?.response?.status === 401 ||
                    e?.response?.status === 403 ||
                    e?.response?.status === 404 ||
                    e?.status === 401 ||
                    e?.status === 403 ||
                    e?.status === 404 ||
                    e?.message?.includes('Invalid token');

                if (!isExpectedError) {
                    console.error("Failed to load active order", e);
                }
            } finally {
                setLoading(false);
            }
        };
        loadOrder();
    }, []);

    // Socket.IO Integration
    useEffect(() => {
        if (!activeOrder || activeOrder.currentStage >= ORDER_STAGES.DELIVERED || activeOrder.status === 'Cancelled') return;

        let socket = null;

        const connectSocket = async () => {
            try {
                const { io } = await import('socket.io-client');
                const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

                socket = io(socketUrl, {
                    reconnectionAttempts: 5,
                    timeout: 5000
                });

                socket.on('connect', () => {
                    // console.log('Socket connected');
                    if (activeOrder.userId) {
                        socket.emit('join_user_room', activeOrder.userId);
                    }
                    // Also join specific order room just in case
                    socket.emit('order:track', { orderId: activeOrder.id });
                });

                socket.on('order:update', (data) => {
                    if (data.orderId === activeOrder.id) {
                        // MERGE update, don't replace
                        setActiveOrder(prev => ({
                            ...prev,
                            status: data.status,
                            currentStage: data.currentStage,
                            ...(data.currentStage === ORDER_STAGES.DELIVERED ? {
                                actualDeliveryTime: data.timestamp
                            } : {})
                        }));

                        const stageInfo = STAGE_MESSAGES[data.currentStage];
                        if (stageInfo && data.currentStage > activeOrder.currentStage) {
                            toast.success(`${stageInfo.emoji} ${stageInfo.message}`, {
                                duration: 4000,
                                position: 'top-center',
                            });
                        }

                        if (data.currentStage === ORDER_STAGES.DELIVERED) {
                            setTimeout(() => {
                                clearGuestOrderId();
                                setActiveOrder(null);
                                setIsOrderModalOpen(false);
                            }, 5000);
                        }
                    }
                });

                socket.on('connect_error', () => {
                    // Socket server not available - polling fallback will handle it
                });

                socket.on('error', () => {
                    // Silent error handling
                });
            } catch (e) {
                // Socket connection failed - polling fallback will handle it
            }
        };

        connectSocket();

        return () => {
            if (socket) socket.disconnect();
        };
    }, [activeOrder]);

    // Polling Fallback (Resilience)
    useEffect(() => {
        if (!activeOrder || activeOrder.currentStage >= ORDER_STAGES.DELIVERED || activeOrder.status === 'Cancelled') return;

        const pollInterval = setInterval(async () => {
            try {
                const response = await ordersService.getById(activeOrder.id);
                if (response.success) {
                    const remoteOrder = response.data;
                    // Only update if state changed to avoid re-renders
                    if (remoteOrder.currentStage !== activeOrder.currentStage || remoteOrder.status !== activeOrder.status) {
                        setActiveOrder(remoteOrder);

                        // Trigger toast if stage advanced
                        if (remoteOrder.currentStage > activeOrder.currentStage) {
                            const stageInfo = STAGE_MESSAGES[remoteOrder.currentStage];
                            if (stageInfo) {
                                toast.success(`${stageInfo.emoji} ${stageInfo.message}`);
                            }
                        }

                        if (remoteOrder.currentStage === ORDER_STAGES.DELIVERED) {
                            setTimeout(() => {
                                clearGuestOrderId();
                                setActiveOrder(null);
                                setIsOrderModalOpen(false);
                            }, 5000);
                        }
                    }
                }
            } catch (e) {
                // Polling failed, silent ignore
            }
        }, POLLING_INTERVAL);

        return () => clearInterval(pollInterval);
    }, [activeOrder]);

    // Create new order
    const createOrder = useCallback(async (cart, cartTotal, orderDetails, onSuccess) => {
        try {
            // Construct API payload
            const orderPayload = {
                items: cart,
                total: cartTotal,
                address: orderDetails.address || orderDetails.deliveryDetails,
                paymentMethod: orderDetails.paymentMethod,
                deliveryTime: orderDetails.deliveryTime,
                deliveryInstructions: orderDetails.deliveryInstructions,
                paymentDetails: orderDetails.paymentDetails,
                appliedOffer: orderDetails.appliedOffer,
                discountAmount: orderDetails.discountAmount
            };

            const response = await ordersService.create(orderPayload);
            if (response.success && response.data) {
                // API returns the order directly in response.data (not wrapped in { order: ... })
                const order = response.data._id ? response.data : response.data.order;

                // If the created order has no user ID, save it locally for guest tracking
                if (!order.userId) {
                    saveGuestOrderId(order._id || order.id);
                }

                setActiveOrder(order);
                setIsOrderModalOpen(true);

                toast.success('🎉 Order placed successfully!', {
                    duration: 3000,
                    position: 'top-center',
                });

                if (onSuccess) onSuccess(order);
                return order;
            } else {
                toast.error(response.message || "Failed to place order");
                return null;
            }
        } catch (error) {
            console.error("Create Order Error:", error);
            toast.error(error.message || "Failed to place order");
            return null;
        }
    }, []);

    // Cancel order
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

        try {
            const response = await ordersService.cancel(activeOrder.id);
            if (response.success) {
                setActiveOrder(null);
                clearGuestOrderId();
                setIsOrderModalOpen(false);
                toast.error('Order cancelled successfully');
            }
        } catch (e) {
            toast.error("Failed to cancel order");
        }
    }, [activeOrder]);

    const value = {
        activeOrder,
        isOrderModalOpen,
        setIsOrderModalOpen,
        createOrder,
        cancelOrder,
        stageMessages: STAGE_MESSAGES,
        loading
    };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};

export default OrderProvider;
