import { Module } from '@nestjs/common';
import { AuthTokensService } from './services/auth-tokens.service';

@Module({
  providers: [AuthTokensService],
  exports: [AuthTokensService],
})
export class AuthTokensModule {}
