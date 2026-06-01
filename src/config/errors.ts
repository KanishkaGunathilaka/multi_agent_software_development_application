// src/config/errors.ts

/**
 * Specialized error class for configuration‑related failures.
 *
 * It deliberately hides raw configuration values to avoid accidental
 * credential leakage in logs or crash reports.
 */
export class ConfigurationError extends Error {
  /** Human‑readable short description (e.g. "Invalid configuration") */
  public readonly code: string;

  /**
   * @param message - A concise, non‑sensitive description.
   * @param code    - Optional error code for programmatic handling.
   */
  constructor(message: string, code: string = "CONFIG_ERROR") {
    super(message);
    this.name = "ConfigurationError";
    this.code = code;
    // Maintains proper stack trace (only works on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConfigurationError);
    }
  }
}
