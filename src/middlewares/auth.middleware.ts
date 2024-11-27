import { NextFunction, Request, Response } from 'express';
import { ValidateRequests } from '@/validations/validations';
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
      next(new ApiError(error, 'SendOtpMiddleware', 401));
    }

    const decryptedRequest = CryptoUtils.aesDecrypt(value.data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

    const requestObject = JSON.parse(decryptedRequest);

    res.locals.validatedSendOtpRequestBody = requestObject;

    next();
  } catch (error) {
    next(new ApiError(error.message || error, 'SendOtpMiddleware', 401));
  }
};

export const VerifyOtpMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { value, error } = Utils.validateJoiSchema(ValidateRequests, req.body);

    if (error) {
      next(new ApiError(error, 'VerifyOtpMiddleware', 401));
    }

    const decryptedRequest = CryptoUtils.aesDecrypt(value.data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

    const requestObject = JSON.parse(decryptedRequest);

    res.locals.validatedVerifyOtpRequestBody = requestObject;

    next();
  } catch (error) {
    next(new ApiError(error.message || error, 'VerifyOtpMiddleware', 401));
  }
};

export const SignupWithEPMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { value, error } = Utils.validateJoiSchema(ValidateRequests, req.body);

    if (error) {
      next(new ApiError(error, 'SignupWithEPMiddleware', 401));
    }

    const decryptedRequest = CryptoUtils.aesDecrypt(value.data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

    const requestObject = JSON.parse(decryptedRequest);

    res.locals.validatedSignupWithEPRequestBody = requestObject;

    next();
  } catch (error) {
    next(new ApiError(error.message || error, 'SignupWithEPMiddleware', 401));
  }
};

export const SigninWithEPMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { value, error } = Utils.validateJoiSchema(ValidateRequests, req.body);

    if (error) {
      next(new ApiError(error, 'SigninWithEPMiddleware', 401));
    }

    console.log({ value });

    const decryptedRequest = CryptoUtils.aesDecrypt(value.data, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

    console.log({ decryptedRequest });

    const requestObject = JSON.parse(decryptedRequest);

    res.locals.validatedSigninWithEPRequestBody = requestObject;

    next();
  } catch (error) {
    next(new ApiError(error.message || error, 'SigninWithEPMiddleware', 401));
  }
};

export const CheckTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authService = new MongoApiService<UserDocument>(UserModel);
    const token = await Utils.checkToken(req);

    console.log({ token, IsTokenBlacklisted: IsTokenBlacklisted(token) });

    if (!token || IsTokenBlacklisted(token)) {
      return next(new ApiError('unauthorized', 'AuthMiddleware', 401));
    }

    const payload = (await Utils.verifyToken(token)) as any;

    console.log({ payload });

    const auth = await authService.findOneMongo(
      {
        email: payload.username,
        deleted: false,
      },
      { session: null, populate: 'profile' },
    );

    console.log({ auth });

    if (!auth.status) {
      return next(new ApiError('unauthorized', 'AuthMiddleware', 401));
    }

    res.locals.currentUser = auth;
    return next();
  } catch (error) {
    next(new ApiError(error.message || error, 'SignInMiddleware', 401));
  }
};
