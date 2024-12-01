import mongoose from 'mongoose';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { Request, Response } from 'express';
import { parse } from 'js2xmlparser';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { createHash, randomBytes } from 'crypto';
import {
  APIResponseType,
  LogOptionsType,
  applicationJsonType,
  applicationXmlType,
  ExternalAPIResponseType,
  LogStatus,
  GenericAnyType,
} from '../@types';
import bcrypt from 'bcryptjs';
import { JWT_SECRET_KEY, logger } from '../config';
import { Schema } from 'joi';

export class Utils {
  public static generateAppKey = (prefix = '', format: BufferEncoding = 'hex') => {
    return prefix + randomBytes(8).toString(format) + uuidv4();
  };

  public static generateRequestId(string: string): string {
    return createHash('md5').update(string).digest('hex');
  }

  static isValidURL = (str: string): boolean => {
    if (!str) return false;

    const pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i',
    ); // fragment locator
    return !!pattern.test(str);
  };

  static containsSpecialChars(str: string): boolean {
    const re = /[ `!@#$%^&*()+\=\[\]{};':"\\|,.<>\/?~]/;
    return re.test(str);
  }

  static generateUniqueId(key?: string): string {
    if (key) {
      return `${key}_${uuidv4()}`;
    }
    return uuidv4();
  }

  static convertMillisecondsToDateTime(milliseconds: number): Date {
    const date = new Date(milliseconds);
    return date;
  }

  public static generateRandomNumber(length: number): number {
    if (process.env.NODE_ENV !== 'production') {
      return Number('123456'.substring(0, length));
    }
    return Math.floor(Math.pow(10, length - 1) + Math.random() * Math.pow(10, length - 1) * 9);
  }

  public static getFileExtension(filename: string): string {
    const dotIndex = filename.lastIndexOf('.');
    if (dotIndex !== -1 && dotIndex < filename.length - 1) {
      return filename.substring(dotIndex + 1).toLowerCase();
    }
    return '';
  }

  static slugifyText = (text: string): string => {
    if (text === null || typeof text === 'undefined') {
      return text;
    }
    if (text.indexOf(' ') >= 0) {
      return slugify(text.toLowerCase(), '-');
    }
    return text.toLowerCase();
  };

  static isObjectId(value: string | mongoose.Types.ObjectId): boolean {
    return mongoose.isValidObjectId(value);
  }

  public static getIp(req: Request): string | undefined {
    let ip: string | undefined =
      (req.headers['x-real-ip'] as string) ||
      (Array.isArray(req.headers['x-forwarded-for'])
        ? req.headers['x-forwarded-for'][0]
        : req.headers['x-forwarded-for']?.split(',').shift()?.trim()) ||
      req.socket?.remoteAddress ||
      req.ip;

    if (ip && ip.substring(0, 7) === '::ffff:') {
      ip = ip.substring(7);
    }

    return ip;
  }

  static encryptPassword(password: string): string {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  }

  static comparePasswords(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }

  static createToken(payload: object, expiresIn = '5m'): string {
    return sign(payload, JWT_SECRET_KEY as string, { expiresIn });
  }

  static checkToken(req: Request): string | null {
    const {
      headers: { authorization },
      cookies: { token: cookieToken },
    } = req;
    const token = authorization || cookieToken || req.headers['x-access-token'] || req.headers?.token || req.body?.token;

    return token || null;
  }

  static verifyToken(token: string): string | JwtPayload | boolean | object {
    try {
      const response = verify(token, JWT_SECRET_KEY as string);
      return response;
    } catch (err) {
      return false;
    }
  }

  static apiResponse<T>(
    res: Response,
    code: number,
    data: string | object | null = null,
    logData: LogOptionsType<T>,
    rootElement: string | null = '',
  ): Response {
    const response: APIResponseType = {
      status: logData.status,
      code,
      action: logData.action,
      message: logData.message || getReasonPhrase(logData.status),
      data,
    };
    const request = {
      headers: res.req.headers,
      method: res.req.method,
      url: `${res.req.baseUrl}${res.req.url}`,
      body: res.req.body,
      params: res.req.params,
      query: res.req.query,
    };
    logger({
      action: logData.action,
      status: logData.status,
      message: logData.message,
      user: logData.user,
      serviceLog: logData.serviceLog,
      options: {
        ...logData.options,
        apiRequest: JSON.stringify(request),
        apiResponse: ' ',
      },
    });
    return res.format({
      json: () => {
        res.type(applicationJsonType);
        res.status(code).send(response);
      },
      xml: () => {
        res.type(applicationXmlType);
        res.status(code).send(parse(rootElement || 'response', response));
      },
      default: () => {
        res.status(StatusCodes.NOT_IMPLEMENTED).send(getReasonPhrase(StatusCodes.NOT_IMPLEMENTED));
      },
    });
  }

  static createExternalApiResponse<T>(
    message: string,
    status: LogStatus,
    code: number,
    data: T | null = null,
    response: GenericAnyType = null,
  ): ExternalAPIResponseType<T> {
    console.log({ externalApiResponse: response });
    return { message, code, status, data };
  }

  static validateJoiSchema = <T>(schema: Schema, data: T): { value?: T; error?: string } => {
    const { error, value } = schema.validate(data);
    if (error) {
      return { error: error.details[0].message };
    }
    return { value };
  };

  /**
   * Replaces placeholders in an HTML template string with actual values.
   * @param templateString - The HTML template string with placeholders.
   * @param variables - An object containing the variables to replace in the template.
   * @returns The HTML string with replaced variables.
   */
  static replaceTemplateVariables(templateString: string, variables: Record<string, string>): string {
    let replacedString = templateString;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      replacedString = replacedString.replace(new RegExp(placeholder, 'g'), value);
    }

    return replacedString;
  }

  /**
   * Reads an HTML file, replaces the variables with the provided values, and returns the processed HTML string.
   * @param filePath - The path to the HTML file.
   * @param variables - An object containing the variables to replace in the HTML template.
   * @returns The processed HTML string with variables replaced.
   */
  static generateHtmlFromFile(filePath: string, variables: Record<string, string>): string {
    const templateString = fs.readFileSync(filePath, 'utf-8');

    return this.replaceTemplateVariables(templateString, variables);
  }

  static generateOtp(): string {
    let otp = '';
    for (let i = 0; i < 6; i++) {
      const digit = Math.floor(Math.random() * 10); // Generates a random digit from 0 to 9
      otp += digit.toString();
    }
    return otp;
  }
}
