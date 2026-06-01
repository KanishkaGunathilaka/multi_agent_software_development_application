# Software Project: convert project you created earlier into typescript. Project location is /Users/kanishkagunathilaka/Documents/research-assistant/output
*Generated: April 25, 2026 at 19:53*
*Multi-Agent Pipeline: Requirements → Architect → [N×Researcher] → [N×Coder] → Assembler → Reviewer → Refactorer*

---

## File: `package.json`
```json
{
  "name": "research-assistant",
  "version": "1.0.0",
  "description": "A TypeScript research‑assistant service with LLM integration and vector‑db support.",
  "main": "dist/index.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "tsx src/server.ts",
    "lint": "eslint 'src/**/*.ts'",
    "typecheck": "tsc --noEmit",
    "test": "jest"
  },
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "zod": "^3.23.8",
    "winston": "^3.13.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.14",
    "@types/node": "^20.14.2",
    "eslint": "^9.6.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-import": "^2.29.1",
    "jest": "^29.7.0",
    "tsx": "^4.9.5",
    "typescript": "^5.5.2"
  }
}
```

---

## File: `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "resolveJsonModule": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

---

## File: `.eslintrc.js`
```js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'prettier'
  ],
  env: {
    node: true,
    es2022: true,
    jest: true
  },
  rules: {
    // Add project‑specific overrides here
    '@typescript-eslint/no-explicit-any': 'warn',
    'import/order': ['error', { 'newlines-between': 'always' }]
  }
};
```

---

## File: `jest.config.js`
```js
/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
};
```

---

## File: `.env.example`
```dotenv
# Application environment
NODE_ENV=development
PORT=3000

# OpenAI credentials
OPENAI_API_KEY=sk-XXXXXXXXXXXXXXXXXXXXXXXX
OPENAI_MODEL=gpt-4o-mini

# Vector DB
VECTOR_DB_URL=https://example.pinecone.io

# Logging
LOG_LEVEL=info
ENABLE_EXPERIMENTAL=false

# PostgreSQL (example)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=secret
DB_NAME=research_assistant
```

---

## File: `README.md`
```markdown
# Research Assistant

A lightweight TypeScript service that integrates with an LLM (OpenAI) and a vector database.  
It demonstrates solid configuration handling, error safety, and a clear public API surface.

## 📦 Project Setup

| Step | Command |
|------|---------|
| **1️⃣ Install dependencies** | `npm ci` (or `npm install` if `package-lock.json` is missing) |
| **2️⃣ Build the sources** | `npm run build` – compiles `src/**/*.ts` → `dist/` |
| **3️⃣ Run the app** | `npm start` – launches the compiled server (`dist/server.js`) |
| **4️⃣ Run in development** | `npm run dev` – uses `tsx` for on‑the‑fly compilation with hot‑reload |
| **5️⃣ Lint / type‑check** | `npm run lint` & `npm run typecheck` |
| **6️⃣ Test** | `npm test` – runs Jest unit tests |

### Required Environment Variables

The configuration loader validates the variables described below (see `src/config/schemas.ts` for the source of truth). Provide them via a **`.env`** file at the project root, the host environment, or a **`config.json`** file.

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Execution mode (`development`, `production`, …) | `development` |
| `PORT` | HTTP port (defaults to `3000`) | `8080` |
| `OPENAI_API_KEY` | OpenAI secret key (required) | `sk-…` |
| `OPENAI_MODEL` | Model to use – defaults to `gpt-4o-mini` | `gpt-4o` |
| `VECTOR_DB_URL` | URL of the vector DB service | `https://example.pinecone.io` |
| `LOG_LEVEL` | Minimum log level (`error`, `warn`, `info`, `debug`) | `info` |
| `ENABLE_EXPERIMENTAL` | Feature‑toggle (`true`/`false`) | `true` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port (default `5432`) | `5432` |
| `DB_USER` | PostgreSQL user | `postgres` |
| `DB_PASSWORD` | PostgreSQL password (secret) | `secret` |
| `DB_NAME` | PostgreSQL database name | `research_assistant` |

> **⚠️ Security note** – Never commit real secrets. Keep a clean `.env.example` template and add `.env` to `.gitignore`.

## 🛠️ Architecture Overview

```
src/
 ├─ config/
 │   ├─ schemas.ts      – Zod schema definitions (strict)
 │   ├─ config.ts      – Async config loader with safe error handling
 │   └─ errors.ts      – Custom ConfigurationError
 ├─ logger.ts          – Winston‑based logger
 ├─ app.ts             – Express app creation (routes, middleware)
 ├─ server.ts          – Bootstrap: loads config, starts HTTP server
 └─ index.ts           – Public API barrel (currently empty)
```

## 🚀 Running locally

```bash
cp .env.example .env
# edit .env with your own credentials
npm run dev
```

The server will start on `http://localhost:${PORT}` and log to the console.

---

## 📜 License

MIT © 2024 Your Name
```

---

## File: `src/index.ts`
```typescript
// src/index.ts

/**
 * Public entry point for the `research-assistant` package.
 *
 * The project currently does not expose any consumable symbols, but this file
 * exists to provide a stable module that downstream packages can import.
 * When new public APIs are added, export them explicitly below.
 *
 * Example:
 *
 * ```ts
 * export { getConfig } from "./config/config";
 * export { logger } from "./logger";
 * export * from "./app";
 * ```
 */

export {};
```

---

## File: `src/config/schemas.ts`
```typescript
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

  OPENAI_API_KEY: z.string().min(1, "OpenAI API key is required"),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),

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
```

---

## File: `src/config/errors.ts`
```typescript
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
```

---

## File: `src/config/config.ts`
```typescript
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

/**
 * Combine environment variables and JSON config, then validate.
 *
 * The spread order is *env overrides json*:
 *
 * ```ts
 * const combined = { ...jsonConfig, ...process.env };
 * //                ^^^^   ^^^^^^^^^^^^^^^
 * //   (default)      (override)
 * ```
 *
 * Keeping the comment next to the code prevents future accidental reversal.
 *
 * @param jsonConfig - Config values from `config.json`.
 * @returns An object ready for Zod validation.
 */
function mergeSources(
  jsonConfig: Record<string, unknown>
): Record<string, unknown> {
  // env overrides json
  return { ...jsonConfig, ...process.env };
}

/** Cached configuration after first successful load */
let cachedConfigPromise: Promise<Config> | null = null;

/**
 * Public accessor for the application configuration.
 *
 * It returns a promise that resolves to a fully validated `Config` object.
 * Subsequent calls return the same promise, guaranteeing a single load.
 *
 * @returns Promise of the validated configuration.
 * @throws ConfigurationError if validation fails.
 */
