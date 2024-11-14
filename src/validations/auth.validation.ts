import Joi from 'joi';

export const SignInWithMFASchema = Joi.object({
  mfaCode: Joi.string().optional().label('MFA Code').messages({
    'string.empty': 'MFA Code cannot be empty',
  }),
});

export const SignInValidationSchema = SignInWithMFASchema.keys({
  username: Joi.string().required().label('username').messages({
    'string.empty': 'Username is required',
  }),

  password: Joi.string().min(8).max(20).required().label('password').messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password cannot exceed 20 characters',
  }),
});
