import { NextFunction, Request, Response } from 'express';
import { ValidateRequests, ValidateAuthRequest, ValidateGoogleAuthRequest } from '@/validations/validations';
import { Utils, ApiError, CryptoUtils } from '@/utils';
import { UserDocument, UserModel } from '@/services/mongodb';
import { MongoApiService } from '@/services';
import { IsTokenBlacklisted } from '@/utils';
import { StatusCode, LogUsers, LogAction, LogStatus, GenericAnyType } from '@/@types';
import { ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER } from '@/config';

export const AuthenticationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = await Utils.checkToken(req);
    if (!token) {
      return Utils.apiResponse<UserDocument>(
        res,
        StatusCode.UNAUTHORIZED,
        { devError: { token } },
        {
          user: LogUsers.AUTH,
          action: LogAction.VERIFY,
          message: 'invalid token',
          status: LogStatus.FAIL,
          serviceLog: UserModel,
          options: {},
        },
      );
    }

    const tokenData = await Utils.verifyToken(token);

    if (!tokenData) {
      return Utils.apiResponse<UserDocument>(
        res,
        StatusCode.UNAUTHORIZED,
        { devError: { tokenData } },
        {
          user: LogUsers.AUTH,
          action: LogAction.VERIFY,
          message: 'invalid token',
          status: LogStatus.FAIL,
          serviceLog: UserModel,
          options: {},
        },
      );
    }

    res.locals.tokenData = tokenData;
    next();
  } catch (error: GenericAnyType) {
    return Utils.apiResponse<UserDocument>(
      res,
      StatusCode.INTERNAL_SERVER_ERROR,
      { devError: error.message || JSON.stringify(error) },
      {
        user: LogUsers.AUTH,
        action: LogAction.VERIFY,
        message: 'server error',
        status: LogStatus.FAIL,
        serviceLog: UserModel,
        options: {},
      },
    );
  }
};

export const SendOtpMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { value, error } = Utils.validateJoiSchema(ValidateRequests, req.body);

    if (error) {
      next(new ApiError(error, 'SendOtpMiddleware', StatusCode.UNAUTHORIZED));
    }

    const decryptedRequest = CryptoUtils.aesDecrypt(value.data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

    const requestObject = JSON.parse(decryptedRequest);

    res.locals.validatedSendOtpRequestBody = requestObject;

    next();
  } catch (error) {
    next(new ApiError(error.message || error, 'SendOtpMiddleware', StatusCode.UNAUTHORIZED));
  }
};

export const VerifyOtpMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { value, error } = Utils.validateJoiSchema(ValidateRequests, req.body);

    if (error) {
      next(new ApiError(error, 'VerifyOtpMiddleware', StatusCode.UNAUTHORIZED));
    }

    const decryptedRequest = CryptoUtils.aesDecrypt(value.data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

    const requestObject = JSON.parse(decryptedRequest);

    res.locals.validatedVerifyOtpRequestBody = requestObject;

    next();
  } catch (error) {
    next(new ApiError(error.message || error, 'VerifyOtpMiddleware', StatusCode.UNAUTHORIZED));
  }
};

export const SignupWithEPMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { value, error } = Utils.validateJoiSchema(ValidateRequests, req.body);

    if (error) {
      next(new ApiError(error, 'SignupWithEPMiddleware', StatusCode.UNAUTHORIZED));
    }

    const decryptedRequest = CryptoUtils.aesDecrypt(value.data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

    const requestObject = JSON.parse(decryptedRequest);

    res.locals.validatedSignupWithEPRequestBody = requestObject;

    next();
  } catch (error) {
    next(new ApiError(error.message || error, 'SignupWithEPMiddleware', StatusCode.UNAUTHORIZED));
  }
};

export const SigninWithEPMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { value, error } = Utils.validateJoiSchema(ValidateRequests, req.body);

    if (error) {
      next(new ApiError(error, 'SigninWithEPMiddleware', StatusCode.UNAUTHORIZED));
    }

    const decryptedRequest = CryptoUtils.aesDecrypt(value.data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

    const requestObject = JSON.parse(decryptedRequest);

    res.locals.validatedSigninWithEPRequestBody = requestObject;

    next();
  } catch (error) {
    next(new ApiError(error.message || error, 'SigninWithEPMiddleware', StatusCode.UNAUTHORIZED));
  }
};

export const SigninWithGoogleMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { value, error } = Utils.validateJoiSchema(ValidateGoogleAuthRequest, req.query);

    if (error) {
      next(new ApiError(error, 'SigninWithGoogleMiddleware', StatusCode.UNAUTHORIZED));
    }

    res.locals.validatedSignInWGoogleRequest = value;

    next();
  } catch (error) {
    next(new ApiError(error.message || error, 'SigninWithGoogleMiddleware', StatusCode.UNAUTHORIZED));
  }
};

export const SigninWithCliMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  console.log({ req: req.body });
  try {
    const { value, error } = Utils.validateJoiSchema(ValidateAuthRequest, req.body);

    console.log({ value });

    if (error) {
      next(new ApiError(error, 'SigninWithCliMiddleware', StatusCode.UNAUTHORIZED));
    }

    res.locals.validatedSignInWCliRequestBody = value;

    next();
  } catch (error) {
    next(new ApiError(error.message || error, 'SigninWithCliMiddleware', StatusCode.UNAUTHORIZED));
  }
};

export const CheckTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userService = new MongoApiService<UserDocument>(UserModel);
    const token = Utils.checkToken(req);

    if (!token) {
      return next(new ApiError('unauthorized', 'AuthMiddleware', StatusCode.UNAUTHORIZED));
    }

    if (token) {
      if (IsTokenBlacklisted(token)) {
        return next(new ApiError('please sign in.', 'AuthMiddleware', StatusCode.UNAUTHORIZED));
      }
    }

    const payload = Utils.verifyToken(token) as any;

    const user = await userService.findOneMongo(
      {
        email: payload.email,
        deleted: false,
      },
      {},
      { session: null, hiddenFields: ['password'] },
    );

    if (!user.status) {
      return next(new ApiError('user not found', 'AuthMiddleware', StatusCode.UNAUTHORIZED));
    }

    res.locals.currentUser = user.data;
    return next();
  } catch (error) {
    next(new ApiError(error.message || error, 'SignInMiddleware', StatusCode.UNAUTHORIZED));
  }
};
