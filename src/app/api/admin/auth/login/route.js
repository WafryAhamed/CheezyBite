/**
 * API Route: Admin Login
 * POST /api/admin/auth/login
 */

import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import Admin from '@/models/Admin';
import { comparePassword, generateToken, setAuthCookie } from '@/lib/auth';
import { validateAdminLogin } from '@/lib/validators';
import { successResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function POST(request) {
    try {
        // Parse request body
        const body = await request.json();
        const { username, password } = body;

        console.log(`🔐 Admin Login Attempt: ${username}`);

        // Validate input
        const validation = validateAdminLogin(body);
        if (!validation.isValid) {
            console.log('❌ Validation Failed:', validation.errors);
            return validationErrorResponse(validation.errors);
        }

        // Connect to database
        await dbConnect();

        // Find admin by username
        const admin = await Admin.findOne({ username: username.toLowerCase() });

        if (!admin) {
            console.log('❌ Admin User Not Found in DB');
            return errorResponse('Invalid username or password', null, 401);
        }

        console.log(`✅ Admin Found: ${admin.username}, Role: ${admin.role}`);
        console.log(`🔑 Testing Password: ${password.substring(0, 3)}*** against Hash: ${admin.password.substring(0, 10)}...`);

        // Check if admin is active
        if (!admin.isActive) {
            console.log('❌ Admin Account Disabled');
            return errorResponse('Admin account is disabled', null, 403);
        }

        // Compare password
        const isPasswordValid = await comparePassword(password, admin.password);

        if (!isPasswordValid) {
            console.log('❌ Password Check Failed');
            return errorResponse('Invalid username or password', null, 401);
        }

        console.log('✅ Password Check Passed! Login Successful.');

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

        // Set HttpOnly Cookie
        const cookieStore = await cookies();
        const cookieOptions = setAuthCookie(token);
        cookieStore.set(cookieOptions);

        // Return admin data (without password)
        const adminData = {
            id: admin.id,
            username: admin.username,
            role: admin.role,
            isActive: admin.isActive,
            lastLogin: admin.lastLogin
        };

        return successResponse(
            { admin: adminData, token }, // Token still returned for client-side fallback if needed
            'Admin login successful'
        );

    } catch (error) {
        console.error('💥 Login API Error:', error);
        return serverErrorResponse(error);
    }
}
