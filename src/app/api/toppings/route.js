/**
 * API Route: Get All Toppings (Customer)
 * GET /api/toppings - Get all enabled toppings
 */

import dbConnect from '@/lib/dbConnect';
import Topping from '@/models/Topping';
import { successResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(request) {
    try {
        await dbConnect();

        // Get enabled toppings only for customers
        const toppings = await Topping.find({ enabled: true })
            .select('-__v')
            .sort({ name: 1 });

        return successResponse(toppings, 'Toppings fetched successfully');

    } catch (error) {
        return serverErrorResponse(error);
    }
}
