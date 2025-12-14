/**
 * API Route: Admin Analytics
 * GET /api/admin/analytics - Get dashboard analytics
 */

import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import User from '@/models/User';
import Pizza from '@/models/Pizza';
import { authenticate, isAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { successResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(request) {
    try {
        // Authenticate admin
        const authData = await authenticate(request);
        if (!authData || authData.type !== 'admin') {
            return unauthorizedResponse();
        }

        if (!isAdmin(authData)) {
            return forbiddenResponse();
        }

        await dbConnect();

        // Get date range (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Parallel queries for performance
        const [
            totalOrders,
            totalRevenue,
            totalUsers,
            activeOrders,
            recentOrders,
            ordersByStatus,
            topPizzas
        ] = await Promise.all([
            // Total orders
            Order.countDocuments(),

            // Total revenue (completed orders)
            Order.aggregate([
                { $match: { currentStage: 4 } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ]),

            // Total users
            User.countDocuments(),

            // Active orders (not delivered or cancelled)
            Order.countDocuments({ currentStage: { $gte: 0, $lt: 4 } }),

            // Recent orders (last 30 days)
            Order.find({ createdAt: { $gte: thirtyDaysAgo } })
                .sort({ createdAt: -1 })
                .limit(10)
                .select('id total status createdAt')
                .lean(),

            // Orders by status
            Order.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),

            // Top selling pizzas
            Order.aggregate([
                { $unwind: '$items' },
                {
                    $group: {
                        _id: '$items.name',
                        count: { $sum: '$items.amount' },
                        revenue: { $sum: { $multiply: ['$items.price', '$items.amount'] } }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ])
        ]);

        // Revenue by day (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const revenueByDay = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo },
                    currentStage: 4
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$total' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Calculate average order value
        const avgOrderValue = totalRevenue[0]?.total
            ? Math.round(totalRevenue[0].total / totalOrders)
            : 0;

        // Response
        const analytics = {
            overview: {
                totalOrders,
                totalRevenue: totalRevenue[0]?.total || 0,
                totalUsers,
                activeOrders,
                avgOrderValue
            },
            ordersByStatus: ordersByStatus.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            topPizzas: topPizzas.map(pizza => ({
                name: pizza._id,
                orders: pizza.count,
                revenue: Math.round(pizza.revenue)
            })),
            revenueByDay: revenueByDay.map(day => ({
                date: day._id,
                revenue: day.revenue,
                orders: day.orders
            })),
            recentOrders
        };

        return successResponse(analytics, 'Analytics fetched successfully');

    } catch (error) {
        return serverErrorResponse(error);
    }
}
