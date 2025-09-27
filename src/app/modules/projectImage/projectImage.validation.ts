import { z } from "zod";

export const updateProjectImageData = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }),
});

const ProjectImageValidations = { updateProjectImageData };
export default ProjectImageValidations;