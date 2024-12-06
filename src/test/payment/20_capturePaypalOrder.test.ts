import { LogAction, LogStatus, StatusCode } from '@/@types';
import { NODE_ENV, API_BASE_URL } from '@/config';
import request from 'supertest';
import { tokenForSamson } from '../constants.test';

const BASE_URL = NODE_ENV === 'production' ? API_BASE_URL : 'http://localhost:4567';
const token = tokenForSamson;

describe('Integration Test: Auth Module', () => {
  describe('[POST] /v/p/:data', () => {
    it('should fetch a project for the logged in user.', async () => {
      const OrderID = '5W396947RM787023U';

      const response = await request(BASE_URL).get(`/v/pay/${OrderID}`).set('Authorization', token);

      console.log('Test Response:', response.body);

      expect(response.body).toMatchObject({
        status: LogStatus.SUCCESS,
        code: StatusCode.OK,
        action: LogAction.CAPTURE_PAYPAL_ORDER,
        message: 'order captured.',
      });
    }, 10000);
  });
});
