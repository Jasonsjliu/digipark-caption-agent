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
BRAND CONTEXT: You are creating content for **Digipark** - Australia's premier immersive digital experience theater.

WHAT DIGIPARK IS:
- An art-tech fusion entertainment venue (located at Westfield Sydney)
- Features 18+ interactive installations (holographic tunnels, mirror mazes, VR cinema, projection mapping)
- Combines art, technology, and imagination for all ages
- Similar to teamLab, Meow Wolf - experiential, Instagram-worthy, wonder-inducing

BRAND VOICE & POSITIONING:
1. **WONDER & DISCOVERY**: Evoke curiosity, amazement, and the magic of stepping into another world
2. **INCLUSIVE FUN**: Family-friendly, accessible, joyful - appeals to all ages
3. **TECH-FORWARD**: Cutting-edge without being cold - technology serves emotion and experience
4. **LOCAL PRIDE**: Proudly Australian.

CONTENT GUIDELINES:
- Highlight the EXPERIENTIAL nature (what people will see, feel, experience)
- Use vivid, sensory language (light, color, immersion, wonder)
- Emphasize shareability and photo-worthiness for social media
- Call out specific attractions when relevant (Mirror Maze, Orbital Cinema, Holographic Studio, etc.)

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

    return `${DIGIPARK_SYSTEM_PROMPT}

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
    const variableDescriptions = Object.entries(variables)
        .map(([key, value]) => {
            // @ts-ignore
            if (Array.isArray(value)) {
                // @ts-ignore
                const labels = value.map(v => getVariableLabel(key as keyof typeof PRESETS, v, 'zh')).join(', ');
                // @ts-ignore
                return `- ${PRESETS[key as keyof typeof PRESETS].label}: ${labels}`;
            }
            // @ts-ignore
            const label = getVariableLabel(key as keyof typeof PRESETS, value!, 'zh');
            // @ts-ignore
            return `- ${PRESETS[key as keyof typeof PRESETS].label}: ${label}`;
        })
        .join('\n');

    return `${DIGIPARK_SYSTEM_PROMPT}

PLATFORM: Xiaohongshu (Little Red Book) (Lifestyle, Authentic, Helpful, Emoji-rich)

你是一位专业及资深的 Digipark 小红书内容主理人。请用纯中文（专有名词除外）生成一条独特、吸引人的小红书文案。

需要融入的关键词: ${keywords.join(', ')}
${topic ? `主题方向: ${topic}` : ''}

文案风格与基调:
${Array.isArray(variables.tone) ? `- 语气: ${variables.tone.map(v => getVariableLabel('tone', v, 'zh')).join(', ')}` : variables.tone ? `- 语气: ${getVariableLabel('tone', variables.tone, 'zh')}` : ''}
${Array.isArray(variables.writingStyle) ? `- 写作风格: ${variables.writingStyle.map(v => getVariableLabel('writingStyle', v, 'zh')).join(', ')}` : variables.writingStyle ? `- 写作风格: ${getVariableLabel('writingStyle', variables.writingStyle, 'zh')}` : ''}
${Array.isArray(variables.perspective) ? `- 人称视角: ${variables.perspective.map(v => getVariableLabel('perspective', v, 'zh')).join(', ')}` : variables.perspective ? `- 人称视角: ${getVariableLabel('perspective', variables.perspective, 'zh')}` : ''}
${Array.isArray(variables.emotionalAppeal) ? `- 情感诉求: ${variables.emotionalAppeal.map(v => getVariableLabel('emotionalAppeal', v, 'zh')).join(', ')}` : variables.emotionalAppeal ? `- 情感诉求: ${getVariableLabel('emotionalAppeal', variables.emotionalAppeal, 'zh')}` : ''}
${Array.isArray(variables.paces) ? `- 叙事节奏: ${variables.paces.map(v => getVariableLabel('paces', v, 'zh')).join(', ')}` : variables.paces ? `- 叙事节奏: ${getVariableLabel('paces', variables.paces, 'zh')}` : ''}
${Array.isArray(variables.valueProposition) ? `- 价值主张: ${variables.valueProposition.map(v => getVariableLabel('valueProposition', v, 'zh')).join(', ')}` : variables.valueProposition ? `- 价值主张: ${getVariableLabel('valueProposition', variables.valueProposition, 'zh')}` : ''}

开头HOOK策略:
${Array.isArray(variables.hookType) ? `- 开头类型: ${variables.hookType.map(v => getVariableLabel('hookType', v, 'zh')).join(', ')}` : variables.hookType ? `- 开头类型: ${getVariableLabel('hookType', variables.hookType, 'zh')}` : ''}
${Array.isArray(variables.openingTemplate) ? `- 开场模板: ${variables.openingTemplate.map(v => getVariableLabel('openingTemplate', v, 'zh')).join(', ')}` : variables.openingTemplate ? `- 开场模板: ${getVariableLabel('openingTemplate', variables.openingTemplate, 'zh')}` : ''}

内容角度:
${Array.isArray(variables.contentFramework) ? `- 内容框架: ${variables.contentFramework.map(v => getVariableLabel('contentFramework', v, 'zh')).join(', ')}` : variables.contentFramework ? `- 内容框架: ${getVariableLabel('contentFramework', variables.contentFramework, 'zh')}` : ''}
${Array.isArray(variables.targetAudience) ? `- 目标受众: ${variables.targetAudience.map(v => getVariableLabel('targetAudience', v, 'zh')).join(', ')}` : variables.targetAudience ? `- 目标受众: ${getVariableLabel('targetAudience', variables.targetAudience, 'zh')}` : ''}

排版与格式:
${variables.captionLength ? `- 长度: ${Array.isArray(variables.captionLength) ? variables.captionLength.map(v => getVariableLabel('captionLength', v, 'zh')).join(', ') : getVariableLabel('captionLength', variables.captionLength, 'zh')}` : ''}
${variables.emojiStyle ? `- Emoji风格: ${Array.isArray(variables.emojiStyle) ? variables.emojiStyle.map(v => getVariableLabel('emojiStyle', v, 'zh')).join(', ') : getVariableLabel('emojiStyle', variables.emojiStyle, 'zh')}` : ''}
${Array.isArray(variables.paragraphStructure) ? `- 段落结构: ${variables.paragraphStructure.map(v => getVariableLabel('paragraphStructure', v, 'zh')).join(', ')}` : variables.paragraphStructure ? `- 段落结构: ${getVariableLabel('paragraphStructure', variables.paragraphStructure, 'zh')}` : ''}

CTA 行动号召:
${Array.isArray(variables.ctaTone) ? `- CTA语气: ${variables.ctaTone.map(v => getVariableLabel('ctaTone', v, 'zh')).join(', ')}` : variables.ctaTone ? `- CTA语气: ${getVariableLabel('ctaTone', variables.ctaTone, 'zh')}` : ''}

时效与趋势:
${Array.isArray(variables.timeliness) ? `- 时效性: ${variables.timeliness.join(', ')}` : variables.timeliness ? `- 时效性: ${variables.timeliness}` : ''}
${Array.isArray(variables.trendElements) ? `- 流行元素: ${variables.trendElements.join(', ')}` : variables.trendElements ? `- 流行元素: ${variables.trendElements}` : ''}

生成5-10个相关的话题标签，混合热门标签和垂直领域标签。

输出格式 (仅JSON，无markdown):
{
  "caption": "你的文案内容（不含标签）",
  "tags": ["#标签1", "#标签2", "#标签3", ...]
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
