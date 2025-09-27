import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import ConversationController from './conversation.controller';

const router = express.Router();

router.get(
    '/get-chat-list',
    auth(USER_ROLE.user),
    ConversationController.getChatList
);
router.get(
    '/get-media-files/:id',
    auth(USER_ROLE.user),
    ConversationController.getConversationMediaFiles
);
export const conversationRoutes = router;
