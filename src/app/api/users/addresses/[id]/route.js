/**
 * API Route: Single Address Management
 * PUT /api/users/addresses/[id] - Update address
 * DELETE /api/users/addresses/[id] - Delete address
 */

import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { authenticate, unauthorizedResponse } from '@/lib/auth';
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function PUT(request, { params }) {
    try {
        // Authenticate user
        const authData = await authenticate(request);
        if (!authData || authData.type !== 'user') {
            return unauthorizedResponse();
        }

        const { id } = await params;
        const body = await request.json();

        await dbConnect();

        const user = await User.findById(authData.userId);

        if (!user) {
            return notFoundResponse('User');
        }

        // Find address
        const addressIndex = user.addresses.findIndex(addr => addr.id === id);

        if (addressIndex === -1) {
            return notFoundResponse('Address');
        }

        // Update address
        user.addresses[addressIndex] = {
            ...user.addresses[addressIndex],
            ...body,
            id // Keep original ID
        };

        // If setting as default, unset others
        if (body.isDefault) {
            user.addresses = user.addresses.map((addr, idx) => ({
                ...addr,
                isDefault: idx === addressIndex
            }));
        }

        await user.save();

        return successResponse(user.addresses[addressIndex], 'Address updated successfully');

    } catch (error) {
        return serverErrorResponse(error);
    }
}

export async function DELETE(request, { params }) {
    try {
        // Authenticate user
        const authData = await authenticate(request);
        if (!authData || authData.type !== 'user') {
            return unauthorizedResponse();
        }

        const { id } = await params;

        await dbConnect();

        const user = await User.findById(authData.userId);

        if (!user) {
            return notFoundResponse('User');
        }

        // Find and remove address
        const initialLength = user.addresses.length;
        user.addresses = user.addresses.filter(addr => addr.id !== id);

        if (user.addresses.length === initialLength) {
            return notFoundResponse('Address');
        }

        await user.save();

        return successResponse(null, 'Address deleted successfully');

    } catch (error) {
        return serverErrorResponse(error);
    }
}
