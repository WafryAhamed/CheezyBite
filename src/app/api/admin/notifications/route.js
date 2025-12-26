import dbConnect from '@/lib/dbConnect';
import Notification from '@/models/Notification';
import { authenticate, isAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { successResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(req) {
    try {
        const user = await authenticate(req);
        if (!user) return unauthorizedResponse();
        if (!isAdmin(user)) return forbiddenResponse();

        await dbConnect();
        // Fetch last 50 notifications, sorted by newest
        const notifications = await Notification.find({})
            .sort({ createdAt: -1 })
            .limit(50);

        return successResponse(notifications, 'Notifications fetched successfully');
    } catch (error) {
        return serverErrorResponse(error);
    }
}

export async function POST(req) {
    try {
        const user = await authenticate(req);
        if (!user) return unauthorizedResponse();
        if (!isAdmin(user)) return forbiddenResponse();

        await dbConnect();
        const body = await req.json();

        const notification = await Notification.create(body);

        return successResponse(notification, 'Notification created successfully', 201);
    } catch (error) {
        return serverErrorResponse(error);
    }
}
