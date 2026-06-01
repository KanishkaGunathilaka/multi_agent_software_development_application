import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { loginRateLimiter } from '../middleware/rateLimiter';

/**
 * Routes for authentication.
 */
export const authRouter = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 */
authRouter.post('/register', AuthController.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in and receive access & refresh tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 */
authRouter.post(
  '/login',
  loginRateLimiter,
  AuthController.login,
);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh an access token using a refresh token
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *     responses:
 *       200:
 *         description: New access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshResponse'
 */
authRouter.post('/refresh', AuthController.refresh);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Revoke a refresh token
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *     responses:
 *       200:
 *         description: Logout confirmation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LogoutResponse'
 */
authRouter.post('/logout', AuthController.logout);
