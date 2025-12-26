
"use client";

import React, { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await authService.forgotPassword(email);
            setIsSent(true);
            toast.success("If an account exists, a reset link has been sent.");
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSent) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-softBlack p-8 rounded-2xl border border-cardBorder text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-ashWhite mb-2">Check Your Email</h1>
                    <p className="text-ashWhite/60 mb-6">
                        If an account exists for <b>{email}</b>, we have sent password reset instructions.
                    </p>
                    <Link href="/" className="text-primary hover:text-primaryHover font-bold flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-softBlack p-8 rounded-2xl border border-cardBorder">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-ashWhite mb-2">Forgot Password?</h1>
                    <p className="text-ashWhite/60">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ashWhite/50 w-5 h-5" />
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full bg-charcoalBlack border border-cardBorder rounded-xl pl-12 pr-4 py-3 text-ashWhite focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                        {!isLoading && <ArrowRight className="w-5 h-5" />}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link href="/" className="text-ashWhite/60 hover:text-ashWhite text-sm flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
