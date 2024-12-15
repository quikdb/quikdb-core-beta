import { Request, Response } from 'express';
import { UserDocument, UserModel } from '@/services/mongodb';
import { LogAction, LogStatus, LogUsers, PaymentStatus, PaymentType, StatusCode } from '@/@types';
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
      const { amount, databaseVersion, projectId } = validatedCreatePaypalOrderRequest;

      /************ Find PAYPAL by email or phone number ************/
      const response = await PaymentController.paymentService.createPaypalOrder({
        amount: String(amount),
      });

      const payload: PaymentType = {
        userId: res.locals.currentUser._id,
        projectId,
        databaseVersion,
        status: PaymentStatus.INITIATED,
        orderId: JSON.parse((response?.body as string) || '')?.id || '',
        amount,
        metadata: response.body as string,
      };

      const payment = await PaymentController.paymentService.mongo.createMongo(payload);

      if (!payment.status) {
        return Utils.apiResponse<UserDocument>(
          res,
          StatusCode.INTERNAL_SERVER_ERROR,
          {},
          {
            user: LogUsers.PAYPAL,
            action: LogAction.CREATE_PAYPAL_ORDER,
            message: 'failed to initiate order.',
            status: LogStatus.FAIL,
            serviceLog: UserModel,
            options: {
              email: '',
            },
          },
        );
      }

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
    const currentUser = res.locals.currentUser;
    try {
      /************ Extract validated capture order data ************/
      const validatedCapturePaypalOrderRequest = res.locals.validatedCapturePaypalOrderRequest;
      const { order } = validatedCapturePaypalOrderRequest;

      const [orderId, projectId] = order.split('-');

      /************ Find PAYPAL by email or phone number ************/
      const response = await PaymentController.paymentService.capturePaypalOrder(orderId);

      const payment = await PaymentController.paymentService.mongo.updateOneMongo(
        { projectId, userId: currentUser._id, orderId },
        {
          status: PaymentStatus.COMPLETED,
          metadata: response.body as string,
        },
      );

      if (!payment.status) {
        return Utils.apiResponse<UserDocument>(
          res,
          StatusCode.INTERNAL_SERVER_ERROR,
          {},
          {
            user: LogUsers.PAYPAL,
            action: LogAction.CREATE_PAYPAL_ORDER,
            message: 'failed to initiate order.',
            status: LogStatus.FAIL,
            serviceLog: UserModel,
            options: {
              email: '',
            },
          },
        );
      }

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
