import { Router } from 'express';

/**** controllers *****/
import SignInController from '@/controllers/signin.controller';

/** Import Middlewares */
import { SignInMiddleware, CheckTokenMiddleware } from '@/middlewares/auth.middleware';

/** Import interfaces */
import { Routes } from '@/interfaces';

export class AuthRoute implements Routes {
  public path = '/a';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/signin`, SignInMiddleware, SignInController.Signin);
    this.router.get(`${this.path}/signout`, CheckTokenMiddleware, SignInController.Signout);
  }
}
