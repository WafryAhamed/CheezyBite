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

const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
const useBackend = process.env.NEXT_PUBLIC_USE_API_BACKEND === 'true';

// Import apiClient dynamically to avoid SSR issues if any, though it's safe
// But better to use the imported singleton if we import it at top.
// Let's add the import at the top first.

// Load user
useEffect(() => {
    const loadUser = async () => {
        if (useBackend) {
            try {
                // Check if we have a token (handled by axios interceptor or cookie)
                const response = await authService.getCurrentUser();
                if (response.success) {
                    setUser(response.data);
                } else {
                    // Silent fail or logout if token invalid
                    authService.logout();
                }
            } catch (e) {
                console.error("Failed to load user from API", e);
            }
        } else {
            // Mock Mode: Load from localStorage
            const storedUser = localStorage.getItem('cheezybite_user');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Failed to parse user", e);
                    localStorage.removeItem('cheezybite_user');
                }
            }
        }
        setLoading(false);
    };

    loadUser();
}, [useBackend]);

const login = async (email, password) => {
    if (!email || !password) {
        toast.error("Please fill in all fields");
        return false;
    }

    if (useBackend) {
        try {
            const response = await authService.login(email, password);
            if (response.success) {
                setUser(response.data.user);
                toast.success(`Welcome back!`);
                return true;
            }
        } catch (error) {
            toast.error(error.message || "Login failed");
            return false;
        }
    } else {
        // Mock Login
        const mockUser = {
            id: 'u_' + Date.now(),
            name: email.split('@')[0],
            email: email,
            phone: '+94 77 123 4567',
            phone_verified: true
        };
        setUser(mockUser);
        localStorage.setItem('cheezybite_user', JSON.stringify(mockUser));
        toast.success(`Welcome back, ${mockUser.name}!`);
        return true;
    }
};

const register = async (name, email, password) => {
    if (!name || !email || !password) {
        toast.error("All fields are required");
        return false;
    }

    if (useBackend) {
        try {
            const response = await authService.register(email, password, name);
            if (response.success) {
                setUser(response.data.user);
                toast.success(`Welcome to CheezyBite!`);
                return true;
            }
        } catch (error) {
            toast.error(error.message || "Registration failed");
            return false;
        }
    } else {
        // Mock Register
        const newUser = {
            id: 'u_' + Date.now(),
            name,
            email,
            phone: '',
            phone_verified: false,
            photo: null
        };
        setUser(newUser);
        localStorage.setItem('cheezybite_user', JSON.stringify(newUser));
        toast.success(`Welcome to CheezyBite, ${name}!`);
        return true;
    }
};

