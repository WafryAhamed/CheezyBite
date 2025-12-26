/**
 * API Route: Get Active Offers (Public)
 * GET /api/offers
 * 
 * Returns all active, non-expired offers for customer viewing
 */

import dbConnect from '@/lib/dbConnect';
import Offer from '@/models/Offer';
import { successResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(request) {
    try {
        await dbConnect();

        const now = new Date();

        // Find all active offers that:
        // 1. Are marked as active
        // 2. Haven't expired (validTo is null or in the future)
        // 3. Have started (validFrom is null or in the past)
        // 4. Haven't reached global usage limit
        const offers = await Offer.find({
            active: true,
            $or: [
                { validTo: null },
                { validTo: { $gte: now } }
            ],
            $or: [
                { validFrom: null },
                { validFrom: { $lte: now } }
            ],
            $or: [
                { usageLimitTotal: null },
                { $expr: { $lt: ['$usedCount', '$usageLimitTotal'] } }
            ]
        })
        .select('name code type value maxDiscount minOrderAmount validTo description')
        .sort({ createdAt: -1 })
        .lean();

        return successResponse(offers, 'Active offers fetched successfully');

    } catch (error) {
        console.error('💥 Offers API Error:', error);
        return serverErrorResponse(error);
    }
}
