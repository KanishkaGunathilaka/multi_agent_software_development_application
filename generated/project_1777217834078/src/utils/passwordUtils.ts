import bcrypt from 'bcryptjs';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

/**
 * Hashes a plain password.
 * @param password Plain password string.
 * @returns Promise resolving to hashed password.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compares a plain password with a stored hash.
 * @param password Plain password.
 * @param hash Stored bcrypt hash.
 * @returns Promise resolving to true if match.
 */
export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Validates password strength according to policy:
 * - Minimum 8 characters
 * - At least one letter
 * - At least one number
 * @param password Password string.
 * @returns True if password meets criteria.
 */
export function isStrongPassword(password: string): boolean {
  const minLength = 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return password.length >= minLength && hasLetter && hasNumber;
}
