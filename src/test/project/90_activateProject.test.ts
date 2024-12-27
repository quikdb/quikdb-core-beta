import { LogAction, LogStatus, StatusCode } from '@/@types';
import { ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER, NODE_ENV, API_BASE_URL } from '@/config';
import { CryptoUtils } from '@/utils';
import request from 'supertest';
import { canisterId, databaseVersion, principalId, projectId, tokenForSamson } from '../constants.test';

const BASE_URL = NODE_ENV === 'production' ? API_BASE_URL : 'http://localhost:4567';
const token = tokenForSamson;

describe('Integration Test: Auth Module', () => {
  describe('[POST] /v/p', () => {
    it('should activate a project.', async () => {
      const unencryptedProjectId = JSON.stringify({
        id: projectId,
      });

      const encryptedProjectId = CryptoUtils.aesEncrypt(unencryptedProjectId, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

      console.log({ encryptedProjectId });
      const data = JSON.stringify({
        databaseVersion,
        url: '127.0.0.1',
        canisterId,
        controllers: [principalId],
      });

      const encryptedData = CryptoUtils.aesEncrypt(data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

      console.log({ encryptedData });

      const response = await request(BASE_URL).post(`/v/p/${encryptedProjectId}/activate`).set('Authorization', token).send({
        data: encryptedData,
      });

      console.log('Test Response:', response.body);

      expect(response.body).toMatchObject({
        status: LogStatus.SUCCESS,
        code: StatusCode.OK,
        action: LogAction.ACTIVATE_PROJECT,
        message: 'activation successful.',
      });
    }, 10000);
  });
});
