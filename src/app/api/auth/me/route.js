/**
 * API Route: Get Current User
 * GET /api/auth/me
 */

import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { authenticate, unauthorizedResponse } from '@/lib/auth';
import { successResponse, notFoundResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(request) {
    try {
        // Authenticate user
        const authData = await authenticate(request);
        if (!authData || authData.type !== 'user') {
            return unauthorizedResponse();
        }

        // Connect to database
        await dbConnect();

        // Find user
        const user = await User.findById(authData.userId).select('-password');
        if (!user) {
            return notFoundResponse('User');
        }

        // Return user data
        const userData = {
            id: user._id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            phone_verified: user.phone_verified,
            addresses: user.addresses
        };

        return successResponse(userData, 'User fetched successfully');

    } catch (error) {
        return serverErrorResponse(error);
    }
}
