import { LogAction, LogStatus, StatusCode } from '@/@types';
import { NODE_ENV, API_BASE_URL } from '@/config';
import request from 'supertest';
import { tokenForSamuel } from '../constants.test';

const BASE_URL = NODE_ENV === 'production' ? API_BASE_URL : 'http://localhost:4567';
const token = tokenForSamuel;

describe('Integration Test: Auth Module', () => {
  describe('[POST] /v/p', () => {
    it('should fetch all projects for the logged in user.', async () => {
      const response = await request(BASE_URL).get('/v/p').set('Authorization', token);

      console.log('Test Response:', response.body);

      expect(response.body).toMatchObject({
        status: LogStatus.SUCCESS,
        code: StatusCode.OK,
        action: LogAction.FETCH_PROJECTS,
        message: 'projects found.',
      });
    });
  });
});
