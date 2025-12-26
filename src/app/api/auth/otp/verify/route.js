import dbConnect from '@/lib/dbConnect';
import OtpSession from '@/models/OtpSession';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { errorResponse, successResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function POST(request) {
    try {
        await dbConnect();
        const { email, purpose, code } = await request.json();

        if (!email || !purpose || !code) {
            return errorResponse('Missing fields', null, 400);
        }

        // Find active, unconsumed session
        const session = await OtpSession.findOne({
            email,
            purpose,
            consumedAt: null,
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 }); // Get latest

        if (!session) {
            return errorResponse('Invalid or expired OTP', null, 400);
        }

        if (session.attempts >= 5) {
            return errorResponse('Too many attempts. Request a new code.', null, 400);
        }

        // Verify Hash
        const isMatch = await bcrypt.compare(code, session.otpHash);

        if (!isMatch) {
            // Increment attempts
            session.attempts += 1;
            await session.save();
            return errorResponse('Invalid code', null, 400);
        }

        // Success: Mark Consumed
        session.consumedAt = new Date();
        await session.save();

        // If purpose was 'email_verification' or 'signup', update user status
        if (purpose === 'signup' || purpose === 'email_verification' || purpose === 'profile_update') {
            await User.findOneAndUpdate({ email }, { emailVerified: true });
        }

        return successResponse({ verified: true }, 'Verification successful');

    } catch (error) {
        return serverErrorResponse(error);
    }
}
