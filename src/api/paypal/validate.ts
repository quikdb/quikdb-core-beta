import { LogStatus, StatusCode } from '../../@types';
import { Utils } from '../../utils';
import APIConfigs from '../config';

const api = APIConfigs.paypal();

export async function validate(payload: any) {
  try {
    const response = await api.post('/', payload);
    return Utils.createExternalApiResponse(response.data.message, LogStatus.SUCCESS, response.data.status, response.data.data, response);
  } catch (error: any) {
    const message = error.response.data.message || 'Paystack Network Error';
    const code = error.response.status || StatusCode.INTERNAL_SERVER_ERROR;
    return Utils.createExternalApiResponse(message, LogStatus.FAIL, code, error);
  }
}
