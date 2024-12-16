import { LogAction, LogStatus, StatusCode } from '@/@types';
import { ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER, NODE_ENV, API_BASE_URL } from '@/config';
import { CryptoUtils } from '@/utils';
import request from 'supertest';
import { testEmail } from '../constants.test';

const BASE_URL = NODE_ENV === 'production' ? API_BASE_URL : 'http://localhost:4567';

// const BASE_URL = API_BASE_URL;

describe('Integration Test: Auth Module', () => {
  describe('[POST] /verifyOtp', () => {
    it('should verify the one time password', async () => {
      const data = JSON.stringify({
        email: testEmail,
        OTPType: 'password',
        otp: '123456',
      });

      const encryptedData = CryptoUtils.aesEncrypt(data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

      console.log({ encryptedData });

      const response = await request(BASE_URL).post('/a/verifyOtp').send({
        data: encryptedData,
      });

      console.log('Test Response:', response.body);

      expect(response.body).toMatchObject({
        status: LogStatus.SUCCESS,
        code: StatusCode.OK,
        action: LogAction.VERIFY_OTP,
        message: 'otp verified.',
      });
    }, 10000);
  });
});
