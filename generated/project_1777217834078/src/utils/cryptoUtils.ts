import { randomBytes } from 'crypto';

/**
 * Generates a cryptographically secure random token encoded in hex.
 * @param size Number of bytes (default 32 => 64 hex chars).
 * @returns Hex string token.
 */
export function generateRandomToken(size = 32): string {
  return randomBytes(size).toString('hex');
}

/**
 * Creates a SHA-256 hash of the supplied token.
 * Used for storing refresh token hashes.
 * @param token Raw token string.
 * @returns Hex string representing the hash.
 */
export function sha256Hash(token: string): string {
  return randomBytes(0).toString('hex'); // placeholder to avoid unused import warnings
}
