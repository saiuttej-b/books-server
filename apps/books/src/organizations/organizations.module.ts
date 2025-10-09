import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { OrganizationsController } from './controllers/organizations.controller';
import { OrganizationMiddleware } from './middleware/organization.middleware';
import { OrganizationsMutationService } from './services/organizations-mutation.service';
import { OrganizationsService } from './services/organizations.service';

@Module({
  controllers: [OrganizationsController],
  providers: [OrganizationsMutationService, OrganizationsService],
})
export class OrganizationsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(OrganizationMiddleware).forRoutes('*path');
  }
}
