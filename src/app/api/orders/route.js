/**
 * API Route: Order Management
 * POST /api/orders - Create new order
 * GET /api/orders - Get user's orders
 */

import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { authenticate, unauthorizedResponse } from '@/lib/auth';
import { validateOrderData } from '@/lib/validators';
import { successResponse, validationErrorResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function POST(request) {
    try {
        // Authenticate user (optional)
        const authData = await authenticate(request);

        // Removed strict auth check to allow Guest Orders
        // if (!authData || authData.type !== 'user') { return unauthorizedResponse(); }

        // Parse request body
        const body = await request.json();

        // Validate input
        const validation = validateOrderData(body);
        if (!validation.isValid) {
            return validationErrorResponse(validation.errors);
        }

        await dbConnect();

        // Generate order ID
        const orderId = `ORD-${Date.now()}`;

        // Create order object
        const orderData = {
            id: orderId,
            items: body.items,
            total: body.total,
            address: body.address,
            paymentMethod: body.paymentMethod,
            paymentDetails: body.paymentDetails || {},
            paymentStatus: body.paymentMethod === 'cash' ? 'pending' : 'paid',
            deliveryTime: body.deliveryTime || 'asap',
            scheduledFor: body.scheduledFor || null,
            deliveryInstructions: body.deliveryInstructions || '',
            appliedOffer: body.appliedOffer || null,
            discountAmount: body.discountAmount || 0,
            currentStage: 0,
            status: 'Order Placed',
            statusHistory: [{
                stage: 0,
                status: 'Order Placed',
                timestamp: new Date()
            }],
            estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000)
        };

        // Only add userId if user is authenticated
        if (authData?.userId) {
            orderData.userId = authData.userId;
        }

        const order = await Order.create(orderData);

        // If coupon was applied, increment usage count
        if (body.appliedOffer && body.appliedOffer.code) {
            const { default: Offer } = await import('@/models/Offer');
            const offer = await Offer.findOne({ code: body.appliedOffer.code.toUpperCase() });
            
            if (offer) {
                // Increment total usage
                offer.usedCount = (offer.usedCount || 0) + 1;
                
                // Track per-user usage
                if (authData?.userId) {
                    const existingUserUsage = offer.userUsage.find(
                        u => u.userId.toString() === authData.userId
                    );
                    
                    if (existingUserUsage) {
                        existingUserUsage.count += 1;
                        existingUserUsage.lastUsedAt = new Date();
                    } else {
                        offer.userUsage.push({
                            userId: authData.userId,
                            count: 1,
                            lastUsedAt: new Date()
                        });
                    }
                }
                
                await offer.save();
            }
        }

        // Emit Socket.IO event for new order with full order object
        const { emitSocketEvent } = await import('@/lib/socketBridge');

        await emitSocketEvent('order:created', {
            orderId: order._id.toString(),
            total: order.total,
            items: order.items,
            customerName: order.customerName,
            timestamp: order.createdAt,
            order: order.toObject ? order.toObject() : order // Full order object for admin UI updates
        }, 'admin-dashboard');

        return successResponse(order, 'Order created successfully', 201);

    } catch (error) {
        return serverErrorResponse(error);
    }
}

export async function GET(request) {
    try {
        // Authenticate user
        const authData = await authenticate(request);
        if (!authData || authData.type !== 'user') {
            return unauthorizedResponse();
        }

        await dbConnect();

        // Get user's orders
        const orders = await Order.find({ userId: authData.userId })
            .sort({ createdAt: -1 })
            .select('-__v');

        return successResponse(orders, 'Orders fetched successfully');

    } catch (error) {
        return serverErrorResponse(error);
    }
}
