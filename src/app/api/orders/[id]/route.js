/**
 * API Route: Single Order Management
 * GET /api/orders/[id] - Get single order
 * POST /api/orders/[id]/cancel - Cancel order
 */

import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { authenticate, unauthorizedResponse } from '@/lib/auth';
import { successResponse, notFoundResponse, errorResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(request, { params }) {
    try {
        // Authenticate user (optional for guest orders)
        const authData = await authenticate(request);

        const { id } = await params;

        await dbConnect();

        // Get order first to check ownership
        const order = await Order.findOne({ id: id }).select('-__v');

        if (!order) {
            return notFoundResponse('Order');
        }

        // Access Control
        if (order.userId) {
            // If order belongs to a user, requester MUST be that user (or Admin)
            if (!authData || (authData.type !== 'user' && authData.type !== 'admin')) {
                return unauthorizedResponse();
            }
            if (authData.type === 'user' && authData.userId !== order.userId.toString()) {
                return unauthorizedResponse();
            }
        }
        // If order.userId is null/undefined, it is a Guest Order -> Allow access with ID

        return successResponse(order, 'Order fetched successfully');

    } catch (error) {
        return serverErrorResponse(error);
    }
}

// Cancel order endpoint (separate file for clarity)
export async function POST(request, { params }) {
    try {
        // Authenticate user
        const authData = await authenticate(request);
        if (!authData || authData.type !== 'user') {
            return unauthorizedResponse();
        }

        const { id } = await params;

        await dbConnect();

        // Get order
        const order = await Order.findOne({
            id: id,
            userId: authData.userId
        });

        if (!order) {
            return notFoundResponse('Order');
        }

        // Check if order can be cancelled (only in first stage)
        if (order.currentStage > 0) {
            return errorResponse('Order cannot be cancelled after preparation has begun', null, 400);
        }

        // Cancel order
        order.currentStage = -1;
        order.status = 'Cancelled';
        order.cancelledAt = new Date();
        order.cancelReason = 'Cancelled by customer';
        await order.save();

        return successResponse(order, 'Order cancelled successfully');

    } catch (error) {
        return serverErrorResponse(error);
    }
}
