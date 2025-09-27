import { z } from 'zod';
import { ENUM_PROJECT_JOIN_REQEST_STATUS } from './projectJoinRequest.enum';

export const acceptRejectValidationSchema = z.object({
    body: z.object({
        status: z.enum(
            Object.values(ENUM_PROJECT_JOIN_REQEST_STATUS) as [
                string,
                ...string[],
            ]
        ),
    }),
});

const ProjectJoinRequestValidations = { acceptRejectValidationSchema };
export default ProjectJoinRequestValidations;
