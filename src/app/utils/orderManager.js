/**
 * Order Management Utilities
 * Handles order persistence and state management
 */

import { addOrder as addToAdminOrders, updateOrderStatus as updateAdminOrderStatus } from './adminStorageHelper';

const ACTIVE_ORDER_KEY = 'cheezybite_active_order';
const ORDER_HISTORY_KEY = 'cheezybite_order_history';

/**
 * Check if we're in browser environment
 */
const isBrowser = () => typeof window !== 'undefined';

/**
 * Generate unique order ID
 */
export function generateOrderId() {
    const timestamp = Date.now();
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `PZ${timestamp}${randomPart}`;
}

/**
 * Calculate delivery ETA
 * @param {number} minMinutes - Minimum minutes
 * @param {number} maxMinutes - Maximum minutes
 */
export function calculateDeliveryETA(minMinutes = 30, maxMinutes = 45) {
    const now = new Date();
    const deliveryMinutes = Math.floor(Math.random() * (maxMinutes - minMinutes + 1)) + minMinutes;
    const deliveryTime = new Date(now.getTime() + deliveryMinutes * 60000);

    const hours = deliveryTime.getHours();
    const minutes = deliveryTime.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;

    return {
        minutes: deliveryMinutes,
        time: `${formattedHours}:${minutes} ${ampm}`,
        formatted: `${deliveryMinutes} min (${formattedHours}:${minutes} ${ampm})`
    };
}

/**
 * Create new order object
 */
export function createOrder(cart, cartTotal, orderDetails = {}) {
    const eta = calculateDeliveryETA();

    const order = {
        id: generateOrderId(),
        createdAt: Date.now(),
        timestamp: Date.now(),
        items: [...cart],
        total: cartTotal,
        status: 'placed',
        currentStage: 0,
        eta: eta,
        ...orderDetails, // Spread optional details like deliveryInstructions, paymentDetails, address props
        statusHistory: [
            {
                status: 'placed',
                timestamp: new Date().toISOString(),
                message: 'Order placed successfully'
            }
        ]
    };

    // Sync with admin storage
    addToAdminOrders(order);

    return order;
}

/**
 * Save active order to localStorage
 */
export function saveActiveOrder(order) {
    if (!isBrowser()) return false;

    try {
        localStorage.setItem(ACTIVE_ORDER_KEY, JSON.stringify(order));
        return true;
    } catch (error) {
        console.error('Failed to save active order:', error);
        return false;
    }
}

/**
 * Load active order from localStorage
 */
export function loadActiveOrder() {
    if (!isBrowser()) return null;

    try {
        const orderData = localStorage.getItem(ACTIVE_ORDER_KEY);
        if (!orderData) return null;

        const order = JSON.parse(orderData);

        // Check if order is still active (less than 2 hours old)
        const orderTime = new Date(order.createdAt).getTime();
        const now = Date.now();
        const twoHours = 2 * 60 * 60 * 1000;

        if (now - orderTime > twoHours) {
            // Order too old, clear it
            clearActiveOrder();
            return null;
        }

        return order;
    } catch (error) {
        console.error('Failed to load active order:', error);
        return null;
    }
}

/**
 * Update order stage
 */
export function updateOrderStage(order, newStage, statusMessage) {
    const statusNames = ['placed', 'preparing', 'baking', 'delivering', 'delivered'];

    const updatedOrder = {
        ...order,
        currentStage: newStage,
        status: statusNames[newStage] || order.status,
        statusHistory: [
            ...order.statusHistory,
            {
                status: statusNames[newStage] || 'unknown',
                timestamp: new Date().toISOString(),
                message: statusMessage || `Order ${statusNames[newStage]}`
            }
        ]
    };

    saveActiveOrder(updatedOrder);

    // Sync with admin storage
    updateAdminOrderStatus(order.id, newStage, statusMessage);

    return updatedOrder;
}

/**
 * Clear active order
 */
export function clearActiveOrder() {
    if (!isBrowser()) return false;

    try {
        localStorage.removeItem(ACTIVE_ORDER_KEY);
        return true;
    } catch (error) {
        console.error('Failed to clear active order:', error);
        return false;
    }
}

/**
 * Save order to history
 */
export function saveToOrderHistory(order) {
    if (!isBrowser()) return false;

    try {
        const historyData = localStorage.getItem(ORDER_HISTORY_KEY);
        const history = historyData ? JSON.parse(historyData) : [];

        // Add order to beginning of history
        history.unshift(order);

        // Keep only last 10 orders
        const trimmedHistory = history.slice(0, 10);

        localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(trimmedHistory));
        return true;
    } catch (error) {
        console.error('Failed to save order to history:', error);
        return false;
    }
}

/**
 * Load order history
 */
export function loadOrderHistory() {
    if (!isBrowser()) return [];

    try {
        const historyData = localStorage.getItem(ORDER_HISTORY_KEY);
        return historyData ? JSON.parse(historyData) : [];
    } catch (error) {
        console.error('Failed to load order history:', error);
        return [];
    }
}

export default {
    generateOrderId,
    calculateDeliveryETA,
    createOrder,
    saveActiveOrder,
    loadActiveOrder,
    updateOrderStage,
    clearActiveOrder,
    saveToOrderHistory,
    loadOrderHistory
};
