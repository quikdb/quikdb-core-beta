import { Router } from 'express';

/**** controllers *****/
import ProjectController from '@/controllers/project.controller';

/** Import Middlewares */
import { CreateProjectMiddleware, FetchProjectMiddleware } from '@/middlewares';

/** Import interfaces */
import { Routes } from '@/interfaces';

export class ProjectRoute implements Routes {
  public path = '/p';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, CreateProjectMiddleware, ProjectController.CreateProject);
    this.router.get(`${this.path}`, ProjectController.FetchProjects);
    this.router.get(`${this.path}/:data`, FetchProjectMiddleware, ProjectController.FetchProject);
  }
}
