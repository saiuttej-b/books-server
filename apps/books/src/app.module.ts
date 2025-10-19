import { AppEnvType, EnvSchema } from '@app/core';
import { AppDbModule } from '@app/infra';
import { AppMailerModule, AppRequestStoreModule } from '@app/integrations';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EncryptionsModule } from '@saiuttej/nestjs-encryptions';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { BooksDbModule } from './db/db.module';
import { InvoicesModule } from './invoices/invoices.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { ProjectsModule } from './projects/projects.module';
import { QuotesModule } from './quotes/quotes.module';

@Module({
  imports: [
    /**
     * Configuration Module
     *
     * Loads environment variables and validates them against the defined schema.
     * Makes configuration globally available across the application.
     */
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        return EnvSchema.parse(config);
      },
    }),

    /**
     * Request Store Module
     *
     * Provides a mechanism to store and access request-scoped data throughout the lifecycle of a request.
     */
    AppRequestStoreModule,

    /**
     * Mailer Module
     *
     * Configured asynchronously to allow dynamic retrieval of mailer settings from environment variables.
     * Provides email sending functionalities across the application.
     */
    AppMailerModule,

    /**
     * Encryptions Module
     *
     * Configured asynchronously to allow dynamic retrieval of the encryption key from environment variables.
     * Provides encryption and decryption functionalities across the application.
     */
    EncryptionsModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppEnvType>) => {
        const secret = configService.get<string>('ENCRYPTION_KEY');
        if (!secret) {
          throw new Error('ENCRYPTION_KEY is required');
        }
        return { secret };
      },
    }),

    AppDbModule,
    BooksDbModule,

    AuthModule,
    OrganizationsModule,
    ClientsModule,
    ProjectsModule,
    InvoicesModule,
    QuotesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
