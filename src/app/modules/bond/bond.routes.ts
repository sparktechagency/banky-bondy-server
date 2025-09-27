import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import bondValidation from './bond.validation';
import bondController from './bond.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();

router.post(
    '/create',
    auth(USER_ROLE.user),
    validateRequest(bondValidation.createBondValidationSchema),
    bondController.createBond
);

router.get('/my-bonds', auth(USER_ROLE.user), bondController.getAllBonds);
router.get('/get-single-bond/:id', bondController.getSingleBond);
router.get(
    '/get-filter-items',
    auth(USER_ROLE.user),
    bondController.getFilterItemsForMatchingBond
);

router.patch(
    '/update/:id',
    auth(USER_ROLE.user),
    validateRequest(bondValidation.updateBondValidationSchema),
    bondController.updateBond
);

router.delete('/delete/:id', auth(USER_ROLE.user), bondController.deleteBond);

export const bondRoutes = router;
