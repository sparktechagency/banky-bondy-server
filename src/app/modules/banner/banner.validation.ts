import { z } from 'zod';

export const createBannerValidationSchema = z.object({
    body: z.object({
        image: z.string({ required_error: 'Image is required' }).optional(),
    }),
});

const BannerValidations = { createBannerValidationSchema };
export default BannerValidations;
