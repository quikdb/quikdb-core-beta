import 'reflect-metadata';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { NODE_ENV, PORT, ORIGIN, CREDENTIALS } from '@/config';
import { Routes } from '@/interfaces';
import { Connection } from '@/services';
import { MongoTools } from './utils';
import { CheckTokenMiddleware } from './middlewares';

export class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  public connection: Connection;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;

    this.initializeMiddlewares();
    this.initializeRoutes(routes);
  }

  private listRoutes(express_app: express.Application) {
    express_app._router.stack.forEach((middleware: any) => {
      if (middleware.route) {
        console.log(`Route: ${middleware.route.path}, Methods: ${Object.keys(middleware.route.methods).join(', ')}`);
      } else if (middleware.name === 'router') {
        middleware.handle.stack.forEach((handler: any) => {
          if (handler.route) {
            console.log(`Route: ${handler.route.path}, Methods: ${Object.keys(handler.route.methods).join(', ')}`);
          }
        });
      }
    });
  }

  public async listen() {
    try {
      await MongoTools.InitMongo();
      this.app.listen(this.port, () => {
        console.log(`=================================`);
        console.log(`======= ENV: ${this.env} =======`);
        console.log(`🚀 App listening on the port ${this.port}`);
        console.log(`=================================`);
      });
    } catch (err) {
      console.error('Failed to initialize Mongo:', err);
      process.exit(1);
    }
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(morgan('combined'));
    this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach((route, index) => {
      if (index === 0) this.app.use('/', route.router);
      else this.app.use('/v', CheckTokenMiddleware, route.router);
    });

    this.listRoutes(this.app);
  }
}
