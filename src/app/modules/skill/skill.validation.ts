import { z } from 'zod';

export const createSkillValidationSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required' }),
    }),
});
export const updateSkillValidationSchema = z.object({
    body: z.object({
        name: z.string().optional(),
    }),
});

const SkillValidations = {
    createSkillValidationSchema,
    updateSkillValidationSchema,
};
export default SkillValidations;
