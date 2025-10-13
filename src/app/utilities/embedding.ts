import OpenAI from 'openai';

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // keep it secret in .env
});

export const generateEmbedding = async (text: string): Promise<number[]> => {
    if (!text || !text.trim()) return [];
    const response = await client.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
    });
    return response.data[0].embedding;
};
