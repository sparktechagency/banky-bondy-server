/* eslint-disable @typescript-eslint/no-explicit-any */
// export default capturePayPalPayment;

import paypal from '@paypal/checkout-server-sdk';
import { Request, Response } from 'express';
import { ENUM_PAYMENT_PURPOSE } from '../utilities/enum';
import paypalClient from '../utilities/paypal';
import handleDonationPaymentSuccess from './handleDonationPaymentSuccess';
import handleSubscriptionPaymentSuccess from './handleSubscriptionPayment';
//
const capturePayPalPayment = async (req: Request, res: Response) => {
    const orderId = req.query.token;
    try {
        const captureRequest: any = new paypal.orders.OrdersCaptureRequest(
            orderId as string
        );
        // capture payment
        captureRequest.requestBody({});
        const captureResponse = await paypalClient.execute(captureRequest);
        if (captureResponse.result.status !== 'COMPLETED') {
            console.error('Payment Capture Failed:', captureResponse);
            return res.redirect(`${process.env.PAYPAL_CANCEL_URL}`);
        }
        const orderRequest = new paypal.orders.OrdersGetRequest(
            orderId as string
        );
        const orderResponse = await paypalClient.execute(orderRequest);

        const purchaseUnit = orderResponse.result.purchase_units[0];
        const id = purchaseUnit.custom_id || 'UNKNOWN_CAMPAIGN';
        const paymentPurpose = purchaseUnit.reference_id || 'UNKNOWN_PURPOSE';
        const transactionId = captureResponse.result.id;
        const amount = purchaseUnit.amount.value;

        if (paymentPurpose === ENUM_PAYMENT_PURPOSE.DONATE) {
            await handleDonationPaymentSuccess(res, id, transactionId, amount);
        } else if (paymentPurpose === ENUM_PAYMENT_PURPOSE.SUBSCRIPTION) {
            await handleSubscriptionPaymentSuccess(
                res,
                id,
                transactionId,
                amount
            );
        }
    } catch (error) {
        console.error('PayPal Capture Error:', error);
        return res.redirect(`${process.env.PAYPAL_CANCEL_URL}`);
    }
};

export default capturePayPalPayment;
