import express from 'express';
import { USER_ROLE } from '../user/user.constant';
import auth from '../../middlewares/auth';
import productBookmarkController from './audio.bookmark.controller';

const router = express.Router();

router.post(
    '/add-delete/:id',
    auth(USER_ROLE.user),
    productBookmarkController.audioBookmarkAddDelete
);
router.get(
    '/my-bookmark-audios',
    auth(USER_ROLE.user),
    productBookmarkController.getMyBookmark
);

export const audioBookmarkRoutes = router;
