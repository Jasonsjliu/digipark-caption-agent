import { GoogleGenerativeAI } from '@google/generative-ai';
import { PRESETS, getRandomOption } from '../presets';
import type { VariableSelections, GeneratedCaption, TikTokTags } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Fill in missing variables with random selections
// @ts-ignore
export function fillVariables(partial: VariableSelections, disabledDimensions: string[] = []): VariableSelections {
    const filled: VariableSelections = { ...partial };
    // @ts-ignore
    const presetKeys = Object.keys(PRESETS) as (keyof typeof PRESETS)[];

    for (const key of presetKeys) {
        // Remove explicitly disabled dimensions from the result
        if (disabledDimensions.includes(key)) {
            delete filled[key];
            continue;
        }

        if (filled[key] === 'random') {
            filled[key] = getRandomOption(key);
        }
    }

    return filled;
}

// Get label for a variable value
export function getVariableLabel(key: keyof typeof PRESETS, value: string, language: 'en' | 'zh'): string {
    const preset = PRESETS[key];
    const option = preset.options.find(o => o.value === value);
    return language === 'zh' ? option?.label || value : option?.labelEn || value;
}

// System Prompt - Digipark Brand Voice
const DIGIPARK_SYSTEM_PROMPT = `
BRAND CONTEXT: You are creating content for **Digipark** - Australia's premier immersive digital experience.

WHAT DIGIPARK IS:
- An art-tech fusion entertainment venue (located at Westfield Sydney)
- 18 thematic environments
- Combines art, technology, and imagination for all ages

BRAND VOICE & POSITIONING:
1. **WONDER & DISCOVERY**: Evoke curiosity, amazement, and the magic of stepping into another world
2. **INCLUSIVE FUN**: Family-friendly, accessible, joyful - appeals to all ages
3. **TECH-FORWARD**: Cutting-edge without being cold - technology serves emotion and experience
4. **LOCAL PRIDE**: Proudly Australian.

TONE: Exciting, imaginative, warm, inviting - like a friend sharing an incredible discovery.
`;


