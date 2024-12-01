import { LogAction, LogStatus, StatusCode } from '@/@types';
import { ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER, NODE_ENV, API_BASE_URL } from '@/config';
import { CryptoUtils } from '@/utils';
import request from 'supertest';
import { testEmail } from '../constants';

const BASE_URL = NODE_ENV === 'production' ? API_BASE_URL : 'http://localhost:4567';

describe('Integration Test: Auth Module', () => {
  describe('[POST] /signinWithCli', () => {
    it('should sign in with the email and password of the user.', async () => {
      const data = JSON.stringify({
        email: testEmail,
        password: 'password',
        principalId: 'icp-user',
        username: 'Samson',
        projectTokenRef:
          '4cfe259e9d3c60c69728fd4e9466c7b6f465a14953e79920f5027f444e60c988b1b643074094c37eb7749b1cfa93c144f46ca56dd98ea8ff3896b5e2f9c1414632fc1ed76447445e99db3cfab67082b2774fa6feed1d750f91dbfe7a32429a1aa2a2be468bcc43ef89bc694e2bbfc23ea82328254ab571567d58bd48ddae4705156975ac70e87c01a3a4386f6fea1c49a9837215e394e2e8c67ba1ce416e07714a17873f715dd4fc1d6c37c68070818967ead11090e038fc83d8939774be0c9eede25dc15515c37183467b7addcce3210649da2e12a74d4998b757ecb02d96800920e9615d77156503ca1938948172a934f649616b8fbfd46c0ba7b9a4d6d543f4b6f50d80ac0ec2249d441defff222b2546f125b903d5862c115e37fa6a32725332497b72238020cefb0cee0a43a329c2e7d59fb62d69469808b5f4dda5fa73',
      });

      const encryptedData = CryptoUtils.aesEncrypt(data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

      console.log({ encryptedData });

      const response = await request(BASE_URL).post('/a/signinWithCli').send({
        data: encryptedData,
      });

      console.log('Test Response:', response.body);

      expect(response.body).toMatchObject({
        status: LogStatus.SUCCESS,
        code: StatusCode.OK,
        action: LogAction.SIGNIN,
        message: 'signin success.',
      });
    });
  });
});
