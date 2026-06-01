// src/config/config.ts

/**
 * Asynchronous, type‑safe configuration loader.
 *
 * The loader:
 * 1. Parses an optional `config.json` file (if present).
 * 2. Loads environment variables from a `.env` file via `dotenv`.
 * 3. Merges the two sources giving **environment variables precedence**.
 * 4. Validates the merged result against the Zod `ConfigSchema`.
 *
 * All errors are wrapped in `ConfigurationError` to avoid leaking secret
 * values. The loader caches its result after the first successful call.
 */

import { readFile, access, constants } from "node:fs/promises";
import { resolve } from "node:path";
import { config as dotenvConfig } from "dotenv";
import { ConfigSchema, Config } from "./schemas";
import { ConfigurationError } from "./errors";

/** Path to the optional JSON config file (project root) */
const JSON_CONFIG_PATH = resolve(process.cwd(), "config.json");

/**
 * Load and parse `config.json` if it exists.
 *
 * @returns A plain object with the JSON content or an empty object.
 * @throws ConfigurationError if the file cannot be parsed.
 */
async function loadJsonConfig(): Promise<Record<string, unknown>> {
  try {
    // `access` checks existence without throwing if missing.
    await access(JSON_CONFIG_PATH, constants.F_OK);
  } catch {
    // File does not exist – silently ignore.
    return {};
  }

  try {
    const raw = await readFile(JSON_CONFIG_PATH, { encoding: "utf8" });
    return JSON.parse(raw) as Record<string, unknown>;
  } catch (err) {
    // Deliberately hide raw payload – only surface a safe message.
    throw new ConfigurationError(
      `Failed to read or parse config.json: ${(err as Error).message}`
    );
  }
}

/** Cached config after first successful load */
let cachedConfig: Config | null = null;

/**
 * Combine environment variables and JSON config, then validate.
 *
 * The spread order is *env overrides json*:
 *   jsonConfig values < environment variable values
 *
 * @returns Validated, type-safe Config object (cached after first call).
 * @throws ConfigurationError on validation failure.
 */
export async function getConfig(): Promise<Config> {
  if (cachedConfig) return cachedConfig;

  // Load .env file into process.env (no-op if missing)
  dotenvConfig();

  const jsonConfig = await loadJsonConfig();

  // Merge: env vars win over JSON config.
  // Only pick known schema keys from process.env to satisfy .strict() on the schema.
  const schemaKeys = Object.keys(ConfigSchema.shape) as Array<keyof typeof ConfigSchema.shape>;
  const envVars = Object.fromEntries(
    schemaKeys
      .filter((k) => k in process.env)
      .map((k) => [k, process.env[k as string]])
  );
  const merged = { ...jsonConfig, ...envVars };

  const result = ConfigSchema.safeParse(merged);

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new ConfigurationError(
      `Invalid configuration:\n${issues}`,
      "CONFIG_VALIDATION_ERROR"
    );
  }

  cachedConfig = result.data;
  return cachedConfig;
}
