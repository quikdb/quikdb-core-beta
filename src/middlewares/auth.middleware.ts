import { NextFunction, Request, Response } from 'express';
import { ValidateRequests } from '@/validations/validations';
import { Utils, ApiError } from '@/utils';
import { UserDocument, UserModel, UserSchema } from '@/mongodb';
import { MongoApiService } from '@/services';
import { IsTokenBlacklisted } from '@/utils';
import { StatusCode, LogUsers, LogAction, LogStatus, GenericAnyType } from '@/@types';

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

export const SignInMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { value, error } = Utils.validateJoiSchema(ValidateRequests, req.body);
    if (error) {
      next(new ApiError(error, 'AuthMiddleware', 401));
    }
    res.locals.validatedSignInEPRequestBody = value;
    next();
  } catch (error) {
    next(new ApiError(error.message || error, 'SignInMiddleware', 401));
  }
};

export const SendOtpMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { value, error } = Utils.validateJoiSchema(ValidateRequests, req.body);
    if (error) {
      next(new ApiError(error, 'AuthMiddleware', 401));
    }
    res.locals.validatedVerifyOtpRequestBody = value;
    next();
  } catch (error) {
    next(new ApiError(error.message || error, 'SignInMiddleware', 401));
  }
};

export const VerifyOtpMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { value, error } = Utils.validateJoiSchema(ValidateRequests, req.body);
    if (error) {
      next(new ApiError(error, 'AuthMiddleware', 401));
    }
    res.locals.validatedVerifyOtpRequestBody = value;
    next();
  } catch (error) {
    next(new ApiError(error.message || error, 'SignInMiddleware', 401));
  }
};

export const CheckTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authService = new MongoApiService<UserDocument>('auth', 'auths', UserSchema);
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
