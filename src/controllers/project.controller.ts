import { Request, Response } from 'express';
import { ProjectDocument, ProjectModel } from '@/services/mongodb';
import { LogAction, LogStatus, LogUsers, StatusCode } from '@/@types';
import { Utils } from '@/utils';
import { Model } from '@/services';
import { BaseController } from './00_base.controller';
import mongoose from 'mongoose';

/**
 * ProjectControllers handles the sign-in process for Projects.
 * It includes multi-factor authentication (MFA) handling and Project session management.
 */
class ProjectController extends BaseController {
  private static staticsInResponse: [LogUsers, LogAction, Model<ProjectDocument>] = [LogUsers.AUTH, LogAction.SIGNIN, ProjectModel];

  /**
   * Handles the Project creation process.
   * @param req - Express request object containing the Project sign-up data.
   * @param res - Express response object to send the response.
   */
  async CreateProject(req: Request, res: Response) {
    const session = null;
    try {
      /************ Extract validated create project data ************/
      const validatedCreateProjectRequestBody = res.locals.validatedCreateProjectRequestBody;
      const { id } = validatedCreateProjectRequestBody;

      console.log({ validatedCreateProjectRequestBody });

      /************ Find Project by email or phone number ************/
      const project = await ProjectController.projectService.findOneMongo(
        {
          name: id, // id is the name in this case,
        },
        {},
        { session },
      );

      /************ Handle invalid credentials ************/
      if (project.status) {
        return ProjectController.abortTransactionWithResponse(
          res,
          StatusCode.BAD_REQUEST,
          session,
          'project name in use.',
          LogStatus.FAIL,
          ...ProjectController.staticsInResponse,
          {
            email: '',
          },
        );
      }

      const projectData = await ProjectController.projectService.createMongo(
        {
          name: id, // id is the name in this case,
          owner: res.locals.currentUser._id,
        },
        { session },
      );

      if (!projectData.status) {
        return ProjectController.abortTransactionWithResponse(
          res,
          StatusCode.INTERNAL_SERVER_ERROR,
          session,
          'failed to create project. please try again.',
          LogStatus.FAIL,
          ...ProjectController.staticsInResponse,
          {
            email: '',
          },
        );
      }

      /************ Commit the transaction and send a successful response ************/
      await session?.commitTransaction();
      session?.endSession();

      return Utils.apiResponse<ProjectDocument>(
        res,
        StatusCode.CREATED,
        {
          projectData,
        },
        {
          user: LogUsers.PROJECT,
          action: LogAction.CREATE_PROJECT,
          message: 'project created.',
          status: LogStatus.SUCCESS,
          serviceLog: ProjectModel,
          options: {
            email: '',
          },
        },
      );
    } catch (error) {
      console.log(error);
      !session.transaction.isActive && (await session.abortTransaction());
      session?.endSession();

      /************ Send an error response ************/
      return Utils.apiResponse<ProjectDocument>(
        res,
        StatusCode.INTERNAL_SERVER_ERROR,
        { devError: error.message || 'Server error' },
        {
          user: LogUsers.PROJECT,
          action: LogAction.CREATE_PROJECT,
          message: JSON.stringify(error),
          status: LogStatus.FAIL,
          serviceLog: ProjectModel,
          options: {},
        },
      );
    } finally {
      session?.endSession();
    }
  }

