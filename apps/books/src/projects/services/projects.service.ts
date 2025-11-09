import { AppRequestStoreService } from '@app/integrations';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectRepository } from '../../db/repositories/project.repository';
import { ProjectsGetDto } from '../dtos/projects.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectRepo: ProjectRepository,
    private readonly requestStore: AppRequestStoreService,
  ) {}

  getProjects(query: ProjectsGetDto) {
    return this.projectRepo.find({
      organizationId: this.requestStore.getOrganizationId(),
      ...query,
    });
  }

  async getProjectDetails(projectId: string) {
    const project = await this.projectRepo.findById({
      id: projectId,
      organizationId: this.requestStore.getOrganizationId(),
      loadClient: true,
    });
    if (!project) {
      throw new NotFoundException('Project not found or is not part of your organization');
    }

    return { project };
  }
}
