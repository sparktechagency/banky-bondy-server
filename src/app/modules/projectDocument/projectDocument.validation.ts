import { z } from 'zod';

export const updateProjectDocumentData = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }),
});

const ProjectDocumentValidations = { updateProjectDocumentData };
export default ProjectDocumentValidations;
