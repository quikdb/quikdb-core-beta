import { NextFunction, Request, Response } from 'express';
import { ValidateRequests } from '@/validations/validations';
import { Utils, ApiError, CryptoUtils } from '@/utils';
import { ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER } from '@/config';

export const CreatePaypalOrderMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { value, error } = Utils.validateJoiSchema(ValidateRequests, req.body);

    if (error) {
      next(new ApiError(error, 'CreatePaypalOrderMiddleware', 401));
    }

    const decryptedRequest = CryptoUtils.aesDecrypt(value.data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

    console.log({ decryptedRequest });

    const requestObject = JSON.parse(decryptedRequest);

    res.locals.validatedCreatePaypalOrderRequest = requestObject;

    next();
  } catch (error) {
    next(new ApiError(error.message || error, 'CreatePaypalOrderMiddleware', 401));
  }
};

export const CapturePaypalOrderMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { value, error } = Utils.validateJoiSchema(ValidateRequests, req.params);

    if (error) {
      next(new ApiError(error, 'CapturePaypalOrderMiddleware', 401));
    }

    const decryptedRequest = CryptoUtils.aesDecrypt(value.data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

    console.log({ decryptedRequest });

    const requestObject = JSON.parse(decryptedRequest);

    res.locals.validatedCapturePaypalOrderRequest = requestObject;

    next();
  } catch (error) {
    next(new ApiError(error.message || error, 'CapturePaypalOrderMiddleware', 401));
  }
};
