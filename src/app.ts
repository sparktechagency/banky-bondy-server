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

// web hook for stripe---------------
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
            'http://localhost:3001',
            'http://localhost:3002',
            'http://localhost:3003',
            'http://localhost:3004',
            'http://localhost:3005',
            'http://localhost:3006',
            'http://localhost:3007',
            'http://localhost:3008',
            'http://10.10.20.70:3000',
            'https://emilioroo-integration.vercel.app',
            'https://emilioroo-dashboard-integration.vercel.app',
        ],
        credentials: true,
    })
);
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
