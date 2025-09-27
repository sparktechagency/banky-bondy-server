import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import AdminController from './admin.controller';
import AdminValidations from './admin.validation';

const router = Router();

router.post(
    '/create-admin',
    auth(USER_ROLE.superAdmin),
    validateRequest(AdminValidations.registerAdminValidationSchema),
    AdminController.createAdmin
);

router.patch(
    '/update-admin/:id',
    auth(USER_ROLE.superAdmin),
    validateRequest(AdminValidations.updateAdminProfileValidationSchema),
    AdminController.updateAdminProfile
);

router.delete(
    '/delete-admin/:id',
    auth(USER_ROLE.superAdmin),
    AdminController.deleteAdmin
);

router.get(
    '/all-admins',
    auth(USER_ROLE.superAdmin),
    AdminController.getAllAdmin
);
router.get(
    '/single-admin/:id',
    auth(USER_ROLE.superAdmin),
    AdminController.getSingleAdmin
);

export const AdminRoutes = router;
