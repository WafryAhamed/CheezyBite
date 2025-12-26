import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Offer from '@/models/Offer';
import { authenticate, isAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/apiResponse';

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

        const offers = await Offer.find({}).sort({ createdAt: -1 });
        return successResponse(offers, 'Offers fetched successfully');

    } catch (error) {
        return serverErrorResponse(error);
    }
}

export async function POST(request) {
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

        const body = await request.json();

        // Validation
        if (!body.name || !body.code || !body.type || body.value === undefined) {
            return errorResponse('Missing required fields: name, code, type, value', null, 400);
        }

        if (body.type === 'percent' && (body.value < 0 || body.value > 100)) {
            return errorResponse('Percentage value must be between 0 and 100', null, 400);
        }

        if (body.type === 'fixed' && body.value < 0) {
            return errorResponse('Fixed discount value cannot be negative', null, 400);
        }

        // Check if code already exists
        const existingOffer = await Offer.findOne({ code: body.code.toUpperCase() });
        if (existingOffer) {
            return errorResponse('Offer code already exists', null, 400);
        }

        // Ensure code is uppercase
        body.code = body.code.toUpperCase();

        const offer = await Offer.create(body);

        return successResponse(offer, 'Offer created successfully', 201);

    } catch (error) {
        return serverErrorResponse(error);
    }
}
