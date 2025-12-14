/**
 * API Route: Admin Topping Management
 * GET /api/admin/toppings - Get all toppings (including disabled)
 * POST /api/admin/toppings - Create new topping
 */

import dbConnect from '@/lib/dbConnect';
import Topping from '@/models/Topping';
import { authenticate, isAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { validateToppingData } from '@/lib/validators';
import { successResponse, validationErrorResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(request) {
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

        // Get ALL toppings for admin (including disabled)
        const toppings = await Topping.find({})
            .select('-__v')
            .sort({ id: 1 });

        return successResponse(toppings, 'Toppings fetched successfully');

    } catch (error) {
        return serverErrorResponse(error);
    }
}

export async function POST(request) {
    try {
        // Authenticate admin
        const authData = await authenticate(request);
        if (!authData || authData.type !== 'admin') {
            return unauthorizedResponse();
        }

        if (!isAdmin(authData)) {
            return forbiddenResponse();
        }

        // Parse request body
        const body = await request.json();

        // Validate input
        const validation = validateToppingData(body);
        if (!validation.isValid) {
            return validationErrorResponse(validation.errors);
        }

        await dbConnect();

        // Generate next ID
        const lastTopping = await Topping.findOne().sort({ id: -1 });
        const nextId = lastTopping ? lastTopping.id + 1 : 1;

        // Create topping
        const topping = await Topping.create({
            ...body,
            id: nextId
        });

        return successResponse(topping, 'Topping created successfully', 201);

    } catch (error) {
        return serverErrorResponse(error);
    }
}
