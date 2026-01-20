'use client';

import { useState, useEffect } from 'react';
import { PRESETS, type PresetKey, type PresetOption } from '@/lib/presets';
import { Sparkles, Target, Layout, Send, Plus, Trash2, Save, Undo, AlertCircle, Briefcase, Megaphone, Loader2, Cloud, CloudOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    loadVariableConfigFromCloud,
    saveVariableConfigToCloud,
    type CloudVariableConfig
} from '@/lib/library-sync';

// Icons mapping for categories
const CATEGORY_ICONS = {
    // Style & Tone
    tone: '🎭', writingStyle: '✍️', perspective: '👁️', emotionalAppeal: '❤️', paces: '⚡', valueProposition: '💎',
    // Hook Strategy
    hookType: '🪝', openingTemplate: '🚪',
    // Content Angle
    contentFramework: '📝', targetAudience: '👥',
    // Platform Format
    captionLength: '📏', emojiStyle: '😎', paragraphStructure: '📑',
    // CTA
    ctaTone: '📢',
    // Timing
    timeliness: '⏰', trendElements: '🔥'
};

// Groups definition (same as VariableSelector)
const GROUPS = [
    {
        title: "Style & Tone",
        icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" />,
        keys: ['tone', 'writingStyle', 'perspective', 'emotionalAppeal', 'paces', 'valueProposition']
    },
    {
        title: "Hook Strategy",
        icon: <Target className="w-3.5 h-3.5 text-red-400" />,
        keys: ['hookType', 'openingTemplate']
    },
    {
        title: "Content Angle",
        icon: <Briefcase className="w-3.5 h-3.5 text-cyan-400" />,
        keys: ['contentFramework', 'targetAudience']
    },
    {
        title: "Platform & Format",
        icon: <Layout className="w-3.5 h-3.5 text-pink-400" />,
        keys: ['captionLength', 'emojiStyle', 'paragraphStructure']
    },
    {
        title: "Call to Action",
        icon: <Megaphone className="w-3.5 h-3.5 text-green-400" />,
        keys: ['ctaTone']
    },
    {
        title: "Timing & Trends",
        icon: <Send className="w-3.5 h-3.5 text-orange-400" />,
        keys: ['timeliness', 'trendElements']
    }
];

interface CustomConfig {
    [key: string]: {
        disabled: string[];
        custom: PresetOption[];
        deleted?: string[]; // New: Track deleted system presets
    }
}

