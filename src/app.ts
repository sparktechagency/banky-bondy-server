/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
import sendContactUsEmail from './app/helper/sendContactUsEmail';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';
import handleWebhook from './app/stripe/webhook';
const app: Application = express();

// web hook for stripe-------------------------
app.post(
    '/banky-bondy-webhook',
    express.raw({ type: 'application/json' }),
    handleWebhook
);
// parser
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: [
            'http://localhost:5173',
            'http://localhost:3000',
            'http://10.10.20.70:3000',
            'https://emilioroo-integration.vercel.app',
            'https://emilioroo-dashboard-integration.vercel.app',
            'https://bankybondy.com',
            'http://bankybondy.com',
            'https://www.bankybondy.com',
            'http://www.bankybondy.com',
            'https://admin.bankybondy.com',
            'http://admin.bankybondy.com',
            'http://192.168.0.100:3000',
        ],
        // origin: '*',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);
//
app.use('/uploads', express.static('uploads'));
// application routers ----------------
app.use('/', router);
app.post('/contact-us', sendContactUsEmail);

app.get('/', async (req, res) => {
    res.send({ message: 'Welcome to dance club server' });
});

// global error handler
app.use(globalErrorHandler);
// not found
app.use(notFound);

export default app;
