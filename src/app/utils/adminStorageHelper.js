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
// Default pizzas data - Prices in LKR, based on pizzaStore.js
export const DEFAULT_PIZZAS = [
    { id: 1, name: 'Fire Grilled Chicken', description: 'Grilled chicken with crushed pepper and melted cheese.', image: '/pizzas/pizza1.jpg', priceSm: 1400, priceMd: 1800, priceLg: 2400, category: 'Chicken', tags: ['Chicken', 'Spicy'], rating: 4.8, ratingCount: 1240, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 2, name: 'BBQ Chicken Feast', description: 'Smoky BBQ chicken with onion and mozzarella.', image: '/pizzas/pizza2.jpg', priceSm: 1450, priceMd: 1850, priceLg: 2450, category: 'Chicken', tags: ['Chicken'], rating: 4.7, ratingCount: 980, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 3, name: 'Volcano Chicken', description: 'Extra spicy chicken with fiery sauce and cheese.', image: '/pizzas/pizza3.jpg', priceSm: 1500, priceMd: 1900, priceLg: 2500, category: 'Chicken', tags: ['Chicken', 'Spicy'], rating: 4.6, ratingCount: 850, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 4, name: 'Triple Cheese Burst', description: 'Mozzarella, cheddar, and parmesan in every bite.', image: '/pizzas/pizza4.jpg', priceSm: 1600, priceMd: 2100, priceLg: 2800, category: 'Cheese', tags: ['Cheese'], rating: 4.9, ratingCount: 2100, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 5, name: 'Farmhouse Veg Supreme', description: 'Loaded with onion, capsicum, olives, and golden cheese.', image: '/pizzas/pizza5.jpg', priceSm: 1200, priceMd: 1600, priceLg: 2000, category: 'Veg', tags: ['Veg'], rating: 4.5, ratingCount: 750, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 6, name: 'Classic Chicken Sausage', description: 'Chicken sausage slices with a rich tomato base.', image: '/pizzas/pizza6.jpg', priceSm: 1300, priceMd: 1700, priceLg: 2200, category: 'Chicken', tags: ['Chicken'], rating: 4.4, ratingCount: 600, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 7, name: 'Hot Chilli Chicken', description: 'Red chilli flakes, hot sauce, and juicy chicken.', image: '/pizzas/pizza7.jpg', priceSm: 1400, priceMd: 1800, priceLg: 2300, category: 'Chicken', tags: ['Chicken', 'Spicy'], rating: 4.6, ratingCount: 820, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 8, name: 'Cheese Lovers Classic', description: 'Simple, rich, and ultra-cheesy.', image: '/pizzas/pizza8.jpg', priceSm: 1100, priceMd: 1500, priceLg: 1900, category: 'Cheese', tags: ['Cheese'], rating: 4.5, ratingCount: 900, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 9, name: 'Pepper Chicken Crunch', description: 'Crispy chicken bites with bold pepper flavor.', image: '/pizzas/pizza9.jpg', priceSm: 1450, priceMd: 1850, priceLg: 2400, category: 'Chicken', tags: ['Chicken', 'Spicy'], rating: 4.7, ratingCount: 1100, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 10, name: 'Creamy Cheese Melt', description: 'Smooth creamy cheese with a soft base.', image: '/pizzas/pizza10.jpg', priceSm: 1250, priceMd: 1650, priceLg: 2150, category: 'Cheese', tags: ['Cheese'], rating: 4.6, ratingCount: 880, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 11, name: 'Spicy Pepperoni Heat', description: 'Pepperoni-style chicken with bold spice.', image: '/pizzas/pizza11.jpg', priceSm: 1550, priceMd: 1950, priceLg: 2600, category: 'Chicken', tags: ['Chicken', 'Spicy'], rating: 4.8, ratingCount: 1500, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 12, name: 'Sweet Corn & Cheese', description: 'Classic sweet corn paired with rich melted cheese.', image: '/pizzas/pizza12.jpg', priceSm: 1150, priceMd: 1550, priceLg: 2050, category: 'Veg', tags: ['Veg', 'Cheese'], rating: 4.4, ratingCount: 700, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 13, name: 'Street Style Chicken', description: 'Inspired by street-style spicy chicken flavors.', image: '/pizzas/pizza13.jpg', priceSm: 1350, priceMd: 1750, priceLg: 2250, category: 'Chicken', tags: ['Chicken'], rating: 4.7, ratingCount: 950, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 14, name: 'Chicken Tikka Fusion', description: 'Indian-style tikka chicken with creamy cheese.', image: '/pizzas/pizza14.jpg', priceSm: 1500, priceMd: 1900, priceLg: 2500, category: 'Chicken', tags: ['Chicken', 'Spicy'], rating: 4.8, ratingCount: 1300, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 15, name: 'Golden Cheese Crunch', description: 'Crispy crust with deep cheese flavor.', image: '/pizzas/pizza15.jpg', priceSm: 1300, priceMd: 1700, priceLg: 2200, category: 'Cheese', tags: ['Cheese'], rating: 4.6, ratingCount: 800, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 16, name: 'Smoky BBQ Fusion', description: 'BBQ sauce, chicken chunks, and cheese.', image: '/pizzas/pizza16.jpg', priceSm: 1450, priceMd: 1850, priceLg: 2450, category: 'Chicken', tags: ['Chicken'], rating: 4.7, ratingCount: 1050, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 17, name: 'Ultimate Cheezy Bite', description: 'Signature CheezyBite recipe with extra cheese.', image: '/pizzas/pizza17.png', priceSm: 1700, priceMd: 2200, priceLg: 2900, category: 'Cheese', tags: ['Cheese'], rating: 4.9, ratingCount: 2500, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 18, name: 'Roasted Chicken Melt', description: 'Slow-roasted chicken with extra cheesy layers.', image: '/pizzas/pizza18.jpg', priceSm: 1400, priceMd: 1800, priceLg: 2300, category: 'Chicken', tags: ['Chicken', 'Cheese'], rating: 4.6, ratingCount: 920, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 19, name: 'Garden Fresh Veggie', description: 'Fresh capsicum, onion, tomato, sweet corn, and mozzarella on a soft base.', image: '/pizzas/pizza19.jpg', priceSm: 1150, priceMd: 1550, priceLg: 1950, category: 'Veg', tags: ['Veg'], rating: 4.5, ratingCount: 680, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 20, name: 'Cheesy Mushroom Delight', description: 'Juicy mushrooms with extra mozzarella and a creamy cheese finish.', image: '/pizzas/pizza20.jpg', priceSm: 1250, priceMd: 1650, priceLg: 2100, category: 'Veg', tags: ['Veg', 'Cheese'], rating: 4.6, ratingCount: 740, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 21, name: 'Peri Peri Blast', description: 'Peri-peri chicken with smoky heat.', image: '/pizzas/pizza21.jpg', priceSm: 1500, priceMd: 1900, priceLg: 2500, category: 'Chicken', tags: ['Chicken', 'Spicy'], rating: 4.7, ratingCount: 1150, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 22, name: 'Four Cheese Magic', description: 'A perfect blend of four premium cheeses.', image: '/pizzas/pizza22.jpg', priceSm: 1650, priceMd: 2150, priceLg: 2850, category: 'Cheese', tags: ['Cheese'], rating: 4.9, ratingCount: 1800, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 23, name: 'Olive Pepper Veggie', description: 'Black olives, mild peppers, and light cheese for a balanced bite.', image: '/pizzas/pizza23.jpg', priceSm: 1200, priceMd: 1600, priceLg: 2000, category: 'Veg', tags: ['Veg'], rating: 4.4, ratingCount: 620, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 24, name: 'Chilli Cheese Inferno', description: 'Melted cheese with green chilli heat (veg-friendly).', image: '/pizzas/pizza24.jpg', priceSm: 1300, priceMd: 1700, priceLg: 2200, category: 'Spicy', tags: ['Spicy', 'Cheese'], rating: 4.5, ratingCount: 790, enabled: true, toppingIds: [1, 2, 3, 4, 5] },
    { id: 25, name: 'Chef’s Special Mix', description: 'A balanced mix of chicken, cheese, and mild spice.', image: '/pizzas/pizza25.jpg', priceSm: 1550, priceMd: 1950, priceLg: 2600, category: 'Chicken', tags: ['Chicken', 'Cheese'], rating: 4.8, ratingCount: 1400, enabled: true, toppingIds: [1, 2, 3, 4, 5] }
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

const ADMIN_USERS_KEY = 'cheezybite_admin_users';

const DEFAULT_ADMINS = [
    {
        id: 1,
        username: 'admin',
        password: 'Admin@123',
        role: 'Super Admin',
        isActive: true,
        lastLogin: null
    },
    {
        id: 2,
        username: 'manager',
        password: 'Manager@123',
        role: 'Manager',
        isActive: true,
        lastLogin: null
    }
];

export function loadAdmins() {
    if (!isBrowser()) return DEFAULT_ADMINS;
    try {
        const data = localStorage.getItem(ADMIN_USERS_KEY);
        if (!data) {
            saveAdmins(DEFAULT_ADMINS);
            return DEFAULT_ADMINS;
        }
        return JSON.parse(data);
    } catch (error) {
        console.error('Failed to load admins:', error);
        return DEFAULT_ADMINS;
    }
}

export function saveAdmins(admins) {
    if (!isBrowser()) return false;
    try {
        localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(admins));
        return true;
    } catch (error) {
        console.error('Failed to save admins:', error);
        return false;
    }
}

export function updateAdmin(id, updates) {
    const admins = loadAdmins();
    const updated = admins.map(admin => admin.id === id ? { ...admin, ...updates } : admin);
    saveAdmins(updated);
    return updated;
}

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
    const admins = loadAdmins();
    const admin = admins.find(a => a.username === username && a.password === password);

    if (admin) {
        if (!admin.isActive) return false; // Account disabled

        // Success
        localStorage.setItem(ADMIN_AUTH_KEY, 'true');
        localStorage.setItem(ADMIN_AUTH_KEY + '_role', admin.role);

        // Update Last Login
        updateAdmin(admin.id, { lastLogin: Date.now() });

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
    loadAdmins, saveAdmins, updateAdmin,
    getAnalyticsData,
    DEFAULT_PIZZAS, DEFAULT_TOPPINGS
};
