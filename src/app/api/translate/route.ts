import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        if (!text || typeof text !== 'string') {
            return Response.json({ error: 'Text is required' }, { status: 400 });
        }

        const result = await generateObject({
            model: google('gemini-3-flash-preview'),
            schema: z.object({
                cn: z.string().describe('The simplified Chinese translation of the text'),
                en: z.string().describe('The English translation of the text'),
                key: z.string().describe('A unique, slug-like key for the text (lowercase, no spaces, e.g., "cyberpunk_style")'),
            }),
            prompt: `Translate and format this text for a creative writing assistant variable: "${text}". 
      If input is Chinese, translate to English. If English, translate to Chinese.
      Generate a short, clean ID key (lowercase, snake_case) based on the English meaning.`,
        });

        return Response.json(result.object);
    } catch (error) {
        console.error('Translation error:', error);
        return Response.json({ error: 'Failed to translate' }, { status: 500 });
    }
}
