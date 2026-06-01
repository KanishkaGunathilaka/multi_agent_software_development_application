import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';

/**
 * Controller for profile endpoint.
 */
export const ProfileController = {
  async getProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User ID missing in request.');
      }
      const profile = await UserService.getProfile(userId);
      return res.status(200).json(profile);
    } catch (err) {
      next(err);
    }
  },
};
