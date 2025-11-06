import { Response } from 'express';
import httpStatus from 'http-status';
import config from '../config';
import AppError from '../error/appError';

import { ENUM_DONATE_STATUS } from '../modules/donate/donate.enum';
import { Donate } from '../modules/donate/donate.model';

const handleDonationPaymentSuccess = async (
    res: Response,
    donationId: string,
    transactionId: string,
    amount: number
) => {
    const donation = await Donate.findById(donationId);
    if (!donation) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Donation not found, Payment completed but donation missing. Please contact support.'
        );
    }

    // 1️⃣ Update payment status
    donation.status = ENUM_DONATE_STATUS.Paid;

    await donation.save();

    // 6️⃣ Redirect back to frontend success page
    return res.redirect(
        `${config.paypal.donation_success_url}?donationId=${donationId}&transaction_id=${transactionId}&amount=${amount}`
    );
};

export default handleDonationPaymentSuccess;
