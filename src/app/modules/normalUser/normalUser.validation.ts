import { z } from 'zod';
import { ENUM_GENDER } from '../user/user.enum';

export const createNormalUserSchema = z.object({
    body: z.object({
        password: z
            .string({ required_error: 'Password is required' })
            .min(6, { message: 'Password must be at least 6 characters' }),
        confirmPassword: z
            .string({ required_error: 'Confirm password is required' })
            .min(6, { message: 'Password must be at least 6 characters' }),
        name: z.string({
            required_error: 'Name is required',
            invalid_type_error: 'Name must be a string',
        }),
        email: z.string().email('Invalid email format'),
        phone: z.string().optional(),
        profile_image: z.string().optional(),
        cover_image: z.string().optional(),
        gender: z
            .enum(Object.values(ENUM_GENDER) as [string, ...string[]])
            .optional(),
        dateOfBirth: z.string().optional(),
        address: z.string().optional(),
        bio: z.string().optional(),
    }),
});

export const updateNormalUserData = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        profile_image: z.string().optional(),
        cover_image: z.string().optional(),
        gender: z
            .enum(Object.values(ENUM_GENDER) as [string, ...string[]])
            .optional(),
        dateOfBirth: z.string().optional(),
        address: z.string().optional(),
        bio: z.string().optional(),
    }),
});

const subscriptionValidationSchema = z.object({
    body: z.object({
        type: z.enum(['Premium', 'Standard']),
    }),
});

const normalUserValidations = {
    createNormalUserSchema,
    updateNormalUserData,
    subscriptionValidationSchema,
};

export default normalUserValidations;
