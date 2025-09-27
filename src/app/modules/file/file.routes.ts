import express from 'express';
import { uploadFile } from '../../helper/mutler-s3-uploader';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import fileController from './file.controller';

const router = express.Router();

router.post(
    '/upload-conversation-files',
    auth(USER_ROLE.user),
    uploadFile(),
    fileController.uploadConversationFiles
);
router.post(
    '/delete-files',
    auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin),
    fileController.deleteFiles
);

export const fileUploadRoutes = router;
