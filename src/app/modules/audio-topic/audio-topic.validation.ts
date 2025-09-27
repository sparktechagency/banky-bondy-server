import { z } from 'zod';

export const createAudioTopicSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required'),
    }),
});

export const updateAudioTopicSchema = z.object({
    body: z.object({
        name: z.string().min(1).optional(),
    }),
});

const audioTopicValidations = {
    createAudioTopicSchema,
    updateAudioTopicSchema,
};
export default audioTopicValidations;
