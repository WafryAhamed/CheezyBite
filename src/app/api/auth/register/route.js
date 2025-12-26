/**
 * API Route: User Registration
 * POST /api/auth/register
 */

import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import OtpSession from '@/models/OtpSession';
import { hashPassword, generateToken } from '@/lib/auth';
import { validateUserRegistration } from '@/lib/validators';
import { successResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function POST(request) {
    try {
        // Parse request body
        const body = await request.json();
        const { email, password, name, phone } = body;

        // Validate input
        const validation = validateUserRegistration(body);
        if (!validation.isValid) {
            return validationErrorResponse(validation.errors);
        }

        // Connect to database
        await dbConnect();

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return errorResponse('User with this email already exists', null, 409);
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user (Unverified initially)
        const user = await User.create({
            email: email.toLowerCase(),
            password: hashedPassword,
            name,
            phone: phone || '',
            emailVerified: false,
            addresses: []
        });

        // We do NOT return a token. We require verification.
        return successResponse(
            {
                userId: user._id,
                email: user.email,
                requireVerification: true
            },
            'Account created. Please verify your email.',
            201
        );

    } catch (error) {
        return serverErrorResponse(error);
    }
}
