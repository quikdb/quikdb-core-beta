import { NextFunction, Request, Response } from 'express';
import { ValidateRequests } from '@/validations/validations';
import { Utils, ApiError, CryptoUtils } from '@/utils';
import { ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER } from '@/config';

export const CreateProjectTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { value, error } = Utils.validateJoiSchema(ValidateRequests, req.body);

    if (error) {
      next(new ApiError(error, 'CreateProjectTokenMiddleware', 401));
    }

    const decryptedRequest = CryptoUtils.aesDecrypt(value.data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

    const requestObject = JSON.parse(decryptedRequest);

    res.locals.validatedCreateProjectTokenRequestBody = requestObject;

    next();
  } catch (error) {
    next(new ApiError(error.message || error, 'CreateProjectTokenMiddleware', 401));
  }
};

export const CreateProjectMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { value, error } = Utils.validateJoiSchema(ValidateRequests, req.body);

    if (error) {
      next(new ApiError(error, 'CreateProjectMiddleware', 401));
    }

    const decryptedRequest = CryptoUtils.aesDecrypt(value.data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

    const requestObject = JSON.parse(decryptedRequest);

    res.locals.validatedCreateProjectRequestBody = requestObject;

    next();
  } catch (error) {
    next(new ApiError(error.message || error, 'CreateProjectMiddleware', 401));
  }
};

export const GetIdInRequestMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { value, error } = Utils.validateJoiSchema(ValidateRequests, req.params);

    if (error) {
      next(new ApiError(error, 'GetIdInRequestMiddleware', 401));
    }

    const decryptedRequest = CryptoUtils.aesDecrypt(value.data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

    const requestObject = JSON.parse(decryptedRequest);

    console.log({ idInRequest: requestObject });

    res.locals.validatedIdRequest = requestObject;

    next();
  } catch (error) {
    next(new ApiError(error.message || error, 'GetIdInRequestMiddleware', 401));
  }
};

export const ActivateProjectMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { value, error } = Utils.validateJoiSchema(ValidateRequests, req.body);

    if (error) {
      next(new ApiError(error, 'ActivateProjectMiddleware', 401));
    }

    const decryptedRequest = CryptoUtils.aesDecrypt(value.data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

    console.log({ decryptedRequest });

    const requestObject = JSON.parse(decryptedRequest);

    res.locals.validatedActivateProjectRequest = requestObject;

    next();
  } catch (error) {
    next(new ApiError(error.message || error, 'ActivateProjectMiddleware', 401));
  }
};
