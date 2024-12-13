import { LogAction, LogStatus, StatusCode } from '@/@types';
import { NODE_ENV, API_BASE_URL } from '@/config';
import request from 'supertest';

const BASE_URL = NODE_ENV === 'production' ? API_BASE_URL : 'http://localhost:4567';

describe('Integration Test: Auth Module', () => {
  describe('[POST] /google-oauth-callback', () => {
    it('should return oauth url', async () => {
      const code = '4%2F0AanRRrvY78OCetXFJnO8PsKG7O-1lG2CNCKNPX1-fqylHseAMsUDPW8SwGC6FL9eTTl6vw';
      const response = await request(BASE_URL).get(`/a/google-oauth-callback?code=${code}`);

      console.log('Test Response:', response.body);

      expect(response.body).toMatchObject({
        status: LogStatus.SUCCESS,
        code: StatusCode.OK,
        action: LogAction.READ,
        message: 'success.',
      });
    }, 10000);
  });
});
