import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import TransactionController from './transaction.controller';

const router = express.Router();

router.get(
    '/all-transactions',
    auth(USER_ROLE.superAdmin, USER_ROLE.admin),
    TransactionController.getAllTransaction
);

export const transactionRoutes = router;
