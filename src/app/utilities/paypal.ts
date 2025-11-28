// import paypal from 'paypal-rest-sdk';
// import config from '../config';

// interface PayPalConfig {
//   mode: 'sandbox' | 'live';
//   client_id: string;
//   client_secret: string;
// }
// console.log(config.paypal.client_id);
// const paypalConfig: PayPalConfig = {
//   mode: (config.paypal.mode as 'sandbox' | 'live') || 'sandbox',
//   client_id: config.paypal.client_id || '',
//   client_secret: config.paypal.client_secret || '',
// };

// if (!paypalConfig.client_id || !paypalConfig.client_secret) {
//   throw new Error(
//     '🚨 PayPal Client ID or Secret is missing from environment variables.',
//   );
// }

// paypal.configure(paypalConfig);

// export default paypal;

// import paypal from '@paypal/checkout-server-sdk';
// import config from '../config';

// const environment =
//   config.paypal.mode === 'live'
//     ? new paypal.core.LiveEnvironment(
//         config.paypal.client_id as string,
//         config.paypal.client_secret as string,
//       )
//     : new paypal.core.SandboxEnvironment(
//         config.paypal.client_id as string,
//         config.paypal.client_secret as string,
//       );

// const paypalClient = new paypal.core.PayPalHttpClient(environment);

// export default paypalClient;

import { core } from '@paypal/checkout-server-sdk';
import config from '../config';

// Set up PayPal environment
const environment =
    config.paypal.mode == 'live'
        ? new core.LiveEnvironment(
              config.paypal.client_id as string,
              config.paypal.client_secret as string
          )
        : new core.SandboxEnvironment(
              config.paypal.client_id as string,
              config.paypal.client_secret as string
          );

const paypalClient = new core.PayPalHttpClient(environment);

export default paypalClient;
