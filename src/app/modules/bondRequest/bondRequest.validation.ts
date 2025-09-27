import { z } from 'zod';

const createBondRequestValidationSchema = z.object({
    body: z.object({
        offer: z.string({ required_error: 'Give is required' }),
        want: z.string({ required_error: 'Get is required' }),
        radius: z.number({ required_error: 'Radius is required' }).optional(),
    }),
});

const updateBondRequestValidationSchema = z.object({
    body: z.object({
        offer: z.string().optional(),
        want: z.string().optional(),
        radius: z.number().optional().optional(),
    }),
});

const bondRequestValidation = {
    createBondRequestValidationSchema,
    updateBondRequestValidationSchema,
};

export default bondRequestValidation;
