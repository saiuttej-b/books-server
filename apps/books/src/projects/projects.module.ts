import { Module } from '@nestjs/common';
import { ProjectsController } from './controllers/projects.controller';
import { ProjectsMutationService } from './services/projects-mutation.service';
import { ProjectsService } from './services/projects.service';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsMutationService, ProjectsService],
})
export class ProjectsModule {}
