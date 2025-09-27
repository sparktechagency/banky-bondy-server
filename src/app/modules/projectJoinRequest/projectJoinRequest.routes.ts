import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import projectJoinRequestController from './projectJoinRequest.controller';
import validateRequest from '../../middlewares/validateRequest';
import ProjectJoinRequestValidations from './projectJoinRequest.validation';
import ProjectJoinRequestController from './projectJoinRequest.controller';

const router = express.Router();

router.post(
    '/send-request/:id',
    auth(USER_ROLE.user),
    projectJoinRequestController.sendJoinRequest
);

router.patch(
    '/approve-reject/:id',
    auth(USER_ROLE.user),
    validateRequest(ProjectJoinRequestValidations.acceptRejectValidationSchema),
    ProjectJoinRequestController.approveRejectRequest
);

router.get(
    '/get-join-requests/:id',
    auth(USER_ROLE.user),
    ProjectJoinRequestController.getJoinRequests
);

export const projectJoinRequestRoutes = router;
