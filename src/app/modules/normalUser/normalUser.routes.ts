import express, { NextFunction, Request, Response } from 'express';
import { uploadFile } from '../../helper/mutler-s3-uploader';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import NormalUserController from './normalUser.controller';
import normalUserValidations from './normalUser.validation';

const router = express.Router();

router.patch(
    '/update-profile',
    auth(USER_ROLE.user),
    uploadFile(),
    (req: Request, res: Response, next: NextFunction) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    },
    validateRequest(normalUserValidations.updateNormalUserData),
    NormalUserController.updateUserProfile
);

router.get(
    '/get-all-user',
    auth(USER_ROLE.superAdmin, USER_ROLE.user),
    NormalUserController.getAllUser
);

router.get(
    '/single-user/:id',
    auth(USER_ROLE.superAdmin, USER_ROLE.user),
    NormalUserController.getSingleUser
);

router.post(
    '/subscribe',
    auth(USER_ROLE.user),
    validateRequest(normalUserValidations.subscriptionValidationSchema),
    NormalUserController.purchaseSubscription
);

export const normalUserRoutes = router;
