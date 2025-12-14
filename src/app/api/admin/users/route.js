/**
 * API Route: Admin User Management
 * GET /api/admin/users - List all admin users
 * POST /api/admin/users - Create new admin user
 */

import dbConnect from '@/lib/dbConnect';
import Admin from '@/models/Admin';
import { authenticate, isAdmin, unauthorizedResponse, forbiddenResponse, hashPassword } from '@/lib/auth';
import { successResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/apiResponse';

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

        // Get all admin users
        const admins = await Admin.find({})
            .select('-password')
            .sort({ createdAt: -1 });

        return successResponse(admins, 'Admin users fetched successfully');

    } catch (error) {
        return serverErrorResponse(error);
    }
}

export async function POST(request) {
    try {
        // Authenticate admin (only Super Admin can create admins)
        const authData = await authenticate(request);
        if (!authData || authData.type !== 'admin') {
            return unauthorizedResponse();
        }

        if (authData.role !== 'Super Admin') {
            return forbiddenResponse('Only Super Admin can create admin users');
        }

        const body = await request.json();
        const { username, password, role = 'Manager' } = body;

        // Validate
        if (!username || username.length < 3) {
            return validationErrorResponse({ username: 'Username must be at least 3 characters' });
        }

        if (!password || password.length < 6) {
            return validationErrorResponse({ password: 'Password must be at least 6 characters' });
        }

        await dbConnect();

        // Check if username exists
        const existingAdmin = await Admin.findOne({ username: username.toLowerCase() });
        if (existingAdmin) {
            return errorResponse('Username already exists', null, 409);
        }

        // Get next ID
        const lastAdmin = await Admin.findOne().sort({ id: -1 });
        const nextId = lastAdmin ? lastAdmin.id + 1 : 1;

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create admin
        const admin = await Admin.create({
            id: nextId,
            username: username.toLowerCase(),
            password: hashedPassword,
            role,
            isActive: true
        });

        return successResponse(
            {
                id: admin.id,
                username: admin.username,
                role: admin.role,
                isActive: admin.isActive
            },
            'Admin user created successfully',
            201
        );

    } catch (error) {
        return serverErrorResponse(error);
    }
}
