/**
 * API Route: Admin Logout
 * POST /api/admin/auth/logout
 */

import { cookies } from 'next/headers';
import { successResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function POST() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete('token');

        return successResponse(null, 'Logged out successfully');
    } catch (error) {
        return serverErrorResponse(error);
    }
}
