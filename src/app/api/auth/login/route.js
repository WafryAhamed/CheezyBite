/**
 * API Route: User Login
 * POST /api/auth/login
 */

import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { comparePassword, generateToken, setAuthCookie } from '@/lib/auth';
import { validateUserLogin } from '@/lib/validators';
import { successResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function POST(request) {
    try {
        // Parse request body
        const body = await request.json();
        const { email, password } = body;

        // Validate input
        const validation = validateUserLogin(body);
        if (!validation.isValid) {
            return validationErrorResponse(validation.errors);
        }

        // Connect to database
        await dbConnect();

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return errorResponse('Invalid email or password', null, 401);
        }

        // Compare password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return errorResponse('Invalid email or password', null, 401);
        }

        if (!user.emailVerified) {
            return errorResponse('Email not verified', { requireVerification: true, email: user.email }, 403);
        }

        // Generate JWT token
        const token = generateToken({
            userId: user._id,
            email: user.email,
            type: 'user'
        });

        // Return user data (without password)
        const userData = {
            id: user._id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            phone_verified: user.phone_verified,
            addresses: user.addresses
        };

        // Set HttpOnly Cookie
        const cookieStore = await cookies();
        const cookieOptions = setAuthCookie(token);
        cookieStore.set(cookieOptions);

        return successResponse(
            { user: userData, token },
            'Login successful'
        );

    } catch (error) {
        return serverErrorResponse(error);
    }
}
