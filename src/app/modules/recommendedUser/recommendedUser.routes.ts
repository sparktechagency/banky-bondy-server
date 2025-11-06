import express from 'express';
import recommendedUserController from './recommendedUser.controller';

const router = express.Router();

router.get('/get', recommendedUserController.getRecommendedUsers);

export const recommendedUserRoutes = router;
