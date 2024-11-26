import { OtpRequestType } from '@/@types';
import Joi from 'joi';

export const ValidateRequests = Joi.object({
  data: Joi.string().required().label('data').messages({
    string: 'encrypted data is required.',
  }),
});

export const ValidateSendOtp = Joi.object({
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
});
