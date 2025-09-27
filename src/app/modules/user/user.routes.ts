import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import normalUserValidations from '../normalUser/normalUser.validation';
import { USER_ROLE } from './user.constant';
import userControllers from './user.controller';
import userValidations from './user.validation';

const router = Router();

router.post(
    '/register-user',
    validateRequest(normalUserValidations.createNormalUserSchema),
    userControllers.registerUser
);

router.post(
    '/verify-code',
    validateRequest(userValidations.verifyCodeValidationSchema),
    userControllers.verifyCode
);

router.post(
    '/resend-verify-code',
    validateRequest(userValidations.resendVerifyCodeSchema),
    userControllers.resendVerifyCode
);

router.get(
    '/get-my-profile',
    auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin),
    userControllers.getMyProfile
);

router.patch(
    '/block-unblock/:id',
    auth(USER_ROLE.superAdmin),
    userControllers.changeUserStatus
);
router.delete(
    '/delete-account',
    auth(USER_ROLE.user),
    validateRequest(userValidations.deleteUserAccountValidationSchema),
    userControllers.deleteUserAccount
);

router.get(
    '/get-my-profile',
    auth(USER_ROLE.user, USER_ROLE.superAdmin),
    userControllers.getMyProfile
);

export const userRoutes = router;
