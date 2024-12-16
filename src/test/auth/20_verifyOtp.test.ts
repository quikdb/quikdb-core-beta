import { LogAction, LogStatus, OtpRequestType, StatusCode } from '@/@types';
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
        OTPType: OtpRequestType.PASSWORD,
        otp: '123456',
      });

      const encryptedData = CryptoUtils.aesEncrypt(data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

      console.log({ encryptedData });

      const response = await request(BASE_URL).post('/a/verifyOtp').send({
        data: 'e122845edfb70f510c82b08ef2e806e54d96d0f170dfaa5be1321003878b316b673c811ad7b2e511c01d81c3f4ab17aa26152dc1a6d5976e4fcc88b70a162eda174f506af7b67e09662206019a378e81cc9ce9b36068e6492d7e6e92f9bf4938',
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
