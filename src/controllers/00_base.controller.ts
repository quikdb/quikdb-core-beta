import { Response } from 'express';
import { LogAction, LogStatus, LogUsers, StatusCode, LogType } from '@/@types';
import { Utils } from '@/utils';
import { ClientSession, Model, UserMongoService, GoogleAuthService, OtpMongoService, ProjectMongoService, TokenMongoService } from '@/services';

/**
 */
export class BaseController {
  protected static userService = UserMongoService;
  protected static otpService = OtpMongoService;
  protected static projectService = ProjectMongoService;
  protected static tokenService = TokenMongoService;
  protected static googleService = GoogleAuthService;
  /**
   * Aborts the current transaction and sends an error response.
   * @param res - Express response object.
   * @param session - MongoDB client session.
   * @param message - Error message to send in the response.
   * @param options - Additional options for the response.
   */
  protected static async abortTransactionWithResponse<T>(
    res: Response,
    statusCode: StatusCode,
    session: ClientSession,
    message: string,
    status: LogStatus,
    user: LogUsers,
    action: LogAction,
    serviceLog: Model<T>,
    options?: LogType,
  ) {
    session && !session.transaction.isActive && (await session.abortTransaction());
    session && session.endSession();
    /************ Abort transaction and send response ************/
    return Utils.apiResponse<T>(
      res,
      statusCode,
      { error: message },
      {
        user,
        action,
        message,
        status,
        serviceLog,
        options,
      },
    );
  }
}
