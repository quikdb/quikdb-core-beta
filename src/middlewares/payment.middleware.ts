import { NextFunction, Request, Response } from 'express';
import { ValidateCreatePaypalOrderRequest, ValidateCapturePaypalOrderRequest } from '@/validations/validations';
import { Utils, ApiError } from '@/utils';

export const CreatePaypalOrderMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { value, error } = Utils.validateJoiSchema(ValidateCreatePaypalOrderRequest, req.body);

    if (error) {
      next(new ApiError(error, 'CreatePaypalOrderMiddleware', 401));
    }

    console.log({ value });

    res.locals.validatedCreatePaypalOrderRequest = value;

    next();
  } catch (error) {
    next(new ApiError(error.message || error, 'CreatePaypalOrderMiddleware', 401));
  }
};

export const CapturePaypalOrderMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { value, error } = Utils.validateJoiSchema(ValidateCapturePaypalOrderRequest, req.params);

    if (error) {
      next(new ApiError(error, 'CapturePaypalOrderMiddleware', 401));
    }

    console.log({ value });

    res.locals.validatedCapturePaypalOrderRequest = value;

    next();
  } catch (error) {
    next(new ApiError(error.message || error, 'CapturePaypalOrderMiddleware', 401));
  }
};
