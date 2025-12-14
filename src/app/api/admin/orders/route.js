/**
 * API Route: Admin Order Management
 * GET /api/admin/orders - Get all orders
 */

import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { authenticate, isAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { successResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(request) {
    try {
        // Authenticate admin
        const authData = await authenticate(request);
        if (!authData || authData.type !== 'admin') {
            return unauthorizedResponse();
        }

        if (!isAdmin(authData)) {
            return forbiddenResponse();
        }

        await dbConnect();

        // Get all orders for admin
        const orders = await Order.find({})
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 })
            .select('-__v');

        return successResponse(orders, 'Orders fetched successfully');

    } catch (error) {
        return serverErrorResponse(error);
    }
}
