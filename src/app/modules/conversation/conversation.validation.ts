import { z } from "zod";

export const updateConversationData = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }),
});

const ConversationValidations = { updateConversationData };
export default ConversationValidations;