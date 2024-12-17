import { LogAction, LogStatus, StatusCode } from '@/@types';
import { ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER, NODE_ENV, API_BASE_URL } from '@/config';
import { CryptoUtils } from '@/utils';
import request from 'supertest';
import { tokenForSamson } from '../constants.test';

const BASE_URL = NODE_ENV === 'production' ? API_BASE_URL : 'http://localhost:4567';
const token = tokenForSamson;

describe('Integration Test: Project Module', () => {
  describe('[POST] /v/p/:data', () => {
    it('should delete a project token for the logged in user.', async () => {
      const data = JSON.stringify({
        id: '675bac3cd48f767082d3e585',
      });

      const encryptedData = CryptoUtils.aesEncrypt(data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

      console.log({ encryptedData });

      const response = await request(BASE_URL).delete(`/v/p/${encryptedData}/token`).set('Authorization', token);

      console.log('Test Response:', response.body);

      expect(response.body).toMatchObject({
        status: LogStatus.SUCCESS,
        code: StatusCode.OK,
        action: LogAction.DELETE_PROJECT_TOKEN,
      });
    }, 10000);
  });
});