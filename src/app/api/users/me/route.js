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
        const { name, phone, phone_verified, address, addresses } = body;

        // Validate phone if provided (Global User Phone)
        if (phone && !isValidPhone(phone)) {
            return validationErrorResponse({ phone: 'Invalid phone number format (Use 07XXXXXXXX)' });
        }

        if (address && address.trim().length < 10) {
            return validationErrorResponse({ address: 'Address must be at least 10 characters' });
        }

        await dbConnect();

        // Prepare update object
        const updateData = {
            ...(name && { name }),
            ...(phone && { phone }),
            ...(phone_verified !== undefined && { phone_verified }),
            // Allow direct update of addresses array if provided
            ...(addresses && Array.isArray(addresses) && { addresses })
        };

        // Handle single address string (Profile Input) -> pushes to addresses or updates default
        // Only if 'addresses' array wasn't explicitly provided
        if (address && !addresses) {
            updateData.addresses = [{
                id: `addr_${Date.now()}`,
                label: 'Home',
                street: address,
                city: 'Colombo',
                phone: phone || '07XXXXXXXX', // Placeholder if phone missing
                isDefault: true
            }];
        }

        // Update user
        const user = await User.findByIdAndUpdate(
            authData.userId,
            { $set: updateData },
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
            addresses: user.addresses,
            // Polyfill address for frontend convenience
            address: user.addresses?.[0]?.address || ''
        }, 'Profile updated successfully');

    } catch (error) {
        return serverErrorResponse(error);
    }
}
