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

    // Load active order on mount
    useEffect(() => {
        const savedOrder = loadActiveOrder();
        if (savedOrder) {
            setActiveOrder(savedOrder);
            setIsOrderModalOpen(true);
        }
    }, []);

    // Auto-advance order stages
    useEffect(() => {
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
    }, [activeOrder]);

    // Create new order
    const createOrder = useCallback((cart, cartTotal, orderDetails, onSuccess) => {
        const order = createOrderUtil(cart, cartTotal, orderDetails); // Pass full details including instructions
        saveActiveOrder(order);
        setActiveOrder(order);
        setIsOrderModalOpen(true);

        // Show toast
        toast.success('🎉 Order placed successfully!', {
            duration: 3000,
            position: 'top-center',
        });

        if (onSuccess) onSuccess(order);

        return order;
    }, []);

    // Cancel order (Strict Logic)
    const cancelOrder = useCallback(() => {
        if (!activeOrder) return;

        // ONLY ALLOW CANCEL IF STAGE IS 0 (Order Placed)
        if (activeOrder.currentStage > 0) {
            toast.error("Cannot cancel: Preparation has started!", {
                icon: '👩‍🍳',
                duration: 4000
            });
            return;
        }

        const cancelledOrder = { ...activeOrder, status: 'Cancelled', stage: -1 };
        saveToOrderHistory(cancelledOrder);
        clearActiveOrder();
        setActiveOrder(null);
        setIsOrderModalOpen(false);

        toast.error('Order cancelled successfully', {
            duration: 3000,
        });
    }, [activeOrder]);

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
