import { generateWithGemini, fillVariables, buildTikTokPrompt, buildInstagramPrompt, buildXiaohongshuPrompt } from './gemini';
import OpenAI from 'openai';
import type { VariableSelections, GeneratedCaption, TikTokTags, ModelType } from '@/types';

// Initialize OpenAI clients
// Note: We create clients lazily or check for keys to avoid errors if keys are missing
const getOpenAIClient = () => {
    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || '',
        dangerouslyAllowBrowser: true // Although this runs on server, just in case of edge runtime issues
    });
};

const getGrokClient = () => {
    const key = process.env.XAI_API_KEY || '';
    console.log(`[Providers] Initializing Grok client with key: ${key.slice(0, 8)}...`);
    return new OpenAI({
        apiKey: key,
        baseURL: 'https://api.x.ai/v1',
        dangerouslyAllowBrowser: true
    });
};



// Generic generator for OpenAI-compatible APIs (GPT / Grok)
async function generateWithOpenAICompatible(
    modelName: string,
    client: OpenAI,
    keywords: string[],
    variables: VariableSelections,
    counts: { tiktok: number; instagram: number; xiaohongshu: number },
    topic?: string,
    temperature: number = 0.9,
    isGrok: boolean = false,
    intensity: number = 3,
    disabledDimensions: string[] = []
): Promise<{
    tiktok: GeneratedCaption[];
    instagram: GeneratedCaption[];
    xiaohongshu: GeneratedCaption[];
}> {
    console.log(`[Providers] Starting generation with model: ${modelName}`); // Debug log

    const results = {
        tiktok: [] as GeneratedCaption[],
        instagram: [] as GeneratedCaption[],
        xiaohongshu: [] as GeneratedCaption[],
    };

    const platforms: ('tiktok' | 'instagram' | 'xiaohongshu')[] = ['tiktok', 'instagram', 'xiaohongshu'];

    for (const platform of platforms) {
        const count = counts[platform];
        for (let i = 0; i < count; i++) {
            const shuffledKeywords = [...keywords].sort(() => Math.random() - 0.5);
            const filledVariables = fillVariables(variables, disabledDimensions);

            let prompt: string = '';
            switch (platform) {
                case 'tiktok':
                    prompt = buildTikTokPrompt(shuffledKeywords, filledVariables, topic, disabledDimensions);
                    break;
                case 'instagram':
                    prompt = buildInstagramPrompt(shuffledKeywords, filledVariables, topic, disabledDimensions);
                    break;
                case 'xiaohongshu':
                    prompt = buildXiaohongshuPrompt(shuffledKeywords, filledVariables, topic, disabledDimensions);
                    break;
            }

            try {
                console.log(`[Providers] Sending request to ${modelName} for ${platform}...`); // Debug log

                // Build request parameters - Grok API may not support response_format
                const requestParams: Parameters<typeof client.chat.completions.create>[0] = {
                    messages: [{ role: 'user', content: prompt }],
                    model: modelName,
                    temperature: temperature,
                    stream: false as const, // Ensure non-streaming for proper type inference
                };

                // Only add response_format for OpenAI (not Grok) as xAI may not support it
                if (!isGrok) {
                    requestParams.response_format = { type: "json_object" };
                }

                const completion = await client.chat.completions.create(requestParams) as OpenAI.Chat.ChatCompletion;

                console.log(`[Providers] Received response from ${modelName} for ${platform}`); // Debug log

                const content = completion.choices[0].message.content || '{}';
                console.log(`[Providers] Raw content from ${modelName}:`, content); // Added for debugging

                // Extract JSON from potential markdown code blocks
                let jsonStr = content.trim();
                const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
                if (jsonMatch) {
                    jsonStr = jsonMatch[1];
                }

                const parsed = JSON.parse(jsonStr.trim());

                // Format tags
                let tags: string[] = [];
                if (platform === 'tiktok' && parsed.tags && typeof parsed.tags === 'object' && !Array.isArray(parsed.tags)) {
                    const tiktokTags = parsed.tags as TikTokTags;
                    tags = [
                        tiktokTags.audience,
                        tiktokTags.vertical,
                        tiktokTags.result,
                        tiktokTags.action,
                        tiktokTags.broadTraffic,
                    ];
                } else {
                    tags = parsed.tags || [];
                }

                // Filter out disabled dimensions from variablesUsed
                const filteredVariablesUsed: typeof filledVariables = {};
                for (const [key, value] of Object.entries(filledVariables)) {
                    if (disabledDimensions.includes(key)) continue;
                    if (value === undefined || value === null || value === '') continue;
                    filteredVariablesUsed[key as keyof typeof filledVariables] = value;
                }

                results[platform].push({
                    platform,
                    caption: parsed.caption,
                    tags,
                    keywordsUsed: shuffledKeywords,
                    variablesUsed: filteredVariablesUsed,
                    model: modelName,
                    creativity: Math.round(temperature * 100),
                    intensity: intensity,
                    keywordCount: shuffledKeywords.length
                });

            } catch (error) {
                console.error(`[Providers] Error generating ${platform} caption with ${modelName}:`, JSON.stringify(error, Object.getOwnPropertyNames(error))); // Enhanced error log
            }
        }
    }

    return results;
}


// Unified generation function
export async function generateCaptions(
    model: ModelType = 'gemini-3-flash-preview', // Default
    keywords: string[],
    variables: VariableSelections,
    counts: { tiktok: number; instagram: number; xiaohongshu: number },
    topic?: string,
    temperature: number = 0.9,
    intensity: number = 3,
    disabledDimensions: string[] = []
) {
    console.log(`Generating with model: ${model}`);

    if (model === 'gemini-3-flash-preview' || model === 'gemini-2.0-flash-exp' as any) {
        return generateWithGemini(keywords, variables, counts, topic, temperature, intensity, disabledDimensions, 'gemini-3-flash-preview');
    }

    if (model === 'gpt-4o') {
        const client = getOpenAIClient();
        return generateWithOpenAICompatible('gpt-4o', client, keywords, variables, counts, topic, temperature, false, intensity, disabledDimensions);
    }

    if (model === 'gpt-5-mini') {
        const client = getOpenAIClient();
        // Mapping "GPT-5 mini" to "gpt-4o-mini" as the closest current equivalent
        return generateWithOpenAICompatible('gpt-4o-mini', client, keywords, variables, counts, topic, temperature, false, intensity, disabledDimensions);
    }

    if (model === 'grok-4-1-fast-non-reasoning') {
        const client = getGrokClient();
        return generateWithOpenAICompatible('grok-4-1-fast-non-reasoning', client, keywords, variables, counts, topic, temperature, true, intensity, disabledDimensions);
    }

    throw new Error(`Unsupported model: ${model}`);
}
