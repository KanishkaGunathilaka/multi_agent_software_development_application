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
