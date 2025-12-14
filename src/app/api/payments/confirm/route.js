/**
 * API Route: Payment Confirmation (Stub)
 * POST /api/payments/confirm
 * 
 * MOCK IMPLEMENTATION - Replace with Stripe/Razorpay webhook later
 */

import { authenticate, unauthorizedResponse } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/apiResponse';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';

export async function POST(request) {
    try {
        // Authenticate user
        const authData = await authenticate(request);
        if (!authData || authData.type !== 'user') {
            return unauthorizedResponse();
        }

        const body = await request.json();
        const { paymentIntentId, orderId } = body;

        if (!paymentIntentId || !orderId) {
            return errorResponse('Payment intent ID and order ID are required', null, 400);
        }

        await dbConnect();

        // MOCK: In production, verify payment with payment gateway
        // const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        // if (paymentIntent.status !== 'succeeded') {
        //   return errorResponse('Payment failed', null, 400);
        // }

        // Mock payment confirmation
        const mockConfirmation = {
            id: paymentIntentId,
            status: 'succeeded',
            amount: 0, // Will be from actual payment gateway
            confirmed_at: new Date()
        };

        // Update order payment status
        const order = await Order.findOneAndUpdate(
            { id: orderId, userId: authData.userId },
            {
                $set: {
                    paymentStatus: 'paid',
                    'paymentDetails.transactionId': paymentIntentId,
                    'paymentDetails.confirmedAt': new Date()
                }
            },
            { new: true }
        );

        if (!order) {
            return errorResponse('Order not found', null, 404);
        }

        // Update Payment record
        const Payment = (await import('@/models/Payment')).default;
        await Payment.findOneAndUpdate(
            { id: paymentIntentId },
            {
                $set: {
                    status: 'succeeded',
                    orderId: orderId,
                    transactionId: `tx_${Date.now()}`
                }
            }
        );

        return successResponse(
            {
                payment: mockConfirmation,
                order: {
                    id: order.id,
                    status: order.status,
                    paymentStatus: order.paymentStatus
                }
            },
            'Payment confirmed successfully'
        );

    } catch (error) {
        return serverErrorResponse(error);
    }
}
