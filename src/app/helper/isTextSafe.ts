/* eslint-disable no-useless-escape */
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Custom rules
const MONEY_REGEX =
    /\b(?:usd|ars|eur|gbp|bdt|inr|jpy|cny|aud|cad|sgd|dollar|dollars|taka|rupee|peso|yen|euro|libra|franco|real|koruna|forint|lei|shekel|dirham|baht|ruble|sol|lira|moneda)\b|[\$\€\£\¥\₹\৳₽₩₺฿₪₫₴]/i;

const SEXUAL_REGEX = /\b(sex|porn|xxx|nude|erotic|adult|nsfw)\b/i;
const VIOLENCE_REGEX =
    /\b(kill|murder|shoot|assault|bomb|attack|terrorist|abuse)\b/i;
const HATE_REGEX = /\b(racist|hate|discriminate|kill [a-z]+|attack [a-z]+)\b/i;

// Detect standalone numbers (potential money)
const NUMBER_REGEX = /\b\d{2,}\b/; // 2 or more digits

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
 * Check if text is safe
 */
export async function isTextSafe(
    text: string
): Promise<{ safe: boolean; reason?: string }> {
    try {
        // Step 1: Run custom rules for obvious forbidden words
        for (const rule of CUSTOM_RULES) {
            if (rule.regex.test(text)) {
                return { safe: false, reason: rule.reason };
            }
        }

        // Step 2: Check numbers for potential money context
        const numbers = text.match(NUMBER_REGEX);
        if (numbers && numbers.length > 0) {
            // Ask OpenAI if the text implies money
            const moderationPrompt = `
Does the following text imply money, payment, or currency? 
If yes, flag it. 
If no, allow it. Only numbers that clearly mean something else like "100 pieces" or "5000 meters" are allowed. 

Text: "${text}"
Answer "Yes" if money, "No" if not money.
            `;

            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: moderationPrompt }],
                temperature: 0,
            });

            const answer =
                response.choices?.[0]?.message?.content?.trim().toLowerCase() ||
                '';
            if (answer.startsWith('yes')) {
                return {
                    safe: false,
                    reason: 'Text contains potential money-related content.',
                };
            }
        }

        // Step 3: Run OpenAI moderation API for everything else (sexual, violence, hate, etc.)
        const modResponse = await openai.moderations.create({
            model: 'omni-moderation-latest',
            input: text,
        });

        const result = modResponse.results?.[0];
        if (result?.flagged) {
            const flaggedCategories = Object.entries(result.categories || {})
                .filter(([_, flagged]) => flagged)
                .map(([category]) => category.replace(/\//g, ' '))
                .join(', ');

            return {
                safe: false,
                reason: `Text flagged for: ${flaggedCategories}.`,
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
