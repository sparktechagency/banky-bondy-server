import { z } from 'zod';

const createInstitutionConversationSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required' }),
        ussers: z.array(z.string()).optional(),
        likers: z.array(z.string()).optional(),
        institution: z.string({ required_error: 'Institution id is required' }),
    }),
});

const updateInstitutionConversationSchema = z.object({
    body: z
        .object({
            name: z.string().optional(),
            isPublic: z.boolean().optional(),
            ussers: z.array(z.string()).optional(),
            likers: z.array(z.string()).optional(),
        })
        .refine((data) => Object.keys(data).length > 0, {
            message: 'At least one field must be provided for update',
        }),
});

const InstitutionConversationValidation = {
    createInstitutionConversationSchema,
    updateInstitutionConversationSchema,
};

export default InstitutionConversationValidation;
