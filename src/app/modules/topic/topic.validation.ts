import { z } from 'zod';
const createTopicValidationSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required' }),
    }),
});
const updateTopicValidationSchema = z.object({
    body: z.object({
        name: z.string().optional(),
    }),
});

const TopicValidations = {
    createTopicValidationSchema,
    updateTopicValidationSchema,
};
export default TopicValidations;
