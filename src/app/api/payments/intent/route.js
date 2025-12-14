/**
 * API Route: Payment Intent (Stub)
 * POST /api/payments/intent
 * 
 * MOCK IMPLEMENTATION - Replace with Stripe/Razorpay later
 */

import { authenticate, unauthorizedResponse } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function POST(request) {
    try {
        // Authenticate user
        const authData = await authenticate(request);
        if (!authData || authData.type !== 'user') {
            return unauthorizedResponse();
        }

        const body = await request.json();
        const { amount, currency = 'LKR' } = body;

        if (!amount || amount <= 0) {
            return errorResponse('Invalid amount', null, 400);
        }

        // MOCK: In production, call Stripe/Razorpay API
        // const paymentIntent = await stripe.paymentIntents.create({ amount, currency });

        // Mock payment intent
        const mockIntent = {
            id: `pi_mock_${Date.now()}`,
            amount,
            currency,
            status: 'requires_confirmation',
            client_secret: `mock_secret_${Date.now()}`,
            created: Date.now()
        };

        // Save payment intent to database
        await dbConnect();
        const Payment = (await import('@/models/Payment')).default;

        await Payment.create({
            id: mockIntent.id,
            orderId: 'pending', // Will be linked when confirming
            userId: authData.userId,
            amount: amount,
            currency: currency,
            provider: 'card_stub',
            status: 'pending',
            metadata: {
                client_secret: mockIntent.client_secret
            }
        });

        return successResponse(
            mockIntent,
            'Payment intent created successfully'
        );

    } catch (error) {
        return serverErrorResponse(error);
    }
}
