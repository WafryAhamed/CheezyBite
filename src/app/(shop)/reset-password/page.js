
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Check, ArrowRight, Loader2 } from 'lucide-react';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';
import Link from 'next/link';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (!token || !email) {
            toast.error("Invalid reset link");
            router.push('/forgot-password');
        }
    }, [token, email, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (passwords.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        try {
            const res = await authService.resetPassword(email, token, passwords.newPassword);
            if (res.success) {
                setIsSuccess(true);
                toast.success("Password reset successfully!");
            } else {
                toast.error(res.message || "Failed to reset password");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Link might be expired.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-softBlack p-8 rounded-2xl border border-cardBorder text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-8 h-8 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-ashWhite mb-2">Password Reset!</h1>
                    <p className="text-ashWhite/60 mb-6">
                        Your password has been updated successfully. You can now login with your new password.
                    </p>
                    <Link href="/" className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2">
                        Login Now
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-softBlack p-8 rounded-2xl border border-cardBorder">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-ashWhite mb-2">Reset Password</h1>
                    <p className="text-ashWhite/60">
                        Create a strong password for your account.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ashWhite/50 w-5 h-5" />
                        <input
                            type="password"
                            required
                            placeholder="New Password"
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                            className="w-full bg-charcoalBlack border border-cardBorder rounded-xl pl-12 pr-4 py-3 text-ashWhite focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ashWhite/50 w-5 h-5" />
                        <input
                            type="password"
                            required
                            placeholder="Confirm Password"
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                            className="w-full bg-charcoalBlack border border-cardBorder rounded-xl pl-12 pr-4 py-3 text-ashWhite focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                    >
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                        {!isLoading && <ArrowRight className="w-5 h-5" />}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center text-ashWhite">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
