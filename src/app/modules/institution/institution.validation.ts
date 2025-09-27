import { z } from 'zod';
import { ENUM_GROUP } from '../institutionMember/institutionMember.enum';

export const createInstitutionValidationSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required' }),
        description: z.string({ required_error: 'Description is required' }),
        groupOneName: z
            .string({
                required_error: 'Group one name is required',
            })
            .optional(),
        groupTwoName: z
            .string({
                required_error: 'Group two name is required',
            })
            .optional(),
        facebookLink: z.string().url().optional(),
        instagramLink: z.string().url().optional(),
    }),
});

export const updateInstitutionValidationSchema = z.object({
    body: z
        .object({
            name: z.string().optional(),
            description: z.string().optional(),
            groupOneName: z.string().optional(),
            groupTwoName: z.string().optional(),
            facebookLink: z.string().url().optional(),
            instagramLink: z.string().url().optional(),
        })
        .refine((data) => Object.keys(data).length > 0, {
            message: 'At least one field must be provided for update',
        }),
});

const joinInstitutionValidationSchema = z.object({
    body: z.object({
        group: z
            .enum(Object.values(ENUM_GROUP) as [string, ...string[]])
            .optional(),
        designation: z
            .string({ required_error: 'Designation is required' })
            .optional(),
        institution: z
            .string({ required_error: 'Insitution id is required' })
            .optional(),
    }),
});

const InstitutionValidations = {
    createInstitutionValidationSchema,
    updateInstitutionValidationSchema,
    joinInstitutionValidationSchema,
};

export default InstitutionValidations;
