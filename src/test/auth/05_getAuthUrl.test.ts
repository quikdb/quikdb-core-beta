import { NODE_ENV, API_BASE_URL } from '@/config';
import request from 'supertest';

const BASE_URL = NODE_ENV === 'production' ? API_BASE_URL : 'http://localhost:4567';

describe('Integration Test: Auth Module', () => {
  describe('[POST] /get-oauth-url', () => {
    it('should send one time password', async () => {
      const response = await request(BASE_URL).get('/a/get-oauth-url');

      console.log('Test Response:', response.redirects);

      expect(response.redirect).toBeTruthy();
    }, 10000);
  });
});
