/**
 * API Route: Admin Order Management
 * GET /api/admin/orders - Get all orders
 */

import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import User from '@/models/User';
import { authenticate, isAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { successResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(request) {
    try {
        // Authenticate admin
        console.log('🔍 [Admin Orders API] Starting authentication...');
        const authData = await authenticate(request);
        console.log('🔍 [Admin Orders API] Auth Data:', JSON.stringify(authData, null, 2));

        if (!authData || authData.type !== 'admin') {
            console.log('❌ [Admin Orders API] Auth failed - authData:', authData);
            console.log('❌ [Admin Orders API] Type check:', authData?.type);
            return unauthorizedResponse();
        }

        if (!isAdmin(authData)) {
            console.log('❌ [Admin Orders API] isAdmin check failed - role:', authData?.role);
            return forbiddenResponse();
        }

        console.log('✅ [Admin Orders API] Authentication passed!');

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
