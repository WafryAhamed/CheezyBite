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
        if (!authData || authData.type !== 'admin') {
            return unauthorizedResponse();
        }

        if (!isAdmin(authData)) {
            return forbiddenResponse();
        }

        const { id } = await params;
        const body = await request.json();
        const { currentStage } = body;

        if (currentStage === undefined || currentStage < 0 || currentStage > 4) {
            return errorResponse('Invalid stage value. Must be between 0 and 4', null, 400);
        }

        await dbConnect();

        // Get order
        const order = await Order.findOne({ id: id });

        if (!order) {
            return notFoundResponse('Order');
        }

        // Update order stage
        order.currentStage = currentStage;
        await order.save();

        // TODO: Emit Socket.IO event for status update
        // const { emitOrderStatusUpdate } = require('../../../../../server/index');
        // emitOrderStatusUpdate(order.id, order.status, order.currentStage);

        return successResponse(order, 'Order status updated successfully');

    } catch (error) {
        return serverErrorResponse(error);
    }
}
