'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Loader2, Sparkles, Undo, Cloud, CloudOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    loadKeywordsFromCloud,
    saveKeywordToCloud,
    deleteKeywordFromCloud,
    type CloudKeyword
} from '@/lib/library-sync';

const KEYWORDS_STORAGE_KEY = 'dipark_keywords_v1';

// Keyword categories
const CATEGORIES = [
    { value: 'general', label: 'General', labelEn: 'General', icon: '📌' },
    { value: 'product', label: 'Product', labelEn: 'Product', icon: '🛍️' },
    { value: 'emotion', label: 'Emotion', labelEn: 'Emotion', icon: '❤️' },
    { value: 'action', label: 'Action', labelEn: 'Action', icon: '🚀' },
    { value: 'trend', label: 'Trend', labelEn: 'Trend', icon: '🔥' },
    { value: 'location', label: 'Location', labelEn: 'Location', icon: '📍' },
];

export function KeywordLibrary() {
    const [keywords, setKeywords] = useState<CloudKeyword[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState<'synced' | 'offline' | 'syncing'>('synced');

    // New keyword state
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newKeyword, setNewKeyword] = useState('');
    const [newCategory, setNewCategory] = useState('general');
    const [isTranslating, setIsTranslating] = useState(false);
    const [translatedEn, setTranslatedEn] = useState('');

    // Filter state
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Load keywords on mount
    useEffect(() => {
        loadKeywords();
    }, []);

    const loadKeywords = async () => {
        setIsLoading(true);
        try {
            // Try cloud first
            const cloudKeywords = await loadKeywordsFromCloud();
            if (cloudKeywords.length > 0) {
                setKeywords(cloudKeywords);
                localStorage.setItem(KEYWORDS_STORAGE_KEY, JSON.stringify(cloudKeywords));
                setSyncStatus('synced');
            } else {
                // Fall back to localStorage
                const saved = localStorage.getItem(KEYWORDS_STORAGE_KEY);
                if (saved) {
                    const localKeywords = JSON.parse(saved);
                    setKeywords(localKeywords);
                    // Migrate to cloud
                    for (const kw of localKeywords) {
                        if (!kw.id?.startsWith('local_')) continue;
                        await saveKeywordToCloud(kw);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load keywords:', error);
            // Offline mode
            setSyncStatus('offline');
            const saved = localStorage.getItem(KEYWORDS_STORAGE_KEY);
            if (saved) setKeywords(JSON.parse(saved));
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-translate
    useEffect(() => {
        if (!newKeyword.trim()) {
            setTranslatedEn('');
            return;
        }

        const handler = setTimeout(async () => {
            setIsTranslating(true);
            try {
                const res = await fetch('/api/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: newKeyword })
                });
                if (res.ok) {
                    const data = await res.json();
                    setTranslatedEn(data.en || newKeyword);
                }
            } catch (error) {
                console.error('Translation failed:', error);
            } finally {
                setIsTranslating(false);
            }
        }, 600);

        return () => clearTimeout(handler);
    }, [newKeyword]);

    const handleAddKeyword = async () => {
        if (!newKeyword.trim()) return;

        setIsSyncing(true);
        setSyncStatus('syncing');

        const keywordData = {
            keyword: newKeyword.trim(),
            category: newCategory,
            labelEn: translatedEn || newKeyword.trim()
        };

        try {
            const saved = await saveKeywordToCloud(keywordData);
            if (saved) {
                const updatedKeywords = [...keywords, saved];
                setKeywords(updatedKeywords);
                localStorage.setItem(KEYWORDS_STORAGE_KEY, JSON.stringify(updatedKeywords));
                setSyncStatus('synced');
            } else {
                // Save locally with temp ID
                const localKeyword = {
                    ...keywordData,
                    id: 'local_' + Date.now()
                };
                const updatedKeywords = [...keywords, localKeyword];
                setKeywords(updatedKeywords);
                localStorage.setItem(KEYWORDS_STORAGE_KEY, JSON.stringify(updatedKeywords));
                setSyncStatus('offline');
            }
        } catch (error) {
            console.error('Failed to save keyword:', error);
            setSyncStatus('offline');
        } finally {
            setIsSyncing(false);
            setIsAddingNew(false);
            setNewKeyword('');
            setNewCategory('general');
            setTranslatedEn('');
        }
    };

    const handleDeleteKeyword = async (id: string) => {
        if (!confirm('Are you sure you want to delete this keyword?')) return;

        setIsSyncing(true);
        setSyncStatus('syncing');

        try {
            const success = await deleteKeywordFromCloud(id);
            if (success || id.startsWith('local_')) {
                const updatedKeywords = keywords.filter(k => k.id !== id);
                setKeywords(updatedKeywords);
                localStorage.setItem(KEYWORDS_STORAGE_KEY, JSON.stringify(updatedKeywords));
                setSyncStatus('synced');
            }
        } catch (error) {
            console.error('Failed to delete keyword:', error);
            setSyncStatus('offline');
        } finally {
            setIsSyncing(false);
        }
    };

    // Filter keywords by category
    const filteredKeywords = selectedCategory
        ? keywords.filter(k => k.category === selectedCategory)
        : keywords;

    // Group keywords by category for display
    const groupedKeywords = CATEGORIES.map(cat => ({
        ...cat,
        keywords: keywords.filter(k => k.category === cat.value)
    }));

    return (
        <div className="flex flex-col gap-6">
            {/* Header with Sync Status */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white">🔑 Keywords</h2>
                    <span className="text-xs text-gray-500">({keywords.length} total)</span>
                </div>

                <div className="flex items-center gap-3">
                    {/* Sync Status */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs ${syncStatus === 'synced' ? 'bg-green-500/10 text-green-400' :
                        syncStatus === 'syncing' ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-red-500/10 text-red-400'
                        }`}>
                        {syncStatus === 'synced' && <Cloud className="w-3.5 h-3.5" />}
                        {syncStatus === 'syncing' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {syncStatus === 'offline' && <CloudOff className="w-3.5 h-3.5" />}
                        <span>{syncStatus === 'synced' ? 'Synced' : syncStatus === 'syncing' ? 'Syncing...' : 'Offline'}</span>
                    </div>

                    {/* Add Button */}
                    <button
                        onClick={() => setIsAddingNew(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-medium transition-all shadow-lg shadow-indigo-500/20"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Keyword
                    </button>
                </div>
            </div>

            {/* Add New Panel */}
            <AnimatePresence>
                {isAddingNew && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider font-bold">
                                    <Sparkles className="w-3 h-3 text-yellow-400" />
                                    <span>Add New Keyword</span>
                                </div>
                                <button onClick={() => setIsAddingNew(false)}>
                                    <Undo className="w-4 h-4 text-gray-400 hover:text-white" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Keyword Input */}
                                <div className="md:col-span-2 relative">
                                    <input
                                        type="text"
                                        placeholder="Enter keyword..."
                                        value={newKeyword}
                                        onChange={e => setNewKeyword(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                                        autoFocus
                                    />
                                    {isTranslating && (
                                        <div className="absolute right-4 top-3.5">
                                            <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                                        </div>
                                    )}
                                    {translatedEn && !isTranslating && (
                                        <div className="absolute right-4 top-3 text-xs text-gray-500">
                                            → {translatedEn}
                                        </div>
                                    )}
                                </div>

                                {/* Category Select */}
                                <select
                                    value={newCategory}
                                    onChange={e => setNewCategory(e.target.value)}
                                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.icon} {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setIsAddingNew(false)}
                                    className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:bg-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddKeyword}
                                    disabled={!newKeyword.trim() || isSyncing}
                                    className="bg-white text-black hover:bg-gray-200 px-6 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSyncing ? 'Saving...' : 'Add Keyword'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedCategory === null
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
                        }`}
                >
                    All ({keywords.length})
                </button>
                {CATEGORIES.map(cat => {
                    const count = keywords.filter(k => k.category === cat.value).length;
                    return (
                        <button
                            key={cat.value}
                            onClick={() => setSelectedCategory(cat.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedCategory === cat.value
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
                                }`}
                        >
                            {cat.icon} {cat.labelEn} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Keywords List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                </div>
            ) : filteredKeywords.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                    <div className="text-4xl mb-4">🔑</div>
                    <p className="text-sm">No keywords yet. Add some to get started!</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filteredKeywords.map(kw => {
                        const category = CATEGORIES.find(c => c.value === kw.category);
                        return (
                            <div
                                key={kw.id}
                                className="group relative bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-medium text-white">{kw.keyword}</span>
                                        {kw.labelEn && kw.labelEn !== kw.keyword && (
                                            <span className="text-[10px] text-gray-500">{kw.labelEn}</span>
                                        )}
                                    </div>
                                    <span className="text-xs opacity-60">{category?.icon}</span>
                                </div>

                                <button
                                    onClick={() => handleDeleteKeyword(kw.id)}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg text-red-400 transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
