import { DatabaseVersion, LogAction, LogStatus, StatusCode } from '@/@types';
import { ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER, NODE_ENV, API_BASE_URL } from '@/config';
import { CryptoUtils } from '@/utils';
import request from 'supertest';
import { projectId, testEmail, tokenForSamson } from '../constants.test';

const BASE_URL = NODE_ENV === 'production' ? API_BASE_URL : 'http://localhost:4567';
const token = tokenForSamson;

describe('Integration Test: Auth Module', () => {
  describe('[POST] /v/p/:data/token', () => {
    it('should create a project token for the logged in user.', async () => {
      const data = JSON.stringify({
        id: projectId,
      });

      const encryptedData = CryptoUtils.aesEncrypt(data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

      console.log({ encryptedData });

      const tokenData = JSON.stringify({
        email: testEmail,
        databaseVersion: DatabaseVersion.FREE,
        duration: 1000,
      });

      const encryptedTokenData = CryptoUtils.aesEncrypt(tokenData, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

      console.log({ encryptedTokenData });

      const response = await request(BASE_URL).post(`/v/p/${encryptedData}/token`).set('Authorization', token).send({
        data: encryptedTokenData,
      });

      console.log('Test Response:', response.body);

      expect(response.body).toMatchObject({
        status: LogStatus.SUCCESS,
        code: StatusCode.CREATED,
        action: LogAction.CREATE_PROJECT_TOKEN,
        message: 'token created.',
      });
    });
  });
});
