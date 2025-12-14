/**
 * API Route: Health Check
 * Verifies MongoDB connection and API availability
 * GET /api/health
 */

import dbConnect from '@/lib/dbConnect';

export async function GET(request) {
    try {
        // Attempt MongoDB connection
        await dbConnect();

        return Response.json({
            status: 'OK',
            message: 'CheezyBite API is running',
            mongodb: 'Connected',
            timestamp: new Date().toISOString()
        }, { status: 200 });
    } catch (error) {
        return Response.json({
            status: 'ERROR',
            message: 'API is running but MongoDB connection failed',
            mongodb: 'Disconnected',
            error: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
