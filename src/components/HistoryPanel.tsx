'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { GeneratedCaption } from '@/types';
import type { User } from '@supabase/supabase-js';

interface HistoryItem {
    id: string;
    created_at: string;
    topic: string | null;
    platform: 'tiktok' | 'instagram' | 'xiaohongshu';
    caption: string;
    tags: string[];
    keywords_used: string[];
    variables_used: Record<string, string>;
    model?: string;
    creativity?: number;
    intensity?: number;
    keyword_count?: number;
}

export function HistoryPanel() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [user, setUser] = useState<User | null>(null);
    const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
    const supabase = createClient();

    // Fetch history on mount
    useEffect(() => {
        checkUser();
        fetchHistory();

        // Listen for updates from CaptionGenerator
        const handleUpdate = () => {
            console.log('Refreshing history...');
            fetchHistory();
        };
        window.addEventListener('history-updated', handleUpdate);
        return () => window.removeEventListener('history-updated', handleUpdate);
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };

    const fetchHistory = async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setHistory([]);
            setIsLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from('generation_history')
            .select('*')
            .eq('user_id', user.id) // Filter by user_id
            .order('created_at', { ascending: false })
            .limit(100);

        if (!error && data) {
            setHistory(data as HistoryItem[]);
        }
        setIsLoading(false);
    };

    const deleteItem = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening modal
        if (!confirm('Are you sure you want to delete this item?')) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('generation_history')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id); // Ensure user owns the item

        if (!error) {
            setHistory(history.filter(h => h.id !== id));
            if (selectedItem?.id === id) setSelectedItem(null);
        }
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const platformIcon = {
        tiktok: '🎵',
        instagram: '📸',
        xiaohongshu: '📕'
    };

    const filteredHistory = history.filter(item => {
        if (filter !== 'all' && item.platform !== filter) return false;
        if (searchQuery && !item.caption.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-white">Generation History</h2>
                    {user && <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">{user.email}</span>}
                </div>
                <button onClick={fetchHistory} className="text-xs text-gray-500 hover:text-white transition-colors">
                    🔄 Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <input
                    type="text"
                    placeholder="Search captions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 min-w-[200px] bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-white/20"
                />
                <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5">
                    {['all', 'tiktok', 'instagram', 'xiaohongshu'].map(p => (
                        <button
                            key={p}
                            onClick={() => setFilter(p)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filter === p ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            {p === 'all' ? '📋 All' : `${platformIcon[p as keyof typeof platformIcon]} ${p.charAt(0).toUpperCase() + p.slice(1)}`}
                        </button>
                    ))}
                </div>
            </div>

            {/* History List */}
            {isLoading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : filteredHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500 italic">
                    {history.length === 0 ? 'No generation history yet.' : 'No results match your filter.'}
                </div>
            ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {filteredHistory.map(item => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all cursor-pointer group relative"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg">{platformIcon[item.platform]}</span>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">{item.platform}</span>
                                        <span className="text-[10px] text-gray-600">• {formatTime(item.created_at)}</span>
                                    </div>
                                    <p className="text-sm text-gray-300 line-clamp-2 group-hover:text-white transition-colors">{item.caption}</p>
                                    {item.tags && item.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {item.tags.slice(0, 5).map((tag, i) => (
                                                <span key={i} className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">{tag}</span>
                                            ))}
                                            {item.tags.length > 5 && <span className="text-[10px] text-gray-500">+{item.tags.length - 5}</span>}
                                        </div>
                                    )}

                                    {/* Metadata Footer */}
                                    {(item.model || item.creativity !== undefined) && (
                                        <div className="flex flex-wrap gap-3 mt-2 pt-2 border-t border-white/5 text-[10px] text-gray-500 font-mono">
                                            {item.model && (
                                                <div className="flex items-center gap-1" title="AI Model">
                                                    <span>🤖</span> {item.model.split('-')[1] || item.model}
                                                </div>
                                            )}
                                            {item.creativity !== undefined && (
                                                <div className="flex items-center gap-1" title="Creativity">
                                                    <span>🎨</span> {item.creativity}%
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => deleteItem(item.id, e)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400/50 hover:text-red-400 text-xs p-1 absolute top-2 right-2"
                                    title="Delete"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedItem(null)}>
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{platformIcon[selectedItem.platform]}</span>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Content Details</h3>
                                    <p className="text-xs text-gray-500">{formatTime(selectedItem.created_at)} • {selectedItem.model}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedItem(null)} className="text-gray-500 hover:text-white transition-colors text-xl">
                                ×
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            {/* Copy Button */}
                            <div className="flex justify-end mb-2">
                                <button
                                    onClick={() => navigator.clipboard.writeText(selectedItem.caption)}
                                    className="text-xs flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    📋 Copy Text
                                </button>
                            </div>

                            <div className="bg-black/30 p-4 rounded-xl border border-white/5 mb-6">
                                <p className="text-gray-200 whitespace-pre-wrap leading-relaxed text-base">{selectedItem.caption}</p>
                            </div>

                            <h4 className="text-sm font-medium text-gray-400 mb-3">Tags</h4>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {selectedItem.tags.map((tag, i) => (
                                    <span key={i} className="text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full">{tag}</span>
                                ))}
                            </div>

                            <h4 className="text-sm font-medium text-gray-400 mb-3">Generation Context</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                    <span className="text-[10px] text-gray-500 block mb-1">Creativity</span>
                                    <span className="text-sm text-white">{selectedItem.creativity}%</span>
                                </div>
                                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                    <span className="text-[10px] text-gray-500 block mb-1">Intensity</span>
                                    <span className="text-sm text-white">{selectedItem.intensity}/5</span>
                                </div>
                                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                    <span className="text-[10px] text-gray-500 block mb-1">Keywords</span>
                                    <span className="text-sm text-white">{selectedItem.keywords_used?.length || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
