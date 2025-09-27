import { z } from 'zod';

import { ENUM_BOND_LINK_STATUS } from './bondLink.enum';

export const createBondLinkSchema = z.object({
    body: z.object({
        name: z.string({
            required_error: 'Name is required',
        }),
        participants: z
            .array(z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId'))
            .optional(),
        requestedBonds: z
            .array(z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId'))
            .optional(),
        status: z
            .enum(Object.values(ENUM_BOND_LINK_STATUS) as [string, ...string[]])
            .optional(),
    }),
});

const BondLinkValidations = { createBondLinkSchema };
export default BondLinkValidations;
