import { NextFunction, Request, Response } from 'express';
import { ValidateRequests } from '@/validations/validations';
import { Utils, ApiError, CryptoUtils } from '@/utils';
import { ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER } from '@/config';

export const CreateProjectMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { value, error } = Utils.validateJoiSchema(ValidateRequests, req.body);

    if (error) {
      next(new ApiError(error, 'CreateProjectMiddleware', 401));
    }

    console.log({ value });

    const decryptedRequest = CryptoUtils.aesDecrypt(value.data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

    console.log({ decryptedRequest });

    const requestObject = JSON.parse(decryptedRequest);

    console.log({ requestObject });

    res.locals.validatedCreateProjectRequestBody = requestObject;

    next();
  } catch (error) {
    next(new ApiError(error.message || error, 'CreateProjectMiddleware', 401));
  }
};

export const FetchProjectMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { value, error } = Utils.validateJoiSchema(ValidateRequests, req.params);

    if (error) {
      next(new ApiError(error, 'CreateProjectMiddleware', 401));
    }

    const decryptedRequest = CryptoUtils.aesDecrypt(value.data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

    const requestObject = JSON.parse(decryptedRequest);

    res.locals.validatedFetchProjectRequest = requestObject;

    next();
  } catch (error) {
    next(new ApiError(error.message || error, 'CreateProjectMiddleware', 401));
  }
};
