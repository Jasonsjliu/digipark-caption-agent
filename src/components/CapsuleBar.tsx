'use client';

import { useRef } from 'react';

interface CapsuleBarProps {
    topic: string;
    setTopic: (t: string) => void;
    onGenerate: () => void;
    onOpenSettings: () => void;
    isGenerating: boolean;
    activeKeywords: { id: string; keyword: string; category: string; }[];
    batchSize: number;
    setBatchSize: (n: number) => void;
}

export function CapsuleBar({ topic, setTopic, onGenerate, isGenerating, batchSize, setBatchSize }: CapsuleBarProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onGenerate();
        }
    };

    return (
        <div className="w-full flex flex-col gap-3 md:flex-row md:items-center">
            {/* Topic Input - Subtle, De-emphasized */}
            <div className="flex-1 flex items-center bg-white/5 border border-white/5 rounded-xl px-4 h-12 hover:border-white/10 transition-colors">
                <span className="text-gray-500 text-sm mr-3 whitespace-nowrap">Topic (optional):</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. digital nomad lifestyle..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
                    disabled={isGenerating}
                />
            </div>

            {/* Batch Size Selector - Stepper */}
            <div className="flex items-center bg-white/5 border border-white/5 rounded-xl px-2 h-12 gap-2 hover:border-white/10 transition-colors">
                <span className="text-gray-500 text-xs uppercase tracking-wider font-bold ml-2 mr-1">Batch</span>

                <div className="flex items-center bg-black/20 rounded-lg p-1">
                    <button
                        onClick={() => setBatchSize(Math.max(1, batchSize - 1))}
                        disabled={batchSize <= 1 || isGenerating}
                        className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                        -
                    </button>
                    <div className="w-8 text-center text-sm font-bold text-white font-mono">
                        {batchSize}
                    </div>
                    <button
                        onClick={() => setBatchSize(Math.max(1, batchSize + 1))} // Cap happens in parent or let it go higher
                        disabled={batchSize >= 10 || isGenerating}
                        className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Generate Button */}
            <button
                onClick={onGenerate}
                disabled={isGenerating}
                className={`
                    h-12 px-6 rounded-xl font-medium tracking-wide text-white transition-all duration-300
                    flex items-center justify-center gap-2 text-sm whitespace-nowrap
                    ${isGenerating
                        ? 'bg-white/5 cursor-not-allowed text-gray-500'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 shadow-lg active:scale-95'}
                `}
            >
                {isGenerating ? (
                    <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce delay-100" />
                        <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce delay-200" />
                    </div>
                ) : (
                    <>
                        <span>✨</span>
                        <span>Generate</span>
                    </>
                )}
            </button>
        </div>
    );
}
