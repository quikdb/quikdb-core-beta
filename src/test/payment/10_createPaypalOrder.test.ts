import { DatabaseVersion, LogAction, LogStatus, StatusCode } from '@/@types';
import { NODE_ENV, API_BASE_URL } from '@/config';
import request from 'supertest';
import { projectId, tokenForII } from '../constants.test';

const BASE_URL = NODE_ENV === 'production' ? API_BASE_URL : 'http://localhost:4567';
const token = tokenForII;

describe('Integration Test: Payment Module', () => {
  describe('[POST] /v/pay', () => {
    it('should create an order for paypal.', async () => {
      const data = {
        amount: 10,
        databaseVersion: DatabaseVersion.PREMIUM,
        projectId,
      };

      const response = await request(BASE_URL)
        .post('/v/pay')
        .set('Authorization', token)
        .send({
          ...data,
        });

      console.log('Test Response:', JSON.stringify(response.body));

      expect(response.body).toMatchObject({
        status: LogStatus.SUCCESS,
        code: StatusCode.CREATED,
        action: LogAction.CREATE_PAYPAL_ORDER,
        message: 'order created.',
      });
    }, 10000);
  });
});
