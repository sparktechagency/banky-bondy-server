/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import Stripe from 'stripe';
import config from '../config';
import handlePaymentSuccess from './handlePaymentSuccess';

const stripe = new Stripe(config.stripe.stripe_secret_key as string);
const handleWebhook = async (req: Request, res: Response) => {
    const endpointSecret = config.stripe.webhook_endpoint_secret;
    const sig = req.headers['stripe-signature'];
    try {
        // Verify the event
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig as string,
            endpointSecret as string
        );

        // Handle different event types
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;

                const paymentIntentId = session.payment_intent;

                // Optionally, retrieve more details about the payment intent (e.g., amount, status)
                const paymentIntent = await stripe.paymentIntents.retrieve(
                    paymentIntentId as string
                );

                await handlePaymentSuccess(
                    session.metadata,
                    paymentIntent.id,
                    paymentIntent.amount / 100
                );
                // Perform any post-payment actions, like updating your database
                // Example: Activate the collaboration or update the status

                break;
            }

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.status(200).send('Success');
    } catch (err: any) {
        console.error('Webhook error:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
};

export default handleWebhook;
