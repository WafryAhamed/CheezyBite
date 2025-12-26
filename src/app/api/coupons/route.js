/**
 * API Route: Public Coupons
 * GET /api/coupons - Get active public coupons (customer-facing)
 */

import dbConnect from '@/lib/dbConnect';
import Coupon from '@/models/Coupon';
import { successResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(request) {
    try {
        await dbConnect();

        const now = new Date();

        // Fetch active, non-expired coupons
        const coupons = await Coupon.find({
            active: true,
            expiresAt: { $gt: now },
            // Only show coupons that haven't reached usage limit
            $or: [
                { usageLimit: null }, // Unlimited
                { $expr: { $lt: ['$usedCount', '$usageLimit'] } } // Not fully used
            ]
        })
        .select('code type value maxDiscount minOrderValue description expiresAt usageLimit usedCount usagePerUser')
        .sort({ createdAt: -1 })
        .lean();

        // Transform for public view
        const publicCoupons = coupons.map(coupon => ({
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            maxDiscount: coupon.maxDiscount,
            minOrderValue: coupon.minOrderValue,
            description: coupon.description,
            expiresAt: coupon.expiresAt,
            usagePerUser: coupon.usagePerUser,
            // Hide exact usage count for security, just show if limited
            isLimited: coupon.usageLimit !== null,
            // Calculate remaining uses percentage (optional)
            availabilityHint: coupon.usageLimit 
                ? `Limited offer` 
                : 'Unlimited uses'
        }));

        return successResponse(publicCoupons, 'Active coupons retrieved');

    } catch (error) {
        console.error('💥 Public Coupons API Error:', error);
        return serverErrorResponse(error);
    }
}
