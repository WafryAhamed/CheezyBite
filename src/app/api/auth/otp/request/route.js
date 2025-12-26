import dbConnect from '@/lib/dbConnect';
import OtpSession from '@/models/OtpSession';
import { sendOTP } from '@/lib/emailService';
import bcrypt from 'bcryptjs';
import { errorResponse, successResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function POST(request) {
    try {
        await dbConnect();

        const { email, purpose } = await request.json();

        if (!email || !purpose) {
            return errorResponse('Email and purpose are required', null, 400);
        }

        // Validate allowed purposes
        const allowedPurposes = ['signup', 'login', 'profile_update', 'checkout', 'order_place', 'email_verification'];
        if (!allowedPurposes.includes(purpose)) {
            return errorResponse('Invalid OTP purpose', null, 400);
        }

        // Rate limiting logic could go here (e.g. check last session created within 60s)
        const existingRecentSession = await OtpSession.findOne({
            email,
            purpose,
            createdAt: { $gt: new Date(Date.now() - 10 * 1000) } // 10 seconds cooldown
        });

        if (existingRecentSession) {
            return errorResponse('Please wait before requesting another code.', null, 429);
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash it
        const salt = await bcrypt.genSalt(10);
        const otpHash = await bcrypt.hash(otp, salt);

        // Save session
        // Valid for 5 minutes
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await OtpSession.create({
            email,
            purpose,
            otpHash,
            expiresAt
        });

        // Send Email
        const emailResult = await sendOTP(email, otp);

        if (!emailResult.success) {
            return errorResponse('Failed to send email. Please try again.', null, 500);
        }

        return successResponse(null, `OTP sent to ${email}`);

    } catch (error) {
        return serverErrorResponse(error);
    }
}
