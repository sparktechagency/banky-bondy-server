import { z } from 'zod';
import { Types } from 'mongoose';

const ObjectIdSchema = (fieldName: string) =>
    z
        .string({ required_error: `${fieldName} is required` })
        .min(1, `${fieldName} cannot be empty`)
        .refine((val) => Types.ObjectId.isValid(val), {
            message: `${fieldName} must be a valid ObjectId`,
        });

const createCommentSchema = z.object({
    body: z.object({
        institutionConversation: ObjectIdSchema('Institution conversation  id'),
        text: z
            .string()
            .trim()
            .min(1, { message: 'Text is required' })
            .max(500, { message: 'Text cannot exceed 500 characters' }),
    }),
});
const updateCommentValidationSchema = z.object({
    body: z.object({
        text: z
            .string()
            .trim()
            .min(1, { message: 'Text is required' })
            .max(500, { message: 'Text cannot exceed 500 characters' })
            .optional(),
    }),
});

const createReplySchema = z.object({
    body: z.object({
        parent: ObjectIdSchema('Parent comment id'),
        text: z
            .string()
            .trim()
            .min(1, { message: 'Text is required' })
            .max(500, { message: 'Text cannot exceed 500 characters' }),
    }),
});

const CommentValidations = {
    createCommentSchema,
    createReplySchema,
    updateCommentValidationSchema,
};

export default CommentValidations;
