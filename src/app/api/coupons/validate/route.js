import dbConnect from '@/lib/dbConnect';
import Offer from '@/models/Offer';
import { authenticate, unauthorizedResponse } from '@/lib/auth';
import { errorResponse, successResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function POST(request) {
    await dbConnect();

    const authData = await authenticate(request);
    if (!authData || authData.type !== 'user') {
        return unauthorizedResponse('Please login to use coupons');
    }

    try {
        const body = await request.json();
        const { code, cartSubtotal } = body;

        if (!code || !cartSubtotal) {
            return errorResponse('Code and cart subtotal are required', null, 400);
        }

        // Find active offer by code
        const offer = await Offer.findOne({
            code: code.toUpperCase(),
            active: true,
        });

        if (!offer) {
            return errorResponse('Invalid or expired coupon code', { codeApplied: false });
        }

        // Check if coupon has started
        if (offer.validFrom && new Date() < new Date(offer.validFrom)) {
            return errorResponse('This coupon is not yet active', { codeApplied: false });
        }

        // Check if coupon has expired
        if (offer.validTo && new Date() > new Date(offer.validTo)) {
            return errorResponse('This coupon has expired', { codeApplied: false });
        }

        // Check usage limit (total)
        if (offer.usageLimitTotal && offer.usedCount >= offer.usageLimitTotal) {
            return errorResponse('This coupon has reached its usage limit', { codeApplied: false });
        }

        // Check per-user usage limit
        const userUsage = offer.userUsage?.find(
            (u) => u.userId?.toString() === authData.userId
        );
        if (offer.usageLimitPerUser && userUsage && userUsage.count >= offer.usageLimitPerUser) {
            return errorResponse(`You can use this coupon only ${offer.usageLimitPerUser} time(s)`, { codeApplied: false });
        }

        // Check minimum order value
        if (offer.minOrderAmount && cartSubtotal < offer.minOrderAmount) {
            return errorResponse(`Minimum order value of Rs. ${offer.minOrderAmount} required`, { codeApplied: false });
        }

        // Calculate discount
        let discountAmount = 0;
        if (offer.type === 'percent') {
            discountAmount = (cartSubtotal * offer.value) / 100;
            // Apply max discount cap if set
            if (offer.maxDiscount) {
                discountAmount = Math.min(discountAmount, offer.maxDiscount);
            }
        } else if (offer.type === 'fixed') {
            discountAmount = offer.value;
        }

        discountAmount = Math.round(discountAmount * 100) / 100; // Round to 2 decimals

        const finalSubtotal = Math.max(0, cartSubtotal - discountAmount);

        return successResponse({
            codeApplied: true,
            code: offer.code,
            discountAmount,
            finalSubtotal,
            originalSubtotal: cartSubtotal,
            couponType: offer.type,
            couponValue: offer.value,
        }, 'Coupon applied successfully');
    } catch (error) {
        return serverErrorResponse(error);
    }
}
