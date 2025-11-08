/* eslint-disable @typescript-eslint/no-explicit-any */
import config from '../config';
import { ENUM_SUBSCRIPTION_TYPE } from '../modules/normalUser/normalUser.enum';
import NormalUser from '../modules/normalUser/normalUser.model';

const handleSubscriptionPaymentSuccess = async (
    res: any,
    userId: string,
    transactionId: string,
    amount: number
) => {
    let limit;
    let subscriptionType;
    if (amount == 10) {
        limit = 100;
        subscriptionType = ENUM_SUBSCRIPTION_TYPE.Standard;
    } else {
        limit = 1000;
        subscriptionType = ENUM_SUBSCRIPTION_TYPE.Premium;
    }

    await NormalUser.findByIdAndUpdate(
        userId,
        { subscriptionType: subscriptionType, $inc: { bondLimit: limit } },
        { new: true, runValidators: true }
    );
    return res.redirect(
        `${config.paypal.donation_success_url}?userId=${userId}&transaction_id=${transactionId}&amount=${amount}`
    );
};

export default handleSubscriptionPaymentSuccess;
