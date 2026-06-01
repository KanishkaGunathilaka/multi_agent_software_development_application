// src/config/schemas.ts

import { z } from "zod";

/**
 * Zod schema describing the full configuration shape.
 *
 * `.strict()` ensures that *unknown* keys cause a validation error instead of
 * being silently stripped – this catches typos early and avoids accidental
 * configuration drift.
 */
export const ConfigSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),

  OLLAMA_BASE_URL: z.string().url().default("http://localhost:11434"),
  OLLAMA_MODEL: z.string().default("llama3.2"),
  OLLAMA_API_KEY: z.string().optional(),

  VECTOR_DB_URL: z.string().url(),

  LOG_LEVEL: z
    .enum(["error", "warn", "info", "debug"])
    .default("info"),
  ENABLE_EXPERIMENTAL: z.coerce.boolean().default(false),

  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
}).strict(); // reject unknown keys

/**
 * TypeScript type inferred from the Zod schema.
 */
export type Config = z.infer<typeof ConfigSchema>;
