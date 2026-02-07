
import { PRESETS, type PresetKey, type PresetOption } from '@/lib/presets';
import type { VariableSelections } from '@/types';
import { useState, useRef, useEffect } from 'react';
import { Sparkles, Target, Layout, Send, X, ChevronDown, Briefcase, Megaphone, Dices, EyeOff, Eye, Pin, PinOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VariableSelectorProps {
    value: VariableSelections;
    onChange: (value: VariableSelections) => void;
    onDisabledChange?: (disabled: Set<PresetKey>) => void;
    onPinnedChange?: (pinned: Set<PresetKey>) => void;
}

export function VariableSelector({ value, onChange, onDisabledChange, onPinnedChange }: VariableSelectorProps) {

    // Digipark-Native Groups
    // User-Defined Groups (English Only)
    const groups = [
        {
            title: "Style & Tone",
            icon: <Sparkles className="w-3 h-3 text-purple-400" />,
            items: [
                { key: 'tone', label: 'Tone', icon: '🎭' },
                { key: 'writingStyle', label: 'Style', icon: '✍️' },
                { key: 'perspective', label: 'POV', icon: '👁️' },
                { key: 'emotionalAppeal', label: 'Emotion', icon: '❤️' },
                { key: 'paces', label: 'Pace', icon: '⚡' },
                { key: 'valueProposition', label: 'Value', icon: '💎' },
            ]
        },
        {
            title: "Hook Strategy",
            icon: <Target className="w-3 h-3 text-red-400" />,
            items: [
                { key: 'hookType', label: 'Hook Type', icon: '🪝' },
                { key: 'openingTemplate', label: 'Opener', icon: '🚪' },
            ]
        },
        {
            title: "Content Angle",
            icon: <Briefcase className="w-3 h-3 text-cyan-400" />,
            items: [
                { key: 'contentFramework', label: 'Framework', icon: '📝' },
                { key: 'targetAudience', label: 'Audience', icon: '👥' },
            ]
        },
        {
            title: "Platform & Format",
            icon: <Layout className="w-3 h-3 text-pink-400" />,
            items: [
                { key: 'captionLength', label: 'Length', icon: '📏' },
                { key: 'emojiStyle', label: 'Emoji', icon: '😎' },
                { key: 'paragraphStructure', label: 'Structure', icon: '📑' },
            ]
        },
        {
            title: "Call to Action",
            icon: <Megaphone className="w-3 h-3 text-green-400" />,
            items: [
                { key: 'ctaTone', label: 'CTA Tone', icon: '📢' },
            ]
        },
        {
            title: "Timing & Trends",
            icon: <Send className="w-3 h-3 text-orange-400" />,
            items: [
                { key: 'timeliness', label: 'Time', icon: '⏰' },
                { key: 'trendElements', label: 'Trend', icon: '🔥' },
            ]
        }
    ];

    const [activeCategory, setActiveCategory] = useState<PresetKey | null>(null);
    const [config, setConfig] = useState<Record<string, { disabled: string[], custom: PresetOption[], deleted?: string[] }>>({});
    const [disabledDimensions, setDisabledDimensions] = useState<Set<PresetKey>>(new Set());
    const [pinnedDimensions, setPinnedDimensions] = useState<Set<PresetKey>>(new Set());
    const containerRef = useRef<HTMLDivElement>(null);

    const DISABLED_DIMS_KEY = 'dipark_disabled_dimensions_v1';
    const PINNED_DIMS_KEY = 'dipark_pinned_dimensions_v1';

    // Load custom config and disabled dimensions
    useEffect(() => {
        const saved = localStorage.getItem('dipark_variable_config');
        if (saved) {
            try {
                setConfig(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse variable config', e);
            }
        }

        // Load disabled dimensions
        const savedDisabled = localStorage.getItem(DISABLED_DIMS_KEY);
        if (savedDisabled) {
            try {
                const parsed = JSON.parse(savedDisabled);
                const set = new Set(parsed);
                setDisabledDimensions(set as Set<PresetKey>);
                onDisabledChange?.(set as Set<PresetKey>);
            } catch (e) {
                console.error('Failed to parse disabled dimensions', e);
            }
        }

        // Load pinned dimensions
        const savedPinned = localStorage.getItem(PINNED_DIMS_KEY);
        if (savedPinned) {
            try {
                const parsed = JSON.parse(savedPinned);
                const set = new Set(parsed);
                setPinnedDimensions(set as Set<PresetKey>);
                onPinnedChange?.(set as Set<PresetKey>);
            } catch (e) {
                console.error('Failed to parse pinned dimensions', e);
            }
        }
    }, [activeCategory]); // Reload when category changes to get updates

    // Toggle dimension disable
    const toggleDimensionDisable = (key: PresetKey, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening dropdown
        const newDisabled = new Set(disabledDimensions);
        if (newDisabled.has(key)) {
            newDisabled.delete(key);
        } else {
            newDisabled.add(key);
            // If disabling, also unpin
            if (pinnedDimensions.has(key)) {
                const newPinned = new Set(pinnedDimensions);
                newPinned.delete(key);
                setPinnedDimensions(newPinned);
                localStorage.setItem(PINNED_DIMS_KEY, JSON.stringify([...newPinned]));
                onPinnedChange?.(newPinned);
            }
        }
        setDisabledDimensions(newDisabled);
        localStorage.setItem(DISABLED_DIMS_KEY, JSON.stringify([...newDisabled]));
        onDisabledChange?.(newDisabled);
    };

    // Toggle dimension pin (preserve value during randomization)
    const toggleDimensionPin = (key: PresetKey, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening dropdown
        const newPinned = new Set(pinnedDimensions);
        if (newPinned.has(key)) {
            newPinned.delete(key);
        } else {
            newPinned.add(key);
        }
        setPinnedDimensions(newPinned);
        localStorage.setItem(PINNED_DIMS_KEY, JSON.stringify([...newPinned]));
        onPinnedChange?.(newPinned);
    };

    // Global Click Outside Handler
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (activeCategory && containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setActiveCategory(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [activeCategory]);

    const handleCustomSubmit = (key: PresetKey, val: string) => {
        if (!val.trim()) return;

        const currentVal = value[key];
        let newValue: string | string[];

        if (Array.isArray(currentVal)) {
            newValue = [...currentVal, val];
        } else if (currentVal) {
            newValue = [currentVal, val];
        } else {
            newValue = val;
        }

        onChange({ ...value, [key]: newValue });
    };

    const handleSelect = (key: PresetKey, val: string | undefined) => {
        if (val === undefined) {
            // Clear selection
            onChange({ ...value, [key]: undefined });
            return;
        }

        const currentVal = value[key];
        let newValue: string | string[] | undefined;

        if (Array.isArray(currentVal)) {
            if (currentVal.includes(val)) {
                newValue = currentVal.filter(v => v !== val);
                if (newValue.length === 0) newValue = undefined;
                else if (newValue.length === 1) newValue = newValue[0];
            } else {
                newValue = [...currentVal, val];
            }
        } else if (currentVal) {
            if (currentVal === val) {
                newValue = undefined;
            } else {
                newValue = [currentVal, val];
            }
        } else {
            newValue = val;
        }

        onChange({ ...value, [key]: newValue });
    };

    // Randomize all variables at once (skip disabled and pinned dimensions)
    const handleRandomizeAll = () => {
        const allKeys = Object.keys(PRESETS) as PresetKey[];
        const newSelections: VariableSelections = {};

        allKeys.forEach(key => {
            // Skip disabled dimensions
            if (disabledDimensions.has(key)) {
                // Keep existing selection if any
                if (value[key]) {
                    newSelections[key] = value[key];
                }
                return;
            }

            // Skip pinned dimensions - preserve their current value
            if (pinnedDimensions.has(key) && value[key]) {
                newSelections[key] = value[key];
                return;
            }

            const currentConfig = config[key] || { disabled: [], custom: [], deleted: [] };
            const baseOptions = PRESETS[key]?.options || [];
            const mergedOptions = [
                ...baseOptions.map(o => ({ ...o, isCustom: false })),
                ...(currentConfig.custom || [])
            ].filter(o => !currentConfig.disabled.includes(o.value) && !(currentConfig.deleted || []).includes(o.value));

            if (mergedOptions.length > 0) {
                const randomIndex = Math.floor(Math.random() * mergedOptions.length);
                newSelections[key] = mergedOptions[randomIndex].value;
            }
        });

        onChange(newSelections);
    };

    return (
        <div className="flex flex-col gap-8 w-full" ref={containerRef}>
            {/* Randomize All Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleRandomizeAll}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl text-xs text-indigo-200 hover:from-indigo-500/30 hover:to-purple-500/30 hover:border-indigo-400/50 transition-all duration-300 group"
                >
                    <Dices className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    Randomize All
                </button>
            </div>
            {groups.map((group, groupIdx) => (
                <div key={groupIdx} className="relative">
                    {/* Group Header */}
                    <div className="flex items-center gap-2 mb-3 px-1">
                        {group.icon}
                        <h4 className="text-[10px] uppercase tracking-widest font-bold text-white/40">{group.title}</h4>
                    </div>

                    {/* Chips & Inline Dropdown */}
                    <div className="flex flex-wrap gap-2">
                        {group.items.map((cat) => {
                            const pKey = cat.key as PresetKey;
                            const selectedVal = value[pKey];
                            const isDimensionDisabled = disabledDimensions.has(pKey);
                            const isPinned = pinnedDimensions.has(pKey);

                            let displayLabel = cat.label;

                            if (selectedVal) {
                                if (Array.isArray(selectedVal)) {
                                    displayLabel = `${cat.label}: ${selectedVal.length}`;
                                } else {
                                    const presetOption = PRESETS[pKey]?.options.find(o => o.value === selectedVal);
                                    if (presetOption) {
                                        // Use bilingual label from preset
                                        displayLabel = `${cat.label}: ${presetOption.label}`;
                                    } else {
                                        displayLabel = `${cat.label}: ${selectedVal}`;
                                    }
                                }
                            }

                            const isActive = activeCategory === pKey;
                            const hasSelection = !!selectedVal;

                            return (
                                <div key={pKey} className={`relative ${isActive ? 'w-full' : ''}`}>
                                    <div className="relative group/chip inline-block">
                                        <button
                                            onClick={() => !isDimensionDisabled && setActiveCategory(isActive ? null : pKey)}
                                            className={`
                                                h-9 pl-3 pr-3 rounded-xl text-xs font-medium border transition-all duration-300 flex items-center gap-2
                                                ${isDimensionDisabled
                                                    ? 'bg-gray-800/50 border-gray-700/50 text-gray-600 opacity-50 cursor-not-allowed'
                                                    : isPinned && hasSelection
                                                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-100 ring-1 ring-amber-500/30'
                                                        : isActive
                                                            ? 'bg-white/10 border-white/20 text-white ring-1 ring-white/20'
                                                            : hasSelection
                                                                ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-100'
                                                                : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10 hover:text-gray-200'}
                                            `}
                                        >
                                            {isPinned && hasSelection && <Pin className="w-3 h-3 text-amber-400" />}
                                            <span className={hasSelection && !isDimensionDisabled ? "" : "opacity-60"}>{cat.icon}</span>
                                            <span className={isDimensionDisabled ? 'line-through' : ''}>{displayLabel}</span>
                                            {!isDimensionDisabled && (isActive ? (
                                                <ChevronDown className="w-3 h-3 rotate-180 transition-transform" />
                                            ) : (
                                                <ChevronDown className="w-3 h-3 opacity-30" />
                                            ))}
                                        </button>

                                        {/* Pin Toggle Button - only show when there's a selection and not disabled */}
                                        {hasSelection && !isDimensionDisabled && (
                                            <button
                                                onClick={(e) => toggleDimensionPin(pKey, e)}
                                                className={`
                                                    absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center
                                                    opacity-0 group-hover/chip:opacity-100 transition-all duration-200
                                                    ${isPinned
                                                        ? 'bg-amber-500 hover:bg-amber-400 text-black'
                                                        : 'bg-gray-600/80 hover:bg-amber-500/80 text-white'}
                                                    shadow-lg
                                                `}
                                                title={isPinned ? 'Unpin value (allow randomization)' : 'Pin value (preserve during randomization)'}
                                            >
                                                {isPinned ? <PinOff className="w-2.5 h-2.5" /> : <Pin className="w-2.5 h-2.5" />}
                                            </button>
                                        )}

                                        {/* Disable Toggle Button */}
                                        <button
                                            onClick={(e) => toggleDimensionDisable(pKey, e)}
                                            className={`
                                                absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center
                                                opacity-0 group-hover/chip:opacity-100 transition-all duration-200
                                                ${isDimensionDisabled
                                                    ? 'bg-yellow-500/80 hover:bg-yellow-400 text-black'
                                                    : 'bg-gray-600/80 hover:bg-red-500/80 text-white'}
                                                shadow-lg
                                            `}
                                            title={isDimensionDisabled ? 'Enable dimension' : 'Disable dimension (skip in random)'}
                                        >
                                            {isDimensionDisabled ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                                        </button>
                                    </div>

                                    {/* Expandable Tray (Inline) */}
                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                                animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                                className="overflow-hidden w-full"
                                            >
                                                <div className="bg-[#0f0f16]/50 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                                                    <div className="flex flex-col gap-4">
                                                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                                                                    Select {PRESETS[pKey]?.label}
                                                                </span>
                                                                {value[pKey] && (
                                                                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">
                                                                        {Array.isArray(value[pKey]) ? value[pKey].length : 1}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => setActiveCategory(null)}
                                                                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                                                            >
                                                                <X className="w-3 h-3 text-gray-500" />
                                                            </button>
                                                        </div>

                                                        <div className="flex flex-wrap gap-2">
                                                            <button
                                                                onClick={() => handleSelect(pKey, undefined)}
                                                                className={`px-3 py-2 rounded-lg text-xs border transition-colors ${!value[pKey] ? 'bg-white/10 border-white/20 text-white' : 'border-dashed border-white/20 text-gray-500 hover:text-gray-300'}`}
                                                            >
                                                                🚫 Clear Selection
                                                            </button>

                                                            {(() => {
                                                                const currentConfig = config[pKey] || { disabled: [], custom: [] };

                                                                // Merge presets + custom, filtered by disabled list
                                                                const baseOptions = PRESETS[pKey]?.options || [];
                                                                const mergedOptions = [
                                                                    ...baseOptions.map(o => ({ ...o, isCustom: false })),
                                                                    ...currentConfig.custom
                                                                ].filter(o => !currentConfig.disabled.includes(o.value) && !(currentConfig.deleted || []).includes(o.value));

                                                                return mergedOptions.map(opt => {
                                                                    const isSelected = Array.isArray(value[pKey])
                                                                        ? value[pKey].includes(opt.value)
                                                                        : value[pKey] === opt.value;

                                                                    return (
                                                                        <button
                                                                            key={opt.value}
                                                                            onClick={() => handleSelect(pKey, opt.value)}
                                                                            className={`
                                                                                px-3 py-2 rounded-lg text-xs border text-left transition-all
                                                                                ${isSelected
                                                                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg'
                                                                                    : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20 hover:text-white'}
                                                                            `}
                                                                        >
                                                                            {opt.label}
                                                                        </button>
                                                                    );
                                                                });
                                                            })()}
                                                        </div>

                                                        {/* Custom Input */}
                                                        <div className="relative mt-1">
                                                            <input
                                                                type="text"
                                                                placeholder="Type custom & Press Enter..."
                                                                className="w-full bg-black/20 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        handleCustomSubmit(pKey, e.currentTarget.value);
                                                                        e.currentTarget.value = '';
                                                                    }
                                                                }}
                                                            />
                                                            <div className="absolute right-3 top-3 pointer-events-none opacity-50">
                                                                <Send className="w-3.5 h-3.5 text-gray-400" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
