/* eslint-disable no-useless-escape */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// ------------------------
// Custom rules for fast checks
// ------------------------

// Money words and symbols
const MONEY_REGEX =
    /\b(?:usd|ars|eur|gbp|bdt|inr|jpy|cny|aud|cad|sgd|dollar|dollars|dólar|dólares|taka|takas|rupee|rupees|rupia|rupias|peso|pesos|yen|yenes|euro|euros|libra|libras|libras esterlinas|franco|francos|real|reais|koruna|krona|forint|lei|shekel|dirham|baht|ruble|rublo|sol|lira|dinero|moneda)\b|[\$\€\£\¥\₹\৳₽₩₺฿₪₫₴]/i;

// Sexual/adult content
const SEXUAL_REGEX = /\b(sex|porn|xxx|nude|erotic|adult|nsfw)\b/i;

// Violence
const VIOLENCE_REGEX =
    /\b(kill|murder|shoot|assault|bomb|attack|terrorist|abuse)\b/i;

// Hate speech
const HATE_REGEX = /\b(racist|hate|kill [a-z]+|attack [a-z]+|discriminate)\b/i;

// Combine rules into an array
const CUSTOM_RULES: { regex: RegExp; reason: string }[] = [
    { regex: MONEY_REGEX, reason: 'Money-related content is not allowed.' },
    { regex: SEXUAL_REGEX, reason: 'Sexual or adult content is not allowed.' },
    { regex: VIOLENCE_REGEX, reason: 'Violent content is not allowed.' },
    {
        regex: HATE_REGEX,
        reason: 'Hate speech or discriminatory content is not allowed.',
    },
];

/**
 * Checks if a given text is safe using OpenAI Moderation API + custom rules
 */
export async function isTextSafe(
    text: string
): Promise<{ safe: boolean; reason?: string }> {
    try {
        // ------------------------
        // Step 1: Apply custom rules
        // ------------------------
        for (const rule of CUSTOM_RULES) {
            if (rule.regex.test(text)) {
                return { safe: false, reason: rule.reason };
            }
        }

        // ------------------------
        // Step 2: OpenAI Moderation API
        // ------------------------
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

            const readableReason = `Your text was flagged for potentially unsafe content related to: ${flaggedCategories}. Please revise your input.`;

            return {
                safe: false,
                reason: readableReason,
            };
        }

        // ------------------------
        // Step 3: If passed all checks
        // ------------------------
        return { safe: true };
    } catch (error: any) {
        console.error('Moderation API error:', error.message || error);
        return {
            safe: false,
            reason: 'Content moderation check failed. Please try again later.',
        };
    }
}
