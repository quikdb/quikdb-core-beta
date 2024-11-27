import { LogAction, StatusCode } from '@/@types';
import request from 'supertest';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:4567';

describe('Integration Test: Auth Module', () => {
  describe('[POST] /signin', () => {
    it('should onboard the user', async () => {
      const signInData = {
        username: 'samsonajulor@gmail.com',
        password: 'password',
      };

      const response = await request(BASE_URL).post('/a/signin').send(signInData);

      console.log('Test Response:', response.body);

      expect(response.body).toMatchObject({
        status: 'success',
        code: StatusCode.OK,
        action: LogAction.SIGNIN,
        message: 'signin success.',
      });
    });
  });
});