// Build the prompt for TikTok captions
export function buildTikTokPrompt(
    keywords: string[],
    variables: VariableSelections,
    topic?: string,
    disabledDimensions: string[] = []
): string {
    // Filter out disabled dimensions from variables
    const filteredVariables: VariableSelections = {};
    for (const [key, value] of Object.entries(variables)) {
        // Skip disabled dimensions
        if (disabledDimensions.includes(key)) continue;
        // Skip undefined/null/empty values
        if (value === undefined || value === null || value === '') continue;
        // Skip arrays that are empty
        if (Array.isArray(value) && value.length === 0) continue;
        filteredVariables[key as keyof VariableSelections] = value;
    }
    const variables_clean = filteredVariables;
    const variableDescriptions = Object.entries(variables_clean)
        .map(([key, value]) => {
            if (Array.isArray(value)) {
                // @ts-ignore
                const labels = value.map(v => getVariableLabel(key as keyof typeof PRESETS, v, 'en')).join(', ');
                // @ts-ignore
                return `- ${PRESETS[key as keyof typeof PRESETS].labelEn}: ${labels}`;
            }
            // @ts-ignore
            const label = getVariableLabel(key as keyof typeof PRESETS, value!, 'en');
            // @ts-ignore
            return `- ${PRESETS[key as keyof typeof PRESETS].labelEn}: ${label}`;
        })
        .join('\n');

    const prompt = `${DIGIPARK_SYSTEM_PROMPT}

PLATFORM: TikTok (Fast-paced, Visual, Trend-aware)

You are generating a unique, engaging TikTok caption in ENGLISH.

CRITICAL LANGUAGE RULE: 
- The content MUST be in ENGLISH. 
- If any input variable is in Chinese, TRANSLATE the concept to English before using it.

KEYWORDS TO INCORPORATE: ${keywords.join(', ')}
${topic ? `TOPIC/THEME: ${topic}` : ''}

STYLE & TONE:
${Array.isArray(variables_clean.tone) ? `- Tone: ${variables_clean.tone.map(v => getVariableLabel('tone', v, 'en')).join(', ')}` : variables_clean.tone ? `- Tone: ${getVariableLabel('tone', variables_clean.tone, 'en')}` : ''}
${Array.isArray(variables_clean.writingStyle) ? `- Writing Style: ${variables_clean.writingStyle.map(v => getVariableLabel('writingStyle', v, 'en')).join(', ')}` : variables_clean.writingStyle ? `- Writing Style: ${getVariableLabel('writingStyle', variables_clean.writingStyle, 'en')}` : ''}
${Array.isArray(variables_clean.perspective) ? `- Perspective: ${variables_clean.perspective.map(v => getVariableLabel('perspective', v, 'en')).join(', ')}` : variables_clean.perspective ? `- Perspective: ${getVariableLabel('perspective', variables_clean.perspective, 'en')}` : ''}
${Array.isArray(variables_clean.emotionalAppeal) ? `- Emotion: ${variables_clean.emotionalAppeal.map(v => getVariableLabel('emotionalAppeal', v, 'en')).join(', ')}` : variables_clean.emotionalAppeal ? `- Emotion: ${getVariableLabel('emotionalAppeal', variables_clean.emotionalAppeal, 'en')}` : ''}
${Array.isArray(variables_clean.paces) ? `- Paces: ${variables_clean.paces.map(v => getVariableLabel('paces', v, 'en')).join(', ')}` : variables_clean.paces ? `- Paces: ${getVariableLabel('paces', variables_clean.paces, 'en')}` : ''}
${Array.isArray(variables_clean.valueProposition) ? `- Value Prop: ${variables_clean.valueProposition.map(v => getVariableLabel('valueProposition', v, 'en')).join(', ')}` : variables_clean.valueProposition ? `- Value Prop: ${getVariableLabel('valueProposition', variables_clean.valueProposition, 'en')}` : ''}

HOOK STRATEGY:
${Array.isArray(variables_clean.hookType) ? `- Hook Type: ${variables_clean.hookType.map(v => getVariableLabel('hookType', v, 'en')).join(', ')}` : variables_clean.hookType ? `- Hook Type: ${getVariableLabel('hookType', variables_clean.hookType, 'en')}` : ''}
${Array.isArray(variables_clean.openingTemplate) ? `- Opening: ${variables_clean.openingTemplate.map(v => getVariableLabel('openingTemplate', v, 'en')).join(', ')}` : variables_clean.openingTemplate ? `- Opening: ${getVariableLabel('openingTemplate', variables_clean.openingTemplate, 'en')}` : ''}

CONTENT ANGLE:
${Array.isArray(variables_clean.contentFramework) ? `- Framework: ${variables_clean.contentFramework.map(v => getVariableLabel('contentFramework', v, 'en')).join(', ')}` : variables_clean.contentFramework ? `- Framework: ${getVariableLabel('contentFramework', variables_clean.contentFramework, 'en')}` : ''}
${Array.isArray(variables_clean.targetAudience) ? `- Audience: ${variables_clean.targetAudience.map(v => getVariableLabel('targetAudience', v, 'en')).join(', ')}` : variables_clean.targetAudience ? `- Audience: ${getVariableLabel('targetAudience', variables_clean.targetAudience, 'en')}` : ''}

STRUCTURE & FORMAT:
${variables_clean.captionLength ? `- Length: ${Array.isArray(variables_clean.captionLength) ? variables_clean.captionLength.map(v => getVariableLabel('captionLength', v, 'en')).join(', ') : getVariableLabel('captionLength', variables_clean.captionLength, 'en')}` : ''}
${variables_clean.emojiStyle ? `- Emoji: ${Array.isArray(variables_clean.emojiStyle) ? variables_clean.emojiStyle.map(v => getVariableLabel('emojiStyle', v, 'en')).join(', ') : getVariableLabel('emojiStyle', variables_clean.emojiStyle, 'en')}` : ''}
${Array.isArray(variables_clean.paragraphStructure) ? `- Paragraphs: ${variables_clean.paragraphStructure.map(v => getVariableLabel('paragraphStructure', v, 'en')).join(', ')}` : variables_clean.paragraphStructure ? `- Paragraphs: ${getVariableLabel('paragraphStructure', variables_clean.paragraphStructure, 'en')}` : ''}

CALL TO ACTION:
${Array.isArray(variables_clean.ctaTone) ? `- CTA Tone: ${variables_clean.ctaTone.map(v => getVariableLabel('ctaTone', v, 'en')).join(', ')}` : variables_clean.ctaTone ? `- CTA Tone: ${getVariableLabel('ctaTone', variables_clean.ctaTone, 'en')}` : ''}

TIMING & TRENDS:
${Array.isArray(variables_clean.timeliness) ? `- Timeliness: ${variables_clean.timeliness.map(v => getVariableLabel('timeliness', v, 'en')).join(', ')}` : variables_clean.timeliness ? `- Timeliness: ${getVariableLabel('timeliness', variables_clean.timeliness, 'en')}` : ''}
${Array.isArray(variables_clean.trendElements) ? `- Trends: ${variables_clean.trendElements.map(v => getVariableLabel('trendElements', v, 'en')).join(', ')}` : variables_clean.trendElements ? `- Trends: ${getVariableLabel('trendElements', variables_clean.trendElements, 'en')}` : ''}

TAG REQUIREMENTS:
Generate exactly 5 hashtags, one for each category:
1. Audience Tag (target audience)
2. Vertical Tag (industry/niche)
3. Result Tag (outcomes/benefits)
4. Action Tag (call to action)
5. Broad Traffic Tag (viral/trending)

OUTPUT FORMAT (JSON only, no markdown):
{
  "caption": "Your caption text here (without hashtags)",
  "tags": {
    "audience": "#YourAudienceTag",
    "vertical": "#YourVerticalTag", 
    "result": "#YourResultTag",
    "action": "#YourActionTag",
    "broadTraffic": "#YourBroadTag"
  }
}`;

    console.log('[Gemini] Generated TikTok Prompt:', prompt);
    return prompt;
}

