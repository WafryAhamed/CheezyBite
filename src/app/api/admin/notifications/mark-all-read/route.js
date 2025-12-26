import dbConnect from '@/lib/dbConnect';
import Notification from '@/models/Notification';
import { authenticate, isAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { successResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function PATCH(req) {
    try {
        const user = await authenticate(req);
        if (!user) return unauthorizedResponse();
        if (!isAdmin(user)) return forbiddenResponse();

        await dbConnect();

        // Mark all as read
        await Notification.updateMany({ read: false }, { read: true });

        return successResponse(null, 'All marked as read');
    } catch (error) {
        return serverErrorResponse(error);
    }
}
