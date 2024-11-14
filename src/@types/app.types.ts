import { Model } from 'mongoose';

export const applicationJsonType = 'application/json';

export const applicationXmlType = 'application/xml';

export type ExternalAPIResponseType<T = any> = {
  status: LogStatus;
  code: number;
  message?: string;
  data?: T | null;
};

export type APIResponseType = {
  action: LogAction;
} & ExternalAPIResponseType;

export type ServiceResponse<T = any> = {
  status: boolean;
  data?: T | null;
  error?: Error;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
};

export enum StatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  CONFLICT = 205,
  BAD_GATEWAY = 502,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  ALREADY_EXISTS = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export enum LogUsers {
  USER = 'user.service',
  WEBHOOK = 'webhook.service',
  AUTH = 'auth.service',
  TRANSACTION = 'transaction.service',
  PAYSTACK = 'paystack.service',
  STRIPE = 'stripe.service',
  PREMBLY = 'prembly.service',
  PLAID = 'plaid.service',
  BENTO = 'bento.service',
  FCM = 'fcm.service',
  FACEPROOF = 'faceproof.service',
}

export enum LogAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  READ = 'read',
  SEND = 'send',
  RECEIVE = 'receive',
  VERIFY = 'verify',
  SIGNUP = 'signup',
  ONBOARD = 'onboard',
  ONBOARD_BENTO = 'onboard_bento',
  SIGNIN = 'signin',
  SIGNOUT = 'signout',
  RESET_PASSWORD = 'reset_password',
  CHANGE_PASSWORD = 'change_password',
  FORGOT_PASSWORD = 'forgot_password',
  RESEND_OTP = 'resend_otp',
  SEND_VERIFICATION = 'send_verification',
  VERIFY_OTP = 'verify_otp',
  EMAIL_VERIFICATION = 'email_verification',
  PHONE_VERIFICATION = 'phone_verification',
  PLAID_VERIFICATION = 'plaid_verification',
}

export enum LogStatus {
  SUCCESS = 'success',
  FAIL = 'fail',
}

export type LogOptionsType<T> = {
  user: LogUsers;
  action: LogAction;
  message: string;
  status: LogStatus;
  serviceLog: Model<T>;
  options: LogType;
};

export type LogType = {
  email?: string;
  username?: string;
  deviceIP?: string;
  deviceID?: string;
  deviceName?: string;
  sourceOS?: string;
  apiRequest?: string;
  apiResponse?: string;
};

export type GenericType = {
  [x: string]: any;
};

export type GenericAnyType = any;

export enum ResponseCodes {
  SUCCESS = '00',
  FAILURE = '01',
  PARTIAL_SUCCESS = '02',
  VALIDATION_ERROR = '06',
  UNKNOWN_ACCOUNT = '07',
  PROCESSING_IN_PROGRESS = '09',
  INVALID_TRANSACTION_TYPE = '12',
  INVALID_AMOUNT = '13',
  INVALID_TRANSACTION_NUMBER = '14',
  NO_ACTION_TAKEN = '21',
  RECORD_NOT_FOUND = '23',
  DUPLICATE_RECORD = '26',
  FORMAT_ERROR = '30',
  INSUFFICIENT_FUNDS = '50',
  INVALID_SERVICE_ACCOUNT = '54',
  TRANSFER_LIMIT_EXCEEDED = '61',
  SECURITY_VIOLATION = '63',
  EXCEEDS_TRANSACTION_FREQUENCY = '65',
  DEBIT_ACCOUNT_BLOCKED = '69',
  DUPLICATE_TRANSACTION = '94',
  SYSTEM_MALFUNCTION = '96',
  SYSTEM_UNAVAILABLE = '97',
  AUTHENTICATION_ERROR = '99',
}

export type FunctionResponseType = {
  status: string;
  message: string;
  [x: string]: any;
};

export enum ResponseType {
  SUCCESS = 1,
  FAILURE = 0,
}
