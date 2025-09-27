import { z } from 'zod';

export const createRelativeValidationSchema = z.object({
    body: z.object({
        relative: z
            .string({ required_error: 'Relative ID is required' })
            .length(24, 'Invalid relative ID'),
        relation: z.string({ required_error: 'Relation is required' }),
    }),
});

export const updateRelativeValidationSchema = z.object({
    body: z
        .object({
            relative: z.string().length(24).optional(),
            relation: z.string().optional(),
        })
        .refine((data) => Object.keys(data).length > 0, {
            message: 'At least one field must be provided for update',
        }),
});

const RelativeValidations = {
    createRelativeValidationSchema,
    updateRelativeValidationSchema,
};

export default RelativeValidations;
