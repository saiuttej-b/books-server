import { AppEnvType } from '@app/core';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService<AppEnvType>) {}

  getRoot() {
    return {
      appName: this.configService.get<string>('APP_NAME'),
      environment: this.configService.get<string>('PROJECT_ENVIRONMENT'),
      message: `Welcome to ${this.configService.get<string>('APP_NAME')}!`,
    };
  }
}
