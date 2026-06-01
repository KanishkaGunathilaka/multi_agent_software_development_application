import { PrismaClient, RefreshToken as PrismaRefreshToken } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Repository for refresh token persistence.
 */
export const RefreshTokenRepository = {
  /**
   * Stores a new refresh token record.
   */
  async create(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<PrismaRefreshToken> {
    return prisma.refreshToken.create({ data });
  },

  /**
   * Finds a token by its hash.
   */
  async findByHash(tokenHash: string): Promise<PrismaRefreshToken | null> {
    return prisma.refreshToken.findFirst({
      where: { tokenHash },
    });
  },

  /**
   * Revokes a token.
   */
  async revoke(id: string): Promise<PrismaRefreshToken> {
    return prisma.refreshToken.update({
      where: { id },
      data: { revoked: true },
    });
  },

  /**
   * Deletes expired or revoked tokens (optional cleanup).
   */
  async deleteOld(): Promise<void> {
    const now = new Date();
    await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { revoked: true },
          { expiresAt: { lt: now } },
        ],
      },
    });
  },
};
