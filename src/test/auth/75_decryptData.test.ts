import { LogAction, LogStatus, StatusCode } from '@/@types';
import { NODE_ENV, API_BASE_URL, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER } from '@/config';
import request from 'supertest';
import { encryptedPassword, principalId, projectTokenRef } from '../constants.test';
import { CryptoUtils } from '@/utils';

const BASE_URL = NODE_ENV === 'production' ? API_BASE_URL : 'http://localhost:4567';

describe('Integration Test: Auth Module', () => {
  describe('[POST] /decrypt', () => {
    it('should decrypt user data.', async () => {
      const identity = JSON.stringify({
        principalId,
        encryptedPassword,
      });

      const encryptedData = CryptoUtils.aesEncrypt(identity, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

      const response = await request(BASE_URL).post('/a/decrypt').set('Authorization', projectTokenRef).send({
        data: encryptedData,
      });

      console.log('Test Response:', response.body);

      expect(response.body).toMatchObject({
        status: LogStatus.SUCCESS,
        code: StatusCode.OK,
        action: LogAction.ENCRYPT_DATA,
        message: 'data decrypted.',
      });
    }, 10000);
  });
});
