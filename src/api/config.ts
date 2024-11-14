import axios from 'axios';
import { PAYPAL_URL, STRIPE_URL } from '../config';

/***
 * axios configuration calls
 * depending on the call invoked, an axios instance is created
 * to enable ease of use of api across the codebase
 */

const configs = {
  /**
   * @description paystack config
   */
  paypal() {
    const api = axios.create({
      baseURL: PAYPAL_URL as string,
      headers: {
        Authorization: `Bearer ${''}`,
      },
    });

    return api;
  },
  /**
   * @stripe smile config
   */
  stripe() {
    const api = axios.create({
      baseURL: STRIPE_URL as string,
      headers: {
        Authorization: `Bearer ${''}`,
      },
    });

    return api;
  },
};

export default configs;
