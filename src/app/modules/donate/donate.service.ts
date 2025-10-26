/* eslint-disable @typescript-eslint/no-explicit-any */
import paypal from '@paypal/checkout-server-sdk';
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import config from '../../config';
import AppError from '../../error/appError';
import {
    ENUM_PAYMENT_PURPOSE,
    ENUM_PAYMENT_STATUS,
} from '../../utilities/enum';
import paypalClient from '../../utilities/paypal';
import { Donate } from './donate.model';
const donate = async (userId: string, amount: number) => {
    const result = await Donate.create({ user: userId, amount: amount });
    // const session = await stripe.checkout.sessions.create({
    //     payment_method_types: ['card'],
    //     line_items: [
    //         {
    //             price_data: {
    //                 currency: 'nzd',
    //                 product_data: {
    //                     name: 'Donation',
    //                 },
    //                 unit_amount: Math.round(amount * 100),
    //             },
    //             quantity: 1,
    //         },
    //     ],
    //     mode: 'payment',
    //     metadata: {
    //         userId: userId.toString(),
    //         paymentPurpose: ENUM_PAYMENT_PURPOSE.DONATE,
    //         donateId: donateCreate._id.toString(),
    //     },
    //     success_url: `${config.stripe.stripe_payment_success_url}`,
    //     cancel_url: `${config.stripe.stripe_payment_cancel_url}`,
    // });

    const totalAmount = amount;

    try {
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer('return=representation');
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'USD',
                        value: totalAmount.toFixed(2),
                    },
                    description: `Payment for Donation: ${result._id}`,
                    custom_id: result._id.toString(),
                    reference_id: ENUM_PAYMENT_PURPOSE.DONATE,
                },
            ],
            application_context: {
                brand_name: 'Your Business Name',
                landing_page: 'LOGIN',
                user_action: 'PAY_NOW',
                return_url: `${config.paypal.payment_capture_url}`,
                cancel_url: `${config.paypal.donation_cancel_url}`,
            },
        });

        const response = await paypalClient.execute(request);
        const approvalUrl = response.result.links.find(
            (link: any) => link.rel === 'approve'
        )?.href;

        if (!approvalUrl) {
            throw new AppError(
                httpStatus.INTERNAL_SERVER_ERROR,
                'PayPal payment creation failed: No approval URL found'
            );
        }

        return { url: approvalUrl };
    } catch (error) {
        console.error('PayPal Payment Error:', error);
        throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to create PayPal order'
        );
    }
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
