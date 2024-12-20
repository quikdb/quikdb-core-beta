import request from 'supertest';
import path from 'path';
import { API_BASE_URL, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER, NODE_ENV } from '@/config';
import { CryptoUtils } from '@/utils';
import { projectId, tokenForII } from '../constants.test';
import { LogAction, LogStatus, StatusCode } from '@/@types';

const BASE_URL = NODE_ENV === 'production' ? API_BASE_URL : 'http://localhost:4567';
const token = tokenForII;

describe('Integration Test: Project Module', () => {
  describe('[POST] /v/p/:data/code', () => {
    it('should upload a project code for the logged-in user along with a file.', async () => {
      const data = JSON.stringify({
        id: projectId,
      });

      const encryptedData = CryptoUtils.aesEncrypt(data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

      console.log({ encryptedData });

      const filePath = path.join(__dirname, './dist.zip');

      const response = await request(BASE_URL).put(`/v/p/${encryptedData}/code`).set('Authorization', token).attach('file', filePath);

      expect(response.body).toMatchObject({
        status: LogStatus.SUCCESS,
        code: StatusCode.OK,
        action: LogAction.UPLOAD_PROJECT_CODE,
        message: 'file upload success.',
      });
    }, 10000);
  });
});
