import config from '../config';
import NormalUser from '../modules/normalUser/normalUser.model';

const handleSubscriptionPaymentSuccess = async (
    res: Response,
    userId: string,
    transactionId: string,
    amount: number
) => {
    let limit;
    if (amount == 10) {
        limit = 100;
    } else {
        limit = 1000;
    }

    await NormalUser.findByIdAndUpdate(
        userId,
        { $inc: { bondLimit: limit } },
        { new: true, runValidators: true }
    );
    return res.redirect(
        `${config.paypal.donation_success_url}?userId=${userId}&transaction_id=${transactionId}&amount=${amount}`
    );
};

export default handleSubscriptionPaymentSuccess;