export function VariableLibrary() {
    const [selectedKey, setSelectedKey] = useState<PresetKey>('tone');
    const [config, setConfig] = useState<CustomConfig>({});
    const [syncStatus, setSyncStatus] = useState<'synced' | 'offline' | 'syncing'>('synced');
    const [isLoading, setIsLoading] = useState(true);

    // New item state
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newItem, setNewItem] = useState<Partial<PresetOption>>({ value: '', label: '', labelEn: '' });
    const [smartInput, setSmartInput] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);

    // Load config from cloud, fallback to localStorage
    useEffect(() => {
        const loadConfig = async () => {
            setIsLoading(true);
            try {
                const cloudConfig = await loadVariableConfigFromCloud();
                if (cloudConfig) {
                    setConfig(cloudConfig as CustomConfig);
                    localStorage.setItem('dipark_variable_config', JSON.stringify(cloudConfig));
                    setSyncStatus('synced');
                } else {
                    // Fall back to localStorage
                    const saved = localStorage.getItem('dipark_variable_config');
                    if (saved) {
                        const localConfig = JSON.parse(saved);
                        setConfig(localConfig);
                        // Migrate to cloud
                        await saveVariableConfigToCloud(localConfig);
                        setSyncStatus('synced');
                    }
                }
            } catch (e) {
                console.error('Failed to load config from cloud:', e);
                setSyncStatus('offline');
                const saved = localStorage.getItem('dipark_variable_config');
                if (saved) {
                    try {
                        setConfig(JSON.parse(saved));
                    } catch (e) {
                        console.error('Failed to parse variable config', e);
                    }
                }
            } finally {
                setIsLoading(false);
            }
        };
        loadConfig();
    }, []);

    // Save config to localStorage and cloud
    const saveConfig = async (newConfig: CustomConfig) => {
        setConfig(newConfig);
        localStorage.setItem('dipark_variable_config', JSON.stringify(newConfig));

        // Sync to cloud
        setSyncStatus('syncing');
        try {
            const success = await saveVariableConfigToCloud(newConfig as CloudVariableConfig);
            setSyncStatus(success ? 'synced' : 'offline');
        } catch (e) {
            console.error('Failed to sync config to cloud:', e);
            setSyncStatus('offline');
        }
    };

    const toggleOptionStatus = (key: PresetKey, value: string) => {
        const currentConfig = config[key] || { disabled: [], custom: [] };
        const isDisabled = currentConfig.disabled.includes(value);

        let newDisabled;
        if (isDisabled) {
            newDisabled = currentConfig.disabled.filter(v => v !== value);
        } else {
            newDisabled = [...currentConfig.disabled, value];
        }

        saveConfig({
            ...config,
            [key]: { ...currentConfig, disabled: newDisabled }
        });
    };

    const handleSmartTranslate = async () => {
        if (!smartInput.trim()) return;

        setIsTranslating(true);
        try {
            const res = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: smartInput })
            });

            if (res.ok) {
                const data = await res.json();
                setNewItem({
                    value: data.key,
                    label: data.cn,
                    labelEn: data.en
                });
            }
        } catch (error) {
            console.error('Translation failed', error);
        } finally {
            setIsTranslating(false);
        }
    };

    // Auto-translate debounce
    useEffect(() => {
        const handler = setTimeout(() => {
            if (smartInput.length > 1) {
                handleSmartTranslate();
            }
        }, 800);

        return () => clearTimeout(handler);
    }, [smartInput]);


    const handleAddCustom = () => {
        if (!newItem.label || !newItem.value) return;

        const currentConfig = config[selectedKey] || { disabled: [], custom: [] };
        const newOption: PresetOption = {
            value: newItem.value || smartInput.toLowerCase().replace(/\s+/g, '_'),
            label: newItem.label || smartInput,
            labelEn: newItem.labelEn || smartInput,
            isCustom: true
        };

        // De-duplicate check
        if (currentConfig.custom.some(o => o.value === newOption.value)) {
            alert('This ID already exists!');
            return;
        }

        saveConfig({
            ...config,
            [selectedKey]: {
                ...currentConfig,
                custom: [...currentConfig.custom, newOption]
            }
        });

        setIsAddingNew(false);
        setNewItem({ value: '', label: '', labelEn: '' });
        setSmartInput('');
    };

    const handleDelete = (key: PresetKey, value: string, isCustom: boolean) => {
        if (!confirm('Are you sure you want to delete this option?')) return;

        const currentConfig = config[key] || { disabled: [], custom: [], deleted: [] };

        if (isCustom) {
            // Permanently remove custom option
            saveConfig({
                ...config,
                [key]: {
                    ...currentConfig,
                    custom: currentConfig.custom?.filter(opt => opt.value !== value) || []
                }
            });
        } else {
            // "Soft delete" system option by adding to deleted list
            saveConfig({
                ...config,
                [key]: {
                    ...currentConfig,
                    deleted: [...(currentConfig.deleted || []), value]
                }
            });
        }
    };

    const currentPreset = PRESETS[selectedKey];
    const currentConfig = config[selectedKey] || { disabled: [], custom: [] };

    // Merge options: System presets + Custom options
    const allOptions = [
        ...currentPreset.options.map(opt => ({ ...opt, isCustom: false })),
        ...(currentConfig.custom || [])
    ].filter(opt => !(currentConfig.deleted || []).includes(opt.value));

    return (
        <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-200px)]">

            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar md:border-r border-white/5 pb-10">
                {GROUPS.map((group, idx) => (
                    <div key={idx} className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 px-3 py-1">
                            {group.icon}
                            <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">
                                {group.title.split(' ')[0]} {/* Show short title */}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            {group.keys.map(key => {
                                const pKey = key as PresetKey;
                                const isActive = selectedKey === pKey;
                                const icon = CATEGORY_ICONS[pKey as keyof typeof CATEGORY_ICONS] || '•';

                                return (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            setSelectedKey(pKey);
                                            setIsAddingNew(false);
                                            setSmartInput('');
                                        }}
                                        className={`
                                            text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center gap-3
                                            ${isActive
                                                ? 'bg-purple-500/10 text-white border border-purple-500/20 shadow-[0_0_15px_-3px_rgba(139,92,246,0.3)]'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}
                                        `}
                                    >
                                        <span className="opacity-70">{icon}</span>
                                        {PRESETS[pKey].labelEn}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Editor Panel */}
            <div className="flex-1 bg-[#131120]/50 border border-white/5 rounded-2xl p-6 md:p-8 overflow-y-auto custom-scrollbar relative">

                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{CATEGORY_ICONS[selectedKey as keyof typeof CATEGORY_ICONS]}</span>
                            <h2 className="text-xl font-bold text-white">{currentPreset.label}</h2>
                        </div>
                        <p className="text-xs text-gray-500 pl-1">
                            Manage options for this category.
                        </p>
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

                        <button
                            onClick={() => setIsAddingNew(true)}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-medium transition-all shadow-lg shadow-indigo-500/20"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add New
                        </button>
                    </div>
                </div>

                {/* Adding New Panel (Simplified with AI) */}
                <AnimatePresence>
                    {isAddingNew && (
                        <motion.div
                            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
                            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col gap-6 relative">
                                <div className="flex justify-between items-center text-xs text-gray-400 uppercase tracking-wider font-bold">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 text-yellow-400" />
                                        <span>AI Smart Add</span>
                                    </div>
                                    <button onClick={() => setIsAddingNew(false)}><Undo className="w-3 h-3 hover:text-white" /></button>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Type anything (e.g. 'Cyberpunk')..."
                                            value={smartInput}
                                            onChange={e => setSmartInput(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner"
                                            autoFocus
                                        />
                                        {isTranslating && (
                                            <div className="absolute right-4 top-3.5">
                                                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                                            </div>
                                        )}
                                    </div>

                                    {/* AI Preview Result */}
                                    <AnimatePresence>
                                        {(newItem.label || newItem.labelEn) && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white/5 rounded-lg p-4 border border-white/5"
                                            >
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[10px] text-gray-500 uppercase">Label</label>
                                                    <input
                                                        value={newItem.label || ''}
                                                        onChange={e => setNewItem({ ...newItem, label: e.target.value })}
                                                        className="bg-transparent border-b border-white/10 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[10px] text-gray-500 uppercase">EN Label</label>
                                                    <input
                                                        value={newItem.labelEn || ''}
                                                        onChange={e => setNewItem({ ...newItem, labelEn: e.target.value })}
                                                        className="bg-transparent border-b border-white/10 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1 opacity-60">
                                                    <label className="text-[10px] text-gray-500 uppercase">ID Key</label>
                                                    <input
                                                        value={newItem.value || ''}
                                                        onChange={e => setNewItem({ ...newItem, value: e.target.value })}
                                                        className="bg-transparent border-b border-white/10 py-1 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                                    <button
                                        onClick={() => setIsAddingNew(false)}
                                        className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddCustom}
                                        disabled={!newItem.value || !newItem.label}
                                        className="bg-white text-black hover:bg-gray-200 px-6 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/10"
                                    >
                                        Confirm Add
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {allOptions.map((opt, idx) => {
                        const isDisabled = currentConfig.disabled.includes(opt.value);

                        return (
                            <div
                                key={opt.value + idx}
                                className={`
                                    relative group p-4 rounded-xl border transition-all duration-300 flex items-center justify-between
                                    ${isDisabled
                                        ? 'bg-red-500/5 border-red-500/10 opacity-60 grayscale'
                                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/8'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        onClick={() => toggleOptionStatus(selectedKey, opt.value)}
                                        className={`
                                            w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors
                                            ${isDisabled ? 'border-red-500/50 bg-transparent' : 'bg-green-500 border-green-500'}
                                        `}
                                    >
                                        {!isDisabled && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                                    </div>

                                    <div className="flex flex-col">
                                        <span className={`text-sm font-medium ${isDisabled ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                                            {opt.label}
                                        </span>
                                        {opt.labelEn !== opt.label && (
                                            <span className="text-[10px] text-gray-500">
                                                {opt.labelEn}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {
                                    <button
                                        onClick={() => handleDelete(selectedKey, opt.value, !!opt.isCustom)}
                                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-all absolute right-2 top-1/2 -translate-y-1/2"
                                        title={opt.isCustom ? "Delete Custom Option" : "Remove System Preset"}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                }
                            </div>
                        );
                    })}
                </div>

                {allOptions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                        <AlertCircle className="w-8 h-8 mb-3" />
                        <p className="text-sm">No active options available.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
