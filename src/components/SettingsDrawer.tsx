'use client';

import { useState } from 'react';
import { SoulSlider } from './SoulSlider';
import { VariableSelector } from './VariableSelector';
import type { VariableSelections } from '@/types';

interface SettingsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    variables: VariableSelections;
    setVariables: (v: VariableSelections) => void;
    counts: { tiktok: number; instagram: number; xiaohongshu: number };
    setCounts: (c: { tiktok: number; instagram: number; xiaohongshu: number }) => void;
    creativity: number;
    setCreativity: (v: number) => void;
    toneIntensity: number;
    setToneIntensity: (v: number) => void;
}

export function SettingsDrawer({
    isOpen, onClose,
    variables, setVariables,
    counts, setCounts,
    creativity, setCreativity,
    toneIntensity, setToneIntensity
}: SettingsDrawerProps) {

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`
                fixed top-0 right-0 h-full w-full md:w-[480px] z-50 transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1)
                bg-[#0a0a0f]/80 backdrop-blur-2xl border-l border-white/10 shadow-2xl
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}
            `}>
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                        <h2 className="text-xl font-light text-white flex items-center gap-3">
                            <span className="text-2xl">⚙️</span> Settings
                        </h2>
                        <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-gray-400">
                            ✕
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">

                        {/* 1. Sliders Section */}
                        <section className="space-y-6">
                            <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold">Inspiration Tuning</h3>

                            <SoulSlider
                                label="🧠 Creativity (Temperature)"
                                value={creativity}
                                min={0} max={100}
                                onChange={setCreativity}
                                formatValue={(v) => `${v}%`}
                            />

                            <SoulSlider
                                label="🎭 Tone Intensity"
                                value={toneIntensity}
                                min={1} max={5}
                                onChange={setToneIntensity}
                                formatValue={(v) => ['😐 Flat', '🙂 Soft', '😊 Standard', '🤩 Strong', '🤯 Crazy'][v - 1]}
                            />
                        </section>

                        {/* 2. Platform Counts */}
                        <section className="space-y-6">
                            <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold">Generation Count</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { id: 'tiktok', icon: '🎵', label: 'TikTok' },
                                    { id: 'instagram', icon: '📸', label: 'Instagram' },
                                    { id: 'xiaohongshu', icon: '📕', label: 'RED' }
                                ].map(p => (
                                    <div key={p.id} className="bg-white/5 rounded-xl p-3 flex flex-col items-center gap-2 border border-white/5 hover:border-white/20 transition-all cursor-pointer">
                                        <div className="text-2xl">{p.icon}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase">{p.label}</div>
                                        <input
                                            type="number"
                                            value={counts[p.id as keyof typeof counts]}
                                            onChange={(e) => setCounts({ ...counts, [p.id]: Math.max(0, parseInt(e.target.value) || 0) })}
                                            className="w-12 bg-transparent text-center font-mono text-lg border-b border-white/10 focus:border-white/50 outline-none"
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 3. Variables */}
                        <section className="space-y-6">
                            <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold">Advanced Variables</h3>
                            <VariableSelector value={variables} onChange={setVariables} />
                        </section>

                    </div>
                </div>
            </div>
        </>
    );
}
