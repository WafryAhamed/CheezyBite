import { ordersService } from '@/services/ordersService';

const GUEST_ORDER_ID_KEY = 'cheezybite_guest_order_id';
// Deprecated keys
const OLD_ACTIVE_ORDER_KEY = 'cheezybite_active_order';
const ORDER_HISTORY_KEY = 'cheezybite_order_history';

const isBrowser = () => typeof window !== 'undefined';

export function generateOrderId() {
    const timestamp = Date.now();
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `PZ${timestamp}${randomPart}`;
}

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

// Guest Order ID Management
export function saveGuestOrderId(orderId) {
    if (!isBrowser()) return;
    localStorage.setItem(GUEST_ORDER_ID_KEY, orderId);
}

export function getGuestOrderId() {
    if (!isBrowser()) return null;
    return localStorage.getItem(GUEST_ORDER_ID_KEY);
}

export function clearGuestOrderId() {
    if (!isBrowser()) return;
    localStorage.removeItem(GUEST_ORDER_ID_KEY);
}

// Deprecated / Compatibility Functions (Migration)

export function createOrder(cart, cartTotal, orderDetails = {}) {
    console.warn('createOrder util is deprecated. Use ordersService.create() instead.');
    // Return mock structure if absolutely needed, but context should prevent this
    return null;
}

export function saveActiveOrder(order) {
    // Only save ID if it's a guest order (no userId)
    if (order && !order.userId) {
        saveGuestOrderId(order.id);
    }
    // Clean up old key
    if (isBrowser()) localStorage.removeItem(OLD_ACTIVE_ORDER_KEY);
    return true;
}

export function loadActiveOrder() {
    // Used for initial load in Context. 
    // Return null to force Context to fetch from API using ID.
    return null;
}

export function clearActiveOrder() {
    clearGuestOrderId();
    if (isBrowser()) localStorage.removeItem(OLD_ACTIVE_ORDER_KEY);
    return true;
}

export function saveToOrderHistory(order) {
    // No-op or migration to backend history
    return true;
}

export function loadOrderHistory() {
    if (!isBrowser()) return [];
    try {
        const historyData = localStorage.getItem(ORDER_HISTORY_KEY);
        return historyData ? JSON.parse(historyData) : [];
    } catch (error) {
        return [];
    }
}

export default {
    generateOrderId,
    calculateDeliveryETA,
    saveGuestOrderId,
    getGuestOrderId,
    clearGuestOrderId,
    // Legacy support
    createOrder,
    saveActiveOrder,
    loadActiveOrder,
    clearActiveOrder,
    saveToOrderHistory,
    loadOrderHistory
};
