import { LogAction, LogStatus, StatusCode } from '@/@types';
import request from 'supertest';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

describe('Integration Test: Auth Module', () => {
  describe('[POST] /signout', () => {
    it('should remove the current user', async () => {
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNhbXNvbmFqdWxvckBnbWFpbC5jb20iLCJtZmFFbmFibGVkIjpmYWxzZSwibWZhQ29tcGxldGVkIjpmYWxzZSwiaWF0IjoxNzI5NzU5MDAwLCJleHAiOjE3Mjk3NTkzMDB9.6XW7U_fFVafehrcEexKssQZ-3ho3hUDkBrt1yiXtmto';

      const response = await request(BASE_URL).get('/a/signout').set('authorization', token);

      console.log('Test Response:', response.body);

      expect(response.body).toMatchObject({
        status: LogStatus.SUCCESS,
        code: StatusCode.OK,
        action: LogAction.READ,
        message: 'user signed out',
      });
    }, 10000);
  });
});
