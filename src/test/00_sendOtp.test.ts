import { LogAction, LogStatus, StatusCode } from '@/@types';
import { NODE_ENV, API_BASE_URL, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER } from '@/config';
import { CryptoUtils } from '@/utils';
import request from 'supertest';

// const BASE_URL = API_BASE_URL;
const BASE_URL = NODE_ENV === 'production' ? API_BASE_URL : 'http://localhost:4567';

describe('Integration Test: Auth Module', () => {
  describe('[POST] /sendOtp', () => {
    it('should send one time password', async () => {
      const data = JSON.stringify({
        email: 'samsonajulor@gmail.com',
        OTPType: 'signup',
      });

      const encryptedData = CryptoUtils.aesEncrypt(data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

      console.log({ encryptedData });

      const response = await request(BASE_URL).post('/a/sendOtp').send({
        data: encryptedData,
      });

      console.log('Test Response:', response.body);

      expect(response.body).toMatchObject({
        status: LogStatus.SUCCESS,
        code: StatusCode.OK,
        action: LogAction.SEND,
        message: 'otp sent.',
      });
    }, 20000);
  });
});
