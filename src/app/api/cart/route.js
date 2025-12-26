/**
 * API Route: Cart Management (Hybrid Strategy)
 * GET /api/cart - Get user's cart from database
 * POST /api/cart - Save/merge cart to database
 * DELETE /api/cart - Clear cart
 */

import dbConnect from '@/lib/dbConnect';
import Cart from '@/models/Cart';
import { authenticate, unauthorizedResponse } from '@/lib/auth';
import { successResponse, serverErrorResponse } from '@/lib/apiResponse';

/**
 * GET - Retrieve user's cart from database
 */
export async function GET(request) {
    try {
        // Authenticate user
        const authData = await authenticate(request);
        
        // Admin users: treat as guest (no cart in DB)
        if (!authData || authData.type !== 'user') {
            return successResponse({ items: [] }, 'Cart is empty');
        }

        await dbConnect();

        // Get cart
        let cart = await Cart.findOne({ userId: authData.userId });

        if (!cart) {
            // Return empty cart if not found
            return successResponse({ items: [] }, 'Cart is empty');
        }

        return successResponse(
            { items: cart.items },
            'Cart fetched successfully'
        );

    } catch (error) {
        return serverErrorResponse(error);
    }
}

/**
 * POST - Save cart to database (merge strategy)
 */
export async function POST(request) {
    try {
        // Authenticate user
        const authData = await authenticate(request);
        
        // Admin users or guests: accept but don't save to DB
        if (!authData || authData.type !== 'user') {
            const body = await request.json();
            const { items = [] } = body;
            return successResponse({ items }, 'Cart accepted (not persisted for admin/guest)');
        }

        const body = await request.json();
        const { items = [], merge = true } = body;

        // Validate items array
        if (!Array.isArray(items)) {
            return serverErrorResponse(new Error('Items must be an array'));
        }

        await dbConnect();

        // Find or create cart
        let cart = await Cart.findOne({ userId: authData.userId });

        if (!cart) {
            // Create new cart
            cart = await Cart.create({
                userId: authData.userId,
                items: items || []
            });
        } else {
            if (merge) {
                // Merge strategy: combine localStorage cart with DB cart
                const mergedItems = [...cart.items];

                // Add new items from localStorage
                items.forEach(newItem => {
                    if (!newItem || !newItem.cartLineId) {
                        return; // Skip invalid items
                    }

                    const existingIndex = mergedItems.findIndex(
                        item => item && item.cartLineId === newItem.cartLineId
                    );

                    if (existingIndex >= 0) {
                        // Update quantity if same item
                        mergedItems[existingIndex].amount += (newItem.amount || 0);
                    } else {
                        // Add new item
                        mergedItems.push(newItem);
                    }
                });

                cart.items = mergedItems;
            } else {
                // Replace strategy: overwrite DB cart
                cart.items = items || [];
            }

            await cart.save();
        }

        return successResponse(
            { items: cart.items },
            'Cart saved successfully'
        );

    } catch (error) {
        console.error('Cart POST Error:', error);
        return serverErrorResponse(error);
    }
}

/**
 * DELETE - Clear cart
 */
export async function DELETE(request) {
    try {
        // Authenticate user
        const authData = await authenticate(request);
        
        // Admin users or guests: return success without DB operation
        if (!authData || authData.type !== 'user') {
            return successResponse(null, 'Cart cleared successfully');
        }

        await dbConnect();

        // Clear cart items
        await Cart.findOneAndUpdate(
            { userId: authData.userId },
            { $set: { items: [] } },
            { upsert: true }
        );

        return successResponse(null, 'Cart cleared successfully');

    } catch (error) {
        return serverErrorResponse(error);
    }
}
