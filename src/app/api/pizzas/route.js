/**
 * API Route: Get All Pizzas (Customer)
 * GET /api/pizzas - Get all enabled pizzas
 */

import dbConnect from '@/lib/dbConnect';
import Pizza from '@/models/Pizza';
import { successResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(request) {
    await dbConnect();

    try {
        const pizzas = await Pizza.find({ enabled: true }).sort({ createdAt: -1 });

        // Calculate discounts dynamically
        const processedPizzas = pizzas.map(pizza => {
            const p = pizza.toObject();

            const calculatePrice = (basePrice) => {
                let finalPrice = basePrice;
                let discountLabel = null;

                if (p.discount && p.discount.active) {
                    const now = new Date();
                    const start = p.discount.startAt ? new Date(p.discount.startAt) : null;
                    const end = p.discount.endAt ? new Date(p.discount.endAt) : null;

                    if ((!start || now >= start) && (!end || now <= end)) {
                        if (p.discount.type === 'fixed') {
                            finalPrice = Math.max(0, basePrice - p.discount.value);
                            discountLabel = `Rs. ${p.discount.value} OFF`;
                        } else if (p.discount.type === 'percent') {
                            finalPrice = Math.max(0, basePrice - (basePrice * (p.discount.value / 100)));
                            discountLabel = `${p.discount.value}% OFF`;
                        }
                    }
                }
                return { originalPrice: basePrice, finalPrice, discountLabel };
            };

            return {
                ...p,
                prices: {
                    sm: calculatePrice(p.priceSm),
                    md: calculatePrice(p.priceMd),
                    lg: calculatePrice(p.priceLg)
                }
            };
        });

        return successResponse(processedPizzas, 'Pizzas fetched successfully');
    } catch (error) {
        return serverErrorResponse(error);
    }
}
