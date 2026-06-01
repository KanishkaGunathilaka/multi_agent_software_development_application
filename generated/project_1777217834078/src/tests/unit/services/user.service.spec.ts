import { UserService } from '../../services/user.service';
import { UserRepository } from '../../repositories/user.repository';
import { TokenService } from '../../services/token.service';
import { hashPassword, isStrongPassword } from '../../utils/passwordUtils';
import { ConflictError, BadRequestError, UnauthorizedError } from '../../utils/httpErrors';

// Mock dependencies
jest.mock('../../repositories/user.repository');
jest.mock('../../services/token.service');
jest.mock('../../utils/passwordUtils');

describe('User Service', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hashed',
    role: 'USER',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const payload = { email: 'new@example.com', password: 'StrongPass1' };
      (UserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (hashPassword as jest.Mock).mockResolvedValue('hashedPwd');
      (UserRepository.create as jest.Mock).mockResolvedValue(mockUser);
      (TokenService.signAccessToken as jest.Mock).mockReturnValue('access-token');
      (TokenService.getAccessTokenTtl as jest.Mock).mockReturnValue(900);

      const result = await UserService.register(payload);
      expect(result).toEqual({
        id: mockUser.id,
        accessToken: 'access-token',
        expiresIn: 900,
      });
      expect(UserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: payload.email,
          passwordHash: 'hashedPwd',
        })
      );
    });

    it('should reject registration with weak password', async () => {
      const payload = { email: 'new@example.com', password: 'weak' };
      (isStrongPassword as jest.Mock).mockReturnValue(false);

      await expect(UserService.register(payload)).rejects.toThrow(BadRequestError);
    });

    it('should reject registration when email already exists', async () => {
      const payload = { email: 'exist@example.com', password: 'StrongPass1' };
      (UserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(UserService.register(payload)).rejects.toThrow(ConflictError);
    });
  });

  describe('login', () => {
    it('should login successfully and return tokens', async () => {
      const email = 'test@example.com';
      const password = 'ValidPass1';
      (UserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(true);
      (TokenService.signAccessToken as jest.Mock).mockReturnValue('access-token');
      (TokenService.createRefreshToken as jest.Mock).mockResolvedValue('raw-refresh');

      const result = await UserService.login(email, password);
      expect(result).toEqual({
        accessToken: 'access-token',
        expiresIn: expect.any(Number),
        refreshToken: 'raw-refresh',
      });
    });

    it('should reject login for non‑existent user', async () => {
      (UserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      await expect(UserService.login('missing@example.com', 'any')).rejects.toThrow(UnauthorizedError);
    });

    it('should reject login for wrong password', async () => {
      (UserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(false);
      await expect(UserService.login(mockUser.email, 'bad')).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('getProfile', () => {
    it('should return public profile fields', async () => {
      (UserRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      const profile = await UserService.getProfile(mockUser.id);
      expect(profile).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        firstName: undefined,
        lastName: undefined,
        createdAt: mockUser.createdAt,
      });
    });

    it('should throw UnauthorizedError when user not found', async () => {
      (UserRepository.findById as jest.Mock).mockResolvedValue(null);
      await expect(UserService.getProfile('nonexistent')).rejects.toThrow(UnauthorizedError);
    });
  });
});
