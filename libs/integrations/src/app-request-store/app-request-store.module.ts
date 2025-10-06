import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RequestStoreModule } from '@saiuttej/nestjs-request-store';
import { AppRequestStoreMiddleware } from './middleware/app-request-store.middleware';
import { AppRequestStoreService } from './services/app-request-store.service';

@Global()
@Module({
  imports: [RequestStoreModule.forRoot({ isGlobal: true })],
  providers: [AppRequestStoreService],
  exports: [AppRequestStoreService],
})
export class AppRequestStoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AppRequestStoreMiddleware).forRoutes('*path');
  }
}
