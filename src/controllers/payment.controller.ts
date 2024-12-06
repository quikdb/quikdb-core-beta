import { Request, Response } from 'express';
import { UserDocument, UserModel } from '@/services/mongodb';
import { LogAction, LogStatus, LogUsers, StatusCode } from '@/@types';
import { Utils } from '@/utils';
import { Model } from '@/services';
import { BaseController } from './00_base.controller';

/**
 * PaymentControllers handles the sign-in process for PAYPALs.
 * It includes paypal and stripe payments.
 */
class PaymentController extends BaseController {
  private static staticsInResponse: [LogUsers, LogAction, Model<UserDocument>] = [LogUsers.PAYPAL, LogAction.ERROR, UserModel];

  /**
   * Handles the PayPAL order creation process.
   * @param req - Express request object containing the Order data.
   * @param res - Express response object to send the response.
   */
  async CreatePaypalOrder(req: Request, res: Response) {
    try {
      /************ Extract validated create order data ************/
      const validatedCreatePaypalOrderRequest = res.locals.validatedCreatePaypalOrderRequest;
      const { amount, databaseVersion } = validatedCreatePaypalOrderRequest;

      /************ Find PAYPAL by email or phone number ************/
      const response = await PaymentController.paymentService.createPaypalOrder({
        amount: String(amount),
      });

      console.log({ response: JSON.stringify(response) });

      return Utils.apiResponse<UserDocument>(
        res,
        StatusCode.CREATED,
        {
          ...JSON.parse(response.body as string),
        },
        {
          user: LogUsers.PAYPAL,
          action: LogAction.CREATE_PAYPAL_ORDER,
          message: 'order created.',
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
          user: LogUsers.PAYPAL,
          action: LogAction.CAPTURE_PAYPAL_ORDER,
          message: JSON.stringify(error),
          status: LogStatus.FAIL,
          serviceLog: UserModel,
          options: {},
        },
      );
    }
  }

  /**
   * Handles the Order capture process.
   * @param req - Express request object containing the PAYPAL sign-up data.
   * @param res - Express response object to send the response.
   */
  async CapturePaypalOrder(req: Request, res: Response) {
    try {
      /************ Extract validated capture order data ************/
      const validatedCapturePaypalOrderRequest = res.locals.validatedCapturePaypalOrderRequest;
      const { OrderID } = validatedCapturePaypalOrderRequest;

      console.log({ OrderID });

      /************ Find PAYPAL by email or phone number ************/
      const response = await PaymentController.paymentService.capturePaypalOrder(OrderID);

      console.log({ response: JSON.stringify(response) });

      return Utils.apiResponse<UserDocument>(
        res,
        StatusCode.OK,
        { ...JSON.parse(response.body as string) },
        {
          user: LogUsers.PAYPAL,
          action: LogAction.CAPTURE_PAYPAL_ORDER,
          message: 'order captured.',
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
          user: LogUsers.PAYPAL,
          action: LogAction.CAPTURE_PAYPAL_ORDER,
          message: JSON.stringify(error),
          status: LogStatus.FAIL,
          serviceLog: UserModel,
          options: {},
        },
      );
    }
  }
}

export default new PaymentController();
