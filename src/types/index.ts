// Type definitions for the caption agent

export interface Keyword {
    id: string;
    keyword: string;
    category: string | null;
    language: 'en' | 'zh';
    created_at: string;
}

export interface GenerationHistory {
    id: string;
    platform: 'tiktok' | 'instagram' | 'xiaohongshu';
    caption: string;
    tags: string[];
    keywords_used: string[];
    variables_used: VariableSelections;
    created_at: string;
    // New metadata
    model?: string;
    creativity?: number;
    intensity?: number;
    keyword_count?: number;
}

export interface VariableSelections {
    // 1. 📝 Style & Tone
    tone?: string | string[];
    writingStyle?: string | string[];
    perspective?: string | string[];
    emotionalAppeal?: string | string[];
    paces?: string | string[];
    valueProposition?: string | string[];

    // 2. 🎯 Hooks
    hookType?: string | string[];
    openingTemplate?: string | string[];

    // 3. 🎨 Content Angle
    contentFramework?: string | string[];
    targetAudience?: string | string[];

    // 4. 📱 Platform
    captionLength?: string | string[];
    emojiStyle?: string | string[];
    paragraphStructure?: string | string[];

    // 5. 💡 Call to Action (CTA)
    ctaTone?: string | string[]; // User retained only ctaTone

    // 6. 🌐 Time & Trends
    timeliness?: string | string[];
    trendElements?: string | string[];
}

export type ModelType = 'gemini-3-flash-preview' | 'gemini-2.0-flash-exp' | 'gpt-4o' | 'gpt-5-mini' | 'grok-4-1-fast-non-reasoning';

export interface GenerationConfig {
    topic?: string;
    model?: ModelType;
    keywordCount: number;
    specificKeywords?: string[]; // For manual selection mode
    availableKeywords?: string[]; // User's keyword library for random selection
    variables: VariableSelections;
    counts: {
        tiktok: number;
        instagram: number;
        xiaohongshu: number;
    };
    temperature?: number;
    intensity?: number;
    disabledDimensions?: string[];
}

export interface GeneratedCaption {
    platform: 'tiktok' | 'instagram' | 'xiaohongshu';
    caption: string;
    tags: string[];
    keywordsUsed: string[];
    variablesUsed: VariableSelections;
    // New metadata for tracking
    model?: string;
    creativity?: number;
    intensity?: number;
    keywordCount?: number;
}

export interface GenerationResult {
    tiktok: GeneratedCaption[];
    instagram: GeneratedCaption[];
    xiaohongshu: GeneratedCaption[];
}

// TikTok specific tag structure
export interface TikTokTags {
    audience: string;
    vertical: string;
    result: string;
    action: string;
    broadTraffic: string;
}
