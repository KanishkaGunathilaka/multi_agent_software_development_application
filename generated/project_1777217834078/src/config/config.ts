import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Centralised configuration object.
 */
export const config = {
  port: parseInt(process.env.PORT || '3000', 10),

  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret',
    accessTokenTtl: parseInt(process.env.ACCESS_TOKEN_TTL || '900', 10), // seconds
    refreshTokenTtl: parseInt(process.env.REFRESH_TOKEN_TTL || '2592000', 10), // seconds
  },

  db: {
    url: process.env.DATABASE_URL || '',
  },

  rateLimiter: {
    login: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 5, // max attempts per window per IP
      message:
        'Too many login attempts from this IP, please try again after 5 minutes.',
    },
  },
};
