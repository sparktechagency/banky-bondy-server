import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import projectMemberController from './projectMember.controller';
import validateRequest from '../../middlewares/validateRequest';
import ProjectMemberValidations from './projectMember.validation';

const router = express.Router();

router.get(
    '/get-project-members/:id',
    auth(USER_ROLE.user),

    projectMemberController.getAllProjectMember
);
router.post(
    '/add-member/:id',
    auth(USER_ROLE.user),
    validateRequest(ProjectMemberValidations.addMemberValidationSchema),
    projectMemberController.addMember
);
router.delete(
    '/remove-member/:id',
    auth(USER_ROLE.user),
    projectMemberController.removeMember
);

export const projectMemberRoutes = router;
