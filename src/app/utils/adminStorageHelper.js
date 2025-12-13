/**
 * Admin Storage Helper - Persistent admin data management
 * Handles menu config, orders, and admin settings
 */

const ADMIN_PIZZAS_KEY = 'cheezybite_admin_pizzas';
const ADMIN_TOPPINGS_KEY = 'cheezybite_admin_toppings';
const ADMIN_ORDERS_KEY = 'cheezybite_orders';
const ADMIN_AUTH_KEY = 'cheezybite_admin_auth';

const isBrowser = () => typeof window !== 'undefined';

// Default toppings data - Prices in LKR
export const DEFAULT_TOPPINGS = [
    { id: 1, name: 'cherry tomatoes', image: '/cherry.png?v=1.0.0', price: 150, enabled: true },
    { id: 2, name: 'corn', image: '/corn.png?v=1.0.0', price: 120, enabled: true },
    { id: 3, name: 'fresh tomatoes', image: '/fresh-tomatoes.png?v=1.0.0', price: 130, enabled: true },
    { id: 4, name: 'jalapeno', image: '/jalapeno.png?v=1.0.0', price: 140, enabled: true },
    { id: 5, name: 'parmesan', image: '/parmesan.png?v=1.0.0', price: 180, enabled: true },
    { id: 6, name: 'mozzarella', image: '/mozzarella.png?v=1.0.0', price: 200, enabled: true },
    { id: 7, name: 'mushrooms', image: '/mushrooms.png?v=1.0.0', price: 160, enabled: true },
    { id: 8, name: 'olives', image: '/olives.png?v=1.0.0', price: 150, enabled: true },
];

