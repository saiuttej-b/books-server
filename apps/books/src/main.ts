import { timeDiffMinutesDetails } from '@app/core';
import { Logger } from '@nestjs/common';
import { createBooksApp } from './main-app';

async function serverBootstrap() {
  const startedAt = new Date();

  /**
   * Create a new Nest application instance with the AppModule
   */
  const { app, configService, isProd } = await createBooksApp();

  /**
   * Gets the PORT value from the ConfigService or uses the default value 80.
   * Starts the Nest application on the specified port and logs startup messages.
   */
  const PORT = configService.get<string>('BOOKS_SERVER_PORT') || 80;
  await app.listen(PORT, '0.0.0.0', () => {
    const startedIn = timeDiffMinutesDetails(startedAt, new Date());

    if (!isProd) {
      Logger.log(
        `API's are documented in Swagger UI on: http://localhost:${PORT}/api/docs`,
        'Main',
      );
    }

    Logger.log(
      `Server is running on: http://localhost:${PORT}/api, server started in ${startedIn}`,
      'Main',
    );
  });
}
void serverBootstrap();
