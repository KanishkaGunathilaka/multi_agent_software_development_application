import jwt from 'jsonwebtoken';
import { TokenService } from '../../services/token.service';
import { RefreshTokenRepository } from '../../repositories/refreshToken.repository';
import { config } from '../../config/config';

// Mock config to have deterministic secret & TTLs
jest.mock('../../config/config', () => ({
  config: {
    jwt: {
      secret: 'test_secret',
      accessTokenTtl: 900,
      refreshTokenTtl: 2592000,
    },
  },
}));

// Mock RefreshTokenRepository
jest.mock('../../repositories/refreshToken.repository', () => ({
  RefreshTokenRepository: {
    create: jest.fn(),
    findByHash: jest.fn(),
    revoke: jest.fn(),
  },
}));

// Mock hashRefreshToken to be deterministic (just return the raw token)
jest.spyOn(TokenService as any, 'hashRefreshToken').mockImplementation(async (token: string) => token);

describe('Token Service', () => {
  const userId = 'user-123';
  const role = 'USER';

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should sign and verify an access token', () => {
    const token = TokenService.signAccessToken(userId, role);
    expect(typeof token).toBe('string');

    const payload = TokenService.verifyAccessToken(token);
    expect(payload.sub).toBe(userId);
    expect(payload.role).toBe(role);
  });

  it('should return configured access token TTL', () => {
    expect(TokenService.getAccessTokenTtl()).toBe(900);
  });

  it('should create a refresh token and store its hash', async () => {
    const rawToken = await TokenService.createRefreshToken(userId);
    expect(typeof rawToken).toBe('string');
    expect(RefreshTokenRepository.create).toHaveBeenCalledWith({
      userId,
      tokenHash: rawToken, // because we mocked hashRefreshToken
      expiresAt: expect.any(Date),
    });
  });

  it('should verify a valid refresh token', async () => {
    const rawToken = 'raw-refresh-token';
    // Mock repository to return a matching record
    (RefreshTokenRepository.findByHash as jest.Mock).mockResolvedValue({
      tokenHash: rawToken,
      revoked: false,
      expiresAt: new Date(Date.now() + 10000),
      userId,
    });

    const verifiedUserId = await TokenService.verifyRefreshToken(rawToken);
    expect(verifiedUserId).toBe(userId);
    expect(RefreshTokenRepository.findByHash).toHaveBeenCalledWith(rawToken);
  });

  it('should reject a revoked refresh token', async () => {
    const rawToken = 'revoked-token';
    (RefreshTokenRepository.findByHash as jest.Mock).mockResolvedValue({
      tokenHash: rawToken,
      revoked: true,
      expiresAt: new Date(Date.now() + 10000),
      userId,
    });

    await expect(TokenService.verifyRefreshToken(rawToken)).rejects.toThrow('Refresh token has been revoked.');
  });

  it('should revoke a refresh token', async () => {
    const rawToken = 'to-revoke';
    (RefreshTokenRepository.findByHash as jest.Mock).mockResolvedValue({
      id: 'rt-1',
      tokenHash: rawToken,
      revoked: false,
    });

    await TokenService.revokeRefreshToken(rawToken);
    expect(RefreshTokenRepository.revoke).toHaveBeenCalledWith('rt-1');
  });
});
