import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import friendRequestValidation from './friendRequest.validation';
import friendRequestController from './friendRequest.controller';

const router = express.Router();

router.post(
    '/send',
    auth(USER_ROLE.user),
    validateRequest(friendRequestValidation.createFriendRequestValidation),
    friendRequestController.sendFriendRequest
);

router.patch(
    '/accept-reject/:id',
    auth(USER_ROLE.user),
    validateRequest(
        friendRequestValidation.updateFriendRequestStatusValidation
    ),
    friendRequestController.acceptRejectRequest
);

router.get(
    '/friends',
    auth(USER_ROLE.user),
    friendRequestController.getFriends
);
router.get(
    '/followers',
    auth(USER_ROLE.user),
    friendRequestController.getFollowers
);
router.get(
    '/following',
    auth(USER_ROLE.user),
    friendRequestController.getFollowing
);

router.delete(
    '/cancel/:receiverId',
    auth(USER_ROLE.user),
    friendRequestController.cancelRequest
);
router.delete(
    '/unfriend/:friendId',
    auth(USER_ROLE.user),
    friendRequestController.unfriend
);

export const friendRequestRoutes = router;
