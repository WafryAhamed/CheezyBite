'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const { login, register, loginWithGoogle } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    // Get redirect param (e.g., /auth?redirect=/checkout)
    const redirectUrl = searchParams.get('redirect') || '/';

    const [step, setStep] = useState('details'); // 'details' | 'otp'
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAuthAction = async (e) => {
        e.preventDefault();
        setIsVerifying(true);

        if (isLogin) {
            // LOGIN FLOW
            const result = await login(formData.email, formData.password);
            if (result.success) {
                // Redirect to intended page or home
                router.push(redirectUrl);
            } else if (result.requireVerification) {
                // User exists but invalid email
                toast('Please verify your email to continue', { icon: '📧' });
                try {
                    await authService.requestOtp(formData.email, 'email_verification');
                    setStep('otp');
                } catch (err) {
                    toast.error("Failed to send verification code");
                }
            }
        } else {
            // SIGNUP FLOW
            // 1. Create Account
            const result = await register(formData.name, formData.email, formData.password);

            if (result.success) {
                if (result.requireVerification) {
                    // 2. Request OTP
                    try {
                        await authService.requestOtp(formData.email, 'signup');
                        setStep('otp');
                    } catch (err) {
                        toast.error("Account created but failed to send OTP. Try logging in.");
                        setIsLogin(true);
                    }
                } else {
                    // Should not happen with new strict rules, but fallback
                    router.push(redirectUrl);
                }
            }
        }
        setIsVerifying(false);
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsVerifying(true);
        try {
            // Determine purpose
            // If we were logging in, purpose is 'email_verification' (or 'login' if 2FA)
            // If we were signing up, purpose is 'signup'
            const purpose = isLogin ? 'email_verification' : 'signup';

            // Verify OTP
            const verifyResponse = await authService.verifyOtp(formData.email, purpose, otp);

            if (verifyResponse.success) {
                toast.success("Email verified successfully!");

                // Auto Login after verification
                const loginResult = await login(formData.email, formData.password);
                if (loginResult.success) {
                    // Redirect to intended page or home
                    router.push(redirectUrl);
                } else {
                    // Fallback if auto-login fails
                    setIsLogin(true);
                    setStep('details');
                    toast("Please login with your credentials");
                }
            }
        } catch (error) {
            console.error("Verification failed", error);
            toast.error(error.message || "Verification failed");
        }
        setIsVerifying(false);
    };

    const handleSubmit = handleAuthAction;

    return (
        <div className='container mx-auto px-4 pt-24 pb-12 min-h-screen flex items-center justify-center'>
            <div className="bg-softBlack w-full max-w-md p-8 rounded-2xl border border-cardBorder shadow-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-ashWhite mb-2">
                        {isLogin ? 'Welcome Back' : (step === 'otp' ? 'Verify Email' : 'Create Account')}
                    </h1>
                    <p className="text-ashWhite/60">
                        {isLogin ? 'Login to access your saved orders' : (step === 'otp' ? `Enter code sent to ${formData.email}` : 'Join CheezyBite for exclusive offers')}
                    </p>
                </div>

                {/* OTP Form */}
                {!isLogin && step === 'otp' || (isLogin && step === 'otp') ? (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="relative">
                            <input
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                type="text"
                                placeholder="Enter 6-digit Code"
                                maxLength={6}
                                className="w-full bg-charcoalBlack border border-cardBorder rounded-xl px-4 py-3 text-ashWhite text-center text-2xl tracking-widest focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                autoFocus
                            />
                        </div>
                        <button disabled={isVerifying} type="submit" className="w-full btn btn-lg bg-primary hover:bg-primaryHover text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2">
                            {isVerifying ? 'Verifying...' : 'Verify & Create Account'}
                        </button>
                        <button type="button" onClick={() => setStep('details')} className="w-full text-sm text-ashWhite/50 hover:text-ashWhite mt-2 text-center block">
                            Back to Details
                        </button>
                    </form>
                ) : (
                    /* Details Form */
                    <>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-ashWhite/50 w-5 h-5" />
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        type="text"
                                        placeholder="Full Name"
                                        className="w-full bg-charcoalBlack border border-cardBorder rounded-xl pl-12 pr-4 py-3 text-ashWhite focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    />
                                </div>
                            )}
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ashWhite/50 w-5 h-5" />
                                <input
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    type="email"
                                    placeholder="Email Address"
                                    className="w-full bg-charcoalBlack border border-cardBorder rounded-xl pl-12 pr-4 py-3 text-ashWhite focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ashWhite/50 w-5 h-5" />
                                <input
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    type="password"
                                    placeholder="Password"
                                    className="w-full bg-charcoalBlack border border-cardBorder rounded-xl pl-12 pr-4 py-3 text-ashWhite focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer text-ashWhite/70">
                                    <input type="checkbox" className="accent-primary rounded" />
                                    Remember me
                                </label>
                                {isLogin && (
                                    <Link href="#" className="text-primary hover:text-primaryHover hover:underline">
                                        Forgot Password?
                                    </Link>
                                )}
                            </div>

                            <button disabled={isVerifying} className="w-full btn btn-lg bg-primary hover:bg-primaryHover text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50">
                                {isVerifying ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="my-6 border-t border-cardBorder relative">
                            <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-softBlack px-4 text-ashWhite/40 text-sm">
                                Or continue with
                            </span>
                        </div>

                        {/* Social Auth */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={async () => {
                                    const success = await loginWithGoogle();
                                    if (success) router.push(redirectUrl);
                                }}
                                className="flex items-center justify-center gap-2 bg-charcoalBlack border border-cardBorder py-2.5 rounded-xl text-ashWhite hover:bg-white/5 transition-colors">
                                <GoogleIcon className="w-5 h-5" />
                                Google
                            </button>
                            <button className="flex items-center justify-center gap-2 bg-charcoalBlack border border-cardBorder py-2.5 rounded-xl text-ashWhite hover:bg-white/5 transition-colors">
                                <FacebookIcon className="w-5 h-5 text-blue-500" />
                                Facebook
                            </button>
                        </div>
                    </>
                )}

                {/* Toggle */}
                <div className="text-center mt-8 text-ashWhite/70">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => { setIsLogin(!isLogin); setStep('details'); }} className="text-primary font-bold hover:underline">
                        {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                </div>

                <div className="text-center mt-4">
                    <Link href="/" className="text-sm text-ashWhite/40 hover:text-ashWhite">
                        Continue as Guest
                    </Link>
                </div>
            </div>
        </div>
    );
}

// Icons
function GoogleIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" className={className}>
            <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
            />
            <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
            />
            <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
            />
            <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
            />
        </svg>
    )
}

function FacebookIcon({ className }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
    )
}
