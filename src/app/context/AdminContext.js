"use client";

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import {
    loadPizzas, savePizzas,
    loadToppings, saveToppings,
    loadPizzas, savePizzas,
    loadToppings, saveToppings,
    loadAllOrders, saveAllOrders, updateOrderStatus as updateOrderInStorage,
    isAdminLoggedIn, adminLogin as doAdminLogin, adminLogout as doAdminLogout, getAdminRole,
    getAnalyticsData,
    DEFAULT_PIZZAS, DEFAULT_TOPPINGS
} from '../utils/adminStorageHelper';
import toast from 'react-hot-toast';

export const AdminContext = createContext();

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within AdminProvider');
    }
    return context;
};

export const AdminProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [pizzas, setPizzas] = useState([]);
    const [toppings, setToppings] = useState([]);
    const [orders, setOrders] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load initial data
    useEffect(() => {
        setIsAuthenticated(isAdminLoggedIn());
        setUserRole(getAdminRole());
        setPizzas(loadPizzas());
        setToppings(loadToppings());
        setOrders(loadAllOrders());
        setAnalytics(getAnalyticsData());
        setLoading(false);
    }, []);

    // Refresh analytics when orders change
    useEffect(() => {
        if (!loading) {
            setAnalytics(getAnalyticsData());
        }
    }, [orders, loading]);

    // ============ AUTH ============
    const login = useCallback((username, password) => {
        const success = doAdminLogin(username, password);
        setIsAuthenticated(success);
        if (success) {
            setUserRole(getAdminRole());
            toast.success('Welcome back, Admin!');
        } else {
            toast.error('Invalid username or password');
        }
        return success;
    }, []);

    const logout = useCallback(() => {
        doAdminLogout();
        setIsAuthenticated(false);
        setUserRole(null);
        toast.success('Logged out successfully');
    }, []);

    // ============ PIZZAS ============
    const addPizza = useCallback((pizza) => {
        const newPizza = {
            ...pizza,
            id: Date.now(),
            enabled: true,
            toppingIds: pizza.toppingIds || [1, 2, 3, 4, 5]
        };
        const updated = [...pizzas, newPizza];
        setPizzas(updated);
        savePizzas(updated);
        toast.success(`${pizza.name} added to menu!`);
        return newPizza;
    }, [pizzas]);

    const updatePizza = useCallback((id, updates) => {
        const updated = pizzas.map(p => p.id === id ? { ...p, ...updates } : p);
        setPizzas(updated);
        savePizzas(updated);
        toast.success('Pizza updated!');
    }, [pizzas]);

    const togglePizzaEnabled = useCallback((id) => {
        const pizza = pizzas.find(p => p.id === id);
        const updated = pizzas.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p);
        setPizzas(updated);
        savePizzas(updated);
        toast.success(`${pizza?.name} ${pizza?.enabled ? 'disabled' : 'enabled'}!`);
    }, [pizzas]);

    const deletePizza = useCallback((id) => {
        const pizza = pizzas.find(p => p.id === id);
        const updated = pizzas.filter(p => p.id !== id);
        setPizzas(updated);
        savePizzas(updated);
        toast.success(`${pizza?.name} removed from menu!`);
    }, [pizzas]);

    // ============ TOPPINGS ============
    const updateTopping = useCallback((id, updates) => {
        const updated = toppings.map(t => t.id === id ? { ...t, ...updates } : t);
        setToppings(updated);
        saveToppings(updated);
        toast.success('Topping updated!');
    }, [toppings]);

    const toggleToppingEnabled = useCallback((id) => {
        const topping = toppings.find(t => t.id === id);
        const updated = toppings.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t);
        setToppings(updated);
        saveToppings(updated);
        toast.success(`${topping?.name} ${topping?.enabled ? 'disabled' : 'enabled'}!`);
    }, [toppings]);

    const addTopping = useCallback((topping) => {
        const newTopping = {
            ...topping,
            id: Date.now(),
            enabled: true
        };
        const updated = [...toppings, newTopping];
        setToppings(updated);
        saveToppings(updated);
        toast.success(`${topping.name} added!`);
        return newTopping;
    }, [toppings]);

    // ============ ORDERS ============
    const updateOrderStatus = useCallback((orderId, newStage) => {
        const stageNames = ['Order Placed', 'Preparing', 'Baking', 'Out for Delivery', 'Delivered'];
        const updatedOrders = updateOrderInStorage(orderId, newStage, stageNames[newStage]);
        setOrders(updatedOrders);
        toast.success(`Order status: ${stageNames[newStage]}`);
    }, []);

    const refreshOrders = useCallback(() => {
        setOrders(loadAllOrders());
        setAnalytics(getAnalyticsData());
    }, []);

    // ============ RESET DATA ============
    const resetToDefaults = useCallback(() => {
        savePizzas(DEFAULT_PIZZAS);
        saveToppings(DEFAULT_TOPPINGS);
        setPizzas(DEFAULT_PIZZAS);
        setToppings(DEFAULT_TOPPINGS);
        toast.success('Menu reset to defaults!');
    }, []);

    // Get enabled pizzas with full topping objects
    const getEnabledPizzasWithToppings = useCallback(() => {
        const enabledToppings = toppings.filter(t => t.enabled);
        return pizzas
            .filter(p => p.enabled)
            .map(pizza => ({
                ...pizza,
                toppings: enabledToppings.filter(t => pizza.toppingIds?.includes(t.id) || true)
            }));
    }, [pizzas, toppings]);

    const value = {
        // Auth
        isAuthenticated,
        userRole,
        login,
        logout,
        // Pizzas
        pizzas,
        addPizza,
        updatePizza,
        togglePizzaEnabled,
        deletePizza,
        // Toppings
        toppings,
        updateTopping,
        toggleToppingEnabled,
        addTopping,
        // Orders
        orders,
        updateOrderStatus,
        refreshOrders,
        // Analytics
        analytics,
        // Helpers
        getEnabledPizzasWithToppings,
        resetToDefaults,
        loading
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};

export default AdminProvider;
