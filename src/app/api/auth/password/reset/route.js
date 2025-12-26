
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { errorResponse, successResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function POST(request) {
    try {
        await dbConnect();
        const { email, token, newPassword } = await request.json();

        if (!email || !token || !newPassword) {
            return errorResponse('Missing fields', null, 400);
        }

        if (newPassword.length < 6) {
            return errorResponse('Password must be at least 6 characters', null, 400);
        }

        // Hash the provided token to compare with DB
        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            email: email.toLowerCase(),
            resetPasswordToken: resetTokenHash,
            resetPasswordExpires: { $gt: Date.now() } // Check not expired
        });

        if (!user) {
            return errorResponse('Invalid or expired token', null, 400);
        }

        // Update password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Clear reset fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return successResponse(null, 'Password reset successful. Please login.');

    } catch (error) {
        return serverErrorResponse(error);
    }
}
