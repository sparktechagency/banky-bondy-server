import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import audioTopicController from './audio-topic.controller';
import { uploadFile } from '../../helper/fileUploader';
import audioTopicValidations from './audio-topic.validation';

const router = express.Router();

router.post(
    '/create',
    auth(USER_ROLE.user),
    uploadFile(),
    (req, res, next) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    },
    validateRequest(audioTopicValidations.createAudioTopicSchema),
    audioTopicController.createAudioTopic
);

router.patch(
    '/update/:id',
    auth(USER_ROLE.user),
    uploadFile(),
    (req, res, next) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    },
    validateRequest(audioTopicValidations.updateAudioTopicSchema),
    audioTopicController.updateAudioTopic
);

router.delete(
    '/delete/:id',
    auth(USER_ROLE.user),
    audioTopicController.deleteAudioTopic
);

router.get(
    '/get-all',
    auth(USER_ROLE.user),
    audioTopicController.getAllAudioTopics
);

router.get(
    '/get-single/:id',
    auth(USER_ROLE.user),
    audioTopicController.getSingleAudioTopic
);

export const audioTopicRoutes = router;
