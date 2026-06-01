import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { TokenService } from '../../services/token.service';
import { UnauthorizedError } from '../../utils/httpErrors';

jest.mock('../../services/token.service');

describe('Auth Middleware', () => {
  const mockReq = {} as Request;
  const mockRes = {} as Response;
  const nextFn = jest.fn() as NextFunction;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should reject missing Authorization header', () => {
    mockReq.headers = {};
    authMiddleware(mockReq, mockRes, nextFn);
    expect(nextFn).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('should reject malformed Authorization header', () => {
    mockReq.headers = { authorization: 'BadHeader' };
    authMiddleware(mockReq, mockRes, nextFn);
    expect(nextFn).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('should attach user payload on valid token', () => {
    const payload = { sub: 'user-1', role: 'USER' };
    (TokenService.verifyAccessToken as jest.Mock).mockReturnValue(payload);
    mockReq.headers = { authorization: 'Bearer valid-token' };

    authMiddleware(mockReq, mockRes, nextFn);
    expect(mockReq.user).toEqual({ id: payload.sub, role: payload.role });
    expect(nextFn).toHaveBeenCalledWith();
  });

  it('should forward token verification errors', () => {
    (TokenService.verifyAccessToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError('Invalid token');
    });
    mockReq.headers = { authorization: 'Bearer bad-token' };
    authMiddleware(mockReq, mockRes, nextFn);
    expect(nextFn).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });
});
