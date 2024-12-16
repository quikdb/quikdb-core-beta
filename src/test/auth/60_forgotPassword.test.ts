import { LogAction, LogStatus, StatusCode } from '@/@types';
import { NODE_ENV, API_BASE_URL, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER } from '@/config';
import request from 'supertest';
import { CryptoUtils } from '@/utils';
import { tokenForSamson } from '../constants.test';

const BASE_URL = NODE_ENV === 'production' ? API_BASE_URL : 'http://localhost:4567';
const token = tokenForSamson;

describe('Integration Test: Auth Module', () => {
  describe('[POST] /forgotPassword', () => {
    it('should update the user"s password.', async () => {
      const data = JSON.stringify({
        password: 'password',
      });

      const encryptedData = CryptoUtils.aesEncrypt(data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

      console.log({ encryptedData });

      const response = await request(BASE_URL)
        .post('/a/forgotPassword')
        .send({
          data: encryptedData,
        })
        .set('authorization', token);

      console.log('Test Response:', response.body);

      expect(response.body).toMatchObject({
        status: LogStatus.SUCCESS,
        code: StatusCode.OK,
        action: LogAction.FORGOT_PASSWORD,
        message: 'password updated.',
      });
    }, 10000);
  });
});
