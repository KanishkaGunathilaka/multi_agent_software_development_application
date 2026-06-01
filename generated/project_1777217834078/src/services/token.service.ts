import jwt from 'jsonwebtoken';
import {
  config,
} from '../config/config';
import { generateRandomToken } from '../utils/cryptoUtils';
import { RefreshTokenRepository } from '../repositories/refreshToken.repository';
import { BadRequestError, UnauthorizedError } from '../utils/httpErrors';
import { addSeconds } from 'date-fns';

/**
 * Service encapsulating token creation and verification.
 */
export const TokenService = {
  /**
   * Signs a JWT access token.
   * @param userId User identifier.
   * @param role User role.
   */
  signAccessToken(userId: string, role: string): string {
    const payload = {
      sub: userId,
      role,
    };
    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.accessTokenTtl,
    });
    return token;
  },

  /**
   * Returns the configured access token TTL (seconds).
   */
  getAccessTokenTtl(): number {
    return config.jwt.accessTokenTtl;
  },

  /**
   * Verifies an access token and returns its payload.
   * Throws UnauthorizedError if invalid.
   */
  verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (err: any) {
      throw new UnauthorizedError('Invalid or expired token.');
    }
  },

  /**
   * Generates a refresh token, stores its hash, and returns the raw token.
   * @param userId Owner user ID.
   */
  async createRefreshToken(userId: string): Promise<string> {
    const rawToken = generateRandomToken(48); // 96 hex chars
    const tokenHash = await this.hashRefreshToken(rawToken);

    const expiresAt = addSeconds(new Date(), config.jwt.refreshTokenTtl);
    await RefreshTokenRepository.create({
      userId,
      tokenHash,
      expiresAt,
    });

    return rawToken;
  },

  /**
   * Validates a raw refresh token and returns the associated user ID.
   */
  async verifyRefreshToken(rawToken: string): Promise<string> {
    const tokenHash = await this.hashRefreshToken(rawToken);
    const stored = await RefreshTokenRepository.findByHash(tokenHash);
    if (!stored) {
      throw new UnauthorizedError('Refresh token not found.');
    }
    if (stored.revoked) {
      throw new UnauthorizedError('Refresh token has been revoked.');
    }
    if (stored.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token has expired.');
    }
    return stored.userId;
  },

  /**
   * Revokes a refresh token.
   */
  async revokeRefreshToken(rawToken: string): Promise<void> {
    const tokenHash = await this.hashRefreshToken(rawToken);
    const stored = await RefreshTokenRepository.findByHash(tokenHash);
    if (!stored) {
      throw new BadRequestError('Refresh token not found.');
    }
    await RefreshTokenRepository.revoke(stored.id);
  },

  /**
   * Hashes a refresh token using SHA‑256 and bcrypt for extra security.
   */
  async hashRefreshToken(token: string): Promise<string> {
    // Simple SHA‑256 hash then bcrypt - keeps token verification fast.
    const crypto = await import('crypto');
    const sha256 = crypto.createHash('sha256').update(token).digest('hex');
    const bcrypt = await import('bcryptjs');
    const saltRounds = 10;
    const hash = await bcrypt.hash(sha256, saltRounds);
    return hash;
  },

  /**
   * Checks a raw token against a stored hash.
   */
  async compareRefreshToken(
    rawToken: string,
    storedHash: string,
  ): Promise<boolean> {
    const crypto = await import('crypto');
    const sha256 = crypto.createHash('sha256').update(rawToken).digest('hex');
    const bcrypt = await import('bcryptjs');
    return bcrypt.compare(sha256, storedHash);
  },
};
