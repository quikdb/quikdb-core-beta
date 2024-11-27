import { Router } from 'express';

/**** controllers *****/
import AuthController from '@/controllers/auth.controller';

/** Import Middlewares */
import {
  SigninWithEPMiddleware,
  CheckTokenMiddleware,
  SendOtpMiddleware,
  VerifyOtpMiddleware,
  SignupWithEPMiddleware,
} from '@/middlewares/auth.middleware';

/** Import interfaces */
import { Routes } from '@/interfaces';

export class AuthRoute implements Routes {
  public path = '/a';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/sendOtp`, SendOtpMiddleware, AuthController.SendOtp);
    this.router.post(`${this.path}/verifyOtp`, VerifyOtpMiddleware, AuthController.VerifyOtp);
    this.router.post(`${this.path}/signupWithEP`, SignupWithEPMiddleware, AuthController.SignupWithEmailAndPassword);
    this.router.post(`${this.path}/signinWithEP`, SigninWithEPMiddleware, AuthController.SigninWithEmailAndPassword);
    this.router.get(`${this.path}/signout`, CheckTokenMiddleware, AuthController.Signout);
  }
}
