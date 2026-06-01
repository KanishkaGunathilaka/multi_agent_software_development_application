/**
 * Base class for HTTP errors.
 */
export class HttpError extends Error {
  status: number;
  code: string;
  details?: any;

  constructor(status: number, code: string, message: string, details?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string, details?: any) {
    super(400, 'BAD_REQUEST', message, details);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string, details?: any) {
    super(401, 'UNAUTHORIZED', message, details);
  }
}

export class ConflictError extends HttpError {
  constructor(message: string, details?: any) {
    super(409, 'CONFLICT', message, details);
  }
}
