import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'body-parser';
import { authRouter } from './routes/auth.routes';
import { profileRouter } from './routes/profile.routes';
import { errorHandler } from './middleware/errorHandler';
import { setupSwagger } from './docs/swagger';
import { config } from './config/config';

const app: Application = express();

// Global middlewares
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

// API routes
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);

// Swagger UI
setupSwagger(app);

// Centralised error handling (must be after routes)
app.use(errorHandler);

/**
 * Starts the Express server.
 * Exported for testing purposes.
 */
export function createApp(): Application {
  return app;
}
