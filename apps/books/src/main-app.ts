import { AppEnvType, Environments, GlobalExceptionFilter, LoggingInterceptor } from '@app/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import { Request } from 'express';
import { AppModule } from './app.module';

export async function createBooksApp() {
  /**
   * Create a new Nest application instance with the AppModule
   */
  const app = await NestFactory.create(AppModule);

  /**
   * Get the ConfigService instance from the app container.
   */
  const configService = app.get<ConfigService<AppEnvType>>(ConfigService);
  const isProd = configService.get<string>('PROJECT_ENVIRONMENT') === Environments.PRODUCTION;

  /**
   * If Prod, enable only the error and warn logs.
   */
  if (isProd) {
    app.useLogger(['error', 'warn']);
  }

  /**
   * Sets the global prefix for all application routes to '/api'.
   */
  app.setGlobalPrefix('api');

  /**
   * Enable CORS for the application with the custom CORS configuration.
   * The CORS_ORIGIN environment variable is used to allow the specified origins.
   * If the CORS_ORIGIN value is not available or is *, allow all origins.
   * If the origin is allowed, set the allowed origin and methods in the callback.
   */
  app.enableCors((req: Request, callback: (...props: unknown[]) => void) => {
    const origin = req.header('Origin');
    const corsOrigin = configService.get<string>('CORS_ORIGIN');

    let allowed = false;
    if (!origin || corsOrigin === '*') {
      allowed = true;
    } else if (corsOrigin) {
      const allowedOrigins = corsOrigin.split(',').map((o) => o.trim());
      allowed = allowedOrigins.includes(origin);
    }

    callback(null, {
      origin: allowed,
      methods: 'GET,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
  });

  /**
   * Enable gzip compression for the application responses.
   */
  app.use(compression({ threshold: 0 }));

  /**
   * Register global exception filter for standardized error handling.
   */
  app.useGlobalFilters(new GlobalExceptionFilter());

  /**
   * Register global logging interceptor for request/response logging.
   */
  app.useGlobalInterceptors(new LoggingInterceptor());

  /**
   * Enables validation for all incoming requests using the ValidationPipe with the following options:
   *
   * - **transform:** Automatically transforms payloads to the correct types.
   * - **whitelist:** Strips any additional properties from the payload.
   * - **validateCustomDecorators:** Enables validation for custom decorators.
   * - **transformOptions:** Enables implicit type conversion.
   */
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      validateCustomDecorators: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  /**
   * Creates a Swagger document and sets up the Swagger UI:
   *
   * - Sets title, description, and version.
   * - Adds bearer authentication security scheme.
   *
   * The Swagger UI will be available at '/api/docs'.
   */
  if (!isProd) {
    const docConfig = new DocumentBuilder()
      .setTitle('Books Application API')
      .setDescription('Books API Documentation')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          in: 'header',
        },
        'JWT_BEARER_AUTHENTICATION',
      )
      .build();
    const document = SwaggerModule.createDocument(app, docConfig);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'Books API Documentation',
    });

    for (const path of Object.values(document.paths)) {
      for (const method of Object.values(path)) {
        if (!method.security) {
          method.security = [{ JWT_BEARER_AUTHENTICATION: [] }];
        }
      }
    }
  }

  return { app, configService, isProd };
}
