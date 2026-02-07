import { NextRequest, NextResponse } from 'next/server';
import { generateCaptions } from '@/lib/ai/providers';
import type { GenerationConfig } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const body: GenerationConfig = await request.json();
        const { topic, keywordCount, variables, counts, specificKeywords, availableKeywords, model, disabledDimensions } = body;

        let selectedKeywords: string[] = [];

        if (specificKeywords && specificKeywords.length > 0) {
            // Use manually selected keywords
            selectedKeywords = specificKeywords;
        } else if (availableKeywords && availableKeywords.length > 0) {
            // Use user's keyword library for random selection
            const shuffled = [...availableKeywords].sort(() => Math.random() - 0.5);
            selectedKeywords = shuffled.slice(0, Math.min(keywordCount, shuffled.length));
        } else {
            // Fallback: Digipark-themed keywords when user's library is empty
            const digiparkKeywords = [
                'immersive art', 'digital experience', 'Sydney attraction',
                'interactive exhibit', 'light installation', 'family fun',
                'photo opportunity', 'projection mapping',
                'sensory journey', 'art meets technology', 'indoor adventure',
                'must-see exhibition', 'creative escape', 'visual wonderland',
                'hidden gem Sydney', 'instagrammable spot',
                'futuristic gallery', 'unforgettable experience'
            ];

            // Randomly select from fallback keywords
            const shuffled = [...digiparkKeywords].sort(() => Math.random() - 0.5);
            selectedKeywords = shuffled.slice(0, Math.min(keywordCount, shuffled.length));
        }

        console.log('[API] Generation Request:', {
            model,
            topic,
            variableCount: Object.keys(variables).length,
            variables,
            selectedKeywords,
            disabledCount: disabledDimensions?.length || 0
        });

        // Generate captions
        const result = await generateCaptions(model, selectedKeywords, variables, counts, topic, body.temperature, body.intensity, disabledDimensions);

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
