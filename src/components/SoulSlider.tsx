'use client';

import { useState, useRef, useEffect } from 'react';

interface SoulSliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (val: number) => void;
    formatValue?: (val: number) => string;
}

export function SoulSlider({ label, value, min, max, step = 1, onChange, formatValue }: SoulSliderProps) {
    const [isDragging, setIsDragging] = useState(false);

    // Haptic feedback simulation
    const vibrate = () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(5);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = parseFloat(e.target.value);
        if (newVal !== value) {
            onChange(newVal);
            if (newVal === min || newVal === max || newVal % 10 === 0) {
                vibrate(); // Vibrate on bounds or round numbers
            }
        }
    };

    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className="space-y-3 group">
            <div className="flex justify-between items-center text-sm font-medium">
                <label className="text-gray-300 transition-colors group-hover:text-white">{label}</label>
                <span className={`font-mono text-purple-300 transition-all duration-100 ${isDragging ? 'scale-110 text-purple-200' : ''}`}>
                    {formatValue ? formatValue(value) : value}
                </span>
            </div>

            <div className="relative h-6 flex items-center">
                {/* Track Background */}
                <div className="absolute w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    {/* Fill */}
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-75"
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                {/* Glow Thumb Element (Visual only, behind input) */}
                <div
                    className={`absolute h-4 w-4 bg-white rounded-full shadow-[0_0_15px_rgba(168,85,247,0.6)] pointer-events-none transition-all duration-75
                         ${isDragging ? 'scale-125 shadow-[0_0_25px_rgba(168,85,247,0.9)]' : ''}`}
                    style={{ left: `calc(${percentage}% - 8px)` }}
                />

                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={handleChange}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => setIsDragging(false)}
                    onTouchStart={() => setIsDragging(true)}
                    onTouchEnd={() => setIsDragging(false)}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                />
            </div>
        </div>
    );
}
