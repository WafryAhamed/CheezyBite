"use client";

import { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useRouter } from 'next/navigation';
import { Pizza, Lock, User } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
    const { login, isAuthenticated } = useAdmin();
    const router = useRouter();

    // Form state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/admin');
        }
    }, [isAuthenticated, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Helper returns boolean success
        const success = await login(username, password);

        if (success) {
            // Redirect happens in useEffect
        } else {
            setIsLoading(false);
        }
    };

    if (isAuthenticated) return null; // Prevent flash

    return (
        <div className="min-h-screen bg-jetBlack flex items-center justify-center p-4">
            <div className="bg-softBlack rounded-2xl shadow-xl p-8 w-full max-w-md border border-cardBorder">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6 relative">
                        <Pizza className="w-10 h-10 text-primary absolute" />
                        <div className="absolute -bottom-1 -right-1 bg-charcoalBlack rounded-full p-1.5 border border-cardBorder">
                            <Lock className="w-4 h-4 text-ashWhite" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-ashWhite tracking-tight">Admin Portal</h1>
                        <p className="text-ashWhite/50">Restricted Access • Authorized Personnel Only</p>
                    </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-ashWhite/70 uppercase tracking-wider ml-1">Username</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-3.5 w-5 h-5 text-ashWhite/30 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter admin username"
                                className="w-full pl-12 pr-4 py-3 bg-charcoalBlack border border-cardBorder rounded-xl text-ashWhite placeholder-ashWhite/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-ashWhite/70 uppercase tracking-wider ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-ashWhite/30 group-focus-within:text-primary transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full pl-12 pr-4 py-3 bg-charcoalBlack border border-cardBorder rounded-xl text-ashWhite placeholder-ashWhite/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3.5 bg-primary hover:bg-primaryHover text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-primary/25 active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Authenticating...' : 'Secure Login'}
                    </button>
                </form>

                {/* Credentials Hint (For Demo Only) */}
                <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/5">
                    <p className="text-xs text-center text-ashWhite/40 mb-3 font-mono">DEMO CREDENTIALS</p>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="text-center">
                            <div className="text-primary font-bold mb-1">Super Admin</div>
                            <code className="bg-black/30 px-2 py-1 rounded text-ashWhite/70">admin</code>
                            <div className="mt-1 text-ashWhite/30">Password: Admin@123</div>
                        </div>
                        <div className="text-center border-l border-white/5">
                            <div className="text-secondary font-bold mb-1">Manager</div>
                            <code className="bg-black/30 px-2 py-1 rounded text-ashWhite/70">manager</code>
                            <div className="mt-1 text-ashWhite/30">Password: Manager@123</div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <Link href="/" className="text-sm text-ashWhite/40 hover:text-ashWhite transition-colors">
                        ← Return to Main Site
                    </Link>
                </div>
            </div>

            {/* Footer Watermark */}
            <div className="fixed bottom-4 text-[10px] text-ashWhite/10 font-mono tracking-widest pointer-events-none">
                CHEEZYBITE ADMIN SYSTEM v2.0
            </div>
        </div>
    );
}
