import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import MetaController from './meta.controller';

const router = express.Router();

router.get(
    '/get-meta-data',
    auth(USER_ROLE.superAdmin, USER_ROLE.admin),
    MetaController.getDashboardMetaData
);

router.get(
    '/user-chart-data',
    auth(USER_ROLE.superAdmin, USER_ROLE.admin),
    MetaController.getUserChartData
);
router.get(
    '/donor-chart-data',
    auth(USER_ROLE.superAdmin, USER_ROLE.admin),
    MetaController.donorGrowthChartData
);
router.get(
    '/institution-chart-data',
    auth(USER_ROLE.superAdmin, USER_ROLE.admin),
    MetaController.getInstitutionChartData
);
router.get(
    '/audio-pie-chart',
    auth(USER_ROLE.superAdmin, USER_ROLE.admin),
    MetaController.getAudioPieChartData
);
router.get(
    '/bond-chart-data',
    auth(USER_ROLE.superAdmin, USER_ROLE.admin),
    MetaController.bondChartData
);
router.get(
    '/earning-chart-data',
    auth(USER_ROLE.superAdmin, USER_ROLE.admin),
    MetaController.getEarningChartData
);

export const metaRoutes = router;
