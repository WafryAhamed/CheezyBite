"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import { authService } from '@/services/authService';

export const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within UserProvider');
    }
    return context;
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const useBackend = process.env.NEXT_PUBLIC_USE_API_BACKEND === 'true';

    // Import apiClient dynamically to avoid SSR issues if any, though it's safe
    // But better to use the imported singleton if we import it at top.
    // Let's add the import at the top first.

    // Load user (Backend Only)
    useEffect(() => {
        const loadUser = async () => {
            try {
                // Check if we have a valid session via cookie
                const response = await authService.getCurrentUser();
                if (response.success && response.data.type === 'user') {
                    // Polyfill address from first array item if present
                    const userData = response.data;
                    if (userData.addresses && userData.addresses.length > 0) {
                        // Map 'street' from schema to 'address' for frontend
                        userData.address = userData.addresses[0].street || userData.addresses[0].address;
                    }
                    setUser(userData);
                } else {
                    // Not authenticated or session expired
                    setUser(null);
                    // Legacy Cleanup: Remove old localStorage keys if they exist
                    localStorage.removeItem('cheezybite_user');
                    localStorage.removeItem('jwt_token');
                }
            } catch (e) {
                const isExpectedError = e?.response?.status === 401 ||
                    e?.response?.status === 403 ||
                    e?.response?.status === 404 ||
                    e?.message?.includes('Invalid token') ||
                    e?.status === 401 || // Check explicit status property if present
                    e?.status === 403 ||
                    e?.status === 404;

                if (!isExpectedError) {
                    console.error("Failed to load user from API", e);
                }
                setUser(null);
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    const login = async (email, password) => {
        if (!email || !password) {
            toast.error("Please fill in all fields");
            return { success: false };
        }

        try {
            const response = await authService.login(email, password);
            if (response.success) {
                setUser(response.data.user);
                toast.success(`Welcome back!`);
                return { success: true };
            }
        } catch (error) {
            // Check for verification requirement
            if (error?.response?.data?.data?.requireVerification || error?.message?.includes('verified') || error?.response?.status === 403) {
                return { success: false, requireVerification: true };
            }
            toast.error(error.message || "Login failed");
            return { success: false, error: error.message };
        }
    };

    const register = async (name, email, password) => {
        if (!name || !email || !password) {
            toast.error("All fields are required");
            return { success: false };
        }

        try {
            const response = await authService.register(email, password, name);
            if (response.success) {
                // Check if verification is required (it should be)
                if (response.data.requireVerification) {
                    return { success: true, requireVerification: true };
                }

                setUser(response.data.user);
                toast.success(`Welcome to CheezyBite!`);
                return { success: true };
            }
        } catch (error) {
            toast.error(error.message || "Registration failed");
            return { success: false, error: error.message };
        }
    };

    const loginWithGoogle = async () => {
        toast.error("Google Login not yet implemented in backend.");
        return false;
    };

    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
            toast.success("Logged out successfully");

            // Redirect to home if needed, but state update handles UI
            window.location.href = '/';
        } catch (e) {
            console.error("Logout error", e);
            setUser(null);
        }
    };

    const updateUser = async (updates) => {
        if (!user) return;

        try {
            // Filter updates to only allowed fields
            const allowedUpdates = {
                name: updates.name,
                phone: updates.phone,
                phone_verified: updates.phone_verified,
                address: updates.address // Allow address update
            };

            const response = await authService.updateProfile(allowedUpdates);
            if (response.success) {
                // Backend now returns compatible object, merge it
                setUser(prev => ({ ...prev, ...response.data }));
                toast.success("Profile updated successfully!");
            } else {
                // Handle API error response
                const errorMessage = response.message || response.error || "Failed to update profile";
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error("Update profile error:", error);
            
            // Better error handling
            let errorMessage = "Failed to update profile";
            
            if (error.response?.status === 400) {
                errorMessage = error.response?.data?.message || "Please check your information";
            } else if (error.response?.status === 401) {
                errorMessage = "Session expired. Please log in again.";
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage);
        }
    };

    const addAddress = async (address) => {
        if (!user) return;
        const newAddr = {
            id: `addr_${Date.now()}`,
            ...address,
            isDefault: user.addresses?.length === 0 // Make default if first address
        };

        const updatedAddresses = [...(user.addresses || []), newAddr];

        try {
            const response = await authService.updateProfile({ addresses: updatedAddresses });
            if (response.success) {
                setUser(prev => ({ ...prev, ...response.data }));
                toast.success("Address added successfully");
            }
        } catch (e) {
            toast.error("Failed to add address");
        }
    };

    const removeAddress = async (addressId) => {
        if (!user) return;
        const updatedAddresses = user.addresses.filter(a => a.id !== addressId);

        try {
            const response = await authService.updateProfile({ addresses: updatedAddresses });
            if (response.success) {
                setUser(prev => ({ ...prev, ...response.data }));
                toast.success("Address removed");
            }
        } catch (e) {
            toast.error("Failed to remove address");
        }
    };

    const setAddressAsDefault = async (addressId) => {
        if (!user) return;
        const updatedAddresses = user.addresses.map(a => ({
            ...a,
            isDefault: a.id === addressId
        }));

        try {
            const response = await authService.updateProfile({ addresses: updatedAddresses });
            if (response.success) {
                setUser(prev => ({ ...prev, ...response.data }));
                toast.success("Default address updated");
            }
        } catch (e) {
            toast.error("Failed to update preference");
        }
    };

    return (
        <UserContext.Provider value={{
            user,
            loading,
            login,
            register,
            loginWithGoogle,
            logout,
            updateUser,
            addAddress,
            removeAddress,
            setAddressAsDefault,
            isAuthenticated: !!user
        }}>
            {children}
        </UserContext.Provider>
    );
};
