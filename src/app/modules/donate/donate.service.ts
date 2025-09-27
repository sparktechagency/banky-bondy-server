import QueryBuilder from '../../builder/QueryBuilder';
import config from '../../config';
import {
    ENUM_PAYMENT_PURPOSE,
    ENUM_PAYMENT_STATUS,
} from '../../utilities/enum';
import { stripe } from '../../utilities/stripe';
import { Donate } from './donate.model';

const donate = async (userId: string, amount: number) => {
    const donateCreate = await Donate.create({ user: userId, amount: amount });
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'nzd',
                    product_data: {
                        name: 'Donation',
                    },
                    unit_amount: Math.round(amount * 100),
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        metadata: {
            userId: userId.toString(),
            paymentPurpose: ENUM_PAYMENT_PURPOSE.DONATE,
            donateId: donateCreate._id.toString(),
        },
        success_url: `${config.stripe.stripe_payment_success_url}`,
        cancel_url: `${config.stripe.stripe_payment_cancel_url}`,
    });

    return { url: session.url };
};

const getAllDonner = async (query: Record<string, unknown>) => {
    const resultQuery = new QueryBuilder(
        Donate.find({ status: ENUM_PAYMENT_STATUS.PAID }).populate({
            path: 'user',
        }),
        query
    )
        .search(['name'])
        .fields()
        .filter()
        .paginate()
        .sort();

    const result = await resultQuery.modelQuery;
    const meta = await resultQuery.countTotal();
    return {
        meta,
        result,
    };
};

export const DonateService = {
    donate,
    getAllDonner,
};
