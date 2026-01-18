'use client';

import { SoulSlider } from './SoulSlider';
import { PlatformDial } from './PlatformDial';
import { VariableSelector } from './VariableSelector';
import type { VariableSelections } from '@/types';

interface InlineSettingsProps {
    isOpen: boolean;
    variables: VariableSelections;
    setVariables: (v: VariableSelections) => void;
    counts: { tiktok: number; instagram: number; xiaohongshu: number };
    setCounts: (c: { tiktok: number; instagram: number; xiaohongshu: number }) => void;
    creativity: number;
    setCreativity: (v: number) => void;
    toneIntensity: number;
    setToneIntensity: (v: number) => void;
}

export function InlineSettings({
    isOpen,
    variables, setVariables,
    counts, setCounts,
    creativity, setCreativity,
    toneIntensity, setToneIntensity
}: InlineSettingsProps) {

    return (
        <div className={`
            w-full max-w-2xl mx-auto overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
            ${isOpen ? 'max-h-[800px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4'}
        `}>
            <div className="mt-4 p-8 bg-black/20 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex flex-col gap-10">

                {/* 1. Platform Dials */}
                <section className="flex justify-center gap-8 md:gap-16 pb-6 border-b border-white/5">
                    <PlatformDial
                        id="tiktok" label="TikTok" icon="🎵" color="cyan"
                        count={counts.tiktok}
                        onChange={(v) => setCounts({ ...counts, tiktok: v })}
                    />
                    <PlatformDial
                        id="instagram" label="Instagram" icon="📸" color="purple"
                        count={counts.instagram}
                        onChange={(v) => setCounts({ ...counts, instagram: v })}
                    />
                    <PlatformDial
                        id="xiaohongshu" label="RedBook" icon="📕" color="red"
                        count={counts.xiaohongshu}
                        onChange={(v) => setCounts({ ...counts, xiaohongshu: v })}
                    />
                </section>

                {/* 2. Sliders */}
                <section className="grid md:grid-cols-2 gap-10">
                    <SoulSlider
                        label="🧠 脑洞 (Temperature)"
                        value={creativity} min={0} max={100}
                        onChange={setCreativity} formatValue={v => `${v}%`}
                    />
                    <SoulSlider
                        label="🎭 语气 (Intensity)"
                        value={toneIntensity} min={1} max={5}
                        onChange={setToneIntensity}
                        formatValue={v => ['😐 平淡', '🙂 柔和', '😊 标准', '🤩 强烈', '🤯 疯狂'][v - 1]}
                    />
                </section>

                {/* 3. Variables (Collapsible or just inline) */}
                <section>
                    <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4">高级设置</h3>
                    <VariableSelector value={variables} onChange={setVariables} />
                </section>

            </div>
        </div>
    );
}
