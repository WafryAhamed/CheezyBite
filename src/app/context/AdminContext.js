"use client";

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import {
    loadPizzas, savePizzas,
    loadToppings, saveToppings,
    loadAllOrders, saveAllOrders, updateOrderStatus as updateOrderInStorage,
    isAdminLoggedIn, adminLogin as doAdminLogin, adminLogout as doAdminLogout, getAdminRole, getAdminUsername,
    loadAdmins, updateAdmin,
    getAnalyticsData,
    DEFAULT_PIZZAS, DEFAULT_TOPPINGS
} from '../utils/adminStorageHelper';
import toast from 'react-hot-toast';
import { authService } from '@/services/authService';
import { pizzasService } from '@/services/pizzasService';
import { toppingsService } from '@/services/toppingsService';
import { ordersService } from '@/services/ordersService';
import { analyticsService } from '@/services/analyticsService';

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
    const [currentUser, setCurrentUser] = useState(null);
    const [pizzas, setPizzas] = useState([]);
    const [toppings, setToppings] = useState([]);
    const [orders, setOrders] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const useBackend = process.env.NEXT_PUBLIC_USE_API_BACKEND === 'true';

    // Load initial data
    useEffect(() => {
        const loadToState = async () => {
            if (useBackend) {
                try {
                    const authCheck = await authService.getCurrentUser();

                    if (authCheck.success && ['Super Admin', 'Manager'].includes(authCheck.data.role)) {
                        setIsAuthenticated(true);
                        setUserRole(authCheck.data.role);
                        setCurrentUser(authCheck.data);

                        // Load data in parallel
                        const [pizzasRes, toppingsRes, ordersRes, analyticsRes] = await Promise.all([
                            pizzasService.getAll(),
                            toppingsService.getAll(),
                            ordersService.getAllAdmin(),
                            analyticsService.getDashboardData()
                        ]);

                        setPizzas(pizzasRes.success ? pizzasRes.data : []);
                        setToppings(toppingsRes.success ? toppingsRes.data : []);
                        setOrders(ordersRes.success ? ordersRes.data : []);
                        setAnalytics(analyticsRes.success ? analyticsRes.data : null);

                        if (authCheck.data.role === 'Super Admin') {
                            const { default: api } = await import('@/services/apiClient');
                            const adminsRes = await api.get('/admin/users'); // Pending adminUserService
                            if (adminsRes.success) setAdmins(adminsRes.data);
                        }

                    } else {
                        setIsAuthenticated(false);
                    }
                } catch (e) {
                    console.error("Admin load failed", e);
                    setIsAuthenticated(false);
                }
            } else {
                // Mock Mode
                const isAuth = isAdminLoggedIn();
                setIsAuthenticated(isAuth);
                if (isAuth) {
                    const role = getAdminRole();
                    const username = getAdminUsername();
                    setUserRole(role);
                    setCurrentUser({
                        username: username,
                        email: `${username}@cheezybite.com`
                    });
                }
                setPizzas(loadPizzas());
                setToppings(loadToppings());
                setOrders(loadAllOrders());
                setAdmins(loadAdmins());
                setAnalytics(getAnalyticsData());
            }
            setLoading(false);
        };

        loadToState();
    }, [useBackend]);

    // Refresh data utility
    const refreshData = async () => {
        if (useBackend && isAuthenticated) {
            const [ordersRes, analyticsRes] = await Promise.all([
                ordersService.getAllAdmin(),
                analyticsService.getDashboardData()
            ]);
            if (ordersRes.success) setOrders(ordersRes.data);
            if (analyticsRes.success) setAnalytics(analyticsRes.data);
        } else if (!useBackend) {
            setOrders(loadAllOrders());
            setAnalytics(getAnalyticsData());
        }
    };

    // ============ AUTH ============
    const login = useCallback(async (username, password) => {
        if (useBackend) {
            try {
                const response = await authService.adminLogin(username, password);
                if (response.success) {
                    setIsAuthenticated(true);
                    setUserRole(response.data.user.role);
                    setCurrentUser(response.data.user);
                    toast.success('Welcome back, Admin!');

                    // Load data
                    const [pizzasRes, toppingsRes, ordersRes, analyticsRes] = await Promise.all([
                        pizzasService.getAll(),
                        toppingsService.getAll(),
                        ordersService.getAllAdmin(),
                        analyticsService.getDashboardData()
                    ]);

                    setPizzas(pizzasRes.success ? pizzasRes.data : []);
                    setToppings(toppingsRes.success ? toppingsRes.data : []);
                    setOrders(ordersRes.success ? ordersRes.data : []);
                    setAnalytics(analyticsRes.success ? analyticsRes.data : null);

                    return true;
                }
            } catch (e) {
                toast.error(e.message || 'Login failed');
                return false;
            }
        } else {
            const success = doAdminLogin(username, password);
            setIsAuthenticated(success);
            if (success) {
                setUserRole(getAdminRole());
                setCurrentUser({
                    username: username,
                    email: `${username}@cheezybite.com`
                });
                setAdmins(loadAdmins());
                toast.success('Welcome back, Admin!');
            } else {
                toast.error('Invalid username or password');
            }
            return success;
        }
    }, [useBackend]);

    const logout = useCallback(async () => {
        if (useBackend) {
            await authService.logout();
        } else {
            doAdminLogout();
        }
        setIsAuthenticated(false);
        setUserRole(null);
        setCurrentUser(null);
        toast.success('Logged out successfully');
    }, [useBackend]);

    const toggleAdminStatus = useCallback(async (id) => {
        if (useBackend) {
            try {
                const { default: api } = await import('@/services/apiClient');
                const response = await api.patch(`/admin/users/${id}`);
                if (response.success) {
                    setAdmins(prev => prev.map(a => a.id === id ? response.data : a));
                    toast.success(`Admin status updated`);
                }
            } catch (e) {
                toast.error("Failed to update status");
            }
        } else {
            const admin = admins.find(a => a.id === id);
            if (!admin) return;
            const newStatus = !admin.isActive;
            const updatedList = updateAdmin(id, { isActive: newStatus });
            setAdmins(updatedList);
            toast.success(`${admin.username} is now ${newStatus ? 'Active' : 'Disabled'}`);
        }
    }, [admins, useBackend]);

    // ============ PIZZAS ============
    const addPizza = useCallback(async (pizza) => {
        if (useBackend) {
            try {
                const response = await pizzasService.create(pizza);
                if (response.success) {
                    setPizzas(prev => [...prev, response.data]);
                    toast.success(`${pizza.name} added!`);
                    return response.data;
                }
            } catch (e) {
                toast.error("Failed to add pizza");
            }
        } else {
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
        }
    }, [pizzas, useBackend]);

    const updatePizza = useCallback(async (id, updates) => {
        if (useBackend) {
            try {
                const response = await pizzasService.update(id, updates);
                if (response.success) {
                    setPizzas(prev => prev.map(p => p.id === id ? response.data : p));
                    toast.success('Pizza updated!');
                }
            } catch (e) {
                toast.error("Failed to update pizza");
            }
        } else {
            const updated = pizzas.map(p => p.id === id ? { ...p, ...updates } : p);
            setPizzas(updated);
            savePizzas(updated);
            toast.success('Pizza updated!');
        }
    }, [pizzas, useBackend]);

    const togglePizzaEnabled = useCallback(async (id) => {
        if (useBackend) {
            try {
                const response = await pizzasService.toggleStatus(id);
                if (response.success) {
                    setPizzas(prev => prev.map(p => p.id === id ? response.data : p));
                    toast.success(`Pizza status updated`);
                }
            } catch (e) {
                toast.error("Failed to toggle pizza");
            }
        } else {
            const pizza = pizzas.find(p => p.id === id);
            const updated = pizzas.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p);
            setPizzas(updated);
            savePizzas(updated);
            toast.success(`${pizza?.name} ${pizza?.enabled ? 'disabled' : 'enabled'}!`);
        }
    }, [pizzas, useBackend]);

    const deletePizza = useCallback(async (id) => {
        if (useBackend) {
            try {
                const response = await pizzasService.delete(id);
                if (response.success) {
                    setPizzas(prev => prev.filter(p => p.id !== id));
                    toast.success("Pizza deleted");
                }
            } catch (e) {
                toast.error("Failed to delete pizza");
            }
        } else {
            const pizza = pizzas.find(p => p.id === id);
            const updated = pizzas.filter(p => p.id !== id);
            setPizzas(updated);
            savePizzas(updated);
            toast.success(`${pizza?.name} removed from menu!`);
        }
    }, [pizzas, useBackend]);

    // ============ TOPPINGS ============
    const updateTopping = useCallback(async (id, updates) => {
        if (useBackend) {
            try {
                const response = await toppingsService.update(id, updates);
                if (response.success) {
                    setToppings(prev => prev.map(t => t.id === id ? response.data : t));
                    toast.success('Topping updated!');
                }
            } catch (e) {
                toast.error("Failed to update topping");
            }
        } else {
            const updated = toppings.map(t => t.id === id ? { ...t, ...updates } : t);
            setToppings(updated);
            saveToppings(updated);
            toast.success('Topping updated!');
        }
    }, [toppings, useBackend]);

    const toggleToppingEnabled = useCallback(async (id) => {
        if (useBackend) {
            try {
                const response = await toppingsService.toggleStatus(id);
                if (response.success) {
                    setToppings(prev => prev.map(t => t.id === id ? response.data : t));
                    toast.success('Topping status toggled');
                }
            } catch (e) {
                toast.error("Failed to toggle topping");
            }
        } else {
            const topping = toppings.find(t => t.id === id);
            const updated = toppings.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t);
            setToppings(updated);
            saveToppings(updated);
            toast.success(`${topping?.name} ${topping?.enabled ? 'disabled' : 'enabled'}!`);
        }
    }, [toppings, useBackend]);

    const addTopping = useCallback(async (topping) => {
        if (useBackend) {
            try {
                const response = await toppingsService.create(topping);
                if (response.success) {
                    setToppings(prev => [...prev, response.data]);
                    toast.success(`${topping.name} added!`);
                    return response.data;
                }
            } catch (e) {
                toast.error("Failed to add topping");
            }
        } else {
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
        }
    }, [toppings, useBackend]);

    // ============ ORDERS ============
    const updateOrderStatus = useCallback(async (orderId, newStage) => {
        const stageNames = ['Order Placed', 'Preparing', 'Baking', 'Out for Delivery', 'Delivered'];

        if (useBackend) {
            try {
                const response = await ordersService.updateStatus(orderId, newStage);
                if (response.success) {
                    setOrders(prev => prev.map(o => o.id === orderId ? response.data : o));
                    if (newStage === -1) toast.error('Order Cancelled');
                    else toast.success(`Order status: ${stageNames[newStage]}`);

                    // Refresh analytics
                    const analyticsRes = await analyticsService.getDashboardData();
                    if (analyticsRes.success) setAnalytics(analyticsRes.data);
                }
            } catch (e) {
                toast.error("Failed to update status");
            }
        } else {
            if (newStage === -1) {
                updateOrderInStorage(orderId, -1, 'Cancelled');
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, currentStage: -1, status: 'Cancelled' } : o));
                toast.error('Order Cancelled');
                return;
            }
            const updatedOrders = updateOrderInStorage(orderId, newStage, stageNames[newStage]);
            setOrders(updatedOrders);
            toast.success(`Order status: ${stageNames[newStage]}`);
            setAnalytics(getAnalyticsData());
        }
    }, [useBackend]);

    const refreshOrders = useCallback(() => {
        refreshData();
    }, [useBackend, isAuthenticated]);

    // ============ RESET DATA ============
    const resetToDefaults = useCallback(() => {
        // Only for mock mode
        if (useBackend) {
            toast.error("Cannot reset Production Database from helper!");
            return;
        }
        savePizzas(DEFAULT_PIZZAS);
        saveToppings(DEFAULT_TOPPINGS);
        setPizzas(DEFAULT_PIZZAS);
        setToppings(DEFAULT_TOPPINGS);
        toast.success('Menu reset to defaults!');
    }, [useBackend]);

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
        currentUser,
        login,
        logout,
        admins,
        toggleAdminStatus,
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
