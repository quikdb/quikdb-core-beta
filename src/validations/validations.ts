import { DatabaseVersion, OtpRequestType } from '@/@types';
import Joi from 'joi';

export const ValidateRequests = Joi.object({
  data: Joi.string().required().label('data').messages({
    string: 'encrypted data is required.',
  }),
});

export const ValidateOtpRequest = Joi.object({
  email: Joi.string().email().required().label('email').messages({
    string: 'valid email is required',
  }),
  OTPType: Joi.string()
    .valid(...Object.values(OtpRequestType))
    .required()
    .label('OTPType')
    .messages({
      string: `otp type of 'password' or 'signup' is required`,
    }),
  otp: Joi.string().optional().label('otp').messages({
    string: 'otp is of type string',
  }),
});

export const ValidateAuthRequest = Joi.object({
  email: Joi.string().email().required().label('email').messages({
    string: 'valid email is required',
  }),
  password: Joi.string().min(8).max(15).required().label('password').messages({
    string: 'password of valid length is required',
  }),
  principalId: Joi.string().optional().label('principal').messages({
    string: 'principal is not valid',
  }),
  username: Joi.string().optional().label('username').messages({
    string: 'username is not valid',
  }),
  projectTokenRef: Joi.string().optional().label('projectTokenRef').messages({
    string: 'projectTokenRef is not valid',
  }),
});

export const ValidateGoogleAuthRequest = Joi.object({
  code: Joi.string().required().label('code').messages({
    string: 'valid code is required',
  }),
  authuser: Joi.string().label('auth-user').messages({
    string: 'auth-user is required.',
  }),
  scope: Joi.string().label('scope').messages({
    string: 'scope is not valid',
  }),
  prompt: Joi.string().label('prompt').messages({
    string: 'prompt is not valid.',
  }),
});

export const ValidateProjectRequest = Joi.object({
  id: Joi.string().required().label('id').messages({
    string: 'project name or id is required',
  }),
});

export const ValidateCreateProjectRequest = Joi.object({
  email: Joi.string().email().required().label('email').messages({
    string: 'valid email is required',
  }),
  databaseVersion: Joi.string()
    .required()
    .valid(...Object.values(DatabaseVersion))
    .label('database version')
    .messages({
      string: `Database version of either ${Object.values(DatabaseVersion).join(', ')} is required`,
    }),
  duration: Joi.number().required().min(1).label('token-duration').messages({
    string: 'duration is required in days',
  }),
});

export const ValidateCreatePaypalOrderRequest = Joi.object({
  amount: Joi.number().required().label('amount').messages({
    string: 'valid amount is required in usd',
  }),
  projectId: Joi.string().required().label('projectId').messages({
    string: 'valid projectId is required',
  }),
  databaseVersion: Joi.string()
    .required()
    .valid(...Object.values(DatabaseVersion))
    .label('database version')
    .messages({
      string: `Database version of either ${Object.values(DatabaseVersion).join(', ')} is required`,
    }),
});

export const ValidateCapturePaypalOrderRequest = Joi.object({
  order: Joi.string().required().label('order').messages({
    string: 'valid order is required',
  }),
});
