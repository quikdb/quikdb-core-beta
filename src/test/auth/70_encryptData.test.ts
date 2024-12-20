import { LogAction, LogStatus, StatusCode } from '@/@types';
import { NODE_ENV, API_BASE_URL } from '@/config';
import request from 'supertest';
import { encryptedPassword, principalId, projectTokenRef } from '../constants.test';

const BASE_URL = NODE_ENV === 'production' ? API_BASE_URL : 'http://localhost:4567';

describe('Integration Test: Auth Module', () => {
  describe('[POST] /encrypt', () => {
    it('should encrypt user data.', async () => {
      const identity = JSON.stringify({
        principalId,
        encryptedPassword,
      });

      const response = await request(BASE_URL).post('/a/encrypt').set('Authorization', projectTokenRef).send({ data: identity });

      console.log('Test Response:', response.body);

      expect(response.body).toMatchObject({
        status: LogStatus.SUCCESS,
        code: StatusCode.OK,
        action: LogAction.ENCRYPT_DATA,
        message: 'data encrypted.',
      });
    }, 10000);
  });
});
