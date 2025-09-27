import { z } from 'zod';
import { ENUM_GROUP } from './institutionMember.enum';

export const updateInstitutionMemberData = z.object({
    body: z.object({
        group: z.enum(Object.values(ENUM_GROUP) as [string, ...string[]]),
        designation: z.string({ required_error: 'Designation is required' }),
    }),
});

const InstitutionMemberValidations = { updateInstitutionMemberData };
export default InstitutionMemberValidations;
