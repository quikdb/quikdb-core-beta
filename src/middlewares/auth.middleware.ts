import { NextFunction, Request, Response } from 'express';
import { SignInValidationSchema } from '@/validations/auth.validation';
import { Utils, ApiError } from '@/utils';
import { AuthDocument, AuthModel, authSchema } from '@/mongodb';
import { MongoApiService } from '@/services';
import { IsTokenBlacklisted } from '@/utils/validateEnv';
import { StatusCode, LogUsers, LogAction, LogStatus, GenericAnyType } from '@/@types';

export const AuthenticationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = await Utils.checkToken(req);
    if (!token) {
      return Utils.apiResponse<AuthDocument>(
        res,
        StatusCode.UNAUTHORIZED,
        { devError: { token } },
        {
          user: LogUsers.AUTH,
          action: LogAction.VERIFY,
          message: 'invalid token',
          status: LogStatus.FAIL,
          serviceLog: AuthModel,
          options: {},
        },
      );
    }

    const tokenData = await Utils.verifyToken(token);

    if (!tokenData) {
      return Utils.apiResponse<AuthDocument>(
        res,
        StatusCode.UNAUTHORIZED,
        { devError: { tokenData } },
        {
          user: LogUsers.AUTH,
          action: LogAction.VERIFY,
          message: 'invalid token',
          status: LogStatus.FAIL,
          serviceLog: AuthModel,
          options: {},
        },
      );
    }

    res.locals.tokenData = tokenData;
    next();
  } catch (error: GenericAnyType) {
    return Utils.apiResponse<AuthDocument>(
      res,
      StatusCode.INTERNAL_SERVER_ERROR,
      { devError: error.message || JSON.stringify(error) },
      {
        user: LogUsers.AUTH,
        action: LogAction.VERIFY,
        message: 'server error',
        status: LogStatus.FAIL,
        serviceLog: AuthModel,
        options: {},
      },
    );
  }
};

export const SignInMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { value, error } = Utils.validateJoiSchema(SignInValidationSchema, req.body);
    if (error) {
      next(new ApiError(error, 'AuthMiddleware', 401));
    }
    res.locals.validatedSignInRequestBody = value;
    next();
  } catch (error) {
    next(new ApiError(error.message || error, 'SignInMiddleware', 401));
  }
};

export const CheckTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authService = new MongoApiService<AuthDocument>('auth', 'auths', authSchema);
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
