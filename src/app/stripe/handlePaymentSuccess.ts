/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import httpStatus from 'http-status';
import AppError from '../error/appError';
import { Donate } from '../modules/donate/donate.model';
import NormalUser from '../modules/normalUser/normalUser.model';
import Transaction from '../modules/transaction/transaction.model';
import {
    ENUM_PAYMENT_PURPOSE,
    ENUM_PAYMENT_STATUS,
    ENUM_TRANSACTION_TYPE,
} from '../utilities/enum';

const handlePaymentSuccess = async (
    metaData: any,
    transactionId: string,
    amount: number
) => {
    if (metaData.paymentPurpose == ENUM_PAYMENT_PURPOSE.DONATE) {
        await handleDonateSuccess(
            metaData.userId,
            transactionId,
            amount,
            metaData.donateId
        );
    }
};

const handleDonateSuccess = async (
    userId: string,
    transactionId: string,
    amount: number,
    donateId: string
) => {
    const normalUser = await NormalUser.findById(userId);
    if (!normalUser) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    const result = await Donate.findByIdAndUpdate(donateId, {
        status: ENUM_PAYMENT_STATUS.PAID,
    });

    console.log('result', result);

    await Transaction.create({
        user: normalUser?._id,
        email: normalUser?.email,
        type: ENUM_TRANSACTION_TYPE.DONATION,
        amount: amount,
        transactionId,
    });
};

export default handlePaymentSuccess;
