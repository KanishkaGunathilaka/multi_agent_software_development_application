import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { ProfileController } from '../controllers/profile.controller';

/**
 * Protected routes for user profile.
 */
export const profileRouter = Router();

profileRouter.use(authMiddleware);

profileRouter.get('/', ProfileController.getProfile);