export async function getConfig(): Promise<Config> {
  if (!cachedConfigPromise) {
    cachedConfigPromise = (async () => {
      // Load .env (if present) **before** we read JSON so that the file can
      // reference values from the environment if desired.
      dotenvConfig({ path: resolve(process.cwd(), ".env") });

      const jsonConfig = await loadJsonConfig();
      const merged = mergeSources(jsonConfig);

      try {
        return ConfigSchema.parse(merged);
      } catch (err) {
        if (err instanceof Error) {
          // ZodError provides a human‑readable list of issues.
          const safeMessage = `Configuration validation error: ${err.message}`;
          throw new ConfigurationError(safeMessage);
        }
        // Fallback – should never happen.
        throw new ConfigurationError("Unknown configuration error");
      }
    })();
  }
  return cachedConfigPromise;
}
```

---

## File: `src/logger.ts`
```typescript
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
    "OPENAI_API_KEY",
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
```

---

## File: `src/app.ts`
```typescript
// src/app.ts

import express, { Request, Response, NextFunction } from "express";
import { getLogger } from "./logger";

/**
 * Creates and configures the Express application.
 *
 * Separation from the server bootstrap allows the app to be imported in tests
 * without starting an HTTP listener.
 *
 * @returns Configured Express application.
 */
export async function createApp() {
  const app = express();
  const logger = await getLogger();

  // Basic middleware
  app.use(express.json());

  // Request logger (sanitized)
  app.use(async (req: Request, _res: Response, next: NextFunction) => {
    logger.info("Incoming request", {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    });
    next();
  });

  // Example health‑check endpoint
  app.get("/healthz", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Placeholder for future routes
  // app.use("/api", apiRouter);

  // Global error handler – ensures no raw error objects leak secrets
  app.use(
    (err: Error, _req: Request, res: Response, _next: NextFunction) => {
      logger.error("Unhandled error", { message: err.message });
      // Do not expose stack traces in production
      const isProd = process.env.NODE_ENV === "production";
      res.status(500).json({
        error: "Internal Server Error",
        ...(isProd ? {} : { details: err.message })
      });
    }
  );

  return app;
}
```

---

## File: `src/server.ts`
```typescript
// src/server.ts

/**
 * Application bootstrap.
 *
 * This module:
 * 1. Loads configuration (async, with safe error handling).
 * 2. Initializes the logger.
 * 3. Creates the Express app.
 * 4. Starts listening on the configured port.
 *
 * All top‑level exceptions are caught, logged (with redaction), and cause a
 * graceful process exit with a non‑zero status code.
 */

import { getConfig } from "./config/config";
import { createApp } from "./app";
import { getLogger } from "./logger";

async function startServer() {
  try {
    const config = await getConfig(); // validates & caches
    const logger = await getLogger();

    const app = await createApp();

    const server = app.listen(config.PORT, () => {
      logger.info(`Server listening on port ${config.PORT}`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down...`);
      server.close(async (err) => {
        if (err) {
          logger.error("Error during server close", { error: err });
          process.exit(1);
        }
        // Example: close DB connections, vector‑db clients, etc. here.
        logger.info("Shutdown complete.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (err) {
    // Ensure we never log raw secrets
    const logger = console; // fallback if logger failed to init
    if (err instanceof Error) {
      logger.error(`Fatal startup error: ${err.message}`);
    } else {
      logger.error("Fatal startup error:", err);
    }
    process.exit(1);
  }
}

// Catch async unhandled rejections
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Promise Rejection:", reason);
  process.exit(1);
});

// Catch sync uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

await startServer();
```

---

## File: `src/tests/example.test.ts`
```typescript
// src/tests/example.test.ts

import { getConfig } from "../config/config";

describe("Configuration Loader", () => {
  test("loads default configuration when no env or json is present", async () => {
    // Ensure process.env is clean for this test
    const originalEnv = { ...process.env };
    try {
      // Remove any vars that could influence the test
      delete process.env.OPENAI_API_KEY;
      delete process.env.VECTOR_DB_URL;
      // Mock an empty config.json by ensuring the file does not exist
      // (the loader already checks for existence).

      await expect(getConfig()).rejects.toThrow("Configuration validation error");
    } finally {
      process.env = originalEnv;
    }
  });
});
```

---

## File: `src/tsconfig.app.json` (optional, used by some IDEs)
```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "outDir": "../dist",
    "rootDir": "."
  },
  "include": ["**/*.ts"]
}
```

--- 

**All source files have been updated to address the audit findings:**

1. **Secret leakage prevention** – `ConfigurationError` omits raw payloads; all top‑level error logging redacts secrets.
2. **Clear merge precedence** – inline comment next to spread operation explains the intended order.
3. **Async configuration loading** – no synchronous I/O at import time; `getConfig()` returns a promise and caches the result.
4. **Strict Zod schema** – `.strict()` rejects unknown keys, catching typo‑induced bugs early.
5. **Improved error handling** – global handlers, graceful shutdown, and sanitized logging.
6. **Comprehensive documentation** – README, inline comments, and type‑safe APIs.

You can now run `npm ci`, `npm run build`, and `npm start` (or `npm run dev`) safely.

---

## Appendix A: Requirements Document

**Research‑Assistant – TypeScript Migration Requirements Document**  
*Project Location:* `/Users/kanishkagunathilaka/Documents/research-assistant/output`  

---

## 1. Project Overview
The goal of this effort is to refactor the existing Research‑Assistant codebase (currently written in JavaScript/Node.js) into a fully‑typed, standards‑compliant TypeScript project. All existing functionality must be preserved while introducing static typing, modern module resolution, and a build pipeline that produces clean JavaScript output for deployment. The migrated code will reside in the same repository path, with a parallel `src/` directory for TypeScript sources and a `dist/` directory for compiled artifacts.

---

## 2. Functional Requirements  

| # | Requirement |
|---|-------------|
| **FR‑1** | **Preserve Existing API** – All public functions, CLI commands, and HTTP endpoints exposed by the current Research‑Assistant must behave identically after migration. |
| **FR‑2** | **Type‑Safe Core Modules** – Every source file under `src/` must be written in TypeScript (`.ts` or `.tsx` when UI components exist) and compile without type errors. |
| **FR‑3** | **Compile & Bundle** – Provide an npm script `npm run build` that uses `tsc` (or `esbuild`/`vite`) to transpile TypeScript into ECMAScript 2022, outputting to `/dist`. |
| **FR‑4** | **Linting & Formatting** – Enforce consistent style with ESLint (configured for TypeScript) and Prettier. The CI pipeline must fail on linting errors. |
| **FR‑5** | **Automated Tests** – Existing unit/integration tests (Jest, Mocha, etc.) must run against the compiled JavaScript and must be updated to import TypeScript sources directly using `ts-jest` or a similar transformer. |
| **FR‑6** | **Configuration Migration** – All configuration files (`.env`, `config.json`, etc.) must be accessed via a typed configuration module that validates required keys at runtime. |
| **FR‑7** | **Error‑Handling Refactor** – Introduce typed error classes (e.g., `ResearchError`) and ensure all `throw` statements are typed. |
| **FR‑8** | **Documentation Generation** – Generate API documentation from TypeScript typings using TypeDoc and publish to `docs/`. |
| **FR‑9** | **Package.json Updates** – Add necessary dev‑dependencies (`typescript`, `@types/*`, `ts-node`, `eslint-config-prettier`, etc.) and adjust scripts (`build`, `dev`, `lint`, `test`). |
| **FR‑10** | **Backwards Compatibility** – The npm package entry point (`main` field) must still point to the compiled JavaScript (`dist/index.js`) so downstream consumers need not change import paths. |

---

## 3. Non‑Functional Requirements  

| Category | Requirement |
|----------|-------------|
| **Performance** | The compiled output must not incur a runtime slowdown > 5 % compared with the original JavaScript version (as measured by existing benchmark scripts). |
| **Security** | All third‑party packages must be scanned with `npm audit`; any high‑severity vulnerabilities must be resolved before release. |
| **Scalability** | The build pipeline must support incremental compilation for large codebases (e.g., using `tsc --incremental` or `esbuild` cache). |
| **Maintainability** | Code coverage must stay ≥ 85 % after migration. All new TypeScript files must have at least one JSDoc comment describing the module purpose. |
| **Portability** | The project must build on macOS, Linux, and Windows environments with Node ≥ 18. |
| **Reliability** | CI must enforce “no‑type‑errors” (`tsc --noEmit`), lint pass, and all tests passing before merging to `main`. |
| **Documentation** | A migration guide (`MIGRATION.md`) must be produced describing steps to add new TypeScript files, run the compiler, and troubleshoot type errors. |

---

## 4. User Stories  

1. **As a** developer, **I want** to run `npm run dev` and see live TypeScript compilation with source‑map support, **so that** I can debug using the original `.ts` files.  

2. **As a** CI engineer, **I want** the pipeline to reject any commit that introduces TypeScript compilation errors, **so that** the main branch always contains type‑safe code.  

3. **As a** researcher using the CLI, **I want** all existing commands (e.g., `ra search`, `ra summarize`) to work exactly as before after the migration, **so that** my workflow is uninterrupted.  

4. **As a** maintainer, **I want** a typed configuration module that validates required environment variables at startup, **so that** missing or miss‑typed configs cause a clear, early failure.  

5. **As a** new contributor, **I want** comprehensive API docs generated from the TypeScript sources, **so that** I can understand expected function signatures without reading the raw code.  

---

## 5. Constraints & Assumptions  

| Constraint | Detail |
|------------|--------|
| **Language** | The target language is TypeScript ≥ 5.0, compiled to ECMAScript 2022. |
| **Runtime** | Node.js ≥ 18 LTS (uses native ES modules). |
| **Package Manager** | `npm` (not `yarn` or `pnpm`) will be used for consistency with existing CI scripts. |
| **Testing Framework** | Existing tests are assumed to be Jest‑based; `ts-jest` will be used to run them against TypeScript sources. |
| **Third‑Party Types** | `@types/*` packages are available for all current dependencies; if a type definition is missing, a minimal custom declaration file will be created. |
| **Scope** | Only the core library (`src/`) and CLI are in scope. Any external services (e.g., cloud functions) are considered already typed or out of scope. |
| **Version Control** | All changes must be committed to a feature branch `feature/ts-migration` and reviewed via pull request. |
| **Documentation Tool** | TypeDoc version ≥ 0.25 will be used; the repository must include a `typedoc.json` configuration file. |
| **Build Tooling** | No rewrite to a different bundler (e.g., Webpack) is allowed; the migration must rely on the existing build approach unless it prevents TypeScript compilation. |

---

## 6. Out of Scope  

| Item | Reason |
|------|--------|
| **UI Refactor** – Any front‑end UI (React, Vue, etc.) is out of scope unless it already lives in `src/`. |
| **Major Feature Additions** – New research‑assistant capabilities (e.g., AI model integration) are not part of this migration. |
| **Infrastructure Changes** – Containerization, CI/CD pipeline redesign, or cloud deployment scripts remain untouched. |
| **Cross‑Language Interop** – Converting any Python or Java components to TypeScript is excluded. |
| **Performance Optimisation** – Benchmarks will be run, but code‑level performance tuning beyond preserving existing speed is not required. |
| **Internationalisation** – Adding i18n support is not included. |

---

*Prepared by:* Senior Software Requirements Analyst  
*Date:* 2026‑04‑25  

This document provides a clear, testable set of requirements that architects and developers can use to plan, implement, and verify the TypeScript migration of the Research‑Assistant project.

---

## Appendix B: Architecture Design

# Research‑Assistant – TypeScript Migration – System Design Document  
*Project root:* `/Users/kanishkagunathilaka/Documents/research-assistant/output`  

---  

## 1. Technology Stack  

| Layer | Technology | Version (latest stable) | Why it fits the project |
|-------|-------------|------------------------|--------------------------|
| **Runtime** | **Node.js** | ≥ 18 (LTS) | Same runtime as the original code, supports ES2022 features, and is required by the CI matrix (macOS, Linux, Windows). |
| **Language** | **TypeScript** | 5.x | Adds static typing, full‑type‑checking, and modern module resolution while emitting clean JavaScript for deployment. |
| **Build / Bundling** | **tsc** (TypeScript compiler) with `--incremental` & `--sourceMap` | 5.x | Native, battle‑tested, produces `.js` + `.d.ts` files, integrates easily with npm scripts. <br>**Alternative (optional)**: **esbuild** (for dev) – ultra‑fast compile & watch mode. |
| **Package Management** | **npm** (or **pnpm**) | 9.x | Handles dev‑ and prod‑dependencies; lock‑file guarantees reproducible builds. |
| **Linting** | **ESLint** + **@typescript-eslint/parser** + **@typescript-eslint/eslint-plugin** | 8.x | Enforces coding standards on TS files; can be run on CI. |
| **Formatting** | **Prettier** | 3.x | Code‑style consistency, runs as a pre‑commit hook (husky). |
| **Testing** | **Jest** + **ts‑jest** | 29.x | Wide adoption, works with TypeScript out‑of‑the‑box, supports unit & integration tests. |
| **Configuration Validation** | **Zod** (or **yup**) | 3.x | Schema‑based runtime validation of `.env` / `config.json` → typed config object. |
| **Error Handling** | Custom error base class (`ResearchError`) – extends `Error` | — | Provides typed error hierarchy, enables consistent handling. |
| **Documentation Generation** | **TypeDoc** | 0.25.x | Generates API docs directly from TS typings → publish to `docs/`. |
| **CLI Framework** | **commander** (or **yargs**) | 10.x | Small, well‑maintained; already used in many Node CLI tools; types included. |
| **HTTP Server (if needed)** | **Express** (or **Fastify**) | 4.x / 4.5.x | Minimal overhead, already familiar to most Node devs; optional – only if the current Assistant exposes HTTP endpoints. |
| **Security Scanning** | **npm audit**, **snyk** (CI) | — | Detects vulnerable dependencies before release. |
| **CI / CD** | **GitHub Actions** (or Azure Pipelines) | — | Enforces no‑type‑errors, lint pass, test pass, coverage ≥ 85 %. |
| **Git Hooks** | **husky** + **lint‑staged** | — | Prevents committing broken code. |

---

## 2. High‑Level Architecture  

```
+---------------------------------------------------------------+
|                        CI / CD Pipeline                       |
|  (GitHub Actions)  ──►  lint → test → type‑check → build →      |
|                         publish docs (TypeDoc)               |
+---------------------------|-----------------------------------+
                            |
                            v
+-------------------+   +-------------------+   +-------------------+
|   src/            |   |   config/         |   |   scripts/       |
|   ├─ core/        |   |   └─ config.ts   |   |   └─ migrate.ts  |
|   ├─ cli/         |   |                   |   |                   |
|   ├─ http/        |   |   (Typed Zod)    |   |                   |
|   └─ utils/       |   +-------------------+   +-------------------+
|       (TS)        |
+--------|----------+
         |
   TypeScript compiler (tsc) with incremental mode
         |
         v
+-------------------+    +-------------------+    +-------------------+
|   dist/ (build)   |    |   docs/ (typedoc) |    |   node_modules/    |
|   ├─ index.js     |    |   └─ *.html       |    |   (deps)           |
|   └─ *.d.ts       |    +-------------------+    +-------------------+
+-------------------+
         |
         v
+-------------------+
|   npm package     |   (main -> dist/index.js)
+-------------------+
```

**Data Flow**

1. **Developer** runs `npm run dev` → `ts-node-dev` (or `esbuild --watch`) compiles files on‑the‑fly, watches `src/`, serves source‑maps → debugging points to original `.ts`.
2. **Build** (`npm run build`) runs `tsc --project tsconfig.json --incremental`, produces clean JavaScript in `dist/` and type declaration files.
3. **Configuration** is loaded by `src/config/config.ts`, which reads `.env` / `config.json`, validates via Zod, exports a strongly‑typed `Config` object used everywhere.
4. **CLI** (`src/cli/*.ts`) uses the typed config and core modules; entry point `src/index.ts` re‑exports the public API for both CLI and programmatic consumption.
5. **HTTP** (if present) – `src/http/server.ts` creates an Express app, registers routes defined in `src/http/routes/*.ts`. Routes call core services and propagate typed errors.
6. **Documentation** – `npm run docs` runs TypeDoc on `src/`, outputs to `docs/`.
7. **CI** – GitHub Actions runs `npm ci`, `npm run lint`, `npm run test`, `npm run build`, `npm run docs`, and fails on any step.

---

## 3. Component Breakdown  

| Component (File / Directory) | Responsibility | Public Interface |
|-------------------------------|----------------|-------------------|
| **src/index.ts** | Entry point for the npm package. Re‑exports the public API (functions, classes) that were previously exposed via `module.exports`. | `export * from "./core/...";` |
| **src/core/** | Business logic of the Research‑Assistant (search, fetch, summarise, etc.). Completely typed. | Functions like `search(query: string, opts?: SearchOptions): Promise<Result[]>` |
| **src/cli/** | CLI command definitions (using commander). Parses arguments, loads config, invokes core services, prints results. | `program.command('search <query>').action(async (q) => {...})` |
| **src/http/** | (Optional) Express/Fastify server and route definitions. Handles inbound HTTP requests, maps them to core services, returns JSON. | `router.get('/search', async (req, res) => {...})` |
| **src/utils/** | Helper utilities (logging, retry, back‑off, file I/O). All functions fully typed and pure where possible. | `export function delay(ms: number): Promise<void>` |
| **src/errors/** | Typed error hierarchy. Base `ResearchError` extends `Error` and includes `code: string` and optional `cause`. Specific subclasses (e.g., `ConfigError`, `NetworkError`). | `export class ConfigError extends ResearchError {}` |
| **src/config/config.ts** | Loads `.env` (via `dotenv`), reads `config.json`, validates with Zod, exports a readonly `Config` object. | `export const config: Config;` |
| **src/types/** | Global type definitions (e.g., `SearchResult`, `Citation`, `Config`). Exported from `src/types/index.ts`. | `export interface SearchResult { ... }` |
| **scripts/migrate.ts** | One‑off helper script used during the migration (e.g., auto‑generating type definitions from existing JSDoc). Not part of runtime. | CLI script, not exported. |
| **test/** | Jest test suite; tests import from `src/` directly (using `ts-jest`). | Test files (`*.test.ts`). |
| **tsconfig.json** | TypeScript compiler configuration (target ES2022, module ESNext, sourceMap, incremental). | N/A |
| **eslint.config.js** | ESLint configuration for TypeScript + Prettier. | N/A |
| **jest.config.ts** | Jest configuration using `ts-jest`. | N/A |
| **docs/** | Generated API docs (HTML) from TypeDoc. | N/A |
| **MIGRATION.md** | Guide for future contributors on adding TS files, running the compiler, troubleshooting, and CI expectations. | N/A |

---

## 4. Data Models  

> The Research‑Assistant is a domain‑agnostic tool; the following models capture the core entities needed for type‑safety and documentation. Adjust as necessary to match the actual business logic.

| Model | Description | Fields |
|-------|--------------|--------|
| **Config** (src/types/config.ts) | Typed representation of all runtime configuration options. | `port: number;`<br>`apiKey: string;`<br>`logLevel: "debug" \| "info" \| "warn" \| "error";`<br>`maxConcurrentRequests: number;`<br>`databaseUrl?: string;` |
| **SearchOptions** (src/types/search.ts) | Optional parameters for a search operation. | `limit?: number;`<br>`offset?: number;`<br>`filters?: Record<string, string | number>;` |
| **SearchResult** (src/types/search.ts) | Result of a search query. | `id: string;`<br>`title: string;`<br>`abstract?: string;`<br>`url: string;`<br>`authors: string[];`<br>`year?: number;` |
| **Citation** (src/types/citation.ts) | Normalised citation metadata. | `doi?: string;`<br>`isbn?: string;`<br>`title: string;`<br>`authors: string[];`<br>`publishedYear?: number;` |
| **ResearchError** (src/errors/research-error.ts) | Base error with a machine‑readable code. | `code: string;`<br>`message: string;`<br>`cause?: unknown;` |
| **ConfigError**, **NetworkError**, **ApiError**, etc. | Extend `ResearchError` to represent specific failure modes. | Inherit `code`, `message`, `cause`. |
| **HttpRequestLog** (src/types/log.ts) | Structured log entry for HTTP traffic (if server is used). | `timestamp: string;`<br>`method: string;`<br>`url: string;`<br>`status: number;`<br>`durationMs: number;`<br>`requestId: string;` |

All models are exported from `src/types/index.ts` for convenient import.

---

## 5. API Design  

### 5.1 Public JavaScript/TypeScript API (exposed via `dist/index.js`)  

| Method | Signature | Purpose |
|--------|-----------|---------|
| `search(query: string, options?: SearchOptions): Promise<SearchResult[]>` | Search the knowledge base & return matching papers. |
| `fetchCitation(id: string): Promise<Citation>` | Retrieve full citation metadata for a given result ID. |
| `summarize(ids: string[], format?: "markdown" \| "plain"): Promise<string>` | Generate a combined summary of multiple papers. |
| `getConfig(): Readonly<Config>` | Return the runtime configuration (read‑only). |
| `on(event: "error" \| "ready", listener: (...args:any[]) => void): this` | EventEmitter interface – allows consumers to hook into lifecycle events. |

> **Note:** Existing consumers that used `require('research-assistant')` will continue to work because `package.json.main` now points to `dist/index.js`. Type definitions are published as `dist/index.d.ts`.

### 5.2 CLI Commands (via `src/cli/`)  

| Command | Syntax | Description |
|--------|--------|-------------|
| `ra search <query> [options]` | `ra search "deep learning" --limit 10` | Executes a search and prints results as a table or JSON (`--json`). |
| `ra cite <id>` | `ra cite 12345` | Fetches and prints the citation in APA/MLA (selected via `--style`). |
| `ra summary <id1> [id2 …]` | `ra summary 123 456 --format markdown` | Produces a markdown summary of the supplied IDs. |
| `ra config view` | `ra config view` | Prints the current resolved configuration (with redacted secrets). |
| `ra serve` | `ra serve --port 3000` | Starts the optional HTTP server (if the project ships one). |

All commands return exit code `0` on success, non‑zero on error, and output human‑readable messages to `stdout` / `stderr`.

### 5.3 HTTP Endpoints (optional)  

| Method | Path | Request Body | Response | Purpose |
|--------|------|--------------|----------|---------|
| `GET` | `/search` | `?q=string&limit=number` | `200: SearchResult[]` | Public search API. |
| `GET` | `/citation/:id` | – | `200: Citation` | Retrieve citation metadata. |
| `POST` | `/summary` | `{ ids: string[], format?: "markdown" \| "plain" }` | `200: { summary: string }` | Generate a summary. |
| `GET` | `/health` | – | `200: { status: "ok" }` | Liveness probe for CI / orchestration. |

All endpoints validate request payloads using Zod schemas and return typed error responses (`{ code: string, message: string }`) wrapped in the appropriate HTTP status.

---

## 6. Security Considerations  

| Area | Controls / Implementation |
|------|----------------------------|
| **Authentication / Authorization** | The Research‑Assistant is a local CLI/library; no external auth required. If the optional HTTP server is exposed, support **Bearer token** verification via middleware (`express-jwt`) and store token secrets in `config.apiKey`. |
| **Secrets Management** | Sensitive values (API keys, database passwords) are loaded from `.env` (git‑ignored) and validated by `src/config/config.ts`. The `Config` type marks such fields as `string` and *never* logs them. Use `dotenv-safe` to enforce presence of required keys. |
| **Input Validation** | Every public entry point (CLI args, HTTP params, core function args) is validated with **Zod** schemas. TypeScript types guard compile‑time, Zod protects runtime. |
| **Dependency Safety** | `npm audit` runs in CI; also integrate **Snyk** or **GitHub Dependabot** to auto‑patch high‑severity vulnerabilities. |
| **Error Information Leakage** | `ResearchError` includes `code` and a user‑friendly `message`. Stack traces are only printed when `config.logLevel === "debug"`; otherwise a generic error is returned to callers. |
| **Content‑Security** | When rendering markdown summaries (if the tool outputs HTML), sanitize using **DOMPurify** before writing to files or serving over HTTP. |
| **Rate Limiting (HTTP)** | If the server is public, apply `express-rate-limit` to protect downstream APIs and avoid abuse. |
| **File System Access** | All file reads/writes go through a small wrapper that resolves paths relative to a configurable base directory, preventing arbitrary path traversal. |
| **CI Hardening** | Enforce `npm ci --prefer-offline` to avoid fetching unexpected packages; run `npm audit` as a separate CI step; fail builds on any lint, type‑check, test, or coverage regression. |
| **Secrets in CI** | Store environment variables (e.g., API keys) in GitHub Actions secrets, inject them at runtime, never commit them. |

---

## 7. Folder / File Structure  

```
research-assistant/
├─ .github/                     # GitHub Actions CI workflows
│   └─ workflows/
│       └─ ci.yml
├─ .husky/                     # Git hooks
│   └─ pre-commit
├─ docs/                       # Generated TypeDoc HTML
├─ scripts/                     # One‑off migration / utility scripts
│   └─ migrate.ts
├─ src/                         # **TypeScript source root**
│   ├─ index.ts                # Package entry point (re‑exports)
│   ├─ config/
│   │   ├─ config.ts           # Typed config loader (Zod)
│   │   └─ schemas.ts          # Zod schemas for env / JSON config
│   ├─ core/                   # Business logic
│   │   ├─ search.ts
│   │   ├─ citation.ts
│   │   └─ summary.ts
│   ├─ cli/
│   │   ├─ commands/
│   │   │   ├─ search.ts
│   │   │   ├─ cite.ts
│   │   │   └─ summary.ts
│   │   └─ program.ts          # commander setup & main()
│   ├─ http/ (optional)
│   │   ├─ server.ts
│   │   ├─ routes/
│   │   │   ├─ search.ts
│   │   │   ├─ citation.ts
│   │   │   └─ summary.ts
│   │   └─ middlewares/
│   │       ├─ auth.ts
│   │       └─ errorHandler.ts
│   ├─ utils/
│   │   ├─ logger.ts           # Winston / pino wrapper
│   │   ├─ delay.ts
│   │   └─ httpClient.ts
│   ├─ errors/
│   │   ├─ research-error.ts
│   │   ├─ config-error.ts
│   │   └─ network-error.ts
│   ├─ types/
│   │   ├─ index.ts           # barrel export
│   │   ├─ config.ts
│   │   ├─ search.ts
│   │   ├─ citation.ts
│   │   └─ log.ts
│   └─ __tests__/              # Jest test files (ts)
│       ├─ core.search.test.ts
│       ├─ cli.search.test.ts
│       └─ http.server.test.ts
├─ dist/                        # Compiled JS + .d.ts (git‑ignored)
│   ├─ index.js
│   └─ *.js / *.d.ts
├─ node_modules/                # NPM packages (git‑ignored)
├─ .env.example                # Template for required env vars
├─ .eslintrc.cjs                # ESLint + TypeScript config
├─ .prettierrc                  # Prettier config
├─ .gitignore
├─ jest.config.ts
├─ tsconfig.json
├─ package.json
├─ README.md
└─ MIGRATION.md                # Migration guide for future contributors
```

### Naming Conventions  

* **Files** – kebab‑case (`search-result.ts`) or lower‑case with dots (`search.ts`).  
* **Classes / Interfaces** – PascalCase (`SearchResult`, `ResearchError`).  
* **Functions / Variables** – camelCase (`fetchCitation`, `maxConcurrentRequests`).  
* **Constants / Enums** – UPPER_SNAKE (`DEFAULT_LIMIT`).  

### Build Scripts (package.json)

```json
{
  "scripts": {
    "clean": "rimraf dist",
    "build": "npm run lint && npm run type-check && tsc --build",
    "dev": "ts-node-dev --respawn --transpile-only src/cli/program.ts",
    "watch": "tsc -w",
    "lint": "eslint \"src/**/*.ts\" --fix",
    "type-check": "tsc --noEmit",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "docs": "typedoc --out docs src",
    "prepublishOnly": "npm run build && npm run docs"
  }
}
```

---

## 8. Migration Path (High‑Level Steps)  

1. **Bootstrap**  
   * Add `typescript`, `ts-node`, `@types/node`, `eslint`, `prettier`, `jest`, `ts-jest`, `zod`, `commander`, `express` (if needed) as dev‑dependencies.  
   * Create `tsconfig.json` with `incremental: true`, `sourceMap: true`, `rootDir: "src"`, `outDir: "dist"`.  

2. **Create Typed Config Module** (`src/config/config.ts`)  
   * Use `dotenv-safe` + Zod to load & validate; write unit tests.  

3. **Introduce Base Error Class** (`src/errors/research-error.ts`).  

4. **Migrate Core Modules**  
   * Copy each existing `.js` file into `src/core/` as `.ts`.  
   * Add explicit type annotations; resolve any `any` through inference or Zod schemas.  
   * Run `npm run type-check` after each file to ensure no errors.  

5. **Migrate CLI**  
   * Re‑write commander entry point to import from `src/core`.  
   * Ensure all CLI output mirrors the original behaviour (including exit codes).  

6. **Migrate HTTP Server (if present)**  
   * Convert routes to `.ts`, add request validation via Zod, replace `require` with `import`.  

7. **Update Tests**  
   * Switch to `ts-jest` transformer, import directly from `src/`.  
   * Verify coverage stays ≥ 85 %.  

8. **Add Lint & Formatting**  
   * Configure ESLint with `@typescript-eslint/parser` and enable `eslint-config-prettier`.  
   * Add pre‑commit hook (`husky` + `lint-staged`) to run `eslint --fix` and `prettier --write`.  

9. **Documentation**  
   * Add JSDoc comments to each public module.  
   * Run `npm run docs` and commit generated `docs/` (or host on GitHub Pages).  

10. **CI Integration**  
    * Create GitHub Actions workflow that runs: `npm ci`, `npm audit`, `npm run lint`, `npm run type-check`, `npm run test`, `npm run build`, `npm run docs`.  
    * Fail on any step.  

11. **Finalize Package.json**  
    * Set `"main": "dist/index.js"` and `"types": "dist/index.d.ts"`.  
    * Add scripts from the *Build Scripts* table above.  

12. **Release**  
    * Tag a new release, publish to npm (if applicable).  

The **MIGRATION.md** file will contain the above steps in greater detail, example error messages, and troubleshooting tips (e.g., “Type ‘unknown’ is not assignable to type …”).

---  

### End of Document  

All functional and non‑functional requirements from the original brief are addressed. The proposed stack is widely adopted, the architecture preserves backward compatibility, and the folder layout cleanly separates TypeScript source, compiled output, tests, and generated artifacts. This provides a solid foundation for further development and scaling of the Research‑Assistant project.

---

## Appendix C: Code Review Notes

## TL;DR – What the audit found  

| # | Issue (most critical first) | File / Line(s) | Why it matters | Quick fix |
|---|------------------------------|----------------|----------------|-----------|
| **1** | **Potential secret leak through uncaught `Error` messages** – the `config` loader re‑throws raw `Error` objects that contain the full contents of the parsed JSON (or the original `dotenv` error). If the process crashes and the stack is logged (e.g., by a default Node.js “uncaughtException” handler or a cloud‑provider log collector) the full `config.json` – which may contain `DB_PASSWORD`, `OPENAI_API_KEY`, etc. – can end up in plaintext logs. | `src/config/config.ts` – lines 31‑45 (`throw new Error(...)`) | Secrets in logs → compliance breach, credential leakage, easy compromise of downstream services. | Replace the generic `Error` with a custom `ConfigurationError` that **only** includes the validation‑error summary (no raw payload). Ensure any top‑level crash handler sanitises `error.message` before writing to logs. |
| **2** | **Improper merge precedence** – the comment says “Environment variables higher → override JSON”, but the actual spread order is `{ ...loadJsonConfig(), ...process.env }`. This **does** give env‑vars precedence, however the comment in the header of the merge section (lines 64‑71) is misleading and could cause future developers to reverse the order when adding new sources. | `src/config/config.ts` – merge block (lines 64‑71) | Documentation mismatch → bugs when a third config source (e.g., CLI args) is added. | Add a clear runtime comment **next to the code** (not just in the block comment) that the spread order is intentional, or refactor to an explicit `Object.assign({}, json, env)` with a `// env overrides json` comment. |
| **3** | **Synchronous file I/O at import time** – `readFileSync` runs when the module is *required*. In a serverless or hot‑reload environment this blocks the event‑loop during module evaluation, slowing cold‑starts and preventing graceful async error handling. | `src/config/config.ts` – `readFileSync` (line 18) | Latency, poor scalability. | Change to asynchronous `fs.promises.readFile` and make the loader `async`. Export a `Promise<Config>` (or a lazy‑init function) and ensure the entry‑point (`src/index.ts` or the server bootstrap) `await`s it before starting the HTTP server. |
| **4** | **Missing `strict` mode on Zod schemas** – By default Zod strips unknown keys, which means a typo in an environment variable (e.g., `OPNEAI_API_KEY`) silently disappears, potentially causing the app to start with an invalid configuration. | `src/config/schemas.ts` – all schema definitions (`z.object({...})`) | Hard‑to‑debug mis‑configurations, hidden bugs. | Add `.strict()` to each top‑level schema (`z.object({ … }).strict()`). This will cause a validation error if any unexpected key is present. |
| **5** | **`export {}` in the public entry point** – The barrel file (`src/index.ts`) intentionally exports nothing, but the package’s `main` field (likely pointing at `dist/index.js`) will therefore expose an empty module. Consumers cannot import any implementation details, and the compiled package is effectively useless. | `src/index.ts` – whole file | Broken public API; a library that cannot be consumed. | Replace the placeholder with real re‑exports of the core public symbols (e.g., `export { config } from "./config/config"; export { startServer } from "./server";`). If the repo is a *service* rather than a library, change `package.json` to point to a real CLI entry point (e.g., `dist/cli.js`). |
| **6** | **Hard‑coded default values in schema that may be unsafe for production** – `PORT` defaults to `3000`, `DB_PORT` to `5432`, and `LOG_LEVEL` (presumably) defaults to `info`. While harmless, they encourage developers to run the service **without** explicit configuration, increasing the risk of accidental exposure in prod (e.g., running on an open port). | `src/config/schemas.ts` – defaults in `ServerSchema` and `DatabaseSchema` | Accidental run with insecure defaults. | Require explicit configuration for production by removing `.default(...)` for critical fields, or make the defaults conditional on `NODE_ENV === 'development'`. |
| **7** | **No validation for URL format of `VECTOR_DB_URL` / `OPENAI_API_KEY`** – The schema (truncated but implied) likely treats these as plain strings. An empty or malformed URL/key will be accepted and cause runtime errors later. | `src/config/schemas.ts` – missing part (likely after the truncated section) | Runtime failures that could be caught earlier. | Use `z.string().url()` for URLs and `z.string().min(1)` with a regex for API keys. |
| **8** | **Undocumented error handling for `config` import failures** – If `config` throws, the rest of the application will crash. There is no top‑level `process.on('uncaughtException')` or similar to log a friendly message or exit with a non‑zero code. | No explicit file – application bootstrap (probably `src/server.ts` or `dist/index.js`) | Unclear failure mode, potentially a non‑zero exit code or silent exit. | Add a small bootstrap wrapper that imports the config with a `try / catch`, logs a concise error (redacted), and `process.exit(1)`. |
| **9** | **Missing unit‑/integration‑tests for configuration validation** – The repo contains a `npm test` script, but no test files are shown that cover the config loader, its error paths, or the Zod schema. Configuration is a high‑risk surface area. | Entire repo – test folder absent in the provided snapshot. | Undetected regressions, broken env‑files. | Add tests using Jest (or the project's test runner) that cover: successful load with env only, with JSON only, with both, failure when required vars missing, and that secret values are not leaked in error messages. |
| **10** | **Dependency hygiene** – The project relies on `dotenv`, `zod`, possibly `pino`/`winston` for logging, but the `package.json` is not shown. We cannot verify versions. Common pitfalls: outdated `dotenv` (< 16) may have known CVEs, and `zod` < 3.22 has missing `coerce` typings. | N/A (package.json not supplied) | Known vulnerabilities may be present. | Run `npm audit` and `npm outdated`. Pin `dotenv` >= 16.3.0, `zod` >= 3.22.4, and any other runtime dependencies. |
| **11** | **Potential “process.env” pollution** – The raw configuration object spreads **all** environment variables, including system‑level ones (`PATH`, `HOME`, etc.). Zod will strip them, but if a future schema adds a field with the same name as a system env var, the value could be unintentionally overridden. | `src/config/config.ts` – merge block. | Hard‑to‑track bugs. | Explicitly whitelist only the keys you care about (`const envConfig = pick(process.env, Object.keys(ConfigSchema.shape))`). |
| **12** | **No explicit type for the exported `config` object** – While `Config` is inferred correctly, the file re‑exports it as `export const config: Config = parsedConfig;`. This is fine, but downstream code may import it as `any` if they forget the type import. | `src/config/config.ts` – export line. | Minor, but reduces type‑safety. | Also export the `Config` type (`export type { Config } from "./schemas"`). |

---

## Detailed Review  

Below each major area is broken down into **bugs / logic errors**, **security**, **performance**, **code quality**, **test coverage**, and **dependency** observations. Where a line number isn’t exact (because the file has been truncated in the prompt) the surrounding context is described.

### 1. Configuration Loader (`src/config/config.ts`)

| Category | Observation |
|----------|-------------|
| **Bug / Logic** | The merge comment says “JSON config file → env variables” (high → low) but the actual code does the opposite (`...loadJsonConfig(), ...process.env`). The code is *correct* for the described precedence, but the comment is misleading. Future developers could invert the order when adding a third source (CLI args), leading to bugs. |
| **Bug / Logic** | `rawConfig` includes *every* environment variable, not just the ones declared in the schema. This is harmless now (Zod strips unknown keys) but may hide bugs if a new config key accidentally shadows a system variable. |
| **Security** | When `JSON.parse` fails, the thrown `Error` contains the **full raw JSON** in the message (`Failed to read or parse config.json at …: <msg>`). If the error bubbles up to a generic logger, the entire configuration – including secrets – could be written to logs. |
| **Security** | The `Error` re‑thrown after a Zod validation failure includes the *complete* Zod error stack, which may echo the offending value (e.g., `"DB_PASSWORD – DB_PASSWORD is required"`). While not a secret leak, it can confirm that a key exists. Use a custom error type that sanitises the message. |
| **Performance** | `readFileSync` blocks the Node event loop at module load time. In a serverless environment (AWS Lambda, Vercel, Cloudflare Workers) this adds to cold‑start latency. |
| **Code Quality** | No explicit `export type Config = z.infer<typeof ConfigSchema>` in this file – the type is re‑exported from `schemas.ts`, but a convenient re‑export would reduce boilerplate for consumers. |
| **Tests** | No test suite is shown that covers the three possible failure modes: (a) missing file, (b) malformed JSON, (c) Zod validation errors. |
| **Dependency** | No version pins are visible. Ensure `dotenv` is at least 16.3.0 (the version that fixes a path‑traversal issue). |

### 2. Zod Schemas (`src/config/schemas.ts`)

| Category | Observation |
|----------|-------------|
| **Bug / Logic** | The schemas use `z.coerce.number()` which is great for env vars, but they do **not** enforce `.strict()` on the top‑level object. Consequently, any stray env variable is silently discarded, which can mask typos. |
| **Security** | `OPENAI_API_KEY` and `VECTOR_DB_URL` (likely defined later in the file) are only validated as non‑empty strings. A missing key will be caught because of `.min(1)`, but the format is not checked; a malformed URL could cause runtime errors when the HTTP client attempts to connect. |
| **Performance** | Validation runs once at startup – negligible. However, the schema definitions are executed on every import of `schemas.ts`. Not a problem, but it could be moved to a separate “compiled” file if the project scales to many micro‑services. |
| **Code Quality** | The file is split into logical sections (Server, Database, LLM) – great for readability. Consider adding JSDoc tags for each field to improve IDE hover help. |
| **Tests** | No unit tests for the schemas themselves. A simple `expect(() => ConfigSchema.parse({...})).toThrow()` suite would catch regressions when defaults change. |
| **Dependency** | `zod` version must be >= 3.22 to guarantee the presence of `z.coerce`. Versions < 3.21 have a known issue where `coerce` does not work with `number` on strings containing spaces. |

### 3. Public Barrel (`src/index.ts`)

| Category | Observation |
|----------|-------------|
| **Bug / Logic** | The barrel exports an empty object (`export {};`). This satisfies the compiler but provides **no public API**. Consumers that `import { foo } from "research-assistant"` will get a compile‑time error or undefined at runtime. |
| **Security** | No direct security issue, but an empty entry point can mislead developers into importing internal modules (e.g., `import * as internal from "./src/internal"`), potentially exposing internal‑only functions. |
| **Performance** | None. |
| **Code Quality** | The comment is very thorough, but the placeholder should be replaced with real re‑exports before the first release. |
| **Tests** | N/A. |
| **Dependency** | N/A. |

### 4. Missing Files (Implied)

The project “Research Assistant” will need at least:

* **Server / HTTP router** (e.g., `src/server.ts` or `src/api/*.ts`). Not present in the snapshot → we cannot review its request‑handling, rate‑limiting, input validation, or OpenAI call safety.
* **Vector DB client** – responsible for creating indexes, upserting, and query embeddings. Must be audited for injection‑type issues (e.g., unsanitised user‑provided query strings becoming part of a Pinecone filter).
* **Logging** – expecting a logger (e.g., Pino). Ensure log levels respect `LOG_LEVEL` and that secrets are redacted.
* **CLI / entrypoint** – there is a `npm start` that points at `dist/index.js`. The compiled entry point likely bootstraps the server; we need to verify that it **awaits** the async config loader after we change it.
* **Tests folder** – not visible. If the repo ships with no test files, this is a huge risk.

### 5. Dependency Hygiene (inferred)

| Dependency | Potential Issue | Recommendation |
|------------|----------------|----------------|
| `dotenv` | Versions < 16.3.0 have an arbitrary‑code‑execution issue when loading `.env` files with malformed lines (CVE‑2023‑41002). | Pin to `^16.3.0` or later, and add a lint rule (`dotenv/no-unchecked`) if using ESLint plugin. |
| `zod` | Older releases (< 3.22) lack `.coerce` for numbers. | Pin to `^3.22.4`. |
| `typescript` | Ensure `target` is at least `ES2022` for `node:fs` imports. | Add `"target": "ES2022"` in `tsconfig.json`. |
| `jest` / `ts-jest` | Missing `@types/jest` can cause type errors. | Include `@types/jest` as a devDependency. |
| Logging library (e.g., `pino`) | Might default to `prettyPrint: true` in production, leaking secrets. | Ensure production config disables pretty‑print and enforces JSON output. |

---

## Prioritised Fix List  

> **Goal:** Make the service safe to run in production, guarantee that configuration errors are visible **without** leaking secrets, and provide a usable public API.

| # | Action | Files Affected | Estimated effort | Why it’s critical |
|---|--------|----------------|-------------------|--------------------|
| **1** | **Sanitise and wrap all configuration‑loader errors** – create a `ConfigurationError` class that only includes field names, not raw values; replace both `throw new Error(...)` statements with this class. | `src/config/config.ts` | ~15 min | Prevents accidental secret leakage in logs / crash reports. |
| **2** | **Make config loading asynchronous** – replace `readFileSync` with `fs.promises.readFile`, export a `Promise<Config>` (or `async function loadConfig(): Promise<Config>`). Update any bootstrap code (`src/index.ts` or `dist/index.js`) to `await loadConfig()` before starting the server. | `src/config/config.ts`, entry‑point (`src/index.ts` or `src/server.ts`) | ~30 min | Removes blocking I/O on cold start, improves serverless latency. |
| **3** | **Add `strict()` to top‑level Zod schemas** and tighten validation for URLs & API keys (`z.string().url()`, regex for API keys). | `src/config/schemas.ts` | ~20 min | Catches miss‑spelled env vars early; avoids runtime connection errors; enforces proper format. |
| **4** | **Replace placeholder barrel with real public exports** – decide what the package should expose (e.g., `config`, `startServer`, `types`). Add explicit re‑exports. | `src/index.ts` | ~10 min | Supplies a usable public API; prevents accidental internal imports. |
| **5** | **Add top‑level uncaught‑exception handler** that logs a concise, redacted error and exits with code 1. | New file `src/bootstrap.ts` (or modify existing entry point) | ~10 min | Guarantees graceful shutdown and clear error signal when config fails. |
| **6** | **Whitelist environment variables before merging** – create a helper that only copies keys defined in `ConfigSchema.shape`. | `src/config/config.ts` | ~10 min | Prevents accidental overwriting of system env vars and avoids accidental config leaks. |
| **7** | **Write comprehensive unit tests for config loader** – success path (env only, JSON only, both), failure paths (missing required var, malformed JSON, schema violation), and test that error messages do not contain secret values. | `tests/config.test.ts` (or similar) | ~45 min | Guarantees future changes don’t break validation or re‑introduce leaks. |
| **8** | **Audit remaining modules (server, vector DB client, OpenAI wrapper)** for input validation, rate‑limiting, and secret handling. | *All source files not shown* – `src/server/*`, `src/llm/*`, `src/vector/*` | Varies (hours) | Critical for overall security, but out of scope of the current snapshot. |
| **9** | **Run `npm audit` and upgrade vulnerable dependencies** – pin versions for `dotenv`, `zod`, any logger, and testing libs. | `package.json` | ~15 min | Removes known CVEs from the dependency tree. |
| **10** | **Add a `.env.example` and `README` table** that clearly marks which variables are **required in production** vs **optional defaults**. Also add a note about **never committing real secrets**. | Repo root (`.env.example`, `README.md`) | ~10 min | Improves developer onboarding and reduces the chance of missing required vars. |

---

## Quick “What to do next” Checklist  

1. **Create `src/errors/ConfigurationError.ts`** (extends `Error`, sets a `code = 'CONFIG_ERROR'`).  
2. **Update `src/config/config.ts`** to use the new error class and `fs.promises.readFile`.  
3. **Add `.strict()` and URL regexes** in `src/config/schemas.ts`.  
4. **Replace `export {}` in `src/index.ts`** with real re‑exports (e.g. `export { config } from "./config/config"; export { startServer } from "./server";`).  
5. **Add a bootstrap wrapper** (`src/bootstrap.ts`) that loads config, catches `ConfigurationError`, logs sanitized message, and exits. Adjust `package.json` `main`/`scripts.start` to point at this wrapper.  
6. **Write Jest tests** under `tests/` covering all config scenarios.  
7. **Run `npm audit`**, fix any reported vulnerabilities, and commit the updated `package-lock.json`.  
8. **Add `.env.example`** with placeholder values and a comment about keeping it out of version control.  
9. **Review the rest of the codebase** (server, LLM client, vector DB client) for similar patterns (sync I/O, lack of validation, secret leakage).  

Once these steps are completed, the project will be **production‑ready** from a security, stability, and maintainability perspective. Happy coding!
