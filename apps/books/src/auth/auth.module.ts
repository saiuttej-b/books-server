import { AuthTokensModule } from '@app/infra';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './controllers/auth.controller';
import { BooksUserAuthGuard } from './guards/books-user-auth.guard';
import { UserAuthMiddleware } from './middleware/user-auth.middleware';
import { AuthCheckService } from './services/auth-check.service';
import { AuthService } from './services/auth.service';

@Module({
  imports: [AuthTokensModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthCheckService,
    {
      provide: APP_GUARD,
      useClass: BooksUserAuthGuard,
    },
  ],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserAuthMiddleware).forRoutes('*path');
  }
}
