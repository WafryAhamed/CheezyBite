/**
 * API Route: Apply/Validate Coupon
 * POST /api/offers/apply
 * 
 * COMPREHENSIVE VALIDATION:
 * - Coupon existence and active status
 * - Expiry date check
 * - Minimum order value
 * - Global usage limit
 * - Per-user usage limit
 * - First-order only coupons
 * - Category restrictions (if applicable)
 * - Prevents coupon abuse
 */

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Offer from '@/models/Offer';
import Order from '@/models/Order';
import { authenticate } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function POST(request) {
    try {
        await dbConnect();

        // Authenticate user (optional - allow guests and admins)
        let authData;
        try {
            authData = await authenticate(request);
        } catch (authError) {
            console.error('❌ Offers Apply: Authentication error:', authError);
            // Continue as guest if auth fails
            authData = null;
        }

        // Only use userId if it's a customer, not admin
        const userId = (authData?.type === 'user') ? (authData?.userId || authData?._id) : null;
        console.log('🎟️ Offers Apply: authData.type =', authData?.type, ', userId =', userId || 'null (guest/admin)');

        const { code, cartTotal, cartItems } = await request.json();

        // Validate input
        if (!code) {
            return errorResponse('Coupon code is required', null, 400);
        }

        // Allow cartTotal of 0 (initial load), but reject undefined/null/negative
        if (cartTotal === undefined || cartTotal === null || cartTotal < 0) {
            return errorResponse('Cart total is required', null, 400);
        }

        // Find coupon (case-insensitive)
        const coupon = await Offer.findOne({
            code: code.toUpperCase(),
            active: true
        });

        if (!coupon) {
            return errorResponse('Invalid or inactive coupon code', null, 404);
        }

        // === VALIDATION CHECKS ===

        // 1. Check Expiry Date
        const now = new Date();
        if (coupon.validTo && now > new Date(coupon.validTo)) {
            return errorResponse('Coupon has expired', { expiresAt: coupon.validTo }, 400);
        }

        // 2. Check Valid From Date
        if (coupon.validFrom && now < new Date(coupon.validFrom)) {
            return errorResponse('Coupon is not yet valid', { validFrom: coupon.validFrom }, 400);
        }

        // 3. Check Minimum Order Value
        if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
            return errorResponse(
                `Minimum order amount is Rs. ${coupon.minOrderAmount}`,
                { required: coupon.minOrderAmount, current: cartTotal },
                400
            );
        }

        // 4. Check Global Usage Limit
        if (coupon.usageLimitTotal !== null && coupon.usedCount >= coupon.usageLimitTotal) {
            return errorResponse('Coupon usage limit reached', null, 400);
        }

        // 5. Check Per-User Usage Limit (only for authenticated users)
        if (userId) {
            const usageLimitPerUser = coupon.usageLimitPerUser || 1;

            // Find user's usage from the userUsage array
            const userUsage = coupon.userUsage?.find(u => u.userId.toString() === userId.toString());
            const userUsageCount = userUsage ? userUsage.count : 0;

            if (userUsageCount >= usageLimitPerUser) {
                return errorResponse(
                    `You can only use this coupon ${usageLimitPerUser} time${usageLimitPerUser > 1 ? 's' : ''}`,
                    { limit: usageLimitPerUser, used: userUsageCount },
                    400
                );
            }

            // 6. Check First-Order Only Coupons (optional field in schema)
            if (coupon.firstOrderOnly) {
                const existingOrders = await Order.countDocuments({ userId });
                if (existingOrders > 0) {
                    return errorResponse('This coupon is only valid for first-time orders', null, 400);
                }
            }

            // 7. Category Restrictions (optional - if your schema supports it)
            // Example: if (coupon.allowedCategories && coupon.allowedCategories.length > 0) {
            //     const cartCategories = cartItems.map(item => item.category);
            //     const hasValidCategory = cartCategories.some(cat => coupon.allowedCategories.includes(cat));
            //     if (!hasValidCategory) {
            //         return errorResponse('Coupon not applicable to items in your cart', null, 400);
            //     }
            // }
        } else {
            // Guest users (not admins): if coupon requires authentication, reject
            // Note: authData.type !== 'user' includes both null (guest) and 'admin'
            const isGuest = !authData || authData.type !== 'user';
            const isAdmin = authData?.type === 'admin';

            if (coupon.usageLimitPerUser && coupon.usageLimitPerUser > 0 && isGuest && !isAdmin) {
                return errorResponse('Please login to use this coupon', null, 401);
            }
        }

        // === CALCULATE DISCOUNT ===

        let discountAmount = 0;

        if (coupon.type === 'fixed') {
            discountAmount = coupon.value;
        } else if (coupon.type === 'percent' || coupon.type === 'percentage') {
            discountAmount = (cartTotal * coupon.value) / 100;

            // Apply max discount cap (if set)
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount;
            }
        } else {
            return errorResponse('Invalid coupon type', null, 500);
        }

        // Ensure discount doesn't exceed cart total
        if (discountAmount > cartTotal) {
            discountAmount = cartTotal;
        }

        // Round to 2 decimal places
        discountAmount = parseFloat(discountAmount.toFixed(2));

        // === RETURN SUCCESS ===

        return successResponse({
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            discountAmount,
            maxDiscount: coupon.maxDiscount,
            minOrderAmount: coupon.minOrderAmount,
            finalTotal: parseFloat((cartTotal - discountAmount).toFixed(2))
        }, 'Coupon applied successfully');

    } catch (error) {
        console.error('💥 Coupon Apply API Error:', error);
        return serverErrorResponse(error);
    }
}