  /**
   * fetches all projects.
   * @param req - Express request object containing the Project sign-up data.
   * @param res - Express response object to send the response.
   */
  async FetchProjects(req: Request, res: Response) {
    const session = null;
    console.log({ currentUser: res.locals.currentUser });
    try {
      /************ Find Project by email or phone number ************/
      const projects = await ProjectController.projectService.findMongo({ owner: res.locals.currentUser._id }, { session });

      if (!projects.status) {
        return ProjectController.abortTransactionWithResponse(
          res,
          StatusCode.INTERNAL_SERVER_ERROR,
          session,
          'failed to fetch projects. please try again.',
          LogStatus.FAIL,
          ...ProjectController.staticsInResponse,
          {
            email: '',
          },
        );
      }

      const { status, data, ...rest } = projects;

      return !status || data.length === 0
        ? Utils.apiResponse<ProjectDocument>(
            res,
            StatusCode.OK,
            {
              projects: [],
            },
            {
              user: LogUsers.PROJECT,
              action: LogAction.FETCH_PROJECTS,
              message: 'no project found.',
              status: LogStatus.SUCCESS,
              serviceLog: ProjectModel,
              options: {
                email: '',
              },
            },
          )
        : Utils.apiResponse<ProjectDocument>(
            res,
            StatusCode.OK,
            {
              projects: data,
              ...rest,
            },
            {
              user: LogUsers.PROJECT,
              action: LogAction.FETCH_PROJECTS,
              message: 'projects found.',
              status: LogStatus.SUCCESS,
              serviceLog: ProjectModel,
              options: {
                email: '',
              },
            },
          );
    } catch (error) {
      console.log(error);
      !session.transaction.isActive && (await session.abortTransaction());
      session?.endSession();

      /************ Send an error response ************/
      return Utils.apiResponse<ProjectDocument>(
        res,
        StatusCode.INTERNAL_SERVER_ERROR,
        { devError: error.message || 'Server error' },
        {
          user: LogUsers.PROJECT,
          action: LogAction.FETCH_PROJECTS,
          message: JSON.stringify(error),
          status: LogStatus.FAIL,
          serviceLog: ProjectModel,
          options: {},
        },
      );
    } finally {
      session?.endSession();
    }
  }

  /**
   * Handles the Project creation process.
   * @param req - Express request object containing the Project sign-up data.
   * @param res - Express response object to send the response.
   */
  async FetchProject(req: Request, res: Response) {
    const session = null;
    try {
      /************ Extract validated create project data ************/
      const validatedFetchProjectRequest = res.locals.validatedFetchProjectRequest;
      const { id } = validatedFetchProjectRequest;

      if (!mongoose.isValidObjectId(id)) {
        return ProjectController.abortTransactionWithResponse(
          res,
          StatusCode.BAD_REQUEST,
          session,
          'not a valid id.',
          LogStatus.FAIL,
          ...ProjectController.staticsInResponse,
          {
            email: '',
          },
        );
      }

      /************ Find Project by email or phone number ************/
      const project = await ProjectController.projectService.findOneMongo(
        {
          _id: id,
        },
        {},
        { session },
      );

      const { status, data, ...rest } = project;

      /************ Handle invalid credentials ************/
      if (!status) {
        return ProjectController.abortTransactionWithResponse(
          res,
          StatusCode.BAD_REQUEST,
          session,
          'project not found.',
          LogStatus.FAIL,
          ...ProjectController.staticsInResponse,
          {
            email: '',
          },
        );
      }

      /************ Commit the transaction and send a successful response ************/
      await session?.commitTransaction();
      session?.endSession();

      return Utils.apiResponse<ProjectDocument>(
        res,
        StatusCode.OK,
        {
          project: data,
          ...rest,
        },
        {
          user: LogUsers.PROJECT,
          action: LogAction.FETCH_PROJECT,
          message: 'project found.',
          status: LogStatus.SUCCESS,
          serviceLog: ProjectModel,
          options: {
            email: '',
          },
        },
      );
    } catch (error) {
      console.log(error);
      !session.transaction.isActive && (await session.abortTransaction());
      session?.endSession();

      /************ Send an error response ************/
      return Utils.apiResponse<ProjectDocument>(
        res,
        StatusCode.INTERNAL_SERVER_ERROR,
        { devError: error.message || 'Server error' },
        {
          user: LogUsers.PROJECT,
          action: LogAction.FETCH_PROJECT,
          message: JSON.stringify(error),
          status: LogStatus.FAIL,
          serviceLog: ProjectModel,
          options: {},
        },
      );
    } finally {
      session?.endSession();
    }
  }
}

export default new ProjectController();