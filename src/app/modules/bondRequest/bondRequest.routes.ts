import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import bondRequestValidation from './bondRequest.validation';
import bondRequestController from './bondRequest.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();

router.post(
    '/create',
    auth(USER_ROLE.user),
    validateRequest(bondRequestValidation.createBondRequestValidationSchema),
    bondRequestController.createBondRequest
);

router.get('/all-bond-requests', bondRequestController.getAllBondRequests);
router.get(
    '/my-bond-requests',
    auth(USER_ROLE.user),
    bondRequestController.getMyBondRequests
);
router.get(
    '/get-single-bond-request/:id',
    bondRequestController.getSingleBondRequest
);

router.patch(
    '/update/:id',
    auth(USER_ROLE.user),
    validateRequest(bondRequestValidation.updateBondRequestValidationSchema),
    bondRequestController.updateBondRequest
);

router.delete(
    '/delete/:id',
    auth(USER_ROLE.user),
    bondRequestController.deleteBondRequest
);
router.get(
    '/matching-bond',
    auth(USER_ROLE.user),
    bondRequestController.getMatchingBondRequest
);

export const bondRequestRoutes = router;
