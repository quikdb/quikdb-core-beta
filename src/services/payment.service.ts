import Stripe from 'stripe';
import paypal from 'paypal-rest-sdk';
import dotenv from 'dotenv';

dotenv.config();

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-10-28.acacia',
});

paypal.configure({
  mode: 'sandbox', // Change to 'live' in production
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

class PaymentService {
  async createStripePaymentIntent(amount: number): Promise<Stripe.PaymentIntent> {
    return await stripeInstance.paymentIntents.create({
      amount: amount * 100, // Stripe expects amount in cents
      currency: 'usd',
    });
  }

  async verifyStripePayment(paymentIntentId: string): Promise<Stripe.PaymentIntent | null> {
    return await stripeInstance.paymentIntents.retrieve(paymentIntentId);
  }

  createPayPalPayment(amount: number, currency: 'USD'): Promise<any> {
    return new Promise((resolve, reject) => {
      const create_payment_json = {
        intent: 'sale',
        payer: { payment_method: 'paypal' },
        redirect_urls: {
          return_url: 'http://localhost:5000/api/paypal/success',
          cancel_url: 'http://localhost:5000/api/paypal/cancel',
        },
        transactions: [
          {
            amount: { currency, total: amount.toFixed(2) },
            description: 'Credits Purchase',
          },
        ],
      };

      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) reject(error);
        else resolve(payment);
      });
    });
  }

  executePayPalPayment(paymentId: string, payerId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const execute_payment_json = {
        payer_id: payerId,
      };

      paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) reject(error);
        else resolve(payment);
      });
    });
  }

  async allocateCycles(userId: string, amount: number): Promise<void> {
    // Define conversion rate, e.g., 1 USD = 10,000 cycles
    const cycles = amount * 10000;
    // await UserService.updateCycles(userId, cycles);
  }
}

export default new PaymentService();
