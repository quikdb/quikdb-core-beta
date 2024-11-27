import { LogAction, LogStatus, StatusCode } from '@/@types';
import { ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER } from '@/config';
import { CryptoUtils } from '@/utils';
import request from 'supertest';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:4567';

describe('Integration Test: Auth Module', () => {
  describe('[POST] /verifyOtp', () => {
    it('should verify the one time password', async () => {
      const data = JSON.stringify({
        email: 'samsonajulor@gmail.com',
        OTPType: 'signup',
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
        message: 'email otp verified.',
      });
    });
  });
});
