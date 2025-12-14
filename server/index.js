const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());

// Socket.IO configuration
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'CheezyBite Socket.IO Server is running',
        timestamp: new Date().toISOString(),
        connections: io.engine.clientsCount
    });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Admin subscribes to dashboard updates
    socket.on('admin:subscribe', () => {
        socket.join('admin-dashboard');
        console.log(`📊 Admin ${socket.id} subscribed to dashboard`);
    });

    // Customer tracks specific order
    socket.on('order:track', (data) => {
        const { orderId } = data;
        socket.join(`order-${orderId}`);
        console.log(`📦 Client ${socket.id} tracking order: ${orderId}`);
    });

    // Admin joins order management room
    socket.on('admin:orders', () => {
        socket.join('admin-orders');
        console.log(`📋 Admin ${socket.id} joined orders room`);
    });

    // Disconnect handling
    socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
    });
});

/**
 * Helper functions to emit events from API routes
 * These are called from Next.js API routes to push real-time updates
 */

// Emit new order to admin dashboard
function emitNewOrder(orderData) {
    io.to('admin-dashboard').emit('order:created', {
        orderId: orderData.id,
        total: orderData.total,
        items: orderData.items,
        customerName: orderData.address?.label || 'Customer',
        timestamp: Date.now()
    });
    console.log(`📢 Broadcasted new order: ${orderData.id}`);
}

// Emit order status update
function emitOrderStatusUpdate(orderId, status, currentStage) {
    // To customer tracking this order
    io.to(`order-${orderId}`).emit('order:update', {
        orderId,
        status,
        currentStage,
        timestamp: Date.now()
    });

    // To admin dashboard
    io.to('admin-dashboard').emit('order:statusChanged', {
        orderId,
        status,
        currentStage,
        timestamp: Date.now()
    });

    console.log(`📢 Broadcasted order status update: ${orderId} → ${status}`);
}

// Emit order delivered notification
function emitOrderDelivered(orderId) {
    io.to(`order-${orderId}`).emit('order:delivered', {
        orderId,
        timestamp: Date.now()
    });
    console.log(`🎉 Broadcasted order delivered: ${orderId}`);
}

// Export io and helper functions for use in API routes
module.exports = {
    app,
    server,
    io,
    emitNewOrder,
    emitOrderStatusUpdate,
    emitOrderDelivered
};

// Start server if run directly
if (require.main === module) {
    const PORT = process.env.SOCKET_IO_PORT || 4000;
    server.listen(PORT, () => {
        console.log(`🚀 Socket.IO Server running on http://localhost:${PORT}`);
        console.log(`📡 Accepting connections from: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
    });
}
