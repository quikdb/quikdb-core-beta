import { LogAction, LogStatus, StatusCode } from '@/@types';
import { NODE_ENV, API_BASE_URL } from '@/config';
import request from 'supertest';

const BASE_URL = NODE_ENV === 'production' ? API_BASE_URL : 'http://localhost:4567';

describe('Integration Test: Auth Module', () => {
  describe('[POST] /signout', () => {
    it('should remove the current user', async () => {
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNhbXNvbmFqdWxvckBnbWFpbC5jb20iLCJpYXQiOjE3MzQwNjE2MzEsImV4cCI6MTczNDE0ODAzMX0.xQWRhMPpNmmIqXkhPSxZTZ9Vpbf9Ure8uDeTh0hjBDs';

      const response = await request(BASE_URL).get('/a/signout').set('authorization', token);

      console.log('Test Response:', response.body);

      expect(response.body).toMatchObject({
        status: LogStatus.SUCCESS,
        code: StatusCode.OK,
        action: LogAction.SIGNOUT,
        message: 'user signed out',
      });
    }, 10000);
  });
});
