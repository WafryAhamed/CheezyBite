/**
 * API Route: Order Management
 * POST /api/orders - Create new order
 * GET /api/orders - Get user's orders
 */

import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { authenticate, unauthorizedResponse } from '@/lib/auth';
import { validateOrderData } from '@/lib/validators';
import { successResponse, validationErrorResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function POST(request) {
    try {
        // Authenticate user
        const authData = await authenticate(request);
        if (!authData || authData.type !== 'user') {
            return unauthorizedResponse();
        }

        // Parse request body
        const body = await request.json();

        // Validate input
        const validation = validateOrderData(body);
        if (!validation.isValid) {
            return validationErrorResponse(validation.errors);
        }

        await dbConnect();

        // Generate order ID
        const orderId = `ORD-${Date.now()}`;

        // Create order
        const order = await Order.create({
            id: orderId,
            userId: authData.userId,
            items: body.items,
            total: body.total,
            address: body.address,
            paymentMethod: body.paymentMethod,
            paymentDetails: body.paymentDetails || {},
            paymentStatus: body.paymentMethod === 'cash' ? 'pending' : 'paid',
            deliveryTime: body.deliveryTime || 'asap',
            scheduledFor: body.scheduledFor || null,
            deliveryInstructions: body.deliveryInstructions || '',
            currentStage: 0,
            status: 'Order Placed',
            statusHistory: [{
                stage: 0,
                status: 'Order Placed',
                timestamp: new Date()
            }],
            estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
        });

        // TODO: Emit Socket.IO event for new order
        // const { emitNewOrder } = require('../../../../server/index');
        // emitNewOrder(order);

        return successResponse(order, 'Order created successfully', 201);

    } catch (error) {
        return serverErrorResponse(error);
    }
}

export async function GET(request) {
    try {
        // Authenticate user
        const authData = await authenticate(request);
        if (!authData || authData.type !== 'user') {
            return unauthorizedResponse();
        }

        await dbConnect();

        // Get user's orders
        const orders = await Order.find({ userId: authData.userId })
            .sort({ createdAt: -1 })
            .select('-__v');

        return successResponse(orders, 'Orders fetched successfully');

    } catch (error) {
        return serverErrorResponse(error);
    }
}