// Build the prompt for Instagram captions
export function buildInstagramPrompt(
    keywords: string[],
    variables: VariableSelections,
    topic?: string,
    disabledDimensions: string[] = []
): string {
    // Filter out disabled dimensions from variables
    const filteredVariables: VariableSelections = {};
    for (const [key, value] of Object.entries(variables)) {
        // Skip disabled dimensions
        if (disabledDimensions.includes(key)) continue;
        // Skip undefined/null/empty values
        if (value === undefined || value === null || value === '') continue;
        // Skip arrays that are empty
        if (Array.isArray(value) && value.length === 0) continue;
        filteredVariables[key as keyof VariableSelections] = value;
    }
    const variables_clean = filteredVariables;
    const variableDescriptions = Object.entries(variables_clean)
        .map(([key, value]) => {
            // @ts-ignore
            if (Array.isArray(value)) {
                // @ts-ignore
                const labels = value.map(v => getVariableLabel(key as keyof typeof PRESETS, v, 'en')).join(', ');
                // @ts-ignore
                return `- ${PRESETS[key as keyof typeof PRESETS].labelEn}: ${labels}`;
            }
            // @ts-ignore
            const label = getVariableLabel(key as keyof typeof PRESETS, value!, 'en');
            // @ts-ignore
            return `- ${PRESETS[key as keyof typeof PRESETS].labelEn}: ${label}`;
        })
        .join('\n');

    return `${DIGIPARK_SYSTEM_PROMPT}

PLATFORM: Instagram (Aesthetic, Community-focused, Storytelling)

You are generating a unique, engaging Instagram caption in ENGLISH.

CRITICAL LANGUAGE RULE: 
- The content MUST be 100% in ENGLISH. 
- If any input variable is in Chinese, TRANSLATE the concept to English before using it.

KEYWORDS TO INCORPORATE: ${keywords.join(', ')}
${topic ? `TOPIC/THEME: ${topic}` : ''}

STYLE & TONE:
${Array.isArray(variables_clean.tone) ? `- Tone: ${variables_clean.tone.map(v => getVariableLabel('tone', v, 'en')).join(', ')}` : variables_clean.tone ? `- Tone: ${getVariableLabel('tone', variables_clean.tone, 'en')}` : ''}
${Array.isArray(variables_clean.writingStyle) ? `- Writing Style: ${variables_clean.writingStyle.map(v => getVariableLabel('writingStyle', v, 'en')).join(', ')}` : variables_clean.writingStyle ? `- Writing Style: ${getVariableLabel('writingStyle', variables_clean.writingStyle, 'en')}` : ''}
${Array.isArray(variables_clean.perspective) ? `- Perspective: ${variables_clean.perspective.map(v => getVariableLabel('perspective', v, 'en')).join(', ')}` : variables_clean.perspective ? `- Perspective: ${getVariableLabel('perspective', variables_clean.perspective, 'en')}` : ''}
${Array.isArray(variables_clean.emotionalAppeal) ? `- Emotion: ${variables_clean.emotionalAppeal.map(v => getVariableLabel('emotionalAppeal', v, 'en')).join(', ')}` : variables_clean.emotionalAppeal ? `- Emotion: ${getVariableLabel('emotionalAppeal', variables_clean.emotionalAppeal, 'en')}` : ''}
${Array.isArray(variables_clean.paces) ? `- Paces: ${variables_clean.paces.map(v => getVariableLabel('paces', v, 'en')).join(', ')}` : variables_clean.paces ? `- Paces: ${getVariableLabel('paces', variables_clean.paces, 'en')}` : ''}
${Array.isArray(variables_clean.valueProposition) ? `- Value Prop: ${variables_clean.valueProposition.map(v => getVariableLabel('valueProposition', v, 'en')).join(', ')}` : variables_clean.valueProposition ? `- Value Prop: ${getVariableLabel('valueProposition', variables_clean.valueProposition, 'en')}` : ''}

HOOK STRATEGY:
${Array.isArray(variables_clean.hookType) ? `- Hook Type: ${variables_clean.hookType.map(v => getVariableLabel('hookType', v, 'en')).join(', ')}` : variables_clean.hookType ? `- Hook Type: ${getVariableLabel('hookType', variables_clean.hookType, 'en')}` : ''}
${Array.isArray(variables_clean.openingTemplate) ? `- Opening: ${variables_clean.openingTemplate.map(v => getVariableLabel('openingTemplate', v, 'en')).join(', ')}` : variables_clean.openingTemplate ? `- Opening: ${getVariableLabel('openingTemplate', variables_clean.openingTemplate, 'en')}` : ''}

CONTENT ANGLE:
${Array.isArray(variables_clean.contentFramework) ? `- Framework: ${variables_clean.contentFramework.map(v => getVariableLabel('contentFramework', v, 'en')).join(', ')}` : variables_clean.contentFramework ? `- Framework: ${getVariableLabel('contentFramework', variables_clean.contentFramework, 'en')}` : ''}
${Array.isArray(variables_clean.targetAudience) ? `- Audience: ${variables_clean.targetAudience.map(v => getVariableLabel('targetAudience', v, 'en')).join(', ')}` : variables_clean.targetAudience ? `- Audience: ${getVariableLabel('targetAudience', variables_clean.targetAudience, 'en')}` : ''}

STRUCTURE & FORMAT:
${variables_clean.captionLength ? `- Length: ${Array.isArray(variables_clean.captionLength) ? variables_clean.captionLength.map(v => getVariableLabel('captionLength', v, 'en')).join(', ') : getVariableLabel('captionLength', variables_clean.captionLength, 'en')}` : ''}
${variables_clean.emojiStyle ? `- Emoji: ${Array.isArray(variables_clean.emojiStyle) ? variables_clean.emojiStyle.map(v => getVariableLabel('emojiStyle', v, 'en')).join(', ') : getVariableLabel('emojiStyle', variables_clean.emojiStyle, 'en')}` : ''}
${Array.isArray(variables_clean.paragraphStructure) ? `- Paragraphs: ${variables_clean.paragraphStructure.map(v => getVariableLabel('paragraphStructure', v, 'en')).join(', ')}` : variables_clean.paragraphStructure ? `- Paragraphs: ${getVariableLabel('paragraphStructure', variables_clean.paragraphStructure, 'en')}` : ''}

CALL TO ACTION:
${Array.isArray(variables_clean.ctaTone) ? `- CTA Tone: ${variables_clean.ctaTone.map(v => getVariableLabel('ctaTone', v, 'en')).join(', ')}` : variables_clean.ctaTone ? `- CTA Tone: ${getVariableLabel('ctaTone', variables_clean.ctaTone, 'en')}` : ''}

TIMING & TRENDS:
${Array.isArray(variables_clean.timeliness) ? `- Timeliness: ${variables_clean.timeliness.map(v => getVariableLabel('timeliness', v, 'en')).join(', ')}` : variables_clean.timeliness ? `- Timeliness: ${getVariableLabel('timeliness', variables_clean.timeliness, 'en')}` : ''}
${Array.isArray(variables_clean.trendElements) ? `- Trends: ${variables_clean.trendElements.map(v => getVariableLabel('trendElements', v, 'en')).join(', ')}` : variables_clean.trendElements ? `- Trends: ${getVariableLabel('trendElements', variables_clean.trendElements, 'en')}` : ''}

Generate 8-15 relevant hashtags that mix popular and niche tags for optimal reach.

OUTPUT FORMAT (JSON only, no markdown):
{
  "caption": "Your caption text here (without hashtags)",
  "tags": ["#tag1", "#tag2", "#tag3", ...]
}`;
}

