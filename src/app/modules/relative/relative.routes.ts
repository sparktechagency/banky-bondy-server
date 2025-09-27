import express from 'express';

import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import RelativeController from './relative.controller';
import validateRequest from '../../middlewares/validateRequest';
import RelativeValidations from './relative.validation';

const router = express.Router();

// Route to create a new relative
router.post(
    '/add-relative',
    auth(USER_ROLE.user),
    validateRequest(RelativeValidations.createRelativeValidationSchema),
    RelativeController.createRelative
);

// Route to get all relatives
router.get(
    '/all-relatives',
    auth(USER_ROLE.user),
    RelativeController.getAllRelatives
);

// Route to get a relative by ID
router.get(
    '/single-relative/:relativeId',
    auth(USER_ROLE.user),
    RelativeController.getRelativeById
);

// Route to update a relative by ID
router.patch(
    '/update-relative/:relativeId',
    auth(USER_ROLE.user),
    validateRequest(RelativeValidations.updateRelativeValidationSchema),
    RelativeController.updateRelative
);

// Route to delete a relative by ID
router.delete(
    '/delete-relative/:relativeId',
    auth(USER_ROLE.user),
    RelativeController.deleteRelative
);

export const relativeRoutes = router;
