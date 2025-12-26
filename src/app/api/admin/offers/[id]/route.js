import dbConnect from '@/lib/dbConnect';
import Offer from '@/models/Offer';
import { authenticate, isAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function PATCH(request, { params }) {
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
        const { id } = await params;

        const body = await request.json();

        // If updating code, ensure uppercase
        if (body.code) {
            body.code = body.code.toUpperCase();
        }

        const offer = await Offer.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });

        if (!offer) {
            return notFoundResponse('Offer');
        }

        return successResponse(offer, 'Offer updated successfully');

    } catch (error) {
        return serverErrorResponse(error);
    }
}

export async function DELETE(request, { params }) {
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
        const { id } = await params;

        const offer = await Offer.findByIdAndDelete(id);

        if (!offer) {
            return notFoundResponse('Offer');
        }

        return successResponse(null, 'Offer deleted successfully');

    } catch (error) {
        return serverErrorResponse(error);
    }
}
