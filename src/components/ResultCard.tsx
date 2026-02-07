'use client';

import { GeneratedCaption } from '@/types';
import { useState } from 'react';
import { PRESETS, type PresetKey } from '@/lib/presets';

interface ResultCardProps {
    result: GeneratedCaption;
    index: number;
}

export function ResultCard({ result, index }: ResultCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            const tags = Array.isArray(result.tags) ? result.tags.join(' ') : '';
            const text = `${result.caption}\n\n${tags}`;

            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                // Fallback for non-secure contexts
                const textArea = document.createElement("textarea");
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                } catch (err) {
                    console.error('Fallback copy failed', err);
                }
                document.body.removeChild(textArea);
            }

            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    return (
        <div className="bg-black/20 backdrop-blur-md border border-white/5 rounded-xl p-5 flex flex-col gap-4 group relative overflow-hidden hover:bg-white/5 transition-all">
            <div className="flex justify-between items-start">
                <span className="text-xs font-mono text-white/40 bg-white/5 px-2 py-1 rounded">#{index + 1}</span>
                <button
                    onClick={handleCopy}
                    className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 border backdrop-blur-md transition-all
                        ${copied
                            ? 'bg-green-500/20 text-green-300 border-green-500/30'
                            : 'bg-white/10 text-gray-300 border-white/10 hover:bg-white/20'}`}
                >
                    {copied ? <><span>✓</span> Copied</> : <><span>📋</span> Copy</>}
                </button>
            </div>

            <div className="space-y-4">
                <p className="text-white/90 leading-relaxed whitespace-pre-wrap text-sm">{result.caption}</p>
                <div className="flex flex-wrap gap-1.5">
                    {result.tags.map((tag, i) => (
                        <span key={i} className="text-xs text-blue-300/80 bg-blue-500/10 px-2 py-0.5 rounded hover:bg-blue-500/20 transition-colors cursor-pointer">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Variables Used */}
                {result.variablesUsed && Object.keys(result.variablesUsed).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                        <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-2">Active Context</div>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(result.variablesUsed).map(([key, value]) => {
                                if (!value) return null;
                                const pKey = key as PresetKey;
                                const preset = PRESETS[pKey];
                                if (!preset) return null;

                                let displayValue = '';
                                if (Array.isArray(value)) {
                                    displayValue = `${value.length} items`;
                                } else {
                                    const option = preset.options.find(o => o.value === value);
                                    displayValue = option ? option.label : value;
                                }

                                return (
                                    <div key={key} className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] flex items-center gap-1.5" title={`${preset.label}: ${displayValue}`}>
                                        <span className="text-gray-500 font-medium">{preset.label}:</span>
                                        <span className="text-indigo-200">{displayValue}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Keywords Used */}
            {result.keywordsUsed && result.keywordsUsed.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-2">Keywords ({result.keywordsUsed.length})</div>
                    <div className="flex flex-wrap gap-1.5">
                        {result.keywordsUsed.map((keyword, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">
                                {keyword}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Metadata Footer */}
            {(result.model || result.creativity !== undefined) && (
                <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-white/5 text-[10px] text-gray-500 font-mono">
                    {result.model && (
                        <div className="flex items-center gap-1" title="AI Model">
                            <span>🤖</span> <span className="text-gray-300">{result.model}</span>
                        </div>
                    )}
                    {result.creativity !== undefined && (
                        <div className="flex items-center gap-1" title="Creativity (Temperature)">
                            <span>🎨</span> {result.creativity}%
                        </div>
                    )}
                    {result.intensity !== undefined && (
                        <div className="flex items-center gap-1" title="Intensity">
                            <span>⚡</span> {result.intensity}/5
                        </div>
                    )}
                </div>
            )}

            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-white/5 blur-3xl rounded-full pointer-events-none group-hover:bg-white/10 transition-colors duration-500" />
        </div>
    );
}
