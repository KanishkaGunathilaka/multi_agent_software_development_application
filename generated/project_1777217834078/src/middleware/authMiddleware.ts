import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/token.service';
import { UnauthorizedError } from '../utils/httpErrors';

/**
 * Middleware that validates JWT access tokens.
 * On success, attaches `req.user = { id, role }`.
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Authorization header missing.'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = TokenService.verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      role: payload.role,
    };
    next();
  } catch (err) {
    next(err);
  }
}
