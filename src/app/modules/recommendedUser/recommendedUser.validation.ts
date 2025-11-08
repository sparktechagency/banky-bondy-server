import { z } from "zod";

export const updateRecommendedUserData = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }),
});

const RecommendedUserValidations = { updateRecommendedUserData };
export default RecommendedUserValidations;