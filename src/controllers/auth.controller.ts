import { Request, Response } from 'express';
import { UserDocument, UserModel } from '@/mongodb';
import { LogAction, LogStatus, LogUsers, StatusCode } from '@/@types';
import { Utils } from '@/utils';
import { Model } from '@/services';
import { BaseController } from './base.controller';
import { AddToBlacklist } from '@/utils';

/**
 * AuthController handles the sign-in process for users.
 * It includes multi-factor authentication (MFA) handling and user session management.
 */
class AuthController extends BaseController {
  private static staticsInResponse: [LogUsers, LogAction, Model<UserDocument>] = [LogUsers.AUTH, LogAction.SIGNIN, UserModel];

  /**
   * Handles the user signin process using email and pw.
   * @param req - Express request object containing the user sign-up data.
   * @param res - Express response object to send the response.
   */
  async SigninWithEmailAndPassword(req: Request, res: Response) {
    const session = null;
    try {
      /************ Extract validated sign-in data ************/
      const validatedSignInEPRequestBody = res.locals.validatedSignInEPRequestBody;
      const { password, email } = validatedSignInEPRequestBody;

      /************ Find user by email or phone number ************/
      const auth = await AuthController.userService.findOneMongo(
        {
          email,
          deleted: false,
        },
        { session, hiddenFields: ['password'] },
      );

      /************ Handle invalid credentials ************/
      if (auth.status) {
        return AuthController.abortTransactionWithResponse(
          res,
          StatusCode.BAD_REQUEST,
          session,
          'invalid credentials',
          LogStatus.FAIL,
          ...AuthController.staticsInResponse,
          {
            email: '',
          },
        );
      }

      /************ Validate password ************/
      const valid = Utils.comparePasswords(password, auth.data.password);
      console.log({ valid });
      if (!valid) {
        return AuthController.abortTransactionWithResponse(
          res,
          StatusCode.UNAUTHORIZED,
          session,
          'Invalid credentials',
          LogStatus.FAIL,
          ...AuthController.staticsInResponse,
          {
            email,
          },
        );
      }

      /************ Generate access token ************/
      const payload = {
        email,
      };
      const accessToken = Utils.createToken(payload);

      // send sign in notification.

      /************ Commit the transaction and send a successful response ************/
      await session.commitTransaction();
      session.endSession();

      return Utils.apiResponse<UserDocument>(
        res,
        StatusCode.OK,
        {
          accessToken,
        },
        {
          user: LogUsers.AUTH,
          action: LogAction.SIGNIN,
          message: 'signin success.',
          status: LogStatus.SUCCESS,
          serviceLog: UserModel,
          options: {
            email,
          },
        },
      );
    } catch (error) {
      console.log(error);
      !session.transaction.isActive && (await session.abortTransaction());
      session.endSession();

      /************ Send an error response ************/
      return Utils.apiResponse<UserDocument>(
        res,
        StatusCode.UNAUTHORIZED,
        { devError: error.message || 'Server error' },
        {
          user: LogUsers.AUTH,
          action: LogAction.SIGNUP,
          message: JSON.stringify(error),
          status: LogStatus.FAIL,
          serviceLog: UserModel,
          options: {},
        },
      );
    } finally {
      session.endSession();
    }
  }

  /**
   * Handles the user signin process using email and pw.
   * @param req - Express request object containing the user sign-up data.
   * @param res - Express response object to send the response.
   */
  async SigninWithGoogleOAuth(req: Request, res: Response) {
    const session = null;
    try {
      /************ Extract validated sign-in data ************/
      const validatedSignInWGoogleRequestBody = res.locals.validatedSignInWGoogleRequestBody;
      
      const { googleToken } = validatedSignInWGoogleRequestBody;

      const payload = await AuthController.verifyGoogleToken(googleToken);

      if (!payload) {
        return AuthController.abortTransactionWithResponse(
          res,
          StatusCode.BAD_REQUEST,
          session,
          'invalid credentials',
          LogStatus.FAIL,
          ...AuthController.staticsInResponse,
          {
            email: '',
          },
        );
      }

      const { email, name, sub: googleId } = payload;

      /************ Find user by email or phone number ************/
      const auth = await AuthController.userService.findOneMongo(
        {
          email,
          deleted: false,
        },
        { session },
      );

      /************ Handle invalid credentials ************/
      if (!auth.status) {
        const user = await AuthController.userService.createMongo(
          {
            email,
            googleId
          },
          { session },
        );
      }

      /************ Generate access token ************/
      const accessToken = Utils.createToken(payload);

      // send sign in notification.

      /************ Commit the transaction and send a successful response ************/
      await session.commitTransaction();
      session.endSession();

      return Utils.apiResponse<UserDocument>(
        res,
        StatusCode.OK,
        {
          accessToken,
        },
        {
          user: LogUsers.AUTH,
          action: LogAction.SIGNIN,
          message: 'signin success.',
          status: LogStatus.SUCCESS,
          serviceLog: UserModel,
          options: {
            email,
          },
        },
      );
    } catch (error) {
      console.log(error);
      !session.transaction.isActive && (await session.abortTransaction());
      session.endSession();

      /************ Send an error response ************/
      return Utils.apiResponse<UserDocument>(
        res,
        StatusCode.UNAUTHORIZED,
        { devError: error.message || 'Server error' },
        {
          user: LogUsers.AUTH,
          action: LogAction.SIGNUP,
          message: JSON.stringify(error),
          status: LogStatus.FAIL,
          serviceLog: UserModel,
          options: {},
        },
      );
    } finally {
      session.endSession();
    }
  }

  /**
   * Signs out a user.
   * @param req - Express request object containing the user sign-up data.
   * @param res - Express response object to send the response.
   */
  async Signout(req: Request, res: Response) {
    try {
      console.log({ currentUser: res.locals.currentUser });
      res.locals.currentUser = null;
      const token = await Utils.checkToken(req);

      AddToBlacklist(token);

      return Utils.apiResponse<UserDocument>(
        res,
        StatusCode.OK,
        {},
        {
          user: LogUsers.AUTH,
          action: LogAction.READ,
          message: 'user signed out',
          status: LogStatus.SUCCESS,
          serviceLog: UserModel,
          options: {},
        },
      );
    } catch (error) {
      console.log(error);

      /************ Send an error response ************/
      return Utils.apiResponse<UserDocument>(
        res,
        StatusCode.UNAUTHORIZED,
        { devError: error.message || 'Server error' },
        {
          user: LogUsers.AUTH,
          action: LogAction.SIGNUP,
          message: JSON.stringify(error),
          status: LogStatus.FAIL,
          serviceLog: UserModel,
          options: {},
        },
      );
    }
  }
}

export default new AuthController();
