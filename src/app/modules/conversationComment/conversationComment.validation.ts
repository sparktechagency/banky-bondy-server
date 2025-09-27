import { z } from 'zod';

const createCommentSchema = z.object({
    body: z.object({
        institutionConversation: z.string({
            required_error: 'InstitutionConversation ID is required',
        }),
        comment: z.string({ required_error: 'Comment is required' }),
        likers: z.array(z.string()).optional(),
    }),
});

const updateCommentSchema = z.object({
    body: z
        .object({
            comment: z.string().optional(),
            likers: z.array(z.string()).optional(),
        })
        .refine((data) => Object.keys(data).length > 0, {
            message: 'At least one field must be provided for update',
        }),
});

const ConversationCommentValidation = {
    createCommentSchema,
    updateCommentSchema,
};

export default ConversationCommentValidation;
