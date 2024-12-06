import { Router } from 'express';

/**** controllers *****/
import PaymentController from '@/controllers/payment.controller';

/** Import Middlewares */
import { CreatePaypalOrderMiddleware, CapturePaypalOrderMiddleware } from '@/middlewares';

/** Import interfaces */
import { Routes } from '@/interfaces';

export class PaymentRoute implements Routes {
  public path = '/pay';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, CreatePaypalOrderMiddleware, PaymentController.CreatePaypalOrder);
    this.router.get(`${this.path}/:data`, CapturePaypalOrderMiddleware, PaymentController.CapturePaypalOrder);
  }
}
