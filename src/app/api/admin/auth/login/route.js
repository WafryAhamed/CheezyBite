/**
 * API Route: Admin Login
 * POST /api/admin/auth/login
 */

import dbConnect from '@/lib/dbConnect';
import Admin from '@/models/Admin';
import { comparePassword, generateToken } from '@/lib/auth';
import { validateAdminLogin } from '@/lib/validators';
import { successResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function POST(request) {
    try {
        // Parse request body
        const body = await request.json();
        const { username, password } = body;

        // Validate input
        const validation = validateAdminLogin(body);
        if (!validation.isValid) {
            return validationErrorResponse(validation.errors);
        }

        // Connect to database
        await dbConnect();

        // Find admin by username
        const admin = await Admin.findOne({ username: username.toLowerCase() });
        if (!admin) {
            return errorResponse('Invalid username or password', null, 401);
        }

        // Check if admin is active
        if (!admin.isActive) {
            return errorResponse('Admin account is disabled', null, 403);
        }

        // Compare password
        const isPasswordValid = await comparePassword(password, admin.password);
        if (!isPasswordValid) {
            return errorResponse('Invalid username or password', null, 401);
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        // Generate JWT token
        const token = generateToken({
            adminId: admin._id,
            username: admin.username,
            role: admin.role,
            type: 'admin'
        });

        // Return admin data (without password)
        const adminData = {
            id: admin.id,
            username: admin.username,
            role: admin.role,
            isActive: admin.isActive,
            lastLogin: admin.lastLogin
        };

        return successResponse(
            { admin: adminData, token },
            'Admin login successful'
        );

    } catch (error) {
        return serverErrorResponse(error);
    }
}
