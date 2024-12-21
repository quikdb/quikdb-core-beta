import { Request, Response } from 'express';
import { ProjectDocument, ProjectModel, TokenDocument, TokenModel } from '@/services/mongodb';
import { LogAction, LogStatus, LogUsers, StatusCode, Token } from '@/@types';
import * as fs from 'fs';
import * as path from 'path';
import { CryptoUtils, MongoTools, Utils } from '@/utils';
import { Model } from '@/services';
import { BaseController } from './00_base.controller';
import { ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER } from '@/config';

/**
 * ProjectControllers handles the crud process for Projects.
 */
class ProjectController extends BaseController {
  private static staticsInResponse: [LogUsers, LogAction, Model<ProjectDocument>] = [LogUsers.PROJECT, LogAction.ERROR, ProjectModel];

  /**
   * Handles the Project creation process.
   * @param req - Express request object containing the Project sign-up data.
   * @param res - Express response object to send the response.
   */
  async CreateProjectToken(req: Request, res: Response) {
    const session = null;
    const currentUser = res.locals.currentUser;
    console.log({ currentUser });
    try {
      /************ Extract validated fetch project data ************/
      const validatedIdRequest = res.locals.validatedIdRequest;
      const { id } = validatedIdRequest;

      if (!Utils.isObjectId(id)) {
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

      /************ Extract validated create project token data ************/
      const validatedCreateProjectTokenRequestBody = res.locals.validatedCreateProjectTokenRequestBody;
      const { databaseVersion, duration } = validatedCreateProjectTokenRequestBody;

      /************ Find Project by email or phone number ************/
      const project = await ProjectController.projectService.findOneMongo(
        {
          _id: id,
          owner: currentUser._id,
        },
        {},
        { session },
      );

      /************ Handle invalid credentials ************/
      if (!project.status || project.data.owner.toString() !== currentUser._id.toString()) {
        return ProjectController.abortTransactionWithResponse(
          res,
          StatusCode.BAD_REQUEST,
          session,
          'invalid credentials.',
          LogStatus.FAIL,
          ...ProjectController.staticsInResponse,
          {
            email: '',
          },
        );
      }

      /************ Too many tokens created ***********/
      const tokenCount = await ProjectController.tokenService.countMongo(
        {
          user: currentUser._id,
        },
        session,
      );

      /************ Handle too many tokens created ************/
      if (!tokenCount.status || tokenCount.data > 10) {
        return ProjectController.abortTransactionWithResponse(
          res,
          StatusCode.BAD_REQUEST,
          session,
          'too many tokens created.',
          LogStatus.FAIL,
          ...ProjectController.staticsInResponse,
          {
            email: '',
          },
        );
      }

      /************ Generate access token ************/
      const payload = {
        email: currentUser.email,
        databaseVersion,
        projectId: id,
        projectName: project.data.name,
        duration,
      };

      const projectToken = Utils.createToken(payload, `${String(duration)}d`);

      const encryptedProjectToken = CryptoUtils.aesEncrypt(projectToken, ENCRYPTION_KEY, ENCRYPTION_RANDOMIZER);

      /************ Create the Project by email ************/
      const token = await ProjectController.tokenService.updateOneMongo(
        {
          token: encryptedProjectToken,
          projectId: id,
          userId: currentUser._id.toString(),
        },
        {
          userId: currentUser._id,
          type: Token.PROJECT,
          duration,
        },
        { session },
      );

      if (!token.status) {
        return ProjectController.abortTransactionWithResponse(
          res,
          StatusCode.BAD_REQUEST,
          session,
          'failed to create token.',
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

      return Utils.apiResponse<TokenDocument>(
        res,
        StatusCode.CREATED,
        {
          projectToken: encryptedProjectToken,
        },
        {
          user: LogUsers.PROJECT,
          action: LogAction.CREATE_PROJECT_TOKEN,
          message: 'token created.',
          status: LogStatus.SUCCESS,
          serviceLog: TokenModel,
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
      return Utils.apiResponse<TokenDocument>(
        res,
        StatusCode.INTERNAL_SERVER_ERROR,
        { devError: error.message || 'Server error' },
        {
          user: LogUsers.PROJECT,
          action: LogAction.CREATE_PROJECT,
          message: JSON.stringify(error),
          status: LogStatus.FAIL,
          serviceLog: TokenModel,
          options: {},
        },
      );
    } finally {
      session?.endSession();
    }
  }

  /**
   * Handles the Project token fetching process.
   * @param req - Express request object containing the Project sign-up data.
   * @param res - Express response object to send the response.
   */
  async GetProjectTokens(req: Request, res: Response) {
    const session = null;
    const currentUser = res.locals.currentUser;
    try {
      /************ Extract validated fetch project data ************/
      const validatedIdRequest = res.locals.validatedIdRequest;
      const { id } = validatedIdRequest;

      if (!Utils.isObjectId(id)) {
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
          owner: currentUser._id,
        },
        {},
        { session },
      );

      /************ Handle invalid credentials ************/
      if (!project.status || project.data.owner.toString() !== currentUser._id.toString()) {
        return ProjectController.abortTransactionWithResponse(
          res,
          StatusCode.BAD_REQUEST,
          session,
          'invalid credentials.',
          LogStatus.FAIL,
          ...ProjectController.staticsInResponse,
          {
            email: '',
          },
        );
      }

      /************ Create the Project by email ************/
      const token = await ProjectController.tokenService.findMongo(
        {
          userId: currentUser._id.toString(),
          projectId: id,
        },
        { session, populate: ['projectId'] },
      );

      if (!token.status) {
        return ProjectController.abortTransactionWithResponse(
          res,
          StatusCode.BAD_REQUEST,
          session,
          'failed to get token(s).',
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

      if (token.data.length === 0) {
        return Utils.apiResponse<TokenDocument>(
          res,
          StatusCode.OK,
          {
            tokens: [],
          },
          {
            user: LogUsers.PROJECT,
            action: LogAction.FETCH_PROJECT_TOKEN,
            message: 'no tokens found.',
            status: LogStatus.SUCCESS,
            serviceLog: TokenModel,
            options: {
              email: '',
            },
          },
        );
      }

      return Utils.apiResponse<ProjectDocument>(
        res,
        StatusCode.OK,
        {
          tokens: token.data,
        },
        {
          user: LogUsers.PROJECT,
          action: LogAction.FETCH_PROJECT_TOKEN,
          message: 'tokens found.',
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
   * Handles the Project creation process.
   * @param req - Express request object containing the Project sign-up data.
   * @param res - Express response object to send the response.
   */
  async DeleteProjectToken(req: Request, res: Response) {
    const session = null;
    const currentUser = res.locals.currentUser;
    try {
      /************ Extract validated fetch project data ************/
      const validatedIdRequest = res.locals.validatedIdRequest;
      const { id } = validatedIdRequest;

      if (!Utils.isObjectId(id)) {
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

      /************ Find Project token by ids ************/
      const token = await ProjectController.tokenService.findOneMongo(
        {
          _id: id,
          userId: currentUser._id,
        },
        {},
        { session },
      );

      /************ Handle invalid credentials ************/
      if (!token.status || token.data.userId.toString() !== currentUser._id.toString()) {
        return ProjectController.abortTransactionWithResponse(
          res,
          StatusCode.BAD_REQUEST,
          session,
          'invalid request.',
          LogStatus.FAIL,
          ...ProjectController.staticsInResponse,
          {
            email: '',
          },
        );
      }

      /************ Create the Project by email ************/
      const tokenData = await ProjectController.tokenService.deleteByIdMongo(id, { session });

      if (!tokenData.status) {
        return ProjectController.abortTransactionWithResponse(
          res,
          StatusCode.BAD_REQUEST,
          session,
          'failed to delete token.',
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

      return Utils.apiResponse<TokenDocument>(
        res,
        StatusCode.OK,
        {},
        {
          user: LogUsers.PROJECT,
          action: LogAction.DELETE_PROJECT_TOKEN,
          message: 'token deleted.',
          status: LogStatus.SUCCESS,
          serviceLog: TokenModel,
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
      return Utils.apiResponse<TokenDocument>(
        res,
        StatusCode.INTERNAL_SERVER_ERROR,
        { devError: error.message || 'Server error' },
        {
          user: LogUsers.PROJECT,
          action: LogAction.CREATE_PROJECT,
          message: JSON.stringify(error),
          status: LogStatus.FAIL,
          serviceLog: TokenModel,
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
  async CreateProject(req: Request, res: Response) {
    const session = null;
    const currentUser = res.locals.currentUser;
    try {
      /************ Extract validated create project data ************/
      const validatedCreateProjectRequestBody = res.locals.validatedCreateProjectRequestBody;
      const { id, databaseVersion } = validatedCreateProjectRequestBody;

      /************ Find Project by email or phone number ************/
      const project = await ProjectController.projectService.findOneMongo(
        {
          name: id, // id is the name in this case,
          owner: currentUser._id,
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

      /************ Too many projects created ***********/
      const projectCount = await ProjectController.projectService.countMongo(
        {
          owner: currentUser._id,
        },
        session,
      );

      /************ Handle too many tokens created ************/
      if (!projectCount.status || projectCount.data > 10) {
        return ProjectController.abortTransactionWithResponse(
          res,
          StatusCode.BAD_REQUEST,
          session,
          'too many projects created.',
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
          owner: currentUser._id,
          databaseVersion,
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
    const currentUser = res.locals.currentUser;
    try {
      /************ Extract validated fetch project data ************/
      const validatedIdRequest = res.locals.validatedIdRequest;
      const { id } = validatedIdRequest;

      if (!Utils.isObjectId(id)) {
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
          owner: currentUser._id,
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

  /**
   * Handles the Project deletion process.
   * @param req - Express request object containing the Project sign-up data.
   * @param res - Express response object to send the response.
   */
  async DeleteProject(req: Request, res: Response) {
    const session = null;
    const currentUser = res.locals.currentUser;
    try {
      /************ Extract validated fetch project data ************/
      const validatedIdRequest = res.locals.validatedIdRequest;
      const { id } = validatedIdRequest;

      if (!Utils.isObjectId(id)) {
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
          owner: currentUser._id,
        },
        {},
        { session },
      );

      /************ Handle invalid credentials ************/
      if (!project.status || project.data.owner.toString() !== currentUser._id.toString()) {
        return ProjectController.abortTransactionWithResponse(
          res,
          StatusCode.BAD_REQUEST,
          session,
          'invalid request.',
          LogStatus.FAIL,
          ...ProjectController.staticsInResponse,
          {
            email: '',
          },
        );
      }

      /************ Create the Project by email ************/
      const token = await ProjectController.projectService.deleteByIdMongo(id, { session });

      if (!token.status) {
        return ProjectController.abortTransactionWithResponse(
          res,
          StatusCode.BAD_REQUEST,
          session,
          'failed to delete token.',
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
        {},
        {
          user: LogUsers.PROJECT,
          action: LogAction.DELETE_PROJECT,
          message: 'project deleted.',
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
   * Handles the Project code upload process.
   * @param req - Express request object containing the Project sign-up data.
   * @param res - Express response object to send the response.
   */
  async UploadProjectCode(req: Request, res: Response) {
    const session = null;
    const currentUser = res.locals.currentUser;
    try {
      /************ Extract validated fetch project data ************/
      const validatedIdRequest = res.locals.validatedIdRequest;
      const { id } = validatedIdRequest;

      if (!Utils.isObjectId(id)) {
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
          owner: currentUser._id,
        },
        {},
        { session },
      );

      /************ Handle invalid credentials ************/
      if (!project.status || project.data.owner.toString() !== currentUser._id.toString()) {
        return ProjectController.abortTransactionWithResponse(
          res,
          StatusCode.BAD_REQUEST,
          session,
          'invalid credentials.',
          LogStatus.FAIL,
          ...ProjectController.staticsInResponse,
          {
            email: '',
          },
        );
      }

      /************ No file created ************/
      if (!req.file) {
        return ProjectController.abortTransactionWithResponse(
          res,
          StatusCode.BAD_REQUEST,
          session,
          'file upload failed.',
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

      const filePath = path.join(__dirname, '../temp', id);

      // Ensure the file exists before proceeding
      if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);

        Utils.apiResponse<TokenDocument>(
          res,
          StatusCode.INTERNAL_SERVER_ERROR,
          {},
          {
            user: LogUsers.PROJECT,
            action: LogAction.UPLOAD_PROJECT_CODE,
            message: 'file not found after upload.',
            status: LogStatus.SUCCESS,
            serviceLog: TokenModel,
            options: {
              email: '',
            },
          },
        );
      }
      const readStream = fs.createReadStream(filePath);

      const bucket = await MongoTools.InitMongo();

      const writeStream = bucket.openUploadStream(id, {
        chunkSizeBytes: 1048576, // Chunk size of 1MB
        metadata: { fileType: req.file.mimetype }, // Set metadata (e.g., mimetype)
      });

      readStream.pipe(writeStream);

      writeStream.on('finish', () => {
        fs.unlinkSync(filePath);
        Utils.apiResponse<TokenDocument>(
          res,
          StatusCode.OK,
          {
            file: {
              filename: id,
              contentType: req.file.mimetype,
            },
          },
          {
            user: LogUsers.PROJECT,
            action: LogAction.UPLOAD_PROJECT_CODE,
            message: 'file upload success.',
            status: LogStatus.SUCCESS,
            serviceLog: TokenModel,
            options: {
              email: '',
            },
          },
        );
      });

      writeStream.on('error', err => {
        console.error('Error uploading file to GridFS:', err);
        Utils.apiResponse<TokenDocument>(
          res,
          StatusCode.INTERNAL_SERVER_ERROR,
          {},
          {
            user: LogUsers.PROJECT,
            action: LogAction.UPLOAD_PROJECT_CODE,
            message: 'Error uploading file to GridFS',
            status: LogStatus.SUCCESS,
            serviceLog: TokenModel,
            options: {
              email: '',
            },
          },
        );
      });
    } catch (error) {
      console.log(error);
      !session.transaction.isActive && (await session.abortTransaction());
      session?.endSession();

      /************ Send an error response ************/
      return Utils.apiResponse<TokenDocument>(
        res,
        StatusCode.INTERNAL_SERVER_ERROR,
        { devError: error.message || 'Server error' },
        {
          user: LogUsers.PROJECT,
          action: LogAction.CREATE_PROJECT,
          message: JSON.stringify(error),
          status: LogStatus.FAIL,
          serviceLog: TokenModel,
          options: {},
        },
      );
    } finally {
      session?.endSession();
    }
  }

  /**
   * Handles the Project code upload process.
   * @param req - Express request object containing the Project sign-up data.
   * @param res - Express response object to send the response.
   */
  async DownloadProjectCode(req: Request, res: Response) {
    const session = null;
    const currentUser = res.locals.currentUser;
    try {
      /************ Extract validated fetch project data ************/
      const validatedIdRequest = res.locals.validatedIdRequest;
      const { id } = validatedIdRequest;

      if (!Utils.isObjectId(id)) {
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
          owner: currentUser._id,
        },
        {},
        { session },
      );

      /************ Handle invalid credentials ************/
      if (!project.status || project.data.owner.toString() !== currentUser._id.toString()) {
        return ProjectController.abortTransactionWithResponse(
          res,
          StatusCode.BAD_REQUEST,
          session,
          'invalid credentials.',
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

      const bucket = await MongoTools.InitMongo();

      const file = bucket.openDownloadStreamByName(id);

      console.log({ file });

      file.on('error', err => {
        console.log('error downloading file', err);
        Utils.apiResponse<TokenDocument>(
          res,
          StatusCode.NOT_FOUND,
          {},
          {
            user: LogUsers.PROJECT,
            action: LogAction.UPLOAD_PROJECT_CODE,
            message: 'File not found.',
            status: LogStatus.SUCCESS,
            serviceLog: TokenModel,
            options: {
              email: '',
            },
          },
        );
      });

      file.pipe(res);

      file.on('finish', () => {
        Utils.apiResponse<TokenDocument>(
          res,
          StatusCode.OK,
          {},
          {
            user: LogUsers.PROJECT,
            action: LogAction.UPLOAD_PROJECT_CODE,
            message: 'download success.',
            status: LogStatus.SUCCESS,
            serviceLog: TokenModel,
            options: {
              email: '',
            },
          },
        );
      });
    } catch (error) {
      console.log(error);
      !session.transaction.isActive && (await session.abortTransaction());
      session?.endSession();

      /************ Send an error response ************/
      return Utils.apiResponse<TokenDocument>(
        res,
        StatusCode.INTERNAL_SERVER_ERROR,
        { devError: error.message || 'Server error' },
        {
          user: LogUsers.PROJECT,
          action: LogAction.CREATE_PROJECT,
          message: JSON.stringify(error),
          status: LogStatus.FAIL,
          serviceLog: TokenModel,
          options: {},
        },
      );
    } finally {
      session?.endSession();
    }
  }
}

export default new ProjectController();
