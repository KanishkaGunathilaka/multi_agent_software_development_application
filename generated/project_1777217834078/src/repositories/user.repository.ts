import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { IUser } from '../models/user.model';

const prisma = new PrismaClient();

/**
 * Repository for user entities.
 */
export const UserRepository = {
  /**
   * Finds a user by email.
   */
  async findByEmail(email: string): Promise<PrismaUser | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  /**
   * Finds a user by ID.
   */
  async findById(id: string): Promise<PrismaUser | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  /**
   * Creates a new user.
   */
  async create(data: {
    email: string;
    passwordHash: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  }): Promise<PrismaUser> {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role ?? 'USER',
        isActive: true,
      },
    });
  },

  /**
   * Updates a user (used for future extensions).
   */
  async update(
    id: string,
    data: Partial<PrismaUser>,
  ): Promise<PrismaUser> {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  /**
   * Deletes a user (cascades refresh tokens via DB schema).
   */
  async delete(id: string): Promise<PrismaUser> {
    return prisma.user.delete({ where: { id } });
  },
};