// Default pizzas data - Prices in LKR, Original descriptions
export const DEFAULT_PIZZAS = [
    { id: 1, name: 'Capricciosa', description: 'Tender chicken, fresh mushrooms, and bell peppers on our signature tomato base. A Sri Lankan favorite for its rich, savory taste.', image: '/capricciosa.webp?v=1.0.0', priceSm: 1490, priceMd: 1890, priceLg: 2290, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 2, name: 'Cheesy Bliss', description: 'Triple cheese blend of mozzarella, cheddar, and processed cheese melted to golden perfection. Pure indulgence for cheese lovers.', image: '/cheesy.webp?v=1.0.0', priceSm: 1590, priceMd: 1990, priceLg: 2390, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 3, name: 'Tropical Delight', description: 'Sweet pineapple chunks with succulent chicken pieces on a creamy cheese base. A refreshing twist loved across Colombo.', image: '/hawaii.webp?v=1.0.0', priceSm: 1590, priceMd: 1990, priceLg: 2390, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 4, name: 'Italiano Special', description: 'Fresh basil, Roma tomatoes, and premium mozzarella with aromatic herbs. Authentic taste with a local touch.', image: '/italian.webp?v=1.0.0', priceSm: 1790, priceMd: 2190, priceLg: 2590, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 5, name: 'Margherita Classic', description: 'Simple yet satisfying - vine-ripened tomatoes, fresh mozzarella, and fragrant basil on our handmade crust.', image: '/margherita.webp?v=1.0.0', priceSm: 1390, priceMd: 1790, priceLg: 2190, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 6, name: 'Spicy Pepperoni', description: 'Loaded with spicy pepperoni slices and extra mozzarella. A crowd-pleaser at every gathering from Kandy to Galle.', image: '/pepperoni.webp?v=1.0.0', priceSm: 1690, priceMd: 2090, priceLg: 2490, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 7, name: 'Four Cheese Feast', description: 'A heavenly combination of mozzarella, cheddar, parmesan, and cream cheese. Rich, creamy, and utterly delicious.', image: '/quattro-formaggi.webp?v=1.0.0', priceSm: 1890, priceMd: 2290, priceLg: 2690, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 8, name: 'Garden Supreme', description: 'Colorful bell peppers, onions, mushrooms, and olives layered on a zesty tomato sauce. Fresh and wholesome.', image: '/quattro-stagioni.webp?v=1.0.0', priceSm: 1690, priceMd: 2090, priceLg: 2490, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 9, name: 'Seafood Sensation', description: 'Premium prawns and fish flakes with tangy onions on a creamy white sauce. A coastal favorite from our kitchen.', image: '/tonno.webp?v=1.0.0', priceSm: 1890, priceMd: 2290, priceLg: 2690, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 10, name: 'Veggie Paradise', description: 'A colorful medley of fresh vegetables including capsicum, onions, tomatoes, and corn. Light, healthy, and full of flavor.', image: '/vegetarian.webp?v=1.0.0', priceSm: 1390, priceMd: 1790, priceLg: 2190, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
];

// ============ PIZZAS ============

export function loadPizzas() {
    if (!isBrowser()) return DEFAULT_PIZZAS;
    try {
        const data = localStorage.getItem(ADMIN_PIZZAS_KEY);
        if (!data) {
            savePizzas(DEFAULT_PIZZAS);
            return DEFAULT_PIZZAS;
        }
        return JSON.parse(data);
    } catch (error) {
        console.error('Failed to load pizzas:', error);
        return DEFAULT_PIZZAS;
    }
}

export function savePizzas(pizzas) {
    if (!isBrowser()) return false;
    try {
        localStorage.setItem(ADMIN_PIZZAS_KEY, JSON.stringify(pizzas));
        return true;
    } catch (error) {
        console.error('Failed to save pizzas:', error);
        return false;
    }
}

// ============ TOPPINGS ============

export function loadToppings() {
    if (!isBrowser()) return DEFAULT_TOPPINGS;
    try {
        const data = localStorage.getItem(ADMIN_TOPPINGS_KEY);
        if (!data) {
            saveToppings(DEFAULT_TOPPINGS);
            return DEFAULT_TOPPINGS;
        }
        return JSON.parse(data);
    } catch (error) {
        console.error('Failed to load toppings:', error);
        return DEFAULT_TOPPINGS;
    }
}

export function saveToppings(toppings) {
    if (!isBrowser()) return false;
    try {
        localStorage.setItem(ADMIN_TOPPINGS_KEY, JSON.stringify(toppings));
        return true;
    } catch (error) {
        console.error('Failed to save toppings:', error);
        return false;
    }
}

// ============ ORDERS ============

export function loadAllOrders() {
    if (!isBrowser()) return [];
    try {
        const data = localStorage.getItem(ADMIN_ORDERS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to load orders:', error);
        return [];
    }
}

export function saveAllOrders(orders) {
    if (!isBrowser()) return false;
    try {
        localStorage.setItem(ADMIN_ORDERS_KEY, JSON.stringify(orders));
        return true;
    } catch (error) {
        console.error('Failed to save orders:', error);
        return false;
    }
}

export function addOrder(order) {
    const orders = loadAllOrders();
    orders.unshift(order);
    saveAllOrders(orders);
    return orders;
}

export function updateOrderStatus(orderId, newStage, message = '') {
    const orders = loadAllOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        orders[orderIndex].currentStage = newStage;
        orders[orderIndex].lastUpdate = Date.now();
        if (message) {
            orders[orderIndex].statusMessage = message;
        }
        saveAllOrders(orders);
    }
    return orders;
}

// ============ ADMIN AUTH ============

// ============ ADMIN AUTH ============

export function isAdminLoggedIn() {
    if (!isBrowser()) return false;
    try {
        const auth = localStorage.getItem(ADMIN_AUTH_KEY);
        // Check if there is also a role, otherwise invalid
        const role = localStorage.getItem(ADMIN_AUTH_KEY + '_role');
        return auth === 'true' && !!role;
    } catch {
        return false;
    }
}

export function getAdminRole() {
    if (!isBrowser()) return null;
    return localStorage.getItem(ADMIN_AUTH_KEY + '_role');
}

export function adminLogin(username, password) {
    // Super Admin: admin / Admin@123
    if (username === 'admin' && password === 'Admin@123') {
        localStorage.setItem(ADMIN_AUTH_KEY, 'true');
        localStorage.setItem(ADMIN_AUTH_KEY + '_role', 'Super Admin');
        return true;
    }

    // Manager: manager / Manager@123
    if (username === 'manager' && password === 'Manager@123') {
        localStorage.setItem(ADMIN_AUTH_KEY, 'true');
        localStorage.setItem(ADMIN_AUTH_KEY + '_role', 'Manager');
        return true;
    }

    return false;
}

export function adminLogout() {
    if (!isBrowser()) return;
    localStorage.removeItem(ADMIN_AUTH_KEY);
    localStorage.removeItem(ADMIN_AUTH_KEY + '_role');
}

// ============ ANALYTICS DATA ============

export function getAnalyticsData() {
    const orders = loadAllOrders();
    const pizzas = loadPizzas();

    // Calculate metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Orders by status
    const ordersByStatus = {
        placed: orders.filter(o => o.currentStage === 0).length,
        preparing: orders.filter(o => o.currentStage === 1).length,
        baking: orders.filter(o => o.currentStage === 2).length,
        delivery: orders.filter(o => o.currentStage === 3).length,
        delivered: orders.filter(o => o.currentStage === 4).length,
    };

    // Popular pizzas (count occurrences)
    const pizzaCounts = {};
    orders.forEach(order => {
        (order.items || []).forEach(item => {
            pizzaCounts[item.name] = (pizzaCounts[item.name] || 0) + item.amount;
        });
    });

    const popularPizzas = Object.entries(pizzaCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // Daily revenue (last 7 days)
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const dailyRevenue = [];

    for (let i = 6; i >= 0; i--) {
        const dayStart = now - (i * dayMs);
        const dayEnd = dayStart + dayMs;
        const dayOrders = orders.filter(o => {
            const orderTime = o.createdAt || o.timestamp;
            return orderTime >= dayStart && orderTime < dayEnd;
        });
        const revenue = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const date = new Date(dayStart);
        dailyRevenue.push({
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            revenue: revenue,
            orders: dayOrders.length
        });
    }

    return {
        totalOrders,
        totalRevenue,
        avgOrderValue,
        ordersByStatus,
        popularPizzas,
        dailyRevenue,
        activePizzas: pizzas.filter(p => p.enabled).length,
        totalPizzas: pizzas.length,
    };
}

export default {
    loadPizzas, savePizzas,
    loadToppings, saveToppings,
    loadAllOrders, saveAllOrders, addOrder, updateOrderStatus,
    isAdminLoggedIn, adminLogin, adminLogout, getAdminRole,
    getAnalyticsData,
    DEFAULT_PIZZAS, DEFAULT_TOPPINGS
};
