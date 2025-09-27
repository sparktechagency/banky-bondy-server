import express from 'express';
import ConversationCommentController from './conversationComment.controller';
import validateRequest from '../../middlewares/validateRequest';
import ConversationCommentValidation from './conversationComment.validation';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();

router.post(
    '/create',
    auth(USER_ROLE.user),
    validateRequest(ConversationCommentValidation.createCommentSchema),
    ConversationCommentController.create
);

router.get(
    'get-all/',
    auth(USER_ROLE.user),
    ConversationCommentController.getAll
);

router.patch(
    '/update/:id',
    auth(USER_ROLE.user),
    validateRequest(ConversationCommentValidation.updateCommentSchema),
    ConversationCommentController.update
);

router.delete(
    '/delete/:id',
    auth(USER_ROLE.user),
    ConversationCommentController.remove
);

export const conversationCommentRoutes = router;
