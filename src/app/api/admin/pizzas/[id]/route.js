/**
 * API Route: Admin Single Pizza Management
 * PUT /api/admin/pizzas/[id] - Update pizza
 * DELETE /api/admin/pizzas/[id] - Delete pizza
 */

import dbConnect from '@/lib/dbConnect';
import Pizza from '@/models/Pizza';
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

        // Update pizza
        const pizza = await Pizza.findOneAndUpdate(
            { id: parseInt(id) },
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!pizza) {
            return notFoundResponse('Pizza');
        }

        // Real-time Update
        const { emitSocketEvent } = await import('@/lib/socketBridge');
        await emitSocketEvent('menu_updated', { type: 'update', pizza }, 'menu-updates');

        return successResponse(pizza, 'Pizza updated successfully');

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

        // Delete pizza
        const pizza = await Pizza.findOneAndDelete({ id: parseInt(id) });

        if (!pizza) {
            return notFoundResponse('Pizza');
        }

        // Real-time Update
        const { emitSocketEvent } = await import('@/lib/socketBridge');
        await emitSocketEvent('menu_updated', { type: 'delete', pizzaId: parseInt(id) }, 'menu-updates');

        return successResponse(null, 'Pizza deleted successfully');

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
        const pizza = await Pizza.findOne({ id: parseInt(id) });

        if (!pizza) {
            return notFoundResponse('Pizza');
        }

        pizza.enabled = !pizza.enabled;
        await pizza.save();

        // Real-time Update
        const { emitSocketEvent } = await import('@/lib/socketBridge');
        await emitSocketEvent('menu_updated', { type: 'update', pizza }, 'menu-updates');

        return successResponse(pizza, `Pizza ${pizza.enabled ? 'enabled' : 'disabled'} successfully`);

    } catch (error) {
        return serverErrorResponse(error);
    }
}
