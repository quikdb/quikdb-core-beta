import Joi from 'joi';

export const ValidateRequests = Joi.object({
  data: Joi.string().required().label('data').messages({
    string: 'encrypted data is required.',
  }),
});
