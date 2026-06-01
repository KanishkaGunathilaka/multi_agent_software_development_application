// src/app.ts

import express, { Request, Response, NextFunction } from "express";
import { resolve } from "node:path";
import { getLogger } from "./logger";
import researchRouter from "./routes/research";
import sdlcRouter from "./routes/sdlc";
import chatRouter from "./routes/chat";

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

  // Serve static frontend from /public
  app.use(express.static(resolve(process.cwd(), "public")));

  // Basic middleware
  app.use(express.json());

  // Request logger (sanitized) – must be before routes so every API call is logged
  app.use((req: Request, _res: Response, next: NextFunction) => {
    logger.info("Incoming request", {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    });
    next();
  });

  // API routes
  app.use("/api/research", researchRouter);
  app.use("/api/sdlc", sdlcRouter);
  app.use("/api/chat", chatRouter);

  // Root endpoint
  app.get("/", (_req, res) => {
    res.json({ name: "research-assistant", version: "1.0.0", status: "running" });
  });

  // Health-check endpoint
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
