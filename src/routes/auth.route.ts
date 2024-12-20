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
  SigninWithGoogleMiddleware,
  SigninWithCliMiddleware,
  ForgotPasswordMiddleware,
  SigninWithInternetIdentityMiddleware,
  EncryptionAuthMiddleware,
} from '@/middlewares';

/** Import interfaces */
import { Routes } from '@/interfaces';

export class AuthRoute implements Routes {
  public path = '/a';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/get-oauth-url`, AuthController.GetAuthUrl);
    this.router.get(`${this.path}/google-oauth-callback`, SigninWithGoogleMiddleware, AuthController.SigninWithGoogleOAuth);
    this.router.post(`${this.path}/sendOtp`, SendOtpMiddleware, AuthController.SendOtp);
    this.router.post(`${this.path}/verifyOtp`, VerifyOtpMiddleware, AuthController.VerifyOtp);
    this.router.post(`${this.path}/signupWithEP`, SignupWithEPMiddleware, AuthController.SignupWithEmailAndPassword);
    this.router.post(`${this.path}/signinWithEP`, SigninWithEPMiddleware, AuthController.SigninWithEmailAndPassword);
    this.router.post(`${this.path}/signinWithCli`, SigninWithCliMiddleware, AuthController.SigninWithCli);
    this.router.post(`${this.path}/signinWithII`, SigninWithInternetIdentityMiddleware, AuthController.SigninWithInternetIdentity);
    this.router.get(`${this.path}/signout`, CheckTokenMiddleware, AuthController.Signout);
    this.router.post(`${this.path}/forgotPassword`, [CheckTokenMiddleware, ForgotPasswordMiddleware], AuthController.ForgotPassword);
    this.router.post(`${this.path}/encrypt`, [EncryptionAuthMiddleware], AuthController.EncryptData);
    this.router.post(`${this.path}/decrypt`, [EncryptionAuthMiddleware], AuthController.DecryptData);
  }
}
