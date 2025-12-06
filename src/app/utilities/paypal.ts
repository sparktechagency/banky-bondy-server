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
