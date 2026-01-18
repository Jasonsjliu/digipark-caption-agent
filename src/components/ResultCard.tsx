'use client';

import { GeneratedCaption } from '@/types';
import { useState } from 'react';

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
            </div>

            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-white/5 blur-3xl rounded-full pointer-events-none group-hover:bg-white/10 transition-colors duration-500" />
        </div>
    );
}
