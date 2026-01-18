'use client';

import { useState } from 'react';

interface DialProps {
    id: string;
    label: string;
    icon: string;
    color: string;
    count: number;
    onChange: (val: number) => void;
}

export function PlatformDial({ id, label, icon, color, count, onChange }: DialProps) {
    const isActive = count > 0;

    const toggle = () => {
        if (isActive) onChange(0);
        else onChange(3); // Default to 3 when enabling
    };

    return (
        <div className="flex flex-col items-center gap-3 group">
            {/* The Dial Button */}
            <button
                onClick={toggle}
                className={`
                    relative w-16 h-16 rounded-full flex items-center justify-center text-2xl
                    transition-all duration-300 border backdrop-blur-md shadow-lg
                    ${isActive
                        ? `border-${color}-500/50 bg-${color}-500/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.2)]`
                        : 'border-white/10 bg-white/5 text-gray-500 hover:bg-white/10 hover:border-white/20'}
                `}
            >
                <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100 grayscale opacity-50'}`}>
                    {icon}
                </span>

                {/* Active Indicator Ring */}
                {isActive && (
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/30 animate-spin-slow" />
                )}
            </button>

            <span className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${isActive ? 'text-white' : 'text-gray-600'}`}>
                {label}
            </span>

            {/* Inline Slider for Quantity (Only when active) */}
            <div className={`
                h-8 transition-all duration-300 overflow-hidden flex items-center gap-2
                ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
            `}>
                <button
                    onClick={() => onChange(Math.max(0, count - 1))}
                    className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs text-gray-400"
                >
                    -
                </button>
                <div className="font-mono text-sm w-4 text-center text-white">{count}</div>
                <button
                    onClick={() => onChange(Math.min(10, count + 1))}
                    className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs text-gray-400"
                >
                    +
                </button>
            </div>
        </div>
    );
}
