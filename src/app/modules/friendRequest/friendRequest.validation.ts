import { z } from 'zod';
import { ENUM_FRIEND_REQUEST_STATUS } from './friendRequest.enum';

const createFriendRequestValidation = z.object({
    body: z.object({
        receiver: z.string({ required_error: 'Receiver is required' }),
    }),
});

const updateFriendRequestStatusValidation = z.object({
    body: z.object({
        status: z.enum(
            Object.values(ENUM_FRIEND_REQUEST_STATUS) as [string, ...string[]]
        ),
    }),
});

const friendRequestValidation = {
    createFriendRequestValidation,
    updateFriendRequestStatusValidation,
};

export default friendRequestValidation;
