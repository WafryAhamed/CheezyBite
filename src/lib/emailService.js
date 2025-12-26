import { Resend } from 'resend';

const resend = (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith('re_123'))
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

export const sendEmailCurrent = async (to, subject, html) => {
    try {
        if (!resend) {
            console.warn("⚠️ Placeholder or Missing RESEND_API_KEY. Email simulation only.");
            console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
            return { success: true, id: 'mock_id_' + Date.now() };
        }

        const data = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'CheezyBite <onboarding@resend.dev>',
            to: to,
            subject: subject,
            html: html,
        });

        if (data.error) {
            console.error("Resend Error:", data.error);
            return { success: false, error: data.error };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Email Service Error:", error);
        return { success: false, error };
    }
};

export const sendOTP = async (email, otp) => {
    const htmlKey = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #FF8c00;">CheezyBite Verification</h1>
        <p>Your verification code is:</p>
        <h2 style="font-size: 32px; letter-spacing: 5px; background: #eee; padding: 10px; text-align: center; border-radius: 8px;">${otp}</h2>
        <p>This code will expire in 5 minutes.</p>
        <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email.</p>
    </div>
    `;
    return sendEmailCurrent(email, 'Your CheezyBite Verification Code', htmlKey);
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
    const htmlKey = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #FF8c00;">Reset Your Password</h1>
        <p>You requested a password reset for your CheezyBite account.</p>
        <p>Click the link below to set a new password:</p>
        <a href="${resetUrl}" style="background: #FF8c00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        <p>This link will expire in 15 minutes.</p>
        <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email.</p>
    </div>
    `;
    return sendEmailCurrent(email, 'Reset Your CheezyBite Password', htmlKey);
};
