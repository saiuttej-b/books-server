import { isValidCode } from '@app/core';
import { DbService } from '@app/infra';
import { AppRequestStoreService } from '@app/integrations';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ClientRepository } from '../../db/repositories/client.repository';
import { ProjectRepository } from '../../db/repositories/project.repository';
import { ProjectCreateDto, ProjectUpdateDto } from '../dtos/projects.dto';

@Injectable()
export class ProjectsMutationService {
  constructor(
    private readonly clientRepo: ClientRepository,
    private readonly projectRepo: ProjectRepository,
    private readonly requestStore: AppRequestStoreService,
    private readonly dbService: DbService,
  ) {}

  async addProject(reqBody: ProjectCreateDto) {
    await this.validateProjectBody(reqBody);

    const client = await this.clientRepo.findById({
      id: reqBody.clientId,
      organizationId: this.requestStore.getOrganizationId(),
    });
    if (!client) {
      throw new BadRequestException('Client not found or is not part of the organization');
    }

    const project = this.projectRepo.instance({
      organizationId: this.requestStore.getOrganizationId(),
      name: reqBody.name,
      displayName: reqBody.displayName,
      code: reqBody.code,
      description: reqBody.description ?? null,
      clientId: reqBody.clientId ?? null,
      isActive: reqBody.isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await this.dbService.transaction({
      execute: async () => {
        await this.projectRepo.create(project);
      },
    });

    return {
      projectId: project.id,
      message: `Project "${project.name}" added successfully`,
    };
  }

  async updateProject(reqBody: ProjectUpdateDto, id: string) {
    const project = await this.projectRepo.findById({
      id,
      organizationId: this.requestStore.getOrganizationId(),
    });
    if (!project) {
      throw new BadRequestException('Project not found or is not part of the organization');
    }

    await this.validateProjectBody(reqBody, id);

    project.name = reqBody.name;
    project.displayName = reqBody.displayName;
    project.code = reqBody.code;
    project.description = reqBody.description ?? null;
    project.isActive = reqBody.isActive;
    project.updatedAt = new Date().toISOString();

    await this.dbService.transaction({
      execute: async () => {
        await this.projectRepo.update(project);
      },
    });

    return {
      projectId: project.id,
      message: `Project "${project.name}" updated successfully`,
    };
  }

  private async validateProjectBody(reqBody: ProjectUpdateDto, id?: string) {
    const validCode = isValidCode(reqBody.code);
    if (!validCode.isValid) {
      throw new BadRequestException(`Invalid Project Code: ${validCode.errors.join(', ')}`);
    }

    const nameExists = await this.projectRepo.existsByName({
      name: reqBody.name,
      organizationId: this.requestStore.getOrganizationId(),
      excludeId: id,
    });
    if (nameExists) {
      throw new BadRequestException(`There is already a project with the name "${reqBody.name}"`);
    }

    const codeExists = await this.projectRepo.existsByCode({
      code: reqBody.code,
      organizationId: this.requestStore.getOrganizationId(),
      excludeId: id,
    });
    if (codeExists) {
      throw new BadRequestException(`There is already a project with the code "${reqBody.code}"`);
    }

    if (!reqBody.description) reqBody.description = null;
  }
}
