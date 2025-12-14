/**
 * API Route: Get All Pizzas (Customer)
 * GET /api/pizzas - Get all enabled pizzas
 */

import dbConnect from '@/lib/dbConnect';
import Pizza from '@/models/Pizza';
import { successResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(request) {
    try {
        await dbConnect();

        // Get enabled pizzas only for customers
        const pizzas = await Pizza.find({ enabled: true })
            .select('-__v')
            .sort({ createdAt: -1 });

        return successResponse(pizzas, 'Pizzas fetched successfully');

    } catch (error) {
        return serverErrorResponse(error);
    }
}
