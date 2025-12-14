/**
 * API Route: Admin Single Topping Management
 * PUT /api/admin/toppings/[id] - Update topping
 * DELETE /api/admin/toppings/[id] - Delete topping
 * PATCH /api/admin/toppings/[id] - Toggle enabled status
 */

import dbConnect from '@/lib/dbConnect';
import Topping from '@/models/Topping';
import { authenticate, isAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { successResponse, notFoundResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function PUT(request, { params }) {
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

        await dbConnect();

        // Update topping
        const topping = await Topping.findOneAndUpdate(
            { id: parseInt(id) },
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!topping) {
            return notFoundResponse('Topping');
        }

        return successResponse(topping, 'Topping updated successfully');

    } catch (error) {
        return serverErrorResponse(error);
    }
}

export async function DELETE(request, { params }) {
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

        await dbConnect();

        // Delete topping
        const topping = await Topping.findOneAndDelete({ id: parseInt(id) });

        if (!topping) {
            return notFoundResponse('Topping');
        }

        return successResponse(null, 'Topping deleted successfully');

    } catch (error) {
        return serverErrorResponse(error);
    }
}

export async function PATCH(request, { params }) {
    try {
        // Authenticate admin
        const authData = await authenticate(request);
        if (!authData || authData.type !== 'admin') {
            return unauthorizedResponse();
        }

        const { id } = await params;

        await dbConnect();

        // Toggle enabled status
        const topping = await Topping.findOne({ id: parseInt(id) });

        if (!topping) {
            return notFoundResponse('Topping');
        }

        topping.enabled = !topping.enabled;
        await topping.save();

        return successResponse(topping, `Topping ${topping.enabled ? 'enabled' : 'disabled'} successfully`);

    } catch (error) {
        return serverErrorResponse(error);
    }
}