// Build the prompt for Xiaohongshu (Little Red Book) captions
export function buildXiaohongshuPrompt(
    keywords: string[],
    variables: VariableSelections,
    topic?: string,
    disabledDimensions: string[] = []
): string {
    // Filter out disabled dimensions from variables
    const filteredVariables: VariableSelections = {};
    for (const [key, value] of Object.entries(variables)) {
        // Skip disabled dimensions
        if (disabledDimensions.includes(key)) continue;
        // Skip undefined/null/empty values
        if (value === undefined || value === null || value === '') continue;
        // Skip arrays that are empty
        if (Array.isArray(value) && value.length === 0) continue;
        filteredVariables[key as keyof VariableSelections] = value;
    }
    const variables_clean = filteredVariables;
    return `${DIGIPARK_SYSTEM_PROMPT}

PLATFORM: Xiaohongshu (Little Red Book) (Lifestyle, Authentic, Helpful, Emoji-rich)

You are a professional and senior Digipark Xiaohongshu (Red Note) content manager. Please generate a unique, attractive Xiaohongshu caption in pure Chinese (except for proper nouns).

CONTEXT & KEYWORDS:
- Keywords to include: ${keywords.join(', ')}
${topic ? `- Topic Direction: ${topic}` : ''}

STYLE & TONE:
${Array.isArray(variables_clean.tone) ? `- Tone: ${variables_clean.tone.map(v => getVariableLabel('tone', v, 'en')).join(', ')}` : variables_clean.tone ? `- Tone: ${getVariableLabel('tone', variables_clean.tone, 'en')}` : ''}
${Array.isArray(variables_clean.writingStyle) ? `- Writing Style: ${variables_clean.writingStyle.map(v => getVariableLabel('writingStyle', v, 'en')).join(', ')}` : variables_clean.writingStyle ? `- Writing Style: ${getVariableLabel('writingStyle', variables_clean.writingStyle, 'en')}` : ''}
${Array.isArray(variables_clean.perspective) ? `- Perspective: ${variables_clean.perspective.map(v => getVariableLabel('perspective', v, 'en')).join(', ')}` : variables_clean.perspective ? `- Perspective: ${getVariableLabel('perspective', variables_clean.perspective, 'en')}` : ''}
${Array.isArray(variables_clean.emotionalAppeal) ? `- Emotional Appeal: ${variables_clean.emotionalAppeal.map(v => getVariableLabel('emotionalAppeal', v, 'en')).join(', ')}` : variables_clean.emotionalAppeal ? `- Emotional Appeal: ${getVariableLabel('emotionalAppeal', variables_clean.emotionalAppeal, 'en')}` : ''}
${Array.isArray(variables_clean.paces) ? `- Pacing: ${variables_clean.paces.map(v => getVariableLabel('paces', v, 'en')).join(', ')}` : variables_clean.paces ? `- Pacing: ${getVariableLabel('paces', variables_clean.paces, 'en')}` : ''}
${Array.isArray(variables_clean.valueProposition) ? `- Value Prop: ${variables_clean.valueProposition.map(v => getVariableLabel('valueProposition', v, 'en')).join(', ')}` : variables_clean.valueProposition ? `- Value Prop: ${getVariableLabel('valueProposition', variables_clean.valueProposition, 'en')}` : ''}

HOOK STRATEGY:
${Array.isArray(variables_clean.hookType) ? `- Hook Type: ${variables_clean.hookType.map(v => getVariableLabel('hookType', v, 'en')).join(', ')}` : variables_clean.hookType ? `- Hook Type: ${getVariableLabel('hookType', variables_clean.hookType, 'en')}` : ''}
${Array.isArray(variables_clean.openingTemplate) ? `- Opener Template: ${variables_clean.openingTemplate.map(v => getVariableLabel('openingTemplate', v, 'en')).join(', ')}` : variables_clean.openingTemplate ? `- Opener Template: ${getVariableLabel('openingTemplate', variables_clean.openingTemplate, 'en')}` : ''}

CONTENT ANGLE:
${Array.isArray(variables_clean.contentFramework) ? `- Framework: ${variables_clean.contentFramework.map(v => getVariableLabel('contentFramework', v, 'en')).join(', ')}` : variables_clean.contentFramework ? `- Framework: ${getVariableLabel('contentFramework', variables_clean.contentFramework, 'en')}` : ''}
${Array.isArray(variables_clean.targetAudience) ? `- Target Audience: ${variables_clean.targetAudience.map(v => getVariableLabel('targetAudience', v, 'en')).join(', ')}` : variables_clean.targetAudience ? `- Target Audience: ${getVariableLabel('targetAudience', variables_clean.targetAudience, 'en')}` : ''}

STRUCTURE & FORMAT:
${variables_clean.captionLength ? `- Length: ${Array.isArray(variables_clean.captionLength) ? variables_clean.captionLength.map(v => getVariableLabel('captionLength', v, 'en')).join(', ') : getVariableLabel('captionLength', variables_clean.captionLength, 'en')}` : ''}
${variables_clean.emojiStyle ? `- Emoji Style: ${Array.isArray(variables_clean.emojiStyle) ? variables_clean.emojiStyle.map(v => getVariableLabel('emojiStyle', v, 'en')).join(', ') : getVariableLabel('emojiStyle', variables_clean.emojiStyle, 'en')}` : ''}
${Array.isArray(variables_clean.paragraphStructure) ? `- Structure: ${variables_clean.paragraphStructure.map(v => getVariableLabel('paragraphStructure', v, 'en')).join(', ')}` : variables_clean.paragraphStructure ? `- Structure: ${getVariableLabel('paragraphStructure', variables_clean.paragraphStructure, 'en')}` : ''}

CALL TO ACTION:
${Array.isArray(variables_clean.ctaTone) ? `- CTA Tone: ${variables_clean.ctaTone.map(v => getVariableLabel('ctaTone', v, 'en')).join(', ')}` : variables_clean.ctaTone ? `- CTA Tone: ${getVariableLabel('ctaTone', variables_clean.ctaTone, 'en')}` : ''}

TIMING & TRENDS:
${Array.isArray(variables_clean.timeliness) ? `- Timeliness: ${variables_clean.timeliness.map(v => getVariableLabel('timeliness', v, 'en')).join(', ')}` : variables_clean.timeliness ? `- Timeliness: ${getVariableLabel('timeliness', variables_clean.timeliness, 'en')}` : ''}
${Array.isArray(variables_clean.trendElements) ? `- Trends: ${variables_clean.trendElements.map(v => getVariableLabel('trendElements', v, 'en')).join(', ')}` : variables_clean.trendElements ? `- Trends: ${getVariableLabel('trendElements', variables_clean.trendElements, 'en')}` : ''}

INSTRUCTIONS:
Generate 5-10 relevant hashtags, mixing trending tags and vertical tags.

OUTPUT FORMAT (JSON only, no markdown):
{
  "caption": "Your caption content (excluding tags)",
  "tags": ["#Tag1", "#Tag2", "#Tag3", ...]
}`;
}

