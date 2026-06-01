// src/logger.ts

import { createLogger, format, transports, Logger } from "winston";
import { getConfig } from "./config/config";

/**
 * Factory that creates a Winston logger configured according to the
 * application configuration. The logger is a singleton: the first call
 * initializes it; subsequent calls reuse the same instance.
 *
 * The logger automatically redacts known secret keys before writing logs.
 */
let loggerInstance: Logger | null = null;

/**
 * Simple secret‑redaction utility – replaces known fields with a placeholder.
 *
 * @param obj - Object to be logged.
 * @returns A shallow copy with secret values masked.
 */
function redactSecrets<T extends object>(obj: T): T {
  const secretKeys = [
    "OLLAMA_API_KEY",
    "DB_PASSWORD",
    "DB_USER",
    "DB_HOST",
    "DB_NAME"
  ];
  const copy = { ...obj } as any;
  for (const key of secretKeys) {
    if (key in copy) {
      copy[key] = "[REDACTED]";
    }
  }
  return copy;
}

/**
 * Returns the configured Winston logger.
 *
 * @returns Winston Logger instance.
 */
export async function getLogger(): Promise<Logger> {
  if (loggerInstance) {
    return loggerInstance;
  }

  const cfg = await getConfig();

  loggerInstance = createLogger({
    level: cfg.LOG_LEVEL,
    format: format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      format.printf((info) => {
        // Redact potential secrets in the `message` metadata if it is an object.
        const meta = info.meta ? redactSecrets(info.meta) : undefined;
        return `${info.timestamp} [${info.level}] ${info.message}${
          meta ? ` ${JSON.stringify(meta)}` : ""
        }`;
      })
    ),
    transports: [new transports.Console()],
  });

  return loggerInstance;
}
