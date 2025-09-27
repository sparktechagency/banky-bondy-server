import { z } from 'zod';
const ObjectIdSchema = z
    .string()
    .refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
        message: 'Invalid ObjectId format',
    });
export const createChatGroupData = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required'),
        participants: z
            .array(ObjectIdSchema)
            .min(2, 'A chat group must have at least 2 participants'),
    }),
});
export const updateChatGroupData = z.object({
    body: z.object({
        name: z.string().optional(),
    }),
});

const addMemberValidationSchema = z.object({
    body: z.object({
        memberId: z.string({ required_error: 'Member id is required' }),
    }),
});

const ChatGroupValidations = {
    createChatGroupData,
    addMemberValidationSchema,
    updateChatGroupData,
};
export default ChatGroupValidations;
