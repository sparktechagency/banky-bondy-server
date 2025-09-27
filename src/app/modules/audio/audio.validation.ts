import { z } from 'zod';

export const createAudioValidationSchema = z.object({
    body: z.object({
        audioTopic: z.string().length(24, 'Invalid audioTopic ID'),
        title: z.string({ required_error: 'Title is required' }),
        description: z.string({ required_error: 'Description is required' }),
        cover_image: z.string().optional(),
        tags: z.array(z.string()).optional(),
        totalPlay: z.number().optional(),
        duration: z.number({ required_error: 'Duration is required' }),
    }),
});

export const updateAudioValidationSchema = z.object({
    body: z
        .object({
            audioTopic: z.string().length(24).optional(),
            title: z.string().optional(),
            description: z.string().optional(),
            cover_image: z.string().optional(),
            tags: z.array(z.string()).optional(),
            totalPlay: z.number().optional(),
            duration: z.number().optional(),
        })
        .refine((data) => Object.keys(data).length > 0, {
            message: 'At least one field must be provided for update',
        }),
});

const AudioValidations = {
    createAudioValidationSchema,
    updateAudioValidationSchema,
};

export default AudioValidations;
