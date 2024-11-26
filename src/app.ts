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
      console.error('Failed to initialize Redis client:', err);
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
      if (index === 0) this.app.use('/', route.router); // this is the auth route
      else this.app.use('/', route.router); // add an auth middleware here
    });
  }
}
