/**
 * API Route: Admin Customers Management
 * GET /api/admin/customers - Get all customers with stats
 */

import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Order from '@/models/Order';
import { authenticate, isAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { successResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(request) {
    try {
        // Authenticate admin
        const authData = await authenticate(request);
        
        // Log authentication details for debugging
        console.log('🔍 Customers API Auth Check:');
        console.log('   authData:', authData ? { ...authData, adminId: authData.adminId?.toString() } : null);
        console.log('   authData.type:', authData?.type);
        console.log('   Is admin type?', authData?.type === 'admin');
        
        if (!authData || authData.type !== 'admin') {
            console.log('❌ Customers API Auth Failed - Not admin');
            return unauthorizedResponse();
        }

        if (!isAdmin(authData)) {
            console.log('❌ Customers API Forbidden - Not in admin roles');
            return forbiddenResponse();
        }

        await dbConnect();

        // Get query params for pagination and search
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const sortBy = searchParams.get('sortBy') || 'lastOrder';

        // Build search query
        const searchQuery = search ? {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ]
        } : {};

        // Aggregate customers with order stats
        const customers = await User.aggregate([
            { $match: searchQuery },
            {
                $lookup: {
                    from: 'orders',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'orders'
                }
            },
            {
                $addFields: {
                    totalOrders: { $size: '$orders' },
                    totalSpent: {
                        $sum: {
                            $map: {
                                input: '$orders',
                                as: 'order',
                                in: '$$order.total'
                            }
                        }
                    },
                    lastOrderDate: {
                        $max: {
                            $map: {
                                input: '$orders',
                                as: 'order',
                                in: '$$order.createdAt'
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    password: 0,
                    orders: 0,
                    __v: 0
                }
            },
            {
                $addFields: {
                    status: {
                        $cond: {
                            if: { $eq: ['$totalOrders', 0] },
                            then: 'New',
                            else: 'Active'
                        }
                    }
                }
            }
        ]);

        // Sort customers
        if (sortBy === 'lastOrder') {
            customers.sort((a, b) => new Date(b.lastOrderDate) - new Date(a.lastOrderDate));
        } else if (sortBy === 'totalSpent') {
            customers.sort((a, b) => b.totalSpent - a.totalSpent);
        } else if (sortBy === 'totalOrders') {
            customers.sort((a, b) => b.totalOrders - a.totalOrders);
        }

        // Paginate
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedCustomers = customers.slice(startIndex, endIndex);

        return successResponse({
            customers: paginatedCustomers,
            pagination: {
                page,
                limit,
                total: customers.length,
                totalPages: Math.ceil(customers.length / limit)
            }
        }, 'Customers fetched successfully');

    } catch (error) {
        console.error('GET /api/admin/customers error:', error);
        return serverErrorResponse(error);
    }
}