const loginWithGoogle = async () => {
    setLoading(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Start with Mock for Google login even in backend mode for now
    // Or implement a real Google Auth later.
    // For now, keep it mock as requested ("mocked items to convert gradually")

    const mockGoogleUser = {
        id: 'g_' + Date.now(),
        name: 'Demo User',
        email: 'demo.user@gmail.com',
        photo: 'https://ui-avatars.com/api/?name=Demo+User&background=random',
        phone: '',
        phone_verified: false,
        provider: 'google'
    };

    setUser(mockGoogleUser);
    localStorage.setItem('cheezybite_user', JSON.stringify(mockGoogleUser));
    toast.success(`Welcome back, ${mockGoogleUser.name}!`);
    setLoading(false);
    return true;
};

const logout = async () => {
    if (useBackend) {
        try {
            await authService.logout();
            setUser(null);
            toast.success("Logged out successfully");
        } catch (e) {
            console.error("Logout error", e);
            // Force client logout anyway
            setUser(null);
        }
    } else {
        setUser(null);
        localStorage.removeItem('cheezybite_user');
        toast.success("Logged out successfully");
    }
};

const updateUser = async (updates) => {
    if (!user) return;

    if (useBackend) {
        try {
            // Filter updates to only allowed fields
            const allowedUpdates = {
                name: updates.name,
                phone: updates.phone,
                phone_verified: updates.phone_verified
            };

            const response = await authService.updateProfile(allowedUpdates);
            if (response.success) {
                setUser(prev => ({ ...prev, ...response.data }));
                toast.success("Profile updated");
            }
        } catch (error) {
            toast.error("Failed to update profile");
        }
    } else {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('cheezybite_user', JSON.stringify(updatedUser));
    }
};

const addAddress = async (address) => {
    if (!user) return;

    if (useBackend) {
        try {
            const response = await apiClient.post('/users/addresses', address);
            if (response.success) {
                // Refresh user to get updated addresses
                const userResponse = await authService.getCurrentUser();
                if (userResponse.success) {
                    setUser(userResponse.data);
                    toast.success("Address added successfully");
                }
            }
        } catch (error) {
            toast.error("Failed to add address");
        }
    } else {
        const newAddress = { ...address, id: 'addr_' + Date.now() };
        const currentAddresses = user.addresses || [];
        if (currentAddresses.length === 0) newAddress.isDefault = true;
        const updatedAddresses = [...currentAddresses, newAddress];

        // Re-use mock updateUser logic inline or call function?
        // Calling local function handles state update
        const updatedUser = { ...user, addresses: updatedAddresses };
        setUser(updatedUser);
        localStorage.setItem('cheezybite_user', JSON.stringify(updatedUser));
        toast.success("Address added successfully");
    }
};

const removeAddress = async (addressId) => {
    if (!user) return;

    if (useBackend) {
        try {
            const response = await apiClient.delete(`/users/addresses/${addressId}`);
            if (response.success) {
                // Optimistic update
                setUser(prev => ({
                    ...prev,
                    addresses: prev.addresses.filter(a => a.id !== addressId)
                }));
                toast.success("Address removed");
            }
        } catch (error) {
            toast.error("Failed to remove address");
        }
    } else {
        const updatedAddresses = (user.addresses || []).filter(a => a.id !== addressId);
        const updatedUser = { ...user, addresses: updatedAddresses };
        setUser(updatedUser);
        localStorage.setItem('cheezybite_user', JSON.stringify(updatedUser));
        toast.success("Address removed");
    }
};

const setAddressAsDefault = async (addressId) => {
    if (!user) return;

    if (useBackend) {
        try {
            const response = await apiClient.put(`/users/addresses/${addressId}`, { isDefault: true });
            if (response.success) {
                // Update local state to reflect change
                setUser(prev => ({
                    ...prev,
                    addresses: prev.addresses.map(a => ({
                        ...a,
                        isDefault: a.id === addressId
                    }))
                }));
                toast.success("Default address updated");
            }
        } catch (error) {
            toast.error("Failed to update address");
        }
    } else {
        const updatedAddresses = (user.addresses || []).map(a => ({
            ...a,
            isDefault: a.id === addressId
        }));
        const updatedUser = { ...user, addresses: updatedAddresses };
        setUser(updatedUser);
        localStorage.setItem('cheezybite_user', JSON.stringify(updatedUser));
        toast.success("Default address updated");
    }
};

const verifyPhone = async () => {
    if (!user) return;

    if (useBackend) {
        try {
            const response = await authService.updateProfile({ phone_verified: true });
            if (response.success) {
                setUser(prev => ({ ...prev, phone_verified: true }));
                toast.success("Phone number verified successfully!");
            }
        } catch (error) {
            toast.error("Verification failed");
        }
    } else {
        const updatedUser = { ...user, phone_verified: true };
        setUser(updatedUser);
        localStorage.setItem('cheezybite_user', JSON.stringify(updatedUser));
        toast.success("Phone number verified successfully!");
    }
};

return (
    <UserContext.Provider value={{
        user,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        updateUser,
        addAddress,
        removeAddress,
        setAddressAsDefault,
        verifyPhone,
        isAuthenticated: !!user
    }}>
        {children}
    </UserContext.Provider>
);
};
