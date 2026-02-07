'use client';

interface BatchConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    config: {
        randomizeModels: boolean;
        randomizeCreativity: boolean;
        randomizeKeywords: boolean;
        randomizeVariables: boolean;
    };
    setConfig: (config: any) => void;
    batchSize: number;
}

export function BatchConfigModal({ isOpen, onClose, onConfirm, config, setConfig, batchSize }: BatchConfigModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl scale-in">
                <div className="text-center mb-6">
                    <div className="bg-indigo-500/10 text-indigo-300 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                        🎲
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Batch Randomization</h3>
                    <p className="text-sm text-gray-400">
                        You are generating <span className="text-white font-bold">{batchSize}</span> sets of captions.
                        Select which parameters should be randomized for each set.
                    </p>
                </div>

                <div className="space-y-3 mb-8">
                    <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <span className="text-lg">🤖</span>
                            <div>
                                <div className="text-sm font-medium text-white group-hover:text-indigo-200 transition-colors">AI Models</div>
                                <div className="text-[10px] text-gray-500">Rotate between Gemini, GPT, etc.</div>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={config.randomizeModels}
                            onChange={(e) => setConfig({ ...config, randomizeModels: e.target.checked })}
                            className="w-5 h-5 rounded border-gray-600 text-indigo-500 focus:ring-indigo-500 bg-white/10"
                        />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <span className="text-lg">🎨</span>
                            <div>
                                <div className="text-sm font-medium text-white group-hover:text-indigo-200 transition-colors">Creativity & Intensity</div>
                                <div className="text-[10px] text-gray-500">Vary temperature and tone intensity</div>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={config.randomizeCreativity}
                            onChange={(e) => setConfig({ ...config, randomizeCreativity: e.target.checked })}
                            className="w-5 h-5 rounded border-gray-600 text-indigo-500 focus:ring-indigo-500 bg-white/10"
                        />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <span className="text-lg">🎱</span>
                            <div>
                                <div className="text-sm font-medium text-white group-hover:text-indigo-200 transition-colors">Random Pool Size</div>
                                <div className="text-[10px] text-gray-500">Randomize keyword count (1-10)</div>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={config.randomizeKeywords}
                            onChange={(e) => setConfig({ ...config, randomizeKeywords: e.target.checked })}
                            className="w-5 h-5 rounded border-gray-600 text-indigo-500 focus:ring-indigo-500 bg-white/10"
                        />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <span className="text-lg">🧩</span>
                            <div>
                                <div className="text-sm font-medium text-white group-hover:text-indigo-200 transition-colors">Variables (Advanced Context)</div>
                                <div className="text-[10px] text-gray-500">Randomize all non-pinned variables</div>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={config.randomizeVariables}
                            onChange={(e) => setConfig({ ...config, randomizeVariables: e.target.checked })}
                            className="w-5 h-5 rounded border-gray-600 text-indigo-500 focus:ring-indigo-500 bg-white/10"
                        />
                    </label>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-white bg-indigo-500 hover:bg-indigo-400 rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
                    >
                        Generate Batch
                    </button>
                </div>
            </div>
        </div>
    );
}
