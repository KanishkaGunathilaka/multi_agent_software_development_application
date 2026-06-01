import {
  RegisterRequest,
  RegisterResponse,
} from '../models/auth.dto';
import { UserRepository } from '../repositories/user.repository';
import {
  hashPassword,
  isStrongPassword,
  comparePassword,
} from '../utils/passwordUtils';
import { TokenService } from './token.service';
import { UserRole } from '../models/user.model';
import { BadRequestError, ConflictError, UnauthorizedError } from '../utils/httpErrors';

/**
 * Service handling user‑related business logic.
 */
export const UserService = {
  /**
   * Registers a new user, returns ID and access token.
   */
  async register(
    payload: RegisterRequest,
  ): Promise<RegisterResponse> {
    const { email, password, firstName, lastName } = payload;

    if (!email || !password) {
      throw new BadRequestError('Email and password are required.');
    }

    if (!isStrongPassword(password)) {
      throw new BadRequestError(
        'Password must be at least 8 characters long and contain letters and numbers.',
      );
    }

    const existing = await UserRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('Email is already registered.');
    }

    const passwordHash = await hashPassword(password);
    const user = await UserRepository.create({
      email,
      passwordHash,
      firstName,
      lastName,
      role: UserRole.USER,
    });

    const accessToken = TokenService.signAccessToken(user.id, user.role);
    return {
      id: user.id,
      accessToken,
      expiresIn: TokenService.getAccessTokenTtl(),
    };
  },

  /**
   * Authenticates a user and returns access & refresh tokens.
   */
  async login(email: string, password: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const passwordMatches = await comparePassword(
      password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const accessToken = TokenService.signAccessToken(user.id, user.role);
    const refreshToken = await TokenService.createRefreshToken(user.id);

    return {
      accessToken,
      expiresIn: TokenService.getAccessTokenTtl(),
      refreshToken,
    };
  },

  /**
   * Retrieves profile data for a given user ID.
   */
  async getProfile(userId: string) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found.');
    }
    const { id, email, firstName, lastName, createdAt } = user;
    return { id, email, firstName, lastName, createdAt };
  },
};
