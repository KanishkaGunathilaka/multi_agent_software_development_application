import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

/**
 * Sets up Swagger UI on the Express app.
 */
export function setupSwagger(app: Express) {
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Auth Service API',
        version: '1.0.0',
        description: 'Authentication API with JWT and refresh tokens.',
      },
      servers: [{ url: 'http://localhost:{port}', variables: { port: { default: '3000' } } }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
        schemas: {
          RegisterRequest: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
              email: { type: 'string', format: 'email' },
              password: { type: 'string', minLength: 8 },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
            },
          },
          RegisterResponse: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              accessToken: { type: 'string' },
              expiresIn: { type: 'integer' },
            },
          },
          LoginRequest: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
              email: { type: 'string', format: 'email' },
              password: { type: 'string' },
            },
          },
          LoginResponse: {
            type: 'object',
            properties: {
              accessToken: { type: 'string' },
              expiresIn: { type: 'integer' },
              // refreshToken omitted from body (set as HttpOnly cookie)
            },
          },
          RefreshRequest: {
            type: 'object',
            properties: {
              refreshToken: { type: 'string' },
            },
          },
          RefreshResponse: {
            type: 'object',
            properties: {
              accessToken: { type: 'string' },
              expiresIn: { type: 'integer' },
            },
          },
          LogoutResponse: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    apis: ['./src/routes/*.ts'],
  };

  const swaggerSpec = swaggerJSDoc(options);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
