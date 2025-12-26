/**
 * API Route: Get Current User
 * GET /api/auth/me
 */

import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Admin from '@/models/Admin';
import { authenticate, unauthorizedResponse } from '@/lib/auth';
import { successResponse, notFoundResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(request) {
    try {
        // Authenticate user/admin
        const authData = await authenticate(request);
        if (!authData) {
            return unauthorizedResponse();
        }

        await dbConnect();

        let userData = null;

        if (authData.type === 'admin') {
            const admin = await Admin.findById(authData.adminId).select('-password');
            if (!admin) return notFoundResponse('Admin');
            userData = {
                id: admin._id,
                username: admin.username,
                role: admin.role,
                isActive: admin.isActive,
                type: 'admin' // Explicitly mark as admin
            };
        } else {
            const user = await User.findById(authData.userId).select('-password');
            if (!user) return notFoundResponse('User');
            userData = {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role || 'Customer',
                phone: user.phone,
                phone_verified: user.phone_verified,
                addresses: user.addresses,
                type: 'user'
            };
        }

        return successResponse(userData, 'User fetched successfully');

    } catch (error) {
        return serverErrorResponse(error);
    }
}
