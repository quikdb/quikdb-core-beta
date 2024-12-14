import request from 'supertest';
import path from 'path';
import fs from 'fs';
import { API_BASE_URL, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER, NODE_ENV } from '@/config';
import { CryptoUtils } from '@/utils';
import { projectId, tokenForSamson } from '../constants.test';
import { LogAction, LogStatus, StatusCode } from '@/@types';

const BASE_URL = NODE_ENV === 'production' ? API_BASE_URL : 'http://localhost:4567';
const token = tokenForSamson;

describe('Integration Test: Project Module', () => {
  describe('[PATCH] /v/p/:data/code', () => {
    it('should download a project code for the logged-in user and save it to the current directory.', async () => {
      const data = JSON.stringify({
        id: projectId,
      });

      const encryptedData = CryptoUtils.aesEncrypt(data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

      console.log({ encryptedData });

      // Send a PATCH request to download the file
      const response = await request(BASE_URL).patch(`/v/p/${encryptedData}/code`).set('Authorization', token).responseType('arraybuffer');

      expect(response.body).toBeDefined();

      const filePath = path.join(__dirname, 'downloaded_project_code.zip');

      fs.writeFileSync(filePath, response.body);

      const fileExists = fs.existsSync(filePath);
      expect(fileExists).toBe(true);

      console.log(`File downloaded and saved as ${filePath}`);
    }, 10000);
  });
});
