import { LogAction, LogStatus, StatusCode } from '@/@types';
import { ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER, NODE_ENV, API_BASE_URL } from '@/config';
import { CryptoUtils } from '@/utils';
import request from 'supertest';
import { projectId, tokenForSamuel } from '../constants.test';

const BASE_URL = NODE_ENV === 'production' ? API_BASE_URL : 'http://localhost:4567';
const token = tokenForSamuel;

describe('Integration Test: Auth Module', () => {
  describe('[POST] /v/p/:data/token', () => {
    it('should create a project token for the logged in user.', async () => {
      const data = JSON.stringify({
        id: projectId,
      });

      const encryptedData = CryptoUtils.aesEncrypt(data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

      console.log({ encryptedData });

      const response = await request(BASE_URL).get(`/v/p/${encryptedData}/token`).set('Authorization', token);

      console.log('Test Response:', response.body.data.tokens);

      expect(response.body).toMatchObject({
        status: LogStatus.SUCCESS,
        code: StatusCode.OK,
        action: LogAction.FETCH_PROJECT_TOKEN,
      });
    }, 10000);
  });
});
