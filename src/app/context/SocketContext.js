"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Init socket instance but DO NOT connect automatically
        const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000', {
            withCredentials: true,
            autoConnect: false, // WAITING FOR AUTH
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });

        socketInstance.on('connect', () => {
            console.log('✅ Socket connected:', socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('❌ Socket disconnected');
            setIsConnected(false);
        });

        socketInstance.on('connect_error', (err) => {
            // Suppress connection errors - Socket.IO server might not be running
            // This is not critical for app functionality
        });

        socketInstance.on('error', (error) => {
            // Suppress general socket errors
        });

        setSocket(socketInstance);

        // Cleanup
        return () => {
            if (socketInstance.connected) {
                socketInstance.disconnect();
            }
        };
    }, []);

    const connect = () => {
        if (socket && !socket.connected) {
            socket.connect();
        }
    };

    const disconnect = () => {
        if (socket && socket.connected) {
            socket.disconnect();
        }
    };

    // Helper: Subscribe to Admin Dashboard (Global Orders)
    const subscribeToAdminDashboard = () => {
        if (!socket) return;
        socket.emit('admin:subscribe');
    };

    // Helper: Subscribe to Specific Order
    const subscribeToOrder = (orderId) => {
        if (!socket || !orderId) return;
        socket.emit('order:track', { orderId });
    };

    // Helper: Subscribe to Admin Orders management room
    const subscribeToAdminOrders = () => {
        if (!socket) return;
        socket.emit('admin:orders');
    }

    // Helper: Subscribe to Menu Updates
    const subscribeToMenu = () => {
        if (!socket) return;
        socket.emit('menu:subscribe');
    };

    const value = {
        socket,
        isConnected,
        connect,
        disconnect,
        subscribeToAdminDashboard,
        subscribeToOrder,
        subscribeToAdminOrders,
        subscribeToMenu
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;
