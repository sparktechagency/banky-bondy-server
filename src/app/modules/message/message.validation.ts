import { z } from "zod";

export const updateMessageData = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }),
});

const MessageValidations = { updateMessageData };
export default MessageValidations;