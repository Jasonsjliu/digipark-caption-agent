'use client';

import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function AuthButton() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setIsLoading(false);
        };

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = () => {
        window.location.href = '/login';
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };

    if (isLoading) return <div className="animate-pulse w-8 h-8 rounded-full bg-white/10" />;

    if (!user) {
        return (
            <button
                onClick={handleLogin}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-xs font-medium transition-all"
            >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
            </button>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                {user.user_metadata.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="User" className="w-5 h-5 rounded-full" />
                ) : (
                    <div className="w-5 h-5 rounded-full bg-indigo-500/50 flex items-center justify-center">
                        <UserIcon className="w-3 h-3 text-white" />
                    </div>
                )}
                <span className="text-xs text-gray-300 truncate max-w-[100px]">
                    {user.email}
                </span>
            </div>
            <button
                onClick={handleLogout}
                className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all"
                title="Sign Out"
            >
                <LogOut className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}
