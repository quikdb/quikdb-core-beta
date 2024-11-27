import { LogAction, LogStatus, StatusCode } from '@/@types';
import { ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER, NODE_ENV } from '@/config';
import { CryptoUtils } from '@/utils';
import request from 'supertest';

const BASE_URL = NODE_ENV === 'production' ? process.env.API_BASE_URL : 'http://localhost:4567';

describe('Integration Test: Auth Module', () => {
  describe('[POST] /signinWithEP', () => {
    it('should sign in with the email and password of the user.', async () => {
      const data = JSON.stringify({
        email: 'samsonajulor@gmail.com',
        password: 'password',
      });

      const encryptedData = CryptoUtils.aesEncrypt(data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

      console.log({ encryptedData });

      const response = await request(BASE_URL).post('/a/signinWithEP').send({
        data: encryptedData,
      });

      console.log('Test Response:', response.body);

      expect(response.body).toMatchObject({
        status: LogStatus.SUCCESS,
        code: StatusCode.OK,
        action: LogAction.SIGNIN,
        message: 'signin success.',
      });
    });
  });
});
