import { LogAction, LogStatus, StatusCode } from '@/@types';
import { NODE_ENV, API_BASE_URL, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER } from '@/config';
import { CryptoUtils } from '@/utils';
import request from 'supertest';

const BASE_URL = NODE_ENV === 'production' ? API_BASE_URL : 'http://localhost:4567';

describe('Integration Test: Auth Module', () => {
  describe('[POST] /signinWithII', () => {
    it('should sign in with the internet identity.', async () => {
      const data = JSON.stringify({
        principalId: 'icp-user',
      });

      const encryptedData = CryptoUtils.aesEncrypt(data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

      console.log({ encryptedData });

      const response = await request(BASE_URL).post('/a/signinWithII').send({
        data: encryptedData,
      });

      console.log('Test Response:', response.body);

      expect(response.body).toMatchObject({
        status: LogStatus.SUCCESS,
        code: StatusCode.OK,
        action: LogAction.SIGNIN,
        message: 'signin success.',
      });
    }, 10000);
  });
});
