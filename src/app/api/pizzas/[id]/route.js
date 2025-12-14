/**
 * API Route: Get Single Pizza
 * GET /api/pizzas/[id]
 */

import dbConnect from '@/lib/dbConnect';
import Pizza from '@/models/Pizza';
import { successResponse, notFoundResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        await dbConnect();

        // Find pizza by legacy ID
        const pizza = await Pizza.findOne({
            id: parseInt(id),
            enabled: true
        }).select('-__v');

        if (!pizza) {
            return notFoundResponse('Pizza');
        }

        return successResponse(pizza, 'Pizza fetched successfully');

    } catch (error) {
        return serverErrorResponse(error);
    }
}
