import { GoogleGenerativeAI } from '@google/generative-ai';
import { PRESETS, getRandomOption } from '../presets';
import type { VariableSelections, GeneratedCaption, TikTokTags } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Fill in missing variables with random selections
export function fillVariables(partial: VariableSelections): VariableSelections {
    const filled: VariableSelections = { ...partial };
    const presetKeys = Object.keys(PRESETS) as (keyof typeof PRESETS)[];

    for (const key of presetKeys) {
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
    topic?: string
): string {
    const variableDescriptions = Object.entries(variables)
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
${Array.isArray(variables.tone) ? `- Tone: ${variables.tone.map(v => getVariableLabel('tone', v, 'en')).join(', ')}` : variables.tone ? `- Tone: ${getVariableLabel('tone', variables.tone, 'en')}` : ''}
${Array.isArray(variables.writingStyle) ? `- Writing Style: ${variables.writingStyle.map(v => getVariableLabel('writingStyle', v, 'en')).join(', ')}` : variables.writingStyle ? `- Writing Style: ${getVariableLabel('writingStyle', variables.writingStyle, 'en')}` : ''}
${Array.isArray(variables.perspective) ? `- Perspective: ${variables.perspective.map(v => getVariableLabel('perspective', v, 'en')).join(', ')}` : variables.perspective ? `- Perspective: ${getVariableLabel('perspective', variables.perspective, 'en')}` : ''}
${Array.isArray(variables.emotionalAppeal) ? `- Emotion: ${variables.emotionalAppeal.map(v => getVariableLabel('emotionalAppeal', v, 'en')).join(', ')}` : variables.emotionalAppeal ? `- Emotion: ${getVariableLabel('emotionalAppeal', variables.emotionalAppeal, 'en')}` : ''}
${Array.isArray(variables.paces) ? `- Paces: ${variables.paces.map(v => getVariableLabel('paces', v, 'en')).join(', ')}` : variables.paces ? `- Paces: ${getVariableLabel('paces', variables.paces, 'en')}` : ''}
${Array.isArray(variables.valueProposition) ? `- Value Prop: ${variables.valueProposition.map(v => getVariableLabel('valueProposition', v, 'en')).join(', ')}` : variables.valueProposition ? `- Value Prop: ${getVariableLabel('valueProposition', variables.valueProposition, 'en')}` : ''}

HOOK STRATEGY:
${Array.isArray(variables.hookType) ? `- Hook Type: ${variables.hookType.map(v => getVariableLabel('hookType', v, 'en')).join(', ')}` : variables.hookType ? `- Hook Type: ${getVariableLabel('hookType', variables.hookType, 'en')}` : ''}
${Array.isArray(variables.openingTemplate) ? `- Opening: ${variables.openingTemplate.map(v => getVariableLabel('openingTemplate', v, 'en')).join(', ')}` : variables.openingTemplate ? `- Opening: ${getVariableLabel('openingTemplate', variables.openingTemplate, 'en')}` : ''}

CONTENT ANGLE:
${Array.isArray(variables.contentFramework) ? `- Framework: ${variables.contentFramework.map(v => getVariableLabel('contentFramework', v, 'en')).join(', ')}` : variables.contentFramework ? `- Framework: ${getVariableLabel('contentFramework', variables.contentFramework, 'en')}` : ''}
${Array.isArray(variables.targetAudience) ? `- Audience: ${variables.targetAudience.map(v => getVariableLabel('targetAudience', v, 'en')).join(', ')}` : variables.targetAudience ? `- Audience: ${getVariableLabel('targetAudience', variables.targetAudience, 'en')}` : ''}

STRUCTURE & FORMAT:
${variables.captionLength ? `- Length: ${Array.isArray(variables.captionLength) ? variables.captionLength.map(v => getVariableLabel('captionLength', v, 'en')).join(', ') : getVariableLabel('captionLength', variables.captionLength, 'en')}` : ''}
${variables.emojiStyle ? `- Emoji: ${Array.isArray(variables.emojiStyle) ? variables.emojiStyle.map(v => getVariableLabel('emojiStyle', v, 'en')).join(', ') : getVariableLabel('emojiStyle', variables.emojiStyle, 'en')}` : ''}
${Array.isArray(variables.paragraphStructure) ? `- Paragraphs: ${variables.paragraphStructure.map(v => getVariableLabel('paragraphStructure', v, 'en')).join(', ')}` : variables.paragraphStructure ? `- Paragraphs: ${getVariableLabel('paragraphStructure', variables.paragraphStructure, 'en')}` : ''}

CALL TO ACTION:
${Array.isArray(variables.ctaTone) ? `- CTA Tone: ${variables.ctaTone.map(v => getVariableLabel('ctaTone', v, 'en')).join(', ')}` : variables.ctaTone ? `- CTA Tone: ${getVariableLabel('ctaTone', variables.ctaTone, 'en')}` : ''}

TIMING & TRENDS:
${Array.isArray(variables.timeliness) ? `- Timeliness: ${variables.timeliness.map(v => getVariableLabel('timeliness', v, 'en')).join(', ')}` : variables.timeliness ? `- Timeliness: ${getVariableLabel('timeliness', variables.timeliness, 'en')}` : ''}
${Array.isArray(variables.trendElements) ? `- Trends: ${variables.trendElements.map(v => getVariableLabel('trendElements', v, 'en')).join(', ')}` : variables.trendElements ? `- Trends: ${getVariableLabel('trendElements', variables.trendElements, 'en')}` : ''}

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
    topic?: string
): string {
    const variableDescriptions = Object.entries(variables)
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
${Array.isArray(variables.tone) ? `- Tone: ${variables.tone.map(v => getVariableLabel('tone', v, 'en')).join(', ')}` : variables.tone ? `- Tone: ${getVariableLabel('tone', variables.tone, 'en')}` : ''}
${Array.isArray(variables.writingStyle) ? `- Writing Style: ${variables.writingStyle.map(v => getVariableLabel('writingStyle', v, 'en')).join(', ')}` : variables.writingStyle ? `- Writing Style: ${getVariableLabel('writingStyle', variables.writingStyle, 'en')}` : ''}
${Array.isArray(variables.perspective) ? `- Perspective: ${variables.perspective.map(v => getVariableLabel('perspective', v, 'en')).join(', ')}` : variables.perspective ? `- Perspective: ${getVariableLabel('perspective', variables.perspective, 'en')}` : ''}
${Array.isArray(variables.emotionalAppeal) ? `- Emotion: ${variables.emotionalAppeal.map(v => getVariableLabel('emotionalAppeal', v, 'en')).join(', ')}` : variables.emotionalAppeal ? `- Emotion: ${getVariableLabel('emotionalAppeal', variables.emotionalAppeal, 'en')}` : ''}
${Array.isArray(variables.paces) ? `- Paces: ${variables.paces.map(v => getVariableLabel('paces', v, 'en')).join(', ')}` : variables.paces ? `- Paces: ${getVariableLabel('paces', variables.paces, 'en')}` : ''}
${Array.isArray(variables.valueProposition) ? `- Value Prop: ${variables.valueProposition.map(v => getVariableLabel('valueProposition', v, 'en')).join(', ')}` : variables.valueProposition ? `- Value Prop: ${getVariableLabel('valueProposition', variables.valueProposition, 'en')}` : ''}

HOOK STRATEGY:
${Array.isArray(variables.hookType) ? `- Hook Type: ${variables.hookType.map(v => getVariableLabel('hookType', v, 'en')).join(', ')}` : variables.hookType ? `- Hook Type: ${getVariableLabel('hookType', variables.hookType, 'en')}` : ''}
${Array.isArray(variables.openingTemplate) ? `- Opening: ${variables.openingTemplate.map(v => getVariableLabel('openingTemplate', v, 'en')).join(', ')}` : variables.openingTemplate ? `- Opening: ${getVariableLabel('openingTemplate', variables.openingTemplate, 'en')}` : ''}

CONTENT ANGLE:
${Array.isArray(variables.contentFramework) ? `- Framework: ${variables.contentFramework.map(v => getVariableLabel('contentFramework', v, 'en')).join(', ')}` : variables.contentFramework ? `- Framework: ${getVariableLabel('contentFramework', variables.contentFramework, 'en')}` : ''}
${Array.isArray(variables.targetAudience) ? `- Audience: ${variables.targetAudience.map(v => getVariableLabel('targetAudience', v, 'en')).join(', ')}` : variables.targetAudience ? `- Audience: ${getVariableLabel('targetAudience', variables.targetAudience, 'en')}` : ''}

STRUCTURE & FORMAT:
${variables.captionLength ? `- Length: ${Array.isArray(variables.captionLength) ? variables.captionLength.map(v => getVariableLabel('captionLength', v, 'en')).join(', ') : getVariableLabel('captionLength', variables.captionLength, 'en')}` : ''}
${variables.emojiStyle ? `- Emoji: ${Array.isArray(variables.emojiStyle) ? variables.emojiStyle.map(v => getVariableLabel('emojiStyle', v, 'en')).join(', ') : getVariableLabel('emojiStyle', variables.emojiStyle, 'en')}` : ''}
${Array.isArray(variables.paragraphStructure) ? `- Paragraphs: ${variables.paragraphStructure.map(v => getVariableLabel('paragraphStructure', v, 'en')).join(', ')}` : variables.paragraphStructure ? `- Paragraphs: ${getVariableLabel('paragraphStructure', variables.paragraphStructure, 'en')}` : ''}

CALL TO ACTION:
${Array.isArray(variables.ctaTone) ? `- CTA Tone: ${variables.ctaTone.map(v => getVariableLabel('ctaTone', v, 'en')).join(', ')}` : variables.ctaTone ? `- CTA Tone: ${getVariableLabel('ctaTone', variables.ctaTone, 'en')}` : ''}

TIMING & TRENDS:
${Array.isArray(variables.timeliness) ? `- Timeliness: ${variables.timeliness.map(v => getVariableLabel('timeliness', v, 'en')).join(', ')}` : variables.timeliness ? `- Timeliness: ${getVariableLabel('timeliness', variables.timeliness, 'en')}` : ''}
${Array.isArray(variables.trendElements) ? `- Trends: ${variables.trendElements.map(v => getVariableLabel('trendElements', v, 'en')).join(', ')}` : variables.trendElements ? `- Trends: ${getVariableLabel('trendElements', variables.trendElements, 'en')}` : ''}

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
    topic?: string
): string {
    return `${DIGIPARK_SYSTEM_PROMPT}

PLATFORM: Xiaohongshu (Little Red Book) (Lifestyle, Authentic, Helpful, Emoji-rich)

You are a professional and senior Digipark Xiaohongshu (Red Note) content manager. Please generate a unique, attractive Xiaohongshu caption in pure Chinese (except for proper nouns).

CONTEXT & KEYWORDS:
- Keywords to include: ${keywords.join(', ')}
${topic ? `- Topic Direction: ${topic}` : ''}

STYLE & TONE:
${Array.isArray(variables.tone) ? `- Tone: ${variables.tone.map(v => getVariableLabel('tone', v, 'en')).join(', ')}` : variables.tone ? `- Tone: ${getVariableLabel('tone', variables.tone, 'en')}` : ''}
${Array.isArray(variables.writingStyle) ? `- Writing Style: ${variables.writingStyle.map(v => getVariableLabel('writingStyle', v, 'en')).join(', ')}` : variables.writingStyle ? `- Writing Style: ${getVariableLabel('writingStyle', variables.writingStyle, 'en')}` : ''}
${Array.isArray(variables.perspective) ? `- Perspective: ${variables.perspective.map(v => getVariableLabel('perspective', v, 'en')).join(', ')}` : variables.perspective ? `- Perspective: ${getVariableLabel('perspective', variables.perspective, 'en')}` : ''}
${Array.isArray(variables.emotionalAppeal) ? `- Emotional Appeal: ${variables.emotionalAppeal.map(v => getVariableLabel('emotionalAppeal', v, 'en')).join(', ')}` : variables.emotionalAppeal ? `- Emotional Appeal: ${getVariableLabel('emotionalAppeal', variables.emotionalAppeal, 'en')}` : ''}
${Array.isArray(variables.paces) ? `- Pacing: ${variables.paces.map(v => getVariableLabel('paces', v, 'en')).join(', ')}` : variables.paces ? `- Pacing: ${getVariableLabel('paces', variables.paces, 'en')}` : ''}
${Array.isArray(variables.valueProposition) ? `- Value Prop: ${variables.valueProposition.map(v => getVariableLabel('valueProposition', v, 'en')).join(', ')}` : variables.valueProposition ? `- Value Prop: ${getVariableLabel('valueProposition', variables.valueProposition, 'en')}` : ''}

HOOK STRATEGY:
${Array.isArray(variables.hookType) ? `- Hook Type: ${variables.hookType.map(v => getVariableLabel('hookType', v, 'en')).join(', ')}` : variables.hookType ? `- Hook Type: ${getVariableLabel('hookType', variables.hookType, 'en')}` : ''}
${Array.isArray(variables.openingTemplate) ? `- Opener Template: ${variables.openingTemplate.map(v => getVariableLabel('openingTemplate', v, 'en')).join(', ')}` : variables.openingTemplate ? `- Opener Template: ${getVariableLabel('openingTemplate', variables.openingTemplate, 'en')}` : ''}

CONTENT ANGLE:
${Array.isArray(variables.contentFramework) ? `- Framework: ${variables.contentFramework.map(v => getVariableLabel('contentFramework', v, 'en')).join(', ')}` : variables.contentFramework ? `- Framework: ${getVariableLabel('contentFramework', variables.contentFramework, 'en')}` : ''}
${Array.isArray(variables.targetAudience) ? `- Target Audience: ${variables.targetAudience.map(v => getVariableLabel('targetAudience', v, 'en')).join(', ')}` : variables.targetAudience ? `- Target Audience: ${getVariableLabel('targetAudience', variables.targetAudience, 'en')}` : ''}

STRUCTURE & FORMAT:
${variables.captionLength ? `- Length: ${Array.isArray(variables.captionLength) ? variables.captionLength.map(v => getVariableLabel('captionLength', v, 'en')).join(', ') : getVariableLabel('captionLength', variables.captionLength, 'en')}` : ''}
${variables.emojiStyle ? `- Emoji Style: ${Array.isArray(variables.emojiStyle) ? variables.emojiStyle.map(v => getVariableLabel('emojiStyle', v, 'en')).join(', ') : getVariableLabel('emojiStyle', variables.emojiStyle, 'en')}` : ''}
${Array.isArray(variables.paragraphStructure) ? `- Structure: ${variables.paragraphStructure.map(v => getVariableLabel('paragraphStructure', v, 'en')).join(', ')}` : variables.paragraphStructure ? `- Structure: ${getVariableLabel('paragraphStructure', variables.paragraphStructure, 'en')}` : ''}

CALL TO ACTION:
${Array.isArray(variables.ctaTone) ? `- CTA Tone: ${variables.ctaTone.map(v => getVariableLabel('ctaTone', v, 'en')).join(', ')}` : variables.ctaTone ? `- CTA Tone: ${getVariableLabel('ctaTone', variables.ctaTone, 'en')}` : ''}

TIMING & TRENDS:
${Array.isArray(variables.timeliness) ? `- Timeliness: ${variables.timeliness.map(v => getVariableLabel('timeliness', v, 'en')).join(', ')}` : variables.timeliness ? `- Timeliness: ${getVariableLabel('timeliness', variables.timeliness, 'en')}` : ''}
${Array.isArray(variables.trendElements) ? `- Trends: ${variables.trendElements.map(v => getVariableLabel('trendElements', v, 'en')).join(', ')}` : variables.trendElements ? `- Trends: ${getVariableLabel('trendElements', variables.trendElements, 'en')}` : ''}

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
    topic?: string
): Promise<GeneratedCaption> {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
            temperature: 0.9, // Higher temperature for more variety
            topP: 0.95,
        }
    });

    let prompt: string;
    switch (platform) {
        case 'tiktok':
            prompt = buildTikTokPrompt(keywords, variables, topic);
            break;
        case 'instagram':
            prompt = buildInstagramPrompt(keywords, variables, topic);
            break;
        case 'xiaohongshu':
            prompt = buildXiaohongshuPrompt(keywords, variables, topic);
            break;
    }

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

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

    return {
        platform,
        caption: parsed.caption,
        tags,
        keywordsUsed: keywords,
        variablesUsed: variables,
    };
}

// Main generation function
export async function generateWithGemini(
    keywords: string[],
    variables: VariableSelections,
    counts: { tiktok: number; instagram: number; xiaohongshu: number },
    topic?: string
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
            const filledVariables = fillVariables(variables);

            try {
                const caption = await generateSingleCaption(platform, shuffledKeywords, filledVariables, topic);
                results[platform].push(caption);
            } catch (error) {
                console.error(`Error generating ${platform} caption:`, error);
                // Continue with other generations even if one fails
            }
        }
    }

    return results;
}
