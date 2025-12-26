/**
 * API Route: Admin Customer Details
 * GET /api/admin/customers/:id - Get customer details with order history
 */

import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Order from '@/models/Order';
import { authenticate, isAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { successResponse, notFoundResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(request, { params }) {
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

        const { id } = params;

        // Get customer details (exclude password)
        const customer = await User.findById(id).select('-password -__v').lean();

        if (!customer) {
            return notFoundResponse('Customer');
        }

        // Get customer's orders
        const orders = await Order.find({ userId: id })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        // Calculate stats
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const lastOrderDate = orders.length > 0 ? orders[0].createdAt : null;

        // Get default address
        const defaultAddress = customer.addresses?.find(addr => addr.isDefault) || customer.addresses?.[0] || null;

        return successResponse({
            customer: {
                ...customer,
                totalOrders,
                totalSpent,
                lastOrderDate,
                status: totalOrders === 0 ? 'New' : 'Active'
            },
            defaultAddress,
            recentOrders: orders.slice(0, 10),
            allOrders: orders
        }, 'Customer details fetched successfully');

    } catch (error) {
        console.error('GET /api/admin/customers/:id error:', error);
        return serverErrorResponse(error);
    }
}
