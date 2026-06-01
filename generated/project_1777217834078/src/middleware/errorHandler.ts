import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/httpErrors';

/**
 * Central error handling middleware.
 * Formats errors to the standard contract.
 */
export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details || null,
      },
    });
  }

  console.error('Unexpected error:', err);
  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred.',
    },
  });
}
