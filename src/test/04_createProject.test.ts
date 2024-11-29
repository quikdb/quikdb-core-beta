import { LogAction, LogStatus, ProjectVersion, StatusCode } from '@/@types';
import { ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER, NODE_ENV, API_BASE_URL } from '@/config';
import { CryptoUtils } from '@/utils';
import request from 'supertest';

const BASE_URL = NODE_ENV === 'production' ? API_BASE_URL : 'http://localhost:4567';
const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNhbXNvbmFqdWxvckBnbWFpbC5jb20iLCJpYXQiOjE3MzI4NjA1NjgsImV4cCI6MTc0MTUwMDU2OH0.T2UaDAJ3h4JlCmzP-Zsa8KUVmfUYs510HO8wVOgQ06Q';

describe('Integration Test: Auth Module', () => {
  describe('[POST] /v/p', () => {
    it('should create a project.', async () => {
      const data = JSON.stringify({
        id: 'quikdb',
        type: ProjectVersion.FREE,
      });

      const encryptedData = CryptoUtils.aesEncrypt(data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

      console.log({ encryptedData });

      const response = await request(BASE_URL).post('/v/p').set('Authorization', token).send({
        data: encryptedData,
      });

      console.log('Test Response:', response.body);

      // Update expected response to match project creation
      expect(response.body).toMatchObject({
        status: LogStatus.SUCCESS,
        code: StatusCode.OK,
        action: LogAction.CREATE_PROJECT,
        message: 'Project created.',
      });
    });
  });
});
