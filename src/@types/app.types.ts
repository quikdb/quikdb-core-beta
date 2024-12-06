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
  ALREADY_EXISTS = 409,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export enum LogUsers {
  USER = 'user.service',
  WEBHOOK = 'webhook.service',
  AUTH = 'auth.service',
  PROJECT = 'project.service',
  TRANSACTION = 'transaction.service',
  PAYPAL = 'paypal.service',
  STRIPE = 'stripe.service',
  PREMBLY = 'prembly.service',
  PLAID = 'plaid.service',
  BENTO = 'bento.service',
  FCM = 'fcm.service',
  FACEPROOF = 'faceproof.service',
}

export enum LogAction {
  CREATE = 'create',
  GET_AUTH_URL = 'get_auth_url',
  CREATE_PROJECT = 'create_project',
  CREATE_PROJECT_TOKEN = 'create_project_token',
  FETCH_PROJECT_TOKEN = 'fetch_project_token',
  FETCH_PROJECT = 'fetch_project',
  FETCH_PROJECTS = 'fetch_projects',
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
  ERROR = 'error',
  CREATE_PAYPAL_ORDER = 'create_paypal_order',
  CAPTURE_PAYPAL_ORDER = 'capture_paypal_order',
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
  phone?: string;
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

export type FunctionResponseType = {
  status: string;
  message: string;
  [x: string]: any;
};

export enum ResponseType {
  SUCCESS = 1,
  FAILURE = 0,
}
