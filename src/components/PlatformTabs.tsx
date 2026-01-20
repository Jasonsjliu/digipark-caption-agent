'use client';

import { GeneratedCaption } from "@/types";
import { useState } from 'react';
import { ResultCard } from './ResultCard';

interface PlatformTabsProps {
    results: {
        tiktok: GeneratedCaption[];
        instagram: GeneratedCaption[];
        xiaohongshu: GeneratedCaption[];
    };
}

export function PlatformTabs({ results }: PlatformTabsProps) {
    const [activeTab, setActiveTab] = useState<'tiktok' | 'instagram' | 'xiaohongshu'>('tiktok');

    const tabs = [
        { id: 'tiktok', label: 'TikTok', icon: '🎵', count: results.tiktok.length },
        { id: 'instagram', label: 'Instagram', icon: '📸', count: results.instagram.length },
        { id: 'xiaohongshu', label: 'Xiaohongshu', icon: '📕', count: results.xiaohongshu.length },
    ] as const;

    const currentResults = results[activeTab];

    if (results.tiktok.length === 0 && results.instagram.length === 0 && results.xiaohongshu.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <div className="text-4xl mb-4 opacity-20">✨</div>
                <p>Ready to generate your first viral caption</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex bg-black/20 p-1 rounded-xl backdrop-blur-sm border border-white/5 w-fit mx-auto md:mx-0">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2
                            ${activeTab === tab.id
                                ? 'bg-white/10 text-white shadow-lg backdrop-blur-md border border-white/10'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                        {tab.count > 0 && (
                            <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-white/5'}`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                {currentResults.map((result, idx) => (
                    <ResultCard key={`${activeTab}-${idx}`} result={result} index={idx} />
                ))}
                {currentResults.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-black/20 backdrop-blur-md border border-white/5 rounded-xl border-dashed">
                        No results for this platform
                    </div>
                )}
            </div>
        </div>
    );
}
