import { z } from 'zod';
import { ENUM_JOIN_CONTROLL } from './project.enum';

export const createProjectValidationSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required' }),
        description: z.string({ required_error: 'Description is required' }),
        isPublic: z.boolean({ required_error: 'isPublic is required' }),
        joinControll: z.enum(
            Object.values(ENUM_JOIN_CONTROLL) as [string, ...string[]]
        ),
    }),
});

export const updateProjectValidationSchema = z.object({
    body: z
        .object({
            name: z.string().optional(),
            description: z.string().optional(),
            isPublic: z.boolean().optional(),
            joinControll: z.enum(
                Object.values(ENUM_JOIN_CONTROLL) as [string, ...string[]]
            ),
            // status: z.enum(
            //     Object.values(ENUM_PROJECT_STATUS) as [string, ...string[]]
            // ),
        })
        .refine((data) => Object.keys(data).length > 0, {
            message: 'At least one field must be provided for update',
        }),
});

const ProjectValidations = {
    createProjectValidationSchema,
    updateProjectValidationSchema,
};

export default ProjectValidations;
