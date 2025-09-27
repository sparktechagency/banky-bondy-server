import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import ReportValidations from './report.validation';
import ReportController from './report.controller';

const router = express.Router();

router.post(
    '/create-report',
    auth(USER_ROLE.user),
    validateRequest(ReportValidations.reportValidationSchema),
    ReportController.createReport
);

router.get(
    '/all-reports',
    auth(USER_ROLE.superAdmin, USER_ROLE.admin),
    ReportController.getAllReports
);
router.delete(
    '/delete-report/:id',
    auth(USER_ROLE.superAdmin, USER_ROLE.admin),
    ReportController.deleteReport
);

export const reportRoutes = router;
