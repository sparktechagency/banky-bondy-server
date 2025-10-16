/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import OpenAI from 'openai';

// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
// });

// export async function isTextSafe(
//     text: string
// ): Promise<{ safe: boolean; reason?: string }> {
//     try {
//         const response = await openai.moderations.create({
//             model: 'omni-moderation-latest',
//             input: text,
//         });

//         const result = response.results?.[0];

//         // If flagged by OpenAI, it's not safe
//         if (result?.flagged) {
//             return {
//                 safe: false,
//                 reason: JSON.stringify(result.categories, null, 2), // detailed categories
//             };
//         }

//         return { safe: true };
//     } catch (error: any) {
//         console.error('Moderation API error:', error.message || error);
//         return { safe: false, reason: 'Moderation check failed' };
//     }
// }

/* eslint-disable @typescript-eslint/no-explicit-any */
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Checks if a given text is safe using OpenAI Moderation API
 */
export async function isTextSafe(
    text: string
): Promise<{ safe: boolean; reason?: string }> {
    try {
        const response = await openai.moderations.create({
            model: 'omni-moderation-latest',
            input: text,
        });

        const result = response.results?.[0];

        if (result?.flagged) {
            const flaggedCategories = Object.entries(result.categories || {})
                .filter(([_, flagged]) => flagged)
                .map(([category]) => category.replace(/\//g, ' '))
                .join(', ');

            const readableReason = `Your text was flagged for potentially unsafe content related to: ${flaggedCategories}. Please revise your offer and try again.`;

            return {
                safe: false,
                reason: readableReason,
            };
        }

        return { safe: true };
    } catch (error: any) {
        console.error('Moderation API error:', error.message || error);
        return {
            safe: false,
            reason: 'Content moderation check failed. Please try again later.',
        };
    }
}
