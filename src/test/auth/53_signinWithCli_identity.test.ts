import { LogAction, LogStatus, StatusCode } from '@/@types';
import { NODE_ENV, API_BASE_URL, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER } from '@/config';
import request from 'supertest';
import { encryptedPassword, principalId, projectTokenRef } from '../constants.test';
import { CryptoUtils } from '@/utils';

const BASE_URL = NODE_ENV === 'production' ? API_BASE_URL : 'http://localhost:4567';

describe('Integration Test: Auth Module', () => {
  describe('[POST] /signinWithCli', () => {
    it('should sign in using the cli details of the user with internet identity.', async () => {
      /// this is generated on the client side.
      const identity = JSON.stringify({
        principalId,
        encryptedPassword,
      });

      const encryptedData = CryptoUtils.aesEncrypt(identity, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

      console.log({ encryptedData });

      const data = {
        identity: encryptedData,
        username: 'Samson',
        projectTokenRef,
      };

      const response = await request(BASE_URL)
        .post('/a/signinWithCli')
        .send({
          ...data,
        });

      console.log('Test Response:', response.body);

      expect(response.body).toMatchObject({
        status: LogStatus.SUCCESS,
        code: StatusCode.OK,
        action: LogAction.SIGNIN,
        message: 'signin success.',
      });
    }, 10000);
  });
});
