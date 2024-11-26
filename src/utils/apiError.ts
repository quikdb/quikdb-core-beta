import { StatusCode } from '../@types';

export class ApiError extends Error {
  public methodName: string | undefined;
  public httpCode: StatusCode;

  constructor(message: string | unknown, methodName?: string, httpCode = StatusCode.INTERNAL_SERVER_ERROR) {
    super(<string>message);
    Object.setPrototypeOf(this, new.target.prototype);

    if (methodName) this.methodName = methodName;
    this.httpCode = httpCode;
    this.message = <string>message;

    Error.captureStackTrace(this);
  }
}
