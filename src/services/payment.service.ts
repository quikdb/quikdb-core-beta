import Stripe from 'stripe';
import { ApiError as PaystackApiError, CheckoutPaymentIntent, Client, Environment, LogLevel, OrdersController } from '@paypal/paypal-server-sdk';
import axios from 'axios';
import { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_URL } from '@/config';
import { ApiError } from '@/utils';
import { PaymentMongoService } from './mongo.service';

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-11-20.acacia',
});

export class PaymentService {
  public static mongo = PaymentMongoService;
  private static paypalConfig = {
    clientCredentialsAuthCredentials: {
      oAuthClientId: PAYPAL_CLIENT_ID,
      oAuthClientSecret: PAYPAL_CLIENT_SECRET,
    },
    timeout: 0,
    environment: Environment.Sandbox,
    logging: {
      logLevel: LogLevel.Info,
      logRequest: {
        logBody: true,
      },
      logResponse: {
        logHeaders: true,
      },
    },
  };
  private static client = new Client(this.paypalConfig);

  private static ordersController = new OrdersController(this.client);

  static async getPaypalAccessToken() {
    const url = `${PAYPAL_URL}/v1/oauth2/token`;
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

    try {
      const response = await axios.post(url, 'grant_type=client_credentials', {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response.data.access_token;
    } catch (error) {
      console.error('Error obtaining PayPal access token:', error.response?.data || error.message);
      throw new ApiError('Failed to get PayPal OAuth token');
    }
  }

  static async createPaypalOrder(paypalOrderRequest: { amount: string }) {
    try {
      const token = await this.getPaypalAccessToken();
      const collect = {
        body: {
          intent: CheckoutPaymentIntent.Capture,
          purchaseUnits: [
            {
              amount: {
                currencyCode: 'USD',
                value: paypalOrderRequest.amount,
              },
            },
          ],
        },
        prefer: 'return=minimal',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      return await this.ordersController.ordersCreate(collect);
    } catch (error) {
      if (error instanceof PaystackApiError) {
        // const { statusCode, headers } = error;
        throw new ApiError(error.message, 'createPaypalOrder', error.statusCode);
      }
    }
  }

  static async capturePaypalOrder(orderID: string) {
    try {
      const token = await this.getPaypalAccessToken();
      const collect = {
        id: orderID,
        prefer: 'return=minimal',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      return await this.ordersController.ordersCapture(collect);
    } catch (error) {
      if (error instanceof PaystackApiError) {
        throw new ApiError(error.message, 'capturePaypalOrder', error.statusCode);
      }
    }
  }

  static async createStripePaymentIntent(amount: number): Promise<Stripe.PaymentIntent> {
    return await stripeInstance.paymentIntents.create({
      amount: amount * 100, // Stripe expects amount in cents
      currency: 'usd',
    });
  }

  static async verifyStripePayment(paymentIntentId: string): Promise<Stripe.PaymentIntent | null> {
    return await stripeInstance.paymentIntents.retrieve(paymentIntentId);
  }
}
