import { LogAction, LogStatus, StatusCode } from '@/@types';
import { ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER, NODE_ENV, API_BASE_URL } from '@/config';
import { CryptoUtils } from '@/utils';
import request from 'supertest';
import { tokenForII } from '../constants.test';

const BASE_URL = NODE_ENV === 'production' ? API_BASE_URL : 'http://localhost:4567';
const token = tokenForII;

describe('Integration Test: Auth Module', () => {
  describe('[POST] /v/p', () => {
    it('should create a project.', async () => {
      const data = JSON.stringify({
        id: 'quikdb',
      });

      const encryptedData = CryptoUtils.aesEncrypt(data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

      console.log({ encryptedData });

      const response = await request(BASE_URL).post('/v/p').set('Authorization', token).send({
        data: encryptedData,
      });

      console.log('Test Response:', response.body);

      expect(response.body).toMatchObject({
        status: LogStatus.SUCCESS,
        code: StatusCode.CREATED,
        action: LogAction.CREATE_PROJECT,
        message: 'project created.',
      });
    }, 10000);
  });
});
