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
        let authData;
        try {
            authData = await authenticate(request);
        } catch (authError) {
            console.error('❌ Admin Analytics: Authentication error:', authError);
            return unauthorizedResponse('Authentication failed');
        }
        
        if (!authData || authData.type !== 'admin') {
            console.log('❌ Admin Analytics: Invalid auth data:', { authData });
            return unauthorizedResponse();
        }

        if (!isAdmin(authData)) {
            console.log('❌ Admin Analytics: Not admin role:', authData.role);
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

        // Format daily revenue for last 7 days (fill missing days with 0)
        const dailyRevenue = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayData = revenueByDay.find(d => d._id === dateStr);
            
            dailyRevenue.push({
                day: dayNames[date.getDay()],
                date: dateStr,
                revenue: dayData?.revenue || 0,
                orders: dayData?.orders || 0
            });
        }

        // Calculate average order value
        const avgOrderValue = totalRevenue[0]?.total && totalOrders > 0
            ? Math.round(totalRevenue[0].total / totalOrders)
            : 0;

        // Get active pizzas count
        const totalPizzas = await Pizza.countDocuments();
        const activePizzas = await Pizza.countDocuments({ enabled: true });

        // Format response to match frontend expectations
        const analytics = {
            // Direct metrics
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            totalUsers,
            activeOrders,
            avgOrderValue,
            totalPizzas,
            activePizzas,

            // Charts data
            dailyRevenue,
            
            popularPizzas: topPizzas.slice(0, 5).map(pizza => ({
                name: pizza._id,
                count: pizza.count,
                revenue: Math.round(pizza.revenue)
            })),

            // Additional data
            ordersByStatus: ordersByStatus.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),

            recentOrders: recentOrders.map(order => ({
                id: order.id,
                total: order.total,
                status: order.status,
                createdAt: order.createdAt
            }))
        };

        return successResponse(analytics, 'Analytics fetched successfully');

    } catch (error) {
        return serverErrorResponse(error);
    }
}