// Generate a single caption
async function generateSingleCaption(
    platform: 'tiktok' | 'instagram' | 'xiaohongshu',
    keywords: string[],
    variables: VariableSelections,
    topic?: string,
    temperature: number = 0.9,
    intensity: number = 3,
    disabledDimensions: string[] = [],
    modelName: string = 'gemini-3-flash-preview'
): Promise<GeneratedCaption> {
    const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
            temperature: temperature,
            topP: 0.95,
        }
    });

    console.log(`[Gemini] Generating for ${platform} with model ${modelName}...`);

    let prompt: string;
    switch (platform) {
        case 'tiktok':
            prompt = buildTikTokPrompt(keywords, variables, topic, disabledDimensions);
            break;
        case 'instagram':
            prompt = buildInstagramPrompt(keywords, variables, topic, disabledDimensions);
            break;
        case 'xiaohongshu':
            prompt = buildXiaohongshuPrompt(keywords, variables, topic, disabledDimensions);
            break;
    }

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        console.log(`[Gemini] ${platform} response received (length: ${responseText.length})`);

        // Parse JSON from response (handle potential markdown code blocks)
        let jsonStr = responseText;
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1];
        }

        const parsed = JSON.parse(jsonStr.trim());

        // Format tags based on platform
        let tags: string[];
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
        const filteredVariablesUsed: VariableSelections = {};
        for (const [key, value] of Object.entries(variables)) {
            if (disabledDimensions.includes(key)) continue;
            if (value === undefined || value === null || value === '') continue;
            filteredVariablesUsed[key as keyof VariableSelections] = value;
        }

        return {
            platform,
            caption: parsed.caption,
            tags,
            keywordsUsed: keywords,
            variablesUsed: filteredVariablesUsed,
            model: modelName,
            creativity: Math.round(temperature * 100),
            intensity: intensity,
            keywordCount: keywords.length
        };
    } catch (e: any) {
        console.error(`[Gemini] Failed to generate for ${platform}:`, e.message || e);
        if (e.response) {
            console.error(`[Gemini] Error Response blocked: ${e.response.promptFeedback?.blockReason}`);
        }
        throw e;
    }
}

