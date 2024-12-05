import { LogAction, LogStatus, StatusCode } from '@/@types';
import { ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER, NODE_ENV, API_BASE_URL } from '@/config';
import { CryptoUtils } from '@/utils';
import request from 'supertest';
import { testEmail } from '../constants.test';

const BASE_URL = NODE_ENV === 'production' ? API_BASE_URL : 'http://localhost:4567';

// const BASE_URL = API_BASE_URL;

describe('Integration Test: Auth Module', () => {
  describe('[POST] /signupWithEP', () => {
    it('should register the email and password of the user.', async () => {
      const data = JSON.stringify({
        email: testEmail,
        password: 'password',
      });

      const encryptedData = CryptoUtils.aesEncrypt(data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

      console.log({ encryptedData });

      const response = await request(BASE_URL).post('/a/signupWithEP').send({
        data: encryptedData,
      });

      console.log('Test Response:', response.body);

      expect(response.body).toMatchObject({
        status: LogStatus.SUCCESS,
        code: StatusCode.CREATED,
        action: LogAction.SIGNUP,
        message: 'signup success.',
      });
    }, 20000);
  });
});
