import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import institutionMemberController from './institutionMember.controller';

const router = express.Router();

router.get(
    '/all-member/:id',
    auth(USER_ROLE.user, USER_ROLE.superAdmin, USER_ROLE.admin),
    institutionMemberController.getAllInstitutionMember
);
router.delete(
    '/remove-member/:id',
    auth(USER_ROLE.user),
    institutionMemberController.removeMember
);

export const institutionMemberRoutes = router;
