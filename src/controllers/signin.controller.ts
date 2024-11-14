import { Request, Response } from 'express';
import { AuthDocument, AuthModel } from '@/mongodb';
import { LogAction, LogStatus, LogUsers, StatusCode } from '@/@types';
import { Utils } from '@/utils';
import { Model } from '@/services';
import { BaseController } from './base.controller';
import { AddToBlacklist } from '@/utils/validateEnv';

/**
 * SignInController handles the sign-in process for users.
 * It includes multi-factor authentication (MFA) handling and user session management.
 */
class SignInController extends BaseController {
  private static staticsInResponse: [LogUsers, LogAction, Model<AuthDocument>] = [LogUsers.AUTH, LogAction.SIGNIN, AuthModel];

  /**
   * Handles the user signin process.
   * @param req - Express request object containing the user sign-up data.
   * @param res - Express response object to send the response.
   */
  async Signin(req: Request, res: Response) {
    const session = null;
    try {
      /************ Extract validated sign-in data ************/
      const validatedSignInRequestBody = res.locals.validatedSignInRequestBody;
      const { username, password, email } = validatedSignInRequestBody;

      /************ Find user by email or phone number ************/
      const auth = await SignInController.authService.findOneMongo(
        {
          $or: [{ email }, { username }],
          deleted: false,
        },
        { session, populate: 'profile' },
        { session, hiddenFields: ['password'] },
      );

      /************ Handle invalid credentials ************/
      if (!auth.status) {
        return SignInController.abortTransactionWithResponse(
          res,
          StatusCode.BAD_REQUEST,
          session,
          auth.message || 'Invalid credentials',
          LogStatus.FAIL,
          ...SignInController.staticsInResponse,
          {
            email: '',
          },
        );
      }

      /************ Validate password ************/
      const valid = Utils.comparePasswords(password, auth.data.password);
      console.log({ valid });
      if (!valid) {
        return SignInController.abortTransactionWithResponse(
          res,
          StatusCode.UNAUTHORIZED,
          session,
          'Invalid password',
          LogStatus.FAIL,
          ...SignInController.staticsInResponse,
          {
            username,
          },
        );
      }

      /************ Generate access token ************/
      const payload = {
        username,
      };
      const accessToken = Utils.createToken(payload);

      // send sign in notification.

      /************ Commit the transaction and send a successful response ************/
      await session.commitTransaction();
      session.endSession();

      return Utils.apiResponse<AuthDocument>(
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
          serviceLog: AuthModel,
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
      return Utils.apiResponse<AuthDocument>(
        res,
        StatusCode.UNAUTHORIZED,
        { devError: error.message || 'Server error' },
        {
          user: LogUsers.AUTH,
          action: LogAction.SIGNUP,
          message: JSON.stringify(error),
          status: LogStatus.FAIL,
          serviceLog: AuthModel,
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

      return Utils.apiResponse<AuthDocument>(
        res,
        StatusCode.OK,
        {},
        {
          user: LogUsers.AUTH,
          action: LogAction.READ,
          message: 'user signed out',
          status: LogStatus.SUCCESS,
          serviceLog: AuthModel,
          options: {},
        },
      );
    } catch (error) {
      console.log(error);

      /************ Send an error response ************/
      return Utils.apiResponse<AuthDocument>(
        res,
        StatusCode.UNAUTHORIZED,
        { devError: error.message || 'Server error' },
        {
          user: LogUsers.AUTH,
          action: LogAction.SIGNUP,
          message: JSON.stringify(error),
          status: LogStatus.FAIL,
          serviceLog: AuthModel,
          options: {},
        },
      );
    }
  }
}

export default new SignInController();
