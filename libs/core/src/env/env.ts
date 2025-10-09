import { z } from 'zod';

export const Environments = Object.freeze({
  PRODUCTION: 'PRODUCTION',
  DEVELOPMENT: 'DEVELOPMENT',
  LOCAL: 'LOCAL',
});

export const EnvSchema = z.object({
  TZ: z.string().default('UTC'),

  APP_NAME: z.string(),
  PROJECT_ENVIRONMENT: z.string(),
  CORS_ORIGIN: z.string().optional(),

  ENCRYPTION_KEY: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRATION_TIME: z.string(),

  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.coerce.number().positive(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  POSTGRES_SSL: z.enum(['true', 'false']).default('true'),

  AWS_S3_BUCKET_NAME: z.string(),
  AWS_S3_FILE_BASE_URL: z.string(),

  MAILTRAP_TOKEN: z.string(),
  MAILTRAP_SENDER_EMAIL: z.email(),

  // Optional Environment Variables
  BOOKS_SERVER_PORT: z.coerce.number().optional(),

  APP_AWS_REGION: z.string().nullable().optional(),
  APP_AWS_ACCESS_KEY_ID: z.string().nullable().optional(),
  APP_AWS_SECRET_ACCESS_KEY: z.string().nullable().optional(),
  AWS_LAMBDA_FUNCTION_NAME: z.string().optional(),
});

export type AppEnvType = z.infer<typeof EnvSchema>;
