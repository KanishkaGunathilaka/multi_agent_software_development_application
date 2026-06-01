import request from 'supertest';
import { createApp } from '../../app';
import { UserRepository } from '../../repositories/user.repository';
import { RefreshTokenRepository } from '../../repositories/refreshToken.repository';
import { TokenService } from '../../services/token.service';

// Mock all repository and token service calls
jest.mock('../../repositories/user.repository');
jest.mock('../../repositories/refreshToken.repository');
jest.mock('../../services/token.service');

const app = createApp();

describe('Auth Routes Integration', () => {
  const mockUser = {
    id: 'user-123',
    email: 'john@example.com',
    passwordHash: 'hashed',
    role: 'USER',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return 201 with token', async () => {
      (UserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (UserRepository.create as jest.Mock).mockResolvedValue(mockUser);
      (TokenService.signAccessToken as jest.Mock).mockReturnValue('access.jwt');
      (TokenService.getAccessTokenTtl as jest.Mock).mockReturnValue(900);

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: mockUser.email, password: 'StrongPass1' })
        .expect(201);

      expect(res.body).toHaveProperty('id', mockUser.id);
      expect(res.body).toHaveProperty('accessToken', 'access.jwt');
      expect(res.body).toHaveProperty('expiresIn', 900);
    });

    it('should return 409 when email already exists', async () => {
      (UserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      await request(app)
        .post('/api/auth/register')
        .send({ email: mockUser.email, password: 'StrongPass1' })
        .expect(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login and set httpOnly refresh token cookie', async () => {
      (UserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      const bcrypt = await import('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      (TokenService.signAccessToken as jest.Mock).mockReturnValue('access.jwt');
      (TokenService.createRefreshToken as jest.Mock).mockResolvedValue('raw-refresh-token');

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: mockUser.email, password: 'StrongPass1' })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken', 'access.jwt');
      expect(res.body).toHaveProperty('expiresIn');
      expect(res.headers['set-cookie'][0]).toMatch(/refreshToken=.*HttpOnly/);
    });

    it('should reject invalid credentials with 401', async () => {
      (UserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'missing@example.com', password: 'any' })
        .expect(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token using cookie', async () => {
      const newAccess = 'new.access.jwt';
      (TokenService.verifyRefreshToken as jest.Mock).mockResolvedValue(mockUser.id);
      (TokenService.signAccessToken as jest.Mock).mockReturnValue(newAccess);
      // Mock profile fetch to get role (simplify by returning USER)
      jest.spyOn(UserRepository, 'findById').mockResolvedValue(mockUser);

      const agent = request.agent(app);
      // Set cookie manually
      agent.jar.setCookie('refreshToken=valid-cookie-token');

      const res = await agent.post('/api/auth/refresh').send().expect(200);
      expect(res.body).toEqual({ accessToken: newAccess, expiresIn: expect.any(Number) });
    });

    it('should reject missing refresh token with 400', async () => {
      await request(app).post('/api/auth/refresh').send().expect(400);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should revoke refresh token and clear cookie', async () => {
      (TokenService.revokeRefreshToken as jest.Mock).mockResolvedValue(undefined);

      const agent = request.agent(app);
      agent.jar.setCookie('refreshToken=to-revoke');

      const res = await agent.post('/api/auth/logout').send().expect(200);
      expect(res.body).toHaveProperty('message');
      expect(res.headers['set-cookie'][0]).toMatch(/refreshToken=;/); // cleared
    });
  });
});
