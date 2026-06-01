import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  LogoutResponse,
} from '../models/auth.dto';
import { TokenService } from '../services/token.service';
import { BadRequestError } from '../utils/httpErrors';

/**
 * Controller handling authentication routes.
 */
export const AuthController = {
  async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const payload: RegisterRequest = req.body;
      const result: RegisterResponse = await UserService.register(payload);
      return res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async login(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { email, password }: LoginRequest = req.body;
      const result: LoginResponse = await UserService.login(email, password);

      // Set HttpOnly cookie for refresh token
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: config.jwt.refreshTokenTtl * 1000,
      });

      // Remove refreshToken from body (already set as cookie)
      const { refreshToken, ...rest } = result;

      return res.status(200).json(rest);
    } catch (err) {
      next(err);
    }
  },

  async refresh(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const rawToken =
        req.body.refreshToken ||
        req.cookies.refreshToken;

      if (!rawToken) {
        throw new BadRequestError('Refresh token missing.');
      }

      const userId = await TokenService.verifyRefreshToken(rawToken);
      const newAccessToken = TokenService.signAccessToken(
        userId,
        // For simplicity, fetch role from DB (could be cached)
        (await UserService.getProfile(userId)).role ?? 'USER',
      );

      const response: RefreshResponse = {
        accessToken: newAccessToken,
        expiresIn: TokenService.getAccessTokenTtl(),
      };

      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  },

  async logout(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const rawToken =
        req.body.refreshToken ||
        req.cookies.refreshToken;

      if (!rawToken) {
        throw new BadRequestError('Refresh token missing.');
      }

      await TokenService.revokeRefreshToken(rawToken);
      res.clearCookie('refreshToken');

      const response: LogoutResponse = {
        message: 'Successfully logged out.',
      };
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  },
};
