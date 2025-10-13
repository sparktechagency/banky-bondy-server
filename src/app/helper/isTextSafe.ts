/* eslint-disable @typescript-eslint/no-explicit-any */
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function isTextSafe(
    text: string
): Promise<{ safe: boolean; reason?: string }> {
    try {
        const response = await openai.moderations.create({
            model: 'omni-moderation-latest',
            input: text,
        });

        const result = response.results?.[0];

        // If flagged by OpenAI, it's not safe
        if (result?.flagged) {
            return {
                safe: false,
                reason: JSON.stringify(result.categories, null, 2), // detailed categories
            };
        }

        return { safe: true };
    } catch (error: any) {
        console.error('Moderation API error:', error.message || error);
        return { safe: false, reason: 'Moderation check failed' };
    }
}