// Main generation function
export async function generateWithGemini(
    keywords: string[],
    variables: VariableSelections,
    counts: { tiktok: number; instagram: number; xiaohongshu: number },
    topic?: string,
    temperature: number = 0.9,
    intensity: number = 3,
    disabledDimensions: string[] = [],
    modelName: string = 'gemini-3-flash-preview'
): Promise<{
    tiktok: GeneratedCaption[];
    instagram: GeneratedCaption[];
    xiaohongshu: GeneratedCaption[];
}> {
    const results = {
        tiktok: [] as GeneratedCaption[],
        instagram: [] as GeneratedCaption[],
        xiaohongshu: [] as GeneratedCaption[],
    };

    // Generate captions for each platform
    const platforms: ('tiktok' | 'instagram' | 'xiaohongshu')[] = ['tiktok', 'instagram', 'xiaohongshu'];

    for (const platform of platforms) {
        const count = counts[platform];
        for (let i = 0; i < count; i++) {
            // Shuffle keywords for variety
            const shuffledKeywords = [...keywords].sort(() => Math.random() - 0.5);
            // Fill in any missing variables with random selections
            const filledVariables = fillVariables(variables, disabledDimensions);

            try {
                const caption = await generateSingleCaption(platform, shuffledKeywords, filledVariables, topic, temperature, intensity, disabledDimensions, modelName);
                results[platform].push(caption);
            } catch (error) {
                console.error(`Error generating ${platform} caption:`, error);
                // Continue with other generations even if one fails
            }
        }
    }

    return results;
}
