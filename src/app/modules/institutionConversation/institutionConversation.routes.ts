import express from 'express';
import InstitutionConversationController from './institutionConversation.controller';
import validateRequest from '../../middlewares/validateRequest';
import InstitutionConversationValidation from './institutionConversation.validation';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();

router.post(
    '/create',
    auth(USER_ROLE.user),
    validateRequest(
        InstitutionConversationValidation.createInstitutionConversationSchema
    ),
    InstitutionConversationController.create
);

router.get(
    '/get-all/:id',
    auth(USER_ROLE.user),
    InstitutionConversationController.getAll
);

router.get(
    '/get-single/:id',
    auth(USER_ROLE.user),
    InstitutionConversationController.getById
);

router.patch(
    '/update/:id',
    auth(USER_ROLE.user),
    validateRequest(
        InstitutionConversationValidation.updateInstitutionConversationSchema
    ),
    InstitutionConversationController.update
);

router.delete(
    '/delete/:id',
    auth(USER_ROLE.user),
    InstitutionConversationController.remove
);

export const institutionConversationRoutes = router;
