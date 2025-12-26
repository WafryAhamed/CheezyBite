"use client";

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import {
    // Legacy helper removal
} from '../utils/adminStorageHelper';
import toast from 'react-hot-toast';
import { authService } from '@/services/authService';
import { pizzasService } from '@/services/pizzasService';
import { toppingsService } from '@/services/toppingsService';
import { ordersService } from '@/services/ordersService';
import { analyticsService } from '@/services/analyticsService';
import { useSocket } from './SocketContext';

export const AdminContext = createContext();

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within AdminProvider');
    }
    return context;
};

export const AdminProvider = ({ children }) => {
    const { connect, disconnect } = useSocket();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [pizzas, setPizzas] = useState([]);
    const [toppings, setToppings] = useState([]);
    const [orders, setOrders] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load initial data (Backend Only)
    useEffect(() => {
        const loadToState = async () => {
            try {
                // 1. Check Auth (Cookies) - ALWAYS FIRST
                const authCheck = await authService.getCurrentUser();

                if (authCheck.success && ['Super Admin', 'Manager'].includes(authCheck.data.role)) {
                    // Auth Success
                    setIsAuthenticated(true);
                    setUserRole(authCheck.data.role);
                    setCurrentUser(authCheck.data);

                    // Connect Socket ONLY after Auth
                    connect();

                    // 2. Load Data (Parallel) - ONLY if Auth Passed
                    try {
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
                            const adminsRes = await api.get('/admin/users');
                            if (adminsRes.success) setAdmins(adminsRes.data);
                        }
                    } catch (fetchError) {
                        // If fetching data fails (e.g. 401 on protected routes), handle graceful logout
                        const isAuthError = fetchError?.response?.status === 401 ||
                            fetchError?.response?.status === 403 ||
                            fetchError?.status === 401 ||
                            fetchError?.status === 403;

                        if (isAuthError) {
                            console.warn("Auth check passed but data fetch 401'd. Logging out.");
                            setIsAuthenticated(false);
                            disconnect();
                            return; // Stop loading
                        }
                        console.error("Data load partial fail", fetchError);
                    }

                } else {
                    // Not authenticated as Admin
                    setIsAuthenticated(false);
                    disconnect();
                    // Clear legacy admin storage if present
                    const legacyKeys = ['cheezybite_admin_pizzas', 'cheezybite_admin_toppings',
                        'cheezybite_orders', 'cheezybite_admin_auth'];
                    legacyKeys.forEach(key => localStorage.removeItem(key));
                }
            } catch (e) {
                // Squelch 401/403 and Invalid Token errors - treat as not logged in
                const isAuthError = e?.response?.status === 401 ||
                    e?.response?.status === 403 ||
                    e?.status === 401 ||
                    e?.status === 403 ||
                    e?.message?.includes('Invalid token');

                if (!isAuthError) {
                    console.error("Admin load failed", e);
                }
                setIsAuthenticated(false);
                disconnect();
            } finally {
                // FIX: Always strict stop loading
                setLoading(false);
            }
        };

        loadToState();
    }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

    // Refresh data utility
    const refreshData = async () => {
        if (isAuthenticated) {
            try {
                const [ordersRes, analyticsRes] = await Promise.all([
                    ordersService.getAllAdmin(),
                    analyticsService.getDashboardData()
                ]);
                if (ordersRes.success) setOrders(ordersRes.data);
                if (analyticsRes.success) setAnalytics(analyticsRes.data);
            } catch (e) {
                if (e?.response?.status === 401) {
                    setIsAuthenticated(false);
                    disconnect();
                    toast.error("Session expired");
                }
            }
        }
    };

    // ============ AUTH ============
    const login = useCallback(async (username, password) => {
        try {
            const response = await authService.adminLogin(username, password);
            if (response.success) {
                const adminData = response.data.admin || response.data.user || response.data;
                setIsAuthenticated(true);
                setUserRole(adminData.role);
                setCurrentUser(adminData);
                connect(); // Connect Socket
                toast.success('Welcome back, Admin!');

                // Trigger data load in background (don't block login)
                refreshData().catch(console.error);

                // Load static assets in background
                Promise.all([
                    pizzasService.getAll(),
                    toppingsService.getAll()
                ]).then(([pizzasRes, toppingsRes]) => {
                    if (pizzasRes.success) setPizzas(pizzasRes.data);
                    if (toppingsRes.success) setToppings(toppingsRes.data);
                }).catch(console.error);

                return true;
            }
        } catch (e) {
            toast.error(e.message || 'Login failed');
            return false;
        }
    }, [connect]);

    const logout = useCallback(async () => {
        await authService.logout();
        setIsAuthenticated(false);
        setUserRole(null);
        setCurrentUser(null);
        disconnect(); // Disconnect Socket
        toast.success('Logged out successfully');
        window.location.href = '/admin/login';
    }, [disconnect]);

    const toggleAdminStatus = useCallback(async (id) => {
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
    }, []);

    // ============ PIZZAS ============
    const addPizza = useCallback(async (pizza) => {
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
    }, []);

    const updatePizza = useCallback(async (id, updates) => {
        try {
            const response = await pizzasService.update(id, updates);
            if (response.success) {
                setPizzas(prev => prev.map(p => p.id === id ? response.data : p));
                toast.success('Pizza updated!');
            }
        } catch (e) {
            toast.error("Failed to update pizza");
        }
    }, []);

    const togglePizzaEnabled = useCallback(async (id) => {
        try {
            const response = await pizzasService.toggleStatus(id);
            if (response.success) {
                setPizzas(prev => prev.map(p => p.id === id ? response.data : p));
                toast.success(`Pizza status updated`);
            }
        } catch (e) {
            toast.error("Failed to toggle pizza");
        }
    }, []);

    const deletePizza = useCallback(async (id) => {
        try {
            const response = await pizzasService.delete(id);
            if (response.success) {
                setPizzas(prev => prev.filter(p => p.id !== id));
                toast.success("Pizza deleted");
            }
        } catch (e) {
            toast.error("Failed to delete pizza");
        }
    }, []);

    // ============ TOPPINGS ============
    const updateTopping = useCallback(async (id, updates) => {
        try {
            const response = await toppingsService.update(id, updates);
            if (response.success) {
                setToppings(prev => prev.map(t => t.id === id ? response.data : t));
                toast.success('Topping updated!');
            }
        } catch (e) {
            toast.error("Failed to update topping");
        }
    }, []);

    const toggleToppingEnabled = useCallback(async (id) => {
        try {
            const response = await toppingsService.toggleStatus(id);
            if (response.success) {
                setToppings(prev => prev.map(t => t.id === id ? response.data : t));
                toast.success('Topping status toggled');
            }
        } catch (e) {
            toast.error("Failed to toggle topping");
        }
    }, []);

    const addTopping = useCallback(async (topping) => {
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
    }, []);

    // ============ ORDERS ============
    const updateOrderStatus = useCallback(async (orderId, newStage) => {
        const stageNames = ['Order Placed', 'Preparing', 'Baking', 'Out for Delivery', 'Delivered'];

        try {
            const response = await ordersService.updateStatus(orderId, newStage);
            if (response.success) {
                setOrders(prev => prev.map(o => o.id === orderId ? response.data : o));
                if (newStage === -1) {
                    toast.success('Order Cancelled');
                } else {
                    toast.success(`Order status: ${stageNames[newStage]}`);
                }

                // Refresh analytics
                const analyticsRes = await analyticsService.getDashboardData();
                if (analyticsRes.success) setAnalytics(analyticsRes.data);
            } else {
                toast.error(response.message || "Failed to update status");
            }
        } catch (e) {
            const errorMsg = e?.message || e?.error || "Failed to update status";
            console.error("Update order status error:", errorMsg, e);
            toast.error(errorMsg);
        }
    }, []);

    // Set up socket listeners for realtime order updates (only when authenticated)
    useEffect(() => {
        if (!isAuthenticated) return;

        // Set up realtime socket listeners
        const setupSocketListeners = async () => {
            try {
                // Use the context's socket if already initialized via useSocket
                // Otherwise, create a new one
                const { io } = await import('socket.io-client');
                const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

                const adminSocket = io(socketUrl, {
                    reconnection: true,
                    reconnectionDelay: 1000,
                    reconnectionDelayMax: 5000,
                    reconnectionAttempts: 5,
                    transports: ['websocket', 'polling'],
                    autoConnect: true // Auto connect this instance
                });

                // Wait for connection before setting up listeners
                adminSocket.on('connect', () => {
                    console.log('✅ Admin socket connected');
                    adminSocket.emit('admin:subscribe');
                });

                // Listen for new orders
                adminSocket.on('order:created', (data) => {
                    console.log('New order received via socket:', data);
                    // If full order object sent, add it to orders list
                    if (data.order) {
                        setOrders(prevOrders => [data.order, ...prevOrders]);
                    } else {
                        // Fallback: refresh all orders if full object not available
                        refreshData();
                    }
                    toast.success(`New order placed by ${data.customerName || 'Customer'}`);
                });

                // Listen for status changes (both event names for compatibility)
                const handleStatusUpdate = (data) => {
                    console.log('Order status updated via socket:', data);
                    // Update order in list - handle both _id and id fields
                    setOrders(prevOrders =>
                        prevOrders.map(order => {
                            const matches = order._id === data.orderId || order.id === data.orderId;
                            return matches ? {
                                ...order,
                                status: data.status,
                                currentStage: data.currentStage,
                                ...(data.order && { ...data.order }) // Merge full order object if provided
                            } : order;
                        })
                    );
                };

                adminSocket.on('order:updated', handleStatusUpdate);
                adminSocket.on('order:statusChanged', handleStatusUpdate); // Fallback for old event name

                // Cleanup function to remove listeners
                return () => {
                    adminSocket.off('order:created');
                    adminSocket.off('order:updated', handleStatusUpdate);
                    adminSocket.off('order:statusChanged', handleStatusUpdate);
                    adminSocket.disconnect();
                };
            } catch (error) {
                console.warn('Socket listener setup failed, will use polling fallback:', error);
                return () => { };
            }
        };

        const cleanup = setupSocketListeners();

        // Call cleanup if returned a function
        if (cleanup && typeof cleanup === 'function') {
            return cleanup;
        }
    }, [isAuthenticated]);

    const refreshOrders = useCallback(() => {
        refreshData();
    }, [isAuthenticated]);

    // ============ HELPERS ============
    // Mock reset removal
    const resetToDefaults = useCallback(() => {
        toast.error("Cannot reset data in Production Mode (Backend Active)");
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

    const refreshAnalytics = useCallback(() => {
        refreshData();
    }, [isAuthenticated]);

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
        refreshAnalytics,
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
