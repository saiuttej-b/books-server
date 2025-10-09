import { AppEnvType } from '@app/core';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailClientTypes, EmailsModule } from '@saiuttej/nestjs-mailer';
import { AppMailerService } from './services/app-mailer.service';

@Global()
@Module({
  imports: [
    EmailsModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppEnvType>) => {
        const token = configService.get('MAILTRAP_TOKEN') || '';
        const senderEmail = configService.get('MAILTRAP_SENDER_EMAIL') || '';

        return {
          clients: [
            {
              key: 'default',
              type: EmailClientTypes.MAILTRAP,
              default: true,
              MAILTRAP: {
                defaultSenderEmail: senderEmail,
                config: {
                  token: token,
                },
              },
            },
          ],
        };
      },
    }),
  ],
  providers: [AppMailerService],
  exports: [AppMailerService],
})
export class AppMailerModule {}
