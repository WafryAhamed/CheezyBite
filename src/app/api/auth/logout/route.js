/**
 * API Route: Logout
 * POST /api/auth/logout
 */

import { successResponse } from '@/lib/apiResponse';
import { cookies } from 'next/headers';

export async function POST(request) {
    try {
        // Clear the httpOnly cookie
        const cookieStore = await cookies();

        cookieStore.set('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 0, // Expire immediately
            path: '/'
        });

        return successResponse(null, 'Logged out successfully');

    } catch (error) {
        return successResponse(null, 'Logged out successfully');
    }
}
