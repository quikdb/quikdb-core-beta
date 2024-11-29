import { OtpRequestType, ProjectVersion } from '@/@types';
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

export const ValidateProjectRequest = Joi.object({
  id: Joi.string().required().label('id').messages({
    string: 'project name or id is required',
  }),
  type: Joi.string()
    .optional()
    .valid(...Object.values(ProjectVersion))
    .label('project type')
    .messages({
      string: 'project type of "free", "premium", or "professional" is required',
    }),
});
