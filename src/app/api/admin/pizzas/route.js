/**
 * API Route: Admin Pizza Management
 * GET /api/admin/pizzas - Get all pizzas (including disabled)
 * POST /api/admin/pizzas - Create new pizza
 */

import dbConnect from '@/lib/dbConnect';
import Pizza from '@/models/Pizza';
import { authenticate, isAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { validatePizzaData } from '@/lib/validators';
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

        // Get ALL pizzas for admin (including disabled)
        const pizzas = await Pizza.find({})
            .select('-__v')
            .sort({ id: 1 });

        return successResponse(pizzas, 'Pizzas fetched successfully');

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
        const validation = validatePizzaData(body);
        if (!validation.isValid) {
            return validationErrorResponse(validation.errors);
        }

        await dbConnect();

        // Generate next ID
        const lastPizza = await Pizza.findOne().sort({ id: -1 });
        const nextId = lastPizza ? lastPizza.id + 1 : 1;

        // Create pizza
        const pizza = await Pizza.create({
            ...body,
            id: nextId
        });

        return successResponse(pizza, 'Pizza created successfully', 201);

    } catch (error) {
        return serverErrorResponse(error);
    }
}
