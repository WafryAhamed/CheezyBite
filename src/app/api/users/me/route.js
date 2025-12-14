/**
 * API Route: User Profile Management
 * GET /api/users/me - Get current user profile
 * PUT /api/users/me - Update user profile
 */

import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { authenticate, unauthorizedResponse } from '@/lib/auth';
import { successResponse, notFoundResponse, serverErrorResponse, validationErrorResponse } from '@/lib/apiResponse';
import { isValidPhone } from '@/lib/validators';

export async function GET(request) {
    try {
        // Authenticate user
        const authData = await authenticate(request);
        if (!authData || authData.type !== 'user') {
            return unauthorizedResponse();
        }

        await dbConnect();

        // Get user profile
        const user = await User.findById(authData.userId).select('-password');

        if (!user) {
            return notFoundResponse('User');
        }

        return successResponse({
            id: user._id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            phone_verified: user.phone_verified,
            addresses: user.addresses
        }, 'User profile fetched successfully');

    } catch (error) {
        return serverErrorResponse(error);
    }
}

export async function PUT(request) {
    try {
        // Authenticate user
        const authData = await authenticate(request);
        if (!authData || authData.type !== 'user') {
            return unauthorizedResponse();
        }

        const body = await request.json();
        const { name, phone, phone_verified } = body;

        // Validate phone if provided
        if (phone && !isValidPhone(phone)) {
            return validationErrorResponse({ phone: 'Invalid phone number format' });
        }

        await dbConnect();

        // Update user
        const user = await User.findByIdAndUpdate(
            authData.userId,
            {
                $set: {
                    ...(name && { name }),
                    ...(phone && { phone }),
                    ...(phone_verified !== undefined && { phone_verified })
                }
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return notFoundResponse('User');
        }

        return successResponse({
            id: user._id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            phone_verified: user.phone_verified,
            addresses: user.addresses
        }, 'Profile updated successfully');

    } catch (error) {
        return serverErrorResponse(error);
    }
}
