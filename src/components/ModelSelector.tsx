'use client';

import { Sparkles, Zap, BrainCircuit } from 'lucide-react';
import type { ModelType } from '@/types';

interface ModelSelectorProps {
    value: ModelType;
    onChange: (value: ModelType) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
    const models: { id: ModelType; label: string; icon: React.ReactNode; desc: string }[] = [
        {
            id: 'gemini-2.0-flash-exp',
            label: 'Gemini 2.0',
            icon: <Sparkles className="w-3.5 h-3.5" />,
            desc: 'Fastest (Free)'
        },
        {
            id: 'gpt-4o',
            label: 'GPT-4o',
            icon: <Zap className="w-3.5 h-3.5" />,
            desc: 'Smartest'
        },
        {
            id: 'gpt-5-mini',
            label: 'GPT-5 mini',
            icon: <Zap className="w-3.5 h-3.5 text-blue-400" />,
            desc: 'Next Gen'
        },
        {
            id: 'grok-4-1-fast-non-reasoning',
            label: 'Grok 4.1',
            icon: <BrainCircuit className="w-3.5 h-3.5 text-orange-400" />,
            desc: 'Hyper Speed'
        },
    ];

    return (
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 w-fit">
            {models.map((model) => {
                const isActive = value === model.id;
                return (
                    <button
                        key={model.id}
                        onClick={() => onChange(model.id)}
                        className={`
                            relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300
                            ${isActive
                                ? 'bg-indigo-500/20 text-indigo-100 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}
                        `}
                    >
                        {model.icon}
                        <div className="flex flex-col items-start leading-none gap-0.5">
                            <span>{model.label}</span>
                            {isActive && <span className="text-[9px] opacity-60 font-light">{model.desc}</span>}
                        </div>

                        {isActive && (
                            <div className="absolute inset-0 border border-indigo-500/30 rounded-lg pointer-events-none" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
