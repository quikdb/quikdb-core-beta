import { LogAction, LogStatus, StatusCode } from '@/@types';
import { NODE_ENV, API_BASE_URL } from '@/config';
import request from 'supertest';
import { testEmail } from '../constants.test';

const BASE_URL = NODE_ENV === 'production' ? API_BASE_URL : 'http://localhost:4567';

describe('Integration Test: Auth Module', () => {
  describe('[POST] /signinWithCli', () => {
    it('should sign in with the email and password of the user.', async () => {
      const data = {
        email: testEmail,
        password: 'password',
        principalId: 'icp-user',
        username: 'Samson',
        projectTokenRef:
          '4cfe259e9d3c60c69728fd4e9466c7b6f465a14953e79920f5027f444e60c988b1b643074094c37eb7749b1cfa93c144f46ca56dd98ea8ff3896b5e2f9c1414632fc1ed76447445e99db3cfab67082b2774fa6feed1d750f91dbfe7a32429a1aa2a2be468bcc43ef89bc694e2bbfc23ea82328254ab571567d58bd48ddae4705156975ac70e87c01a3a4386f6fea1c49a9837215e394e2e8c67ba1ce416e07714a17873f715dd4fc1d6c37c68070818967ead11090e038fc83d8939774be0c9eede25dc15515c37183467b7addcce3210649da2e12a74d4998b757ecb02d96804a11fe11bc3f593bd608f7e27b749932b712b3fe0e55530bc7d7cfabe798c0a733b126bd69a66eabae315964d445147eb1807dc3edf2cb34ead8d80c3e3158cf1c3b4f9423fac270126f7d4e625d8a6f9d49009f33b8e8d2bb6a2b1f031ca570',
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
    });
  });
});
