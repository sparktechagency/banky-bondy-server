// /* eslint-disable no-useless-escape */
// import OpenAI from 'openai';

// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
// });

// // Custom rules
// const MONEY_REGEX =
//     /\b(?:usd|ars|eur|gbp|bdt|inr|jpy|cny|aud|cad|sgd|dollar|dollars|taka|rupee|peso|yen|euro|libra|franco|real|koruna|forint|lei|shekel|dirham|baht|ruble|sol|lira|moneda)\b|[\$\€\£\¥\₹\৳₽₩₺฿₪₫₴]/i;

// const SEXUAL_REGEX = /\b(sex|porn|xxx|nude|erotic|adult|nsfw)\b/i;
// const VIOLENCE_REGEX =
//     /\b(kill|murder|shoot|assault|bomb|attack|terrorist|abuse)\b/i;
// const HATE_REGEX = /\b(racist|hate|discriminate|kill [a-z]+|attack [a-z]+)\b/i;

// // Detect standalone numbers (potential money)
// const NUMBER_REGEX = /\b\d{2,}\b/; // 2 or more digits

// const CUSTOM_RULES: { regex: RegExp; reason: string }[] = [
//     { regex: MONEY_REGEX, reason: 'Money-related content is not allowed.' },
//     { regex: SEXUAL_REGEX, reason: 'Sexual or adult content is not allowed.' },
//     { regex: VIOLENCE_REGEX, reason: 'Violent content is not allowed.' },
//     {
//         regex: HATE_REGEX,
//         reason: 'Hate speech or discriminatory content is not allowed.',
//     },
// ];

// /**
//  * Check if text is safe
//  */
// export async function isTextSafe(
//     text: string
// ): Promise<{ safe: boolean; reason?: string }> {
//     try {
//         // Step 1: Run custom rules for obvious forbidden words
//         for (const rule of CUSTOM_RULES) {
//             if (rule.regex.test(text)) {
//                 return { safe: false, reason: rule.reason };
//             }
//         }

//         // Step 2: Check numbers for potential money context
//         const numbers = text.match(NUMBER_REGEX);
//         if (numbers && numbers.length > 0) {
//             // Ask OpenAI if the text implies money
//             const moderationPrompt = `
// Does the following text imply money, payment, or currency?
// If yes, flag it.
// If no, allow it. Only numbers that clearly mean something else like "100 pieces" or "5000 meters" are allowed.

// Text: "${text}"
// Answer "Yes" if money, "No" if not money.
//             `;

//             const response = await openai.chat.completions.create({
//                 model: 'gpt-4o-mini',
//                 messages: [{ role: 'user', content: moderationPrompt }],
//                 temperature: 0,
//             });

//             const answer =
//                 response.choices?.[0]?.message?.content?.trim().toLowerCase() ||
//                 '';
//             if (answer.startsWith('yes')) {
//                 return {
//                     safe: false,
//                     reason: 'Text contains potential money-related content.',
//                 };
//             }
//         }

//         // Step 3: Run OpenAI moderation API for everything else (sexual, violence, hate, etc.)
//         const modResponse = await openai.moderations.create({
//             model: 'omni-moderation-latest',
//             input: text,
//         });

//         const result = modResponse.results?.[0];
//         if (result?.flagged) {
//             const flaggedCategories = Object.entries(result.categories || {})
//                 .filter(([_, flagged]) => flagged)
//                 .map(([category]) => category.replace(/\//g, ' '))
//                 .join(', ');

//             return {
//                 safe: false,
//                 reason: `Text flagged for: ${flaggedCategories}.`,
//             };
//         }

//         return { safe: true };
//     } catch (error: any) {
//         console.error('Moderation API error:', error.message || error);
//         return {
//             safe: false,
//             reason: 'Content moderation check failed. Please try again later.',
//         };
//     }
// }

