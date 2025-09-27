import { z } from 'zod';

const createDonateSchema = z.object({
    body: z.object({
        amount: z
            .number({ required_error: 'Amount is required' })
            .positive({ message: 'Amount must be positive' }),
    }),
});

export const DonateValidations = {
    createDonateSchema,
};
