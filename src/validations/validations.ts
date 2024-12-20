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

export const ValidateAuthRequest = Joi.alternatives()
  .try(
    Joi.object({
      identity: Joi.string().required().label('identity').messages({
        'string.base': 'identity must be a valid string',
        'any.required': 'identity is required if email, password, and principalId are not provided',
      }),
      email: Joi.forbidden().messages({ 'any.unknown': 'email is not allowed when identity is provided' }),
      password: Joi.forbidden().messages({ 'any.unknown': 'password is not allowed when identity is provided' }),
      principalId: Joi.forbidden().messages({ 'any.unknown': 'principalId is not allowed when identity is provided' }),
      username: Joi.string().required().label('username').messages({
        'string.base': 'username must be a valid string',
        'any.required': 'username is required',
      }),
      projectTokenRef: Joi.string().required().label('projectTokenRef').messages({
        'string.base': 'projectTokenRef must be a valid string',
        'any.required': 'projectTokenRef is required',
      }),
    }),

    Joi.object({
      email: Joi.string().email().required().label('email').messages({
        'string.email': 'valid email is required',
        'any.required': 'email is required if identity is not provided',
      }),
      password: Joi.string().min(8).max(15).required().label('password').messages({
        'string.min': 'password must be at least 8 characters',
        'string.max': 'password must not exceed 15 characters',
        'any.required': 'password is required if identity is not provided',
      }),
      principalId: Joi.string().required().label('principalId').messages({
        'string.base': 'principalId must be a valid string',
        'any.required': 'principalId is required if identity is not provided',
      }),
      identity: Joi.forbidden().messages({ 'any.unknown': 'identity is not allowed when email, password, and principalId are provided' }),
      username: Joi.string().required().label('username').messages({
        'string.base': 'username must be a valid string',
        'any.required': 'username is required',
      }),
      projectTokenRef: Joi.string().required().label('projectTokenRef').messages({
        'string.base': 'projectTokenRef must be a valid string',
        'any.required': 'projectTokenRef is required',
      }),
    }),
  )
  .label('ValidateAuthRequest')
  .messages({
    'alternatives.match':
      'Either identity or email/password/principalId combination is required, but not both. username and projectTokenRef are required by default.',
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
