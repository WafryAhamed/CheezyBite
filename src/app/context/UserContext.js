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
            phone: '+94 77 123 4567' // Default mock phone
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
            phone: ''
        };

        setUser(newUser);
        localStorage.setItem('cheezybite_user', JSON.stringify(newUser));
        toast.success(`Welcome to CheezyBite, ${name}!`);
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

    return (
        <UserContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            updateUser,
            isAuthenticated: !!user
        }}>
            {children}
        </UserContext.Provider>
    );
};
