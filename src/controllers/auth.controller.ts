import { Request, Response } from 'express';
import { UserDocument, UserModel } from '@/services/mongodb';
import { LogAction, LogStatus, LogUsers, StatusCode, OtpRequestType } from '@/@types';
import { CryptoUtils, sendEmail, Utils } from '@/utils';
import { Model } from '@/services';
import { BaseController } from './00_base.controller';
import { AddToBlacklist } from '@/utils';
import { ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER, NODE_ENV } from '@/config';

/**
 * AuthController handles the sign-in process for users.
 * It includes multi-factor authentication (MFA) handling and user session management.
 */
class AuthController extends BaseController {
  private static staticsInResponse: [LogUsers, LogAction, Model<UserDocument>] = [LogUsers.AUTH, LogAction.ERROR, UserModel];

  /**
   * Handles the otp sending process during signup and password verification.
   * @param req - Express request object containing the user sign-up data.
   * @param res - Express response object to send the response.
   */
  async SendOtp(req: Request, res: Response) {
    const session = null;
    try {
      /************ Extract validated sign-in data ************/
      const validatedSendOtpRequestBody = res.locals.validatedSendOtpRequestBody;

      const { email, OTPType } = validatedSendOtpRequestBody;

      /************ Find user by email or phone number ************/
      const user = await AuthController.userService.findOneMongo(
        {
          email,
          deleted: false,
        },
        {},
        { session, hiddenFields: ['password'] },
      );

      if ((OTPType as OtpRequestType) === OtpRequestType.PASSWORD) {
        if (!user.status) {
          return AuthController.abortTransactionWithResponse(
            res,
            StatusCode.BAD_REQUEST,
            session,
            'user not found. please sign up.',
            LogStatus.FAIL,
            ...AuthController.staticsInResponse,
            {
              email: '',
            },
          );
        }
      } else {
        if (user.status) {
          return AuthController.abortTransactionWithResponse(
            res,
            StatusCode.BAD_REQUEST,
            session,
            'already registered. please login',
            LogStatus.FAIL,
            ...AuthController.staticsInResponse,
            {
              email: '',
            },
          );
        }
      }

      const otp = NODE_ENV !== 'production' ? '123456' : Utils.generateOtp();

      const createdOtp = await AuthController.otpService.updateOneMongo({ email }, { otp: `${email}-${otp}` }, { session });

      if (!createdOtp.status) {
        return AuthController.abortTransactionWithResponse(
          res,
          StatusCode.INTERNAL_SERVER_ERROR,
          session,
          'Failed to send OTP',
          LogStatus.FAIL,
          ...AuthController.staticsInResponse,
          {
            email: '',
          },
        );
      }

      /************ Commit the transaction and send a successful response ************/
      await session?.commitTransaction();
      session?.endSession();

      /***** send otp email ******/
      await sendEmail(
        email,
        'One Time Password',
        `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #333;
            text-align: center;
            font-size: 24px;
          }
          .content {
            font-size: 16px;
            color: #555;
            text-align: center;
          }
          .otp {
            font-size: 20px;
            font-weight: bold;
            color: #ffffff;
            background-color: #007bff;
            padding: 10px 20px;
            border-radius: 5px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>One Time Password</h1>
          <p class="content">Your one-time password (OTP) has arrived:</p>
          <div class="otp">${otp}</div>
        </div>
      </body>
    </html>
  `,
      );

      return Utils.apiResponse<UserDocument>(
        res,
        StatusCode.OK,
        { otp },
        {
          user: LogUsers.AUTH,
          action: LogAction.SEND,
          message: 'otp sent.',
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
      session?.endSession();

      /************ Send an error response ************/
      return Utils.apiResponse<UserDocument>(
        res,
        StatusCode.INTERNAL_SERVER_ERROR,
        { devError: error.message || 'Server error' },
        {
          user: LogUsers.AUTH,
          action: LogAction.SEND,
          message: JSON.stringify(error),
          status: LogStatus.FAIL,
          serviceLog: UserModel,
          options: {},
        },
      );
    } finally {
      session?.endSession();
    }
  }

  /**
   * Handles the otp verification process for password modification and signup.
   * @param req - Express request object containing the user sign-up data.
   * @param res - Express response object to send the response.
   */
  async VerifyOtp(req: Request, res: Response) {
    const session = null;
    try {
      /************ Extract validated sign-in data ************/
      const validatedVerifyOtpRequestBody = res.locals.validatedVerifyOtpRequestBody;

      const { email, OTPType, otp } = validatedVerifyOtpRequestBody;

      /************ Find user by email or phone number ************/
      const otpData = await AuthController.otpService.findOneMongo(
        {
          email,
          otp: `${email}-${otp}`,
          isValid: false,
        },
        {},
        { session },
      );

      if (!otpData.status) {
        return AuthController.abortTransactionWithResponse(
          res,
          StatusCode.BAD_REQUEST,
          session,
          'invalid request.',
          LogStatus.FAIL,
          ...AuthController.staticsInResponse,
          {
            email: '',
          },
        );
      }

      if ((OTPType as OtpRequestType) === OtpRequestType.PASSWORD) {
        if (!otpData.status) {
          return AuthController.abortTransactionWithResponse(
            res,
            StatusCode.BAD_REQUEST,
            session,
            'invalid request.',
            LogStatus.FAIL,
            ...AuthController.staticsInResponse,
            {
              email: '',
            },
          );
        }

        const token = Utils.createToken({
          email,
          otp,
        });

        /************ Find user by email or phone number ************/
        const user = await AuthController.userService.findOneMongo(
          {
            email,
            deleted: false,
          },
          {},
          { session, hiddenFields: ['password'] },
        );

        if (!user.status) {
          return AuthController.abortTransactionWithResponse(
            res,
            StatusCode.INTERNAL_SERVER_ERROR,
            session,
            'failed to validate user.',
            LogStatus.FAIL,
            ...AuthController.staticsInResponse,
            {
              email: '',
            },
          );
        }

        return Utils.apiResponse<UserDocument>(
          res,
          StatusCode.OK,
          {
            token,
            user: user.data,
          },
          {
            user: LogUsers.AUTH,
            action: LogAction.VERIFY_OTP,
            message: 'password otp verified.',
            status: LogStatus.SUCCESS,
            serviceLog: UserModel,
            options: {
              email,
            },
          },
        );
      }

      const updatedOtpData = await AuthController.otpService.updateOneMongo({ email }, { isValid: true }, { session });

      if (!updatedOtpData.status) {
        return AuthController.abortTransactionWithResponse(
          res,
          StatusCode.NOT_FOUND,
          session,
          'failed to update otp data.',
          LogStatus.FAIL,
          ...AuthController.staticsInResponse,
          {
            email: '',
          },
        );
      }

      /************ Commit the transaction and send a successful response ************/
      await session?.commitTransaction();
      session?.endSession();

      return Utils.apiResponse<UserDocument>(
        res,
        StatusCode.OK,
        {},
        {
          user: LogUsers.AUTH,
          action: LogAction.VERIFY_OTP,
          message: 'email otp verified.',
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
      session?.endSession();

      /************ Send an error response ************/
      return Utils.apiResponse<UserDocument>(
        res,
        StatusCode.INTERNAL_SERVER_ERROR,
        { devError: error.message || 'Server error' },
        {
          user: LogUsers.AUTH,
          action: LogAction.VERIFY_OTP,
          message: JSON.stringify(error),
          status: LogStatus.FAIL,
          serviceLog: UserModel,
          options: {},
        },
      );
    } finally {
      session?.endSession();
    }
  }

  /**
   * Handles the user signup process using email and pw.
   * @param req - Express request object containing the user sign-up data.
   * @param res - Express response object to send the response.
   */
  async SignupWithEmailAndPassword(req: Request, res: Response) {
    const session = null;
    try {
      /************ Extract validated sign-in data ************/
      const validatedSignupWithEPRequestBody = res.locals.validatedSignupWithEPRequestBody;
      const { password, email } = validatedSignupWithEPRequestBody;

      /************ Find user by email or phone number ************/
      const auth = await AuthController.userService.findOneMongo(
        {
          email,
          deleted: false,
        },
        {},
        { session, hiddenFields: ['password'] },
      );

      /************ Handle invalid credentials ************/
      if (auth.status) {
        return AuthController.abortTransactionWithResponse(
          res,
          StatusCode.BAD_REQUEST,
          session,
          'already registered please login.',
          LogStatus.FAIL,
          ...AuthController.staticsInResponse,
          {
            email: '',
          },
        );
      }

      const otpData = await AuthController.otpService.findOneMongo(
        {
          email,
          isValid: true,
        },
        {},
        { session },
      );

      if (!otpData.status) {
        return AuthController.abortTransactionWithResponse(
          res,
          StatusCode.INTERNAL_SERVER_ERROR,
          session,
          'session validation failed please try again.',
          LogStatus.FAIL,
          ...AuthController.staticsInResponse,
          {
            email: '',
          },
        );
      }

      /************ encrypt password ************/
      const hashedPw = Utils.encryptPassword(password);

      /************ Generate access token ************/
      const payload = {
        email,
      };

      const accessToken = Utils.createToken(payload);

      const user = await AuthController.userService.createMongo(
        {
          email,
          password: hashedPw,
        },
        { session },
      );

      if (!user.status) {
        return AuthController.abortTransactionWithResponse(
          res,
          StatusCode.INTERNAL_SERVER_ERROR,
          session,
          'registration failed please try again.',
          LogStatus.FAIL,
          ...AuthController.staticsInResponse,
          {
            email: '',
          },
        );
      }

      /************ Commit the transaction and send a successful response ************/
      await session?.commitTransaction();
      session?.endSession();

      return Utils.apiResponse<UserDocument>(
        res,
        StatusCode.CREATED,
        {
          accessToken,
        },
        {
          user: LogUsers.AUTH,
          action: LogAction.SIGNUP,
          message: 'signup success.',
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
      session?.endSession();

      /************ Send an error response ************/
      return Utils.apiResponse<UserDocument>(
        res,
        StatusCode.INTERNAL_SERVER_ERROR,
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
      session?.endSession();
    }
  }

  /**
   * Handles the user signin process using email and pw.
   * @param req - Express request object containing the user sign-up data.
   * @param res - Express response object to send the response.
   */
  async SigninWithEmailAndPassword(req: Request, res: Response) {
    const session = null;
    try {
      /************ Extract validated sign-in data ************/
      const validatedSigninWithEPRequestBody = res.locals.validatedSigninWithEPRequestBody;
      const { password, email } = validatedSigninWithEPRequestBody;

      /************ Find user by email or phone number ************/
      const auth = await AuthController.userService.findOneMongo(
        {
          email,
          deleted: false,
        },
        {},
        { session, hiddenFields: ['password'] },
      );

      /************ Handle invalid credentials ************/
      if (!auth.status) {
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

      const accessToken = Utils.createToken(payload, '1d');

      /***** send sign-in notification email ******/
      await sendEmail(
        email,
        'You signed in',
        `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #333;
            text-align: center;
            font-size: 24px;
          }
          .content {
            font-size: 16px;
            color: #555;
            text-align: center;
          }
          .timestamp {
            font-size: 14px;
            color: #888;
            text-align: center;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Did you just sign in?</h1>
          <p class="content">We noticed a sign-in attempt to your account.</p>
          <p class="content">If this was you, no further action is needed.</p>
          <p class="timestamp">Signed in at: ${new Date().toLocaleString()}</p>
        </div>
      </body>
    </html>
  `,
      );

      /************ Commit the transaction and send a successful response ************/
      await session?.commitTransaction();
      session?.endSession();

      return Utils.apiResponse<UserDocument>(
        res,
        StatusCode.OK,
        {
          accessToken,
          user: auth.data,
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
      session?.endSession();

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
      session?.endSession();
    }
  }

  /**
   * Signs out a user.
   * @param req - Express request object containing the user sign-up data.
   * @param res - Express response object to send the response.
   */
  async GetAuthUrl(req: Request, res: Response) {
    try {
      const client = AuthController.googleService.client;
      const auth = AuthController.googleService.generateAuthUrl(client);

      if (!auth.status) {
        return AuthController.abortTransactionWithResponse(
          res,
          StatusCode.BAD_REQUEST,
          null,
          auth.message,
          LogStatus.FAIL,
          ...AuthController.staticsInResponse,
          {
            email: '',
          },
        );
      }

      return Utils.apiResponse<UserDocument>(
        res,
        StatusCode.OK,
        {
          redirectUrl: auth.data,
        },
        {
          user: LogUsers.AUTH,
          action: LogAction.READ,
          message: 'success.',
          status: LogStatus.SUCCESS,
          serviceLog: UserModel,
          options: {
            email: '',
          },
        },
      );
    } catch (error) {
      console.log(error);

      /************ Send an error response ************/
      return Utils.apiResponse<UserDocument>(
        res,
        StatusCode.INTERNAL_SERVER_ERROR,
        { devError: error.message || 'Server error' },
        {
          user: LogUsers.AUTH,
          action: LogAction.GET_AUTH_URL,
          message: JSON.stringify(error),
          status: LogStatus.FAIL,
          serviceLog: UserModel,
          options: {},
        },
      );
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
      const validatedSignInWGoogleRequest = res.locals.validatedSignInWGoogleRequest;

      const { code } = validatedSignInWGoogleRequest;

      const client = AuthController.googleService.client;

      const tokens = await AuthController.googleService.getTokens(client, code);

      if (!tokens.status) {
        return AuthController.abortTransactionWithResponse(
          res,
          StatusCode.BAD_REQUEST,
          session,
          tokens.message,
          LogStatus.FAIL,
          ...AuthController.staticsInResponse,
          {
            email: '',
          },
        );
      }

      const payload = await AuthController.googleService.verifyToken(client, tokens.data.id_token);

      if (!payload.status) {
        return AuthController.abortTransactionWithResponse(
          res,
          StatusCode.BAD_REQUEST,
          session,
          payload.message,
          LogStatus.FAIL,
          ...AuthController.staticsInResponse,
          {
            email: '',
          },
        );
      }

      const { email, sub: googleId } = payload.data;

      const user = await AuthController.userService.updateOneMongo(
        {
          email,
        },
        { googleId },
        { session },
      );

      if (!user.status) {
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

      /************ Generate access token ************/
      const accessToken = Utils.createToken(payload);

      /***** send sign-in notification email ******/
      await sendEmail(
        email,
        'You signed in',
        `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #333;
            text-align: center;
            font-size: 24px;
          }
          .content {
            font-size: 16px;
            color: #555;
            text-align: center;
          }
          .timestamp {
            font-size: 14px;
            color: #888;
            text-align: center;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Did you just sign in?</h1>
          <p class="content">We noticed a sign-in attempt to your account.</p>
          <p class="content">If this was you, no further action is needed.</p>
          <p class="timestamp">Signed in at: ${new Date().toLocaleString()}</p>
        </div>
      </body>
    </html>
  `,
      );

      /************ Commit the transaction and send a successful response ************/
      await session?.commitTransaction();
      session?.endSession();

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
      session?.endSession();

      /************ Send an error response ************/
      return Utils.apiResponse<UserDocument>(
        res,
        StatusCode.INTERNAL_SERVER_ERROR,
        { devError: error.message || 'Server error' },
        {
          user: LogUsers.AUTH,
          action: LogAction.SIGNIN,
          message: JSON.stringify(error),
          status: LogStatus.FAIL,
          serviceLog: UserModel,
          options: {},
        },
      );
    } finally {
      session?.endSession();
    }
  }

  /**
   * Handles the user signin process using email and pw.
   * @param req - Express request object containing the user sign-up data.
   * @param res - Express response object to send the response.
   */
  async SigninWithCli(req: Request, res: Response) {
    const session = null;
    try {
      /************ Extract validated sign-in data ************/
      const validatedSignInWCliRequestBody = res.locals.validatedSignInWCliRequestBody;

      const { email, password, principalId, username, projectTokenRef } = validatedSignInWCliRequestBody;

      console.log({ validatedSignInWCliRequestBody });

      /************ Find user by email or phone number ************/
      const auth = await AuthController.userService.findOneMongo(
        {
          email,
          deleted: false,
        },
        {},
        { session },
      );

      /************ Handle invalid credentials ************/
      if (!auth.status) {
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

      /************ updated user canister details ************/
      const userUpdate = await AuthController.userService.updateOneMongo(
        {
          email,
          deleted: false,
        },
        {
          principalId,
          username,
        },
        { session },
      );

      /************ Handle invalid credentials ************/
      if (!userUpdate.status) {
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

      const token = await AuthController.tokenService.findOneMongo({ token: projectTokenRef }, {}, { session });

      if (!token.status) {
        return AuthController.abortTransactionWithResponse(
          res,
          StatusCode.BAD_REQUEST,
          session,
          'token validation failed.',
          LogStatus.FAIL,
          ...AuthController.staticsInResponse,
          {
            email: '',
          },
        );
      }

      const decryptedToken = CryptoUtils.aesDecrypt(projectTokenRef, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

      console.log({ decryptedToken });

      const tokenPayload = Utils.verifyToken(decryptedToken);

      console.log({ tokenPayload });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { iat, exp, ...rest } = tokenPayload as any;

      /************ Generate access token ************/
      const payload = {
        email,
        ...rest,
      };

      /************ Generate access token ************/
      const accessToken = Utils.createToken(payload);

      /***** send cli sign in notification and activate the token with the request. ******/
      await sendEmail(
        email,
        'You signed in',
        `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #333;
            text-align: center;
            font-size: 24px;
          }
          .content {
            font-size: 16px;
            color: #555;
            text-align: center;
          }
          .timestamp {
            font-size: 14px;
            color: #888;
            text-align: center;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Did you just sign in?</h1>
          <p class="content">We noticed a sign-in attempt to your account.</p>
          <p class="content">If this was you, no further action is needed.</p>
          <p class="timestamp">Signed in at: ${new Date().toLocaleString()}</p>
        </div>
      </body>
    </html>
  `,
      );

      /************ Commit the transaction and send a successful response ************/
      await session?.commitTransaction();
      session?.endSession();

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
      session?.endSession();

      /************ Send an error response ************/
      return Utils.apiResponse<UserDocument>(
        res,
        StatusCode.INTERNAL_SERVER_ERROR,
        { devError: error.message || 'Server error' },
        {
          user: LogUsers.AUTH,
          action: LogAction.SIGNIN,
          message: JSON.stringify(error),
          status: LogStatus.FAIL,
          serviceLog: UserModel,
          options: {},
        },
      );
    } finally {
      session?.endSession();
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
      const token = Utils.checkToken(req);

      AddToBlacklist(token);

      return Utils.apiResponse<UserDocument>(
        res,
        StatusCode.OK,
        {},
        {
          user: LogUsers.AUTH,
          action: LogAction.SIGNOUT,
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
        StatusCode.INTERNAL_SERVER_ERROR,
        { devError: error.message || 'Server error' },
        {
          user: LogUsers.AUTH,
          action: LogAction.SIGNOUT,
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
