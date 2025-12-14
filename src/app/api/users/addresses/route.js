/**
 * API Route: Address Management
 * POST /api/users/addresses - Add new address
 * PUT /api/users/addresses/:id - Update address
 * DELETE /api/users/addresses/:id - Delete address
 */

import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { authenticate, unauthorizedResponse } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse, validationErrorResponse } from '@/lib/apiResponse';

export async function POST(request) {
    try {
        // Authenticate user
        const authData = await authenticate(request);
        if (!authData || authData.type !== 'user') {
            return unauthorizedResponse();
        }

        const body = await request.json();
        const { label, street, city, area, phone, isDefault } = body;

        // Validate required fields
        if (!street || !city || !phone) {
            return validationErrorResponse({
                street: !street ? 'Street is required' : undefined,
                city: !city ? 'City is required' : undefined,
                phone: !phone ? 'Phone is required' : undefined
            });
        }

        await dbConnect();

        const user = await User.findById(authData.userId);

        if (!user) {
            return errorResponse('User not found', null, 404);
        }

        // Create new address
        const newAddress = {
            id: `addr-${Date.now()}`,
            label: label || 'Home',
            street,
            city,
            area: area || '',
            phone,
            isDefault: isDefault || false
        };

        // If this is default, unset other defaults
        if (newAddress.isDefault) {
            user.addresses = user.addresses.map(addr => ({
                ...addr,
                isDefault: false
            }));
        }

        // Add address
        user.addresses.push(newAddress);
        await user.save();

        return successResponse(newAddress, 'Address added successfully', 201);

    } catch (error) {
        return serverErrorResponse(error);
    }
}
