
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/lib/emailService';
import crypto from 'crypto';
import { errorResponse, successResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function POST(request) {
    try {
        await dbConnect();
        const { email } = await request.json();

        if (!email) {
            return errorResponse('Email is required', null, 400);
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        // Always return success even if user not found (security)
        if (!user) {
            return successResponse(null, 'If the email exists, a reset link has been sent.');
        }

        // Generate token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Save token & expiry (15 mins)
        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
        await user.save();

        // Send email
        const resetUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${email}`;

        await sendPasswordResetEmail(user.email, resetUrl);

        return successResponse(null, 'If the email exists, a reset link has been sent.');

    } catch (error) {
        return serverErrorResponse(error);
    }
}