import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
async function isAuthorizedByIntent(text: string) {
    const prompt = `
You are a strict content authorization system.

This app allows ONLY:
- Non-monetary exchanges
- Legal items or skills
- No money, drugs, weapons, sex, violence, hate, scams

Block the text if it:
- Mentions money or payment
- Involves drugs, alcohol, weapons
- Is sexual, violent, hateful
- Is illegal or unethical
- Looks like a trade for money
- If the text contains ONLY a number (e.g. "100", "5000") with NO context 

Text: "${text}"

Answer ONLY:
ALLOW
or
BLOCK
`;

    const res = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
    });

    return res.choices[0].message.content?.trim();
}

const HARD_BLOCK_WORDS = {
    sexual: [
        'porn',
        'xxx',
        'nude',
        'nudity',
        'erotic',
        'sex',
        'nsfw',
        'adult',
        'fetish',
        'strip',
        'prostitute',
        'escort',
        'bdsm',
    ],
    drugs: [
        'cocaine',
        'heroin',
        'weed',
        'ganja',
        'marijuana',
        'meth',
        'lsd',
        'ecstasy',
        'opioid',
        'hash',
        'alcohol',
        'beer',
        'wine',
        'amphetamine',
        'cannabis',
        'cigar',
        'tobacco',
        'morphine',
    ],
    weapons: [
        'gun',
        'guns',
        'pistol',
        'rifle',
        'shotgun',
        'ak-47',
        'ak47',
        'knife',
        'weapon',
        'firearm',
        'ammo',
        'bullet',
        'grenade',
        'explosive',
        'sword',
        'dagger',
        'bomb',
        'bazooka',
        'crossbow',
    ],
    violence: [
        'kill',
        'killing',
        'murder',
        'assault',
        'rape',
        'bomb',
        'terrorist',
        'attack',
        'explosion',
        'slaughter',
        'torture',
        'lynch',
        'behead',
        'shooting',
        'massacre',
        'abuse',
    ],
    money: [
        'payment',
        'price',
        'cost',
        'buy',
        'sell',
        'cash',
        'money',
        'salary',
        'fee',
        'paid',
        'earning',
        'income',
        'rent',
        'donate',
        'loan',
        'credit',
        'debt',
        'tax',
        'fund',
        'taka',
        'পয়সা',
    ],
    scams: [
        'scam',
        'fraud',
        'cheat',
        'hack',
        'phishing',
        'fake',
        'ponzi',
        'bribe',
        'counterfeit',
        'ripoff',
        'swindle',
        'con',
        'spam',
        'mislead',
        'trick',
        'extortion',
    ],
    illegal: [
        'human trafficking',
        'child abuse',
        'smuggling',
        'piracy',
        'cybercrime',
        'money laundering',
        'bribery',
        'forgery',
        'identity theft',
        'trafficking',
        'illegal',
        'unlawful',
    ],
    hate: [
        'racist',
        'hate',
        'discriminate',
        'kill [a-z]+',
        'attack [a-z]+',
        'bigot',
        'supremacist',
        'antisemitic',
        'xenophobia',
        'homophobic',
    ],
    self_harm: [
        'suicide',
        'cutting',
        'hang',
        'overdose',
        'self harm',
        'end my life',
        'kill myself',
    ],
    hacking_cyber: [
        'hack',
        'exploit',
        'virus',
        'malware',
        'trojan',
        'ddos',
        'ransomware',
        'keylogger',
        'crack',
        'phish',
        'botnet',
    ],
};

const HARD_BLOCK_REGEX = new RegExp(
    `\\b(${Object.values(HARD_BLOCK_WORDS).flat().join('|')})\\b`,
    'i'
);

export async function isTextSafe(text: string) {
    // 1️⃣ Hard block
    if (HARD_BLOCK_REGEX.test(text)) {
        return { safe: false, reason: 'Unauthorized content detected.' };
    }

    // 2️⃣ Intent-based authorization
    const intent = await isAuthorizedByIntent(text);
    if (intent !== 'ALLOW') {
        return {
            safe: false,
            reason: 'Content not authorized for this platform.',
        };
    }

    // 3️⃣ OpenAI moderation safety net
    const mod = await openai.moderations.create({
        model: 'omni-moderation-latest',
        input: text,
    });

    if (mod.results[0]?.flagged) {
        return { safe: false, reason: 'Content violates safety policies.' };
    }

    return { safe: true };
}
