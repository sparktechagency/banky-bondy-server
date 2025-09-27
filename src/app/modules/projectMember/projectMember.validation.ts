import { z } from 'zod';
import { ENUM_PROJECT_MUMBER_TYPE } from './projectMumber.enum';

export const addMemberValidationSchema = z.object({
    body: z.object({
        user: z.string({ required_error: 'User id required' }),
        type: z.enum(
            Object.values(ENUM_PROJECT_MUMBER_TYPE) as [string, ...string[]]
        ),
    }),
});

const ProjectMemberValidations = { addMemberValidationSchema };
export default ProjectMemberValidations;
