/**
 * API Route: Admin Update Order Status
 * PATCH /api/admin/orders/[id]/status - Update order status
 */

import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { authenticate, isAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { successResponse, notFoundResponse, errorResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function PATCH(request, { params }) {
    try {
        // Authenticate admin
        const authData = await authenticate(request);
        if (!authData || !isAdmin(authData)) {
            return unauthorizedResponse();
        }

        const { id } = await params;
        const body = await request.json();
        const { currentStage } = body;

        // Allow -1 for cancellation, or 0-4 for normal stages
        if (currentStage === undefined || currentStage < -1 || currentStage > 4) {
            return errorResponse('Invalid stage value. Must be -1 (cancelled) or 0-4', null, 400);
        }

        await dbConnect();

        // Get order
        const order = await Order.findOne({ id: id });

        if (!order) {
            return notFoundResponse('Order');
        }

        // Map stage to status message
        const stageToStatus = {
            '-1': 'Cancelled',
            '0': 'Order Placed',
            '1': 'Preparing',
            '2': 'Baking',
            '3': 'Out for Delivery',
            '4': 'Delivered'
        };

        // Update order stage and status
        order.currentStage = currentStage;
        order.status = stageToStatus[currentStage.toString()] || 'Order Placed';
        
        // Add to status history
        order.statusHistory.push({
            stage: currentStage,
            status: order.status,
            timestamp: new Date()
        });

        await order.save();

        // Emit Socket.IO event for status update
        const { emitSocketEvent } = await import('@/lib/socketBridge');

        // Prepare event data with consistent format
        const eventData = {
            orderId: order.id,
            status: order.status,
            currentStage: order.currentStage,
            timestamp: new Date(),
            order: order.toObject ? order.toObject() : order // Full object for admin dashboard
        };

        // Emit to Order Room (Tracking Page) - User tracking this order
        await emitSocketEvent('order:update', eventData, `order-${id}`);

        // Emit to User Room (My Orders List) - User's personal room
        if (order.userId) {
            await emitSocketEvent('order:update', eventData, `user-${order.userId}`);
        }

        // Emit to Admin Dashboard (so other admins see change)
        await emitSocketEvent('order:updated', eventData, 'admin-orders');

        return successResponse(order, 'Order status updated successfully');

    } catch (error) {
        return serverErrorResponse(error);
    }
}
