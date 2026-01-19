'use client';

import { useState, useEffect } from 'react';
import { PlatformTabs } from '@/components/PlatformTabs';
import { CapsuleBar } from '@/components/CapsuleBar';
import { PlatformPill } from '@/components/PlatformPill';
import { SoulSlider } from '@/components/SoulSlider';
import { VariableSelector } from '@/components/VariableSelector';
import { ModelSelector } from '@/components/ModelSelector';
import { createClient } from '@/lib/supabase/client';
import { loadKeywordsFromCloud, type CloudKeyword } from '@/lib/library-sync';
import type { VariableSelections, GeneratedCaption, ModelType } from '@/types';

// Storage key for history
const STORAGE_KEY = 'dipark_history_v1';
const KEYWORDS_STORAGE_KEY = 'dipark_keywords_v1';
interface Keyword { id: string; keyword: string; category: string; }

export function CaptionGenerator() {
    const [topic, setTopic] = useState('');
    const [activeKeywords, setActiveKeywords] = useState<Keyword[]>([]);
    const [availableKeywords, setAvailableKeywords] = useState<Keyword[]>([]);

    const [model, setModel] = useState<ModelType>('gemini-2.0-flash-exp');
    const [variables, setVariables] = useState<VariableSelections>({});
    const [counts, setCounts] = useState({ tiktok: 1, instagram: 1, xiaohongshu: 1 });
    const [creativity, setCreativity] = useState(70);
    const [toneIntensity, setToneIntensity] = useState(3);
    const [isManualMode, setIsManualMode] = useState(false);
    const [randomKeywordCount, setRandomKeywordCount] = useState(5);

    const [isGenerating, setIsGenerating] = useState(false);
    const [results, setResults] = useState<{ tiktok: GeneratedCaption[]; instagram: GeneratedCaption[]; xiaohongshu: GeneratedCaption[]; }>({ tiktok: [], instagram: [], xiaohongshu: [] });
    const [error, setError] = useState<string | null>(null);

    // Flag to prevent saving before initial load completes
    const [isInitialized, setIsInitialized] = useState(false);

    const STORAGE_STATE_KEY = 'dipark_state_v1';

    const supabase = createClient();

    useEffect(() => {
        const loadData = async () => {
            // Load history
            const savedHistory = localStorage.getItem(STORAGE_KEY);
            if (savedHistory) try { setResults(JSON.parse(savedHistory)); } catch (e) { }

            // Load keywords from cloud with localStorage fallback
            try {
                const cloudKeywords = await loadKeywordsFromCloud();
                if (cloudKeywords.length > 0) {
                    setAvailableKeywords(cloudKeywords);
                    localStorage.setItem(KEYWORDS_STORAGE_KEY, JSON.stringify(cloudKeywords));
                } else {
                    const savedKeywords = localStorage.getItem(KEYWORDS_STORAGE_KEY);
                    if (savedKeywords) try { setAvailableKeywords(JSON.parse(savedKeywords)); } catch (e) { }
                }
            } catch (e) {
                // Offline fallback
                const savedKeywords = localStorage.getItem(KEYWORDS_STORAGE_KEY);
                if (savedKeywords) try { setAvailableKeywords(JSON.parse(savedKeywords)); } catch (e) { }
            }

            // Load UI state
            const savedState = localStorage.getItem(STORAGE_STATE_KEY);
            if (savedState) {
                try {
                    const parsed = JSON.parse(savedState);
                    if (parsed.topic !== undefined) setTopic(parsed.topic);
                    if (parsed.model !== undefined) setModel(parsed.model);
                    if (parsed.variables !== undefined) setVariables(parsed.variables);
                    if (parsed.counts !== undefined) setCounts(parsed.counts);
                } catch (e) { }
            }

            // Mark initialization complete
            setIsInitialized(true);
        };
        loadData();
    }, []);

    useEffect(() => {
        if (results.tiktok.length > 0 || results.instagram.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    }, [results]);

    useEffect(() => {
        // Only save state after initialization is complete to avoid overwriting saved state
        if (!isInitialized) return;

        const stateToSave = { topic, model, variables, counts };
        localStorage.setItem(STORAGE_STATE_KEY, JSON.stringify(stateToSave));
    }, [topic, model, variables, counts, isInitialized]);

    const handleReset = () => {
        setTopic('');
        setVariables({});
        setCounts({ tiktok: 1, instagram: 1, xiaohongshu: 1 });
        setResults({ tiktok: [], instagram: [], xiaohongshu: [] });
        setActiveKeywords([]);
        setError(null);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_STATE_KEY);
    };

    // Save to cloud history
    const saveToCloud = async (captions: GeneratedCaption[]) => {
        const records = captions.map(c => ({
            topic: topic || null,
            platform: c.platform,
            caption: c.caption,
            tags: c.tags,
            keywords_used: c.keywordsUsed,
            variables_used: c.variablesUsed
        }));

        if (records.length > 0) {
            await supabase.from('generation_history').insert(records);
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true); setError(null);
        try {
            const response = await fetch('/api/generate', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: topic || undefined,
                    variables, counts,
                    model,
                    temperature: creativity / 100, intensity: toneIntensity,
                    keywordCount: randomKeywordCount,
                    availableKeywords: !isManualMode ? availableKeywords.map(k => k.keyword) : undefined,
                    specificKeywords: isManualMode && activeKeywords.length > 0 ? activeKeywords.map(k => k.keyword) : undefined
                }),
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.error || 'Generation failed');
            setResults(data.data);

            // Save all generated captions to cloud
            const allCaptions = [...data.data.tiktok, ...data.data.instagram, ...data.data.xiaohongshu];
            await saveToCloud(allCaptions);

            setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch (err) { setError(err instanceof Error ? err.message : '生成失败'); }
        finally { setIsGenerating(false); }
    };

    return (
        <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">

            {/* Panel Container (Glass Card) */}
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative">

                {/* 1. The Capsule Input */}
                <div className="mb-10 relative z-20">
                    <CapsuleBar
                        topic={topic} setTopic={setTopic}
                        onGenerate={handleGenerate}
                        onOpenSettings={() => { }}
                        isGenerating={isGenerating}
                        activeKeywords={[]}
                    />
                </div>

                {/* 2. Controls Grid */}
                <div className="flex flex-col gap-6">

                    {/* Row A: Quantity Pills */}
                    <div>
                        <h3 className="text-xs uppercase tracking-widest text-white/30 font-bold mb-4">Generate For</h3>
                        <div className="flex flex-wrap gap-4">
                            <PlatformPill id="tiktok" label="TikTok" icon="🎵" color="cyan" count={counts.tiktok} onChange={(v) => setCounts({ ...counts, tiktok: v })} />
                            <PlatformPill id="instagram" label="Instagram" icon="📸" color="purple" count={counts.instagram} onChange={(v) => setCounts({ ...counts, instagram: v })} />
                            <PlatformPill id="xiaohongshu" label="RedBook" icon="📕" color="red" count={counts.xiaohongshu} onChange={(v) => setCounts({ ...counts, xiaohongshu: v })} />
                        </div>
                    </div>

                    {/* Row B: Keyword Strategy */}
                    <div>
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs uppercase tracking-widest text-white/30 font-bold">Keyword Strategy</h3>
                            {/* Toggle Switch */}
                            <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5">
                                <button
                                    onClick={() => {
                                        setIsManualMode(false);
                                        setActiveKeywords([]);
                                    }}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${!isManualMode ? 'bg-indigo-500/20 text-indigo-200' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    🎲 AI Random
                                </button>
                                <button
                                    onClick={() => {
                                        setIsManualMode(true);
                                    }}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${isManualMode ? 'bg-cyan-500/20 text-cyan-200' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    🎯 Manual Pick
                                </button>
                            </div>
                        </div>

                        {/* Random Amount - Subtle inline */}
                        {!isManualMode && (
                            <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 animate-fade-in">
                                <span>Random pool size:</span>
                                <input
                                    type="range"
                                    min="1" max="10"
                                    value={randomKeywordCount}
                                    onChange={(e) => setRandomKeywordCount(parseInt(e.target.value))}
                                    className="w-24 accent-indigo-400 h-0.5 bg-white/10 rounded-full appearance-none cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                                />
                                <span className="font-mono text-gray-400">{randomKeywordCount}</span>
                            </div>
                        )}

                        {/* Keyword Cloud - Manual Mode */}
                        {isManualMode && (
                            <div className="mt-3 animate-fade-in">
                                {availableKeywords.length === 0 ? (
                                    <div className="text-sm text-gray-500 italic p-4 text-center border border-white/5 rounded-xl bg-white/5">
                                        No keywords found. <a href="/keywords" className="text-cyan-400 hover:underline">Add some here</a>.
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {availableKeywords.map(kw => {
                                            const isActive = activeKeywords.some(k => k.id === kw.id);
                                            return (
                                                <button
                                                    key={kw.id}
                                                    onClick={() => {
                                                        if (isActive) {
                                                            setActiveKeywords(activeKeywords.filter(k => k.id !== kw.id));
                                                        } else {
                                                            setActiveKeywords([...activeKeywords, kw]);
                                                        }
                                                    }}
                                                    className={`px-3 py-1.5 rounded-full text-xs transition-all duration-200 border
                                                        ${isActive
                                                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-100'
                                                            : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                                >
                                                    {kw.keyword}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                                <div className="mt-2 text-[10px] text-right text-white/30">Selected: {activeKeywords.length}</div>
                            </div>
                        )}
                    </div>

                    {/* Row C: Variables & Sliders */}
                    <div className="grid md:grid-cols-2 gap-10 border-t border-white/5 pt-4">
                        {/* B1. Tune */}
                        <div className="space-y-6">
                            <h3 className="text-xs uppercase tracking-widest text-white/30 font-bold">Fine Tune</h3>

                            <div className="mb-4">
                                <label className="text-xs text-white/40 mb-2 block">Model Intelligence</label>
                                <ModelSelector value={model} onChange={setModel} />
                            </div>

                            <SoulSlider label="Creativity" value={creativity} min={0} max={100} onChange={setCreativity} formatValue={v => `${v}%`} />
                            <SoulSlider label="Intensity" value={toneIntensity} min={1} max={5} onChange={setToneIntensity} />
                        </div>

                        {/* B2. Advanced Chips */}
                        <div className="flex flex-col h-full">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs uppercase tracking-widest text-white/30 font-bold mb-0">Advanced Context</h3>
                                <button
                                    onClick={handleReset}
                                    className="text-[10px] text-white/20 hover:text-red-400 transition-colors uppercase tracking-widest font-bold flex items-center gap-1 group"
                                >
                                    <span className="group-hover:rotate-180 transition-transform duration-500">🔄</span>
                                    Reset All
                                </button>
                            </div>
                            <VariableSelector value={variables} onChange={setVariables} />
                        </div>
                    </div>
                </div>

                {/* Decorative Background Blob inside Panel */}
                <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />
            </div>

            {error && <div className="text-center text-red-300 bg-red-500/10 p-4 rounded-xl border border-red-500/20">⚠️ {error}</div>}

            {(results.tiktok.length > 0 || results.instagram.length > 0 || results.xiaohongshu.length > 0) && (
                <div id="results-section" className="animate-fade-in pb-20 pt-4">
                    <PlatformTabs results={results} />
                </div>
            )}
        </div>
    );
}
