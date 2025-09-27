import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import feedbackValidations from './feedback.validation';
import feedbackController from './feedback.controller';

const router = express.Router();

router.post(
    '/create-feedback',
    auth(USER_ROLE.user),
    validateRequest(feedbackValidations.createFeedbackValidationSchema),
    feedbackController.createFeedBack
);

router.get(
    '/all-feedbacks',
    auth(USER_ROLE.superAdmin),
    feedbackController.getAllFeedback
);

router.put(
    '/reply-feedback/:id',
    auth(USER_ROLE.superAdmin),
    validateRequest(feedbackValidations.updateFeedbackValidationSchema),
    feedbackController.replyFeedback
);

router.delete(
    '/delete-feedback/:id',
    auth(USER_ROLE.superAdmin),
    feedbackController.deleteFeedback
);

export const feedbackRoutes = router;
