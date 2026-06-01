import rateLimit from 'express-rate-limit';
import { config } from '../config/config';

/**
 * Rate limiter for login attempts.
 */
export const loginRateLimiter = rateLimit({
  windowMs: config.rateLimiter.login.windowMs,
  max: config.rateLimiter.login.max,
  message: config.rateLimiter.login.message,
  standardHeaders: true,
  legacyHeaders: false,
});
