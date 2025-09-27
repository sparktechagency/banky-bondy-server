import { z } from 'zod';

export const updateSuperAdminSchema = z.object({
    name: z.string().optional(),
    email: z
        .string()
        .email('Invalid email format')
        .nonempty('Email is required')
        .optional(),
    profile_image: z.string().optional().default(''),
});

const superAdminValidations = {
    updateSuperAdminSchema,
};

export default superAdminValidations;
