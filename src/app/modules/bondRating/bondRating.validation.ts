import { z } from 'zod';

export const addRatingValidation = z.object({
    body: z.object({
        userId: z.string({ required_error: 'User id is required' }),
        bondLink: z.string({ required_error: 'Bond link id is required' }),
        rating: z
            .number({ required_error: 'Rating is required' })
            .min(1)
            .max(5),
    }),
});

const BondRatingValidations = { addRatingValidation };
export default BondRatingValidations;
