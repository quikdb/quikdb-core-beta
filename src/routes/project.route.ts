import { Router } from 'express';

/**** controllers *****/
import ProjectController from '@/controllers/project.controller';

/** Import Middlewares */
import {
  CreateProjectMiddleware,
  GetIdInRequestMiddleware,
  CreateProjectTokenMiddleware,
  UploadMongoMiddleware,
  ActivateProjectMiddleware,
} from '@/middlewares';

/** Import interfaces */
import { Routes } from '@/interfaces';

export class ProjectRoute implements Routes {
  public path = '/p';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, [CreateProjectMiddleware], ProjectController.CreateProject);
    this.router.get(`${this.path}`, ProjectController.FetchProjects);
    this.router.get(`${this.path}/:data`, [GetIdInRequestMiddleware], ProjectController.FetchProject);
    this.router.delete(`${this.path}/:data`, [GetIdInRequestMiddleware], ProjectController.DeleteProject);
    this.router.post(`${this.path}/:data/token`, [GetIdInRequestMiddleware, CreateProjectTokenMiddleware], ProjectController.CreateProjectToken);
    this.router.get(`${this.path}/:data/token`, [GetIdInRequestMiddleware], ProjectController.GetProjectTokens);
    this.router.delete(`${this.path}/:data/token`, [GetIdInRequestMiddleware], ProjectController.DeleteProjectToken);
    this.router.post(`${this.path}/:data/activate`, [GetIdInRequestMiddleware, ActivateProjectMiddleware], ProjectController.ActivateProject);
    this.router.post(`${this.path}/:data/deactivate`, [GetIdInRequestMiddleware], ProjectController.DeactivateProject);

    /***** upload code *****/
    this.router.put(`${this.path}/:data/code`, [GetIdInRequestMiddleware, UploadMongoMiddleware.single('file')], ProjectController.UploadProjectCode);

    /***** download code *****/
    this.router.patch(`${this.path}/:data/code`, [GetIdInRequestMiddleware], ProjectController.DownloadProjectCode);
  }
}
