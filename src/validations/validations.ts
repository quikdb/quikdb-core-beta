import { OtpRequestType } from '@/@types';
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
