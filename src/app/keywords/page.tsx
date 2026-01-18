'use client';

import { useState } from 'react';
import { Logo } from '@/components/Logo';
import { VariableLibrary } from '@/components/VariableLibrary';
import { KeywordLibrary } from '@/components/KeywordLibrary';
import { ArrowLeft, Key, Settings2 } from 'lucide-react';
import Link from 'next/link';

type TabType = 'keywords' | 'variables';

export default function KeywordsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('keywords');

    return (
        <div className="min-h-screen relative overflow-auto custom-scrollbar flex flex-col font-sans selection:bg-purple-500/30">

            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex-1 flex flex-col">

                {/* Header */}
                <header className="w-full py-6 flex justify-between items-center">
                    {/* Logo */}
                    <div className="scale-75 origin-left md:scale-90 transition-transform">
                        <Logo />
                    </div>

                    {/* Back Button */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-xs bg-white/5 border border-white/5 hover:bg-white/10 px-4 py-2 rounded-full text-indigo-100/60 hover:text-indigo-100 transition-all"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Generator</span>
                    </Link>
                </header>

                {/* Tab Navigation */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl w-fit border border-white/5">
                        <button
                            onClick={() => setActiveTab('keywords')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'keywords'
                                    ? 'bg-indigo-500/20 text-white border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Key className="w-4 h-4" />
                            <span>Keywords</span>
                            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded">SEO</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('variables')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'variables'
                                    ? 'bg-purple-500/20 text-white border border-purple-500/30 shadow-lg shadow-purple-500/10'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Settings2 className="w-4 h-4" />
                            <span>Variables</span>
                            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded">Style</span>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <main className="flex-1 pb-12">
                    {activeTab === 'keywords' ? (
                        <>
                            <div className="mb-8">
                                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                    🔑 Keyword Library
                                </h1>
                                <p className="text-sm text-gray-400">
                                    Manage SEO keywords to incorporate into your captions
                                </p>
                            </div>
                            <KeywordLibrary />
                        </>
                    ) : (
                        <>
                            <div className="mb-8">
                                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                    📚 Variable Library
                                </h1>
                                <p className="text-sm text-gray-400">
                                    Customize and manage all caption generation variables
                                </p>
                            </div>
                            <VariableLibrary />
                        </>
                    )}
                </main>

                <footer className="py-6 text-center text-[10px] text-white/10 font-mono uppercase tracking-widest">
                    © 2026 Digipark Inc.
                </footer>
            </div>
        </div>
    );
}
