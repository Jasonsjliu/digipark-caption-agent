'use client';

import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/Logo';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        const supabase = createClient();
        try {
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${location.origin}/auth/callback`,
                },
            });
        } catch (error) {
            console.error('Login failed:', error);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[#0a0a0f]" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] animate-pulse delay-1000" />

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center">
                <div className="scale-125 mb-8">
                    <Logo />
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
                <p className="text-gray-400 mb-8 text-sm">
                    Sign in to access your personalized caption library and settings.
                </p>

                <button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-black font-semibold py-3 px-6 rounded-xl transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                    ) : (
                        <svg className="w-5 h-5" aria-hidden="true" viewBox="0 0 24 24">
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
                    )}
                    <span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
                </button>

                <div className="mt-6 text-[10px] text-gray-500 uppercase tracking-widest">
                    Secure Access via Supabase
                </div>
            </div>
        </div>
    );
}
