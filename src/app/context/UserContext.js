"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';

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

    // Load user from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('cheezybite_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user", e);
                localStorage.removeItem('cheezybite_user');
            }
        }
        setLoading(false);
    }, []);

    const login = (email, password) => {
        // Mock Login (Accept any valid-looking email for demo)
        if (!email || !password) {
            toast.error("Please fill in all fields");
            return false;
        }

        const mockUser = {
            id: 'u_' + Date.now(),
            name: email.split('@')[0],
            email: email,
            phone: '+94 77 123 4567', // Default mock phone
            phone_verified: true // Assume verified for repeat login demo
        };

        setUser(mockUser);
        localStorage.setItem('cheezybite_user', JSON.stringify(mockUser));
        toast.success(`Welcome back, ${mockUser.name}!`);
        return true;
    };

    const register = (name, email, password) => {
        if (!name || !email || !password) {
            toast.error("All fields are required");
            return false;
        }

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
    };

    const loginWithGoogle = async () => {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

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

    const logout = () => {
        setUser(null);
        localStorage.removeItem('cheezybite_user');
        toast.success("Logged out successfully");
    };

    const updateUser = (updates) => {
        if (!user) return;
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('cheezybite_user', JSON.stringify(updatedUser));
    };

    const addAddress = (address) => {
        if (!user) return;
        const newAddress = { ...address, id: 'addr_' + Date.now() };
        const currentAddresses = user.addresses || [];

        // If first address, make it default
        if (currentAddresses.length === 0) newAddress.isDefault = true;

        const updatedAddresses = [...currentAddresses, newAddress];
        updateUser({ addresses: updatedAddresses });
        toast.success("Address added successfully");
    };

    const removeAddress = (addressId) => {
        if (!user || !user.addresses) return;
        const updatedAddresses = user.addresses.filter(a => a.id !== addressId);
        updateUser({ addresses: updatedAddresses });
        toast.success("Address removed");
    };

    const setAddressAsDefault = (addressId) => {
        if (!user || !user.addresses) return;
        const updatedAddresses = user.addresses.map(a => ({
            ...a,
            isDefault: a.id === addressId
        }));
        updateUser({ addresses: updatedAddresses });
        toast.success("Default address updated");
    };

    const verifyPhone = () => {
        if (!user) return;
        const updatedUser = { ...user, phone_verified: true };
        setUser(updatedUser);
        localStorage.setItem('cheezybite_user', JSON.stringify(updatedUser));
        toast.success("Phone number verified successfully!");
    };

    return (
        <UserContext.Provider value={{
            user,
            loading,
            login,
            loginWithGoogle,
            register,
            logout,
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
