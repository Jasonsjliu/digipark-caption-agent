'use client';

import { useState } from 'react';

interface PlatformPillProps {
    id: string;
    label: string;
    icon: string;
    color: string;
    count: number;
    onChange: (val: number) => void;
}

export function PlatformPill({ id, label, icon, color, count, onChange }: PlatformPillProps) {
    const isActive = count > 0;
    const [showInput, setShowInput] = useState(false);

    // Color maps for active states
    const activeClass = {
        cyan: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.3)]',
        purple: 'bg-purple-500/20 border-purple-500/50 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.3)]',
        red: 'bg-red-500/20 border-red-500/50 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
    }[color] || 'bg-white/20';

    const toggle = () => {
        if (!isActive) onChange(1);
        else onChange(0);
    };

    return (
        <div className={`
            relative flex items-center h-12 rounded-full border transition-all duration-300 font-medium select-none
            ${isActive ? activeClass : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}
        `}>
            {/* The Label Part (Toggle) */}
            <div
                onClick={toggle}
                className="flex items-center gap-3 px-5 h-full cursor-pointer hover:opacity-80 transition-opacity"
            >
                <span className={`text-xl ${!isActive && 'grayscale opacity-50'}`}>{icon}</span>
                <span className="text-sm tracking-wide">{label}</span>
            </div>

            {/* The Quantity Part (Separator + Value) */}
            {isActive && (
                <div className="flex items-center border-l border-white/10 h-full pl-1 pr-1">
                    <button
                        onClick={() => onChange(Math.max(0, count - 1))}
                        className="w-8 h-full flex items-center justify-center hover:bg-white/10 rounded-sm text-lg leading-none pb-1"
                    >
                        -
                    </button>
                    <input
                        type="number"
                        value={count}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val) && val >= 0) onChange(val);
                            else if (e.target.value === '') onChange(0);
                        }}
                        className="w-8 text-center font-mono text-sm bg-transparent outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                        onClick={() => onChange(count + 1)}
                        className="w-8 h-full flex items-center justify-center hover:bg-white/10 rounded-sm text-lg leading-none pb-1"
                    >
                        +
                    </button>
                </div>
            )}
        </div>
    );
}
