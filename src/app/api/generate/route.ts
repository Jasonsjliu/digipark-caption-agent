import { NextRequest, NextResponse } from 'next/server';
import { generateCaptions } from '@/lib/ai/providers';
import type { GenerationConfig } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const body: GenerationConfig = await request.json();
        const { topic, keywordCount, variables, counts, specificKeywords, availableKeywords, model } = body;

        let selectedKeywords: string[] = [];

        if (specificKeywords && specificKeywords.length > 0) {
            // Use manually selected keywords
            selectedKeywords = specificKeywords;
        } else if (availableKeywords && availableKeywords.length > 0) {
            // Use user's keyword library for random selection
            const shuffled = [...availableKeywords].sort(() => Math.random() - 0.5);
            selectedKeywords = shuffled.slice(0, Math.min(keywordCount, shuffled.length));
        } else {
            // Fallback to sample keywords if no user keywords available
            const sampleKeywords = [
                'growth', 'success', 'productivity', 'marketing', 'business',
                'digital', 'social media', 'content', 'strategy', 'engagement',
                'viral', 'trending', 'tips', 'hacks', 'secrets',
                'entrepreneur', 'startup', 'innovation', 'technology', 'future'
            ];

            // Randomly select keywords
            const shuffled = [...sampleKeywords].sort(() => Math.random() - 0.5);
            selectedKeywords = shuffled.slice(0, Math.min(keywordCount, shuffled.length));
        }

        // Generate captions
        const result = await generateCaptions(model, selectedKeywords, variables, counts, topic);

        return NextResponse.json({
            success: true,
            data: result,
            keywordsUsed: selectedKeywords,
        });
    } catch (error) {
        console.error('Generation error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to generate captions'
            },
            { status: 500 }
        );
    }
}
