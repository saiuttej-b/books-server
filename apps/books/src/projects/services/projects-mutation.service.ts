import {
  ChangeLogEntityName,
  Client,
  EntityChangeLogChangedField,
  isValidCode,
  ProjectChangeType,
} from '@app/core';
import { DbService, EntityChangeLogRepository } from '@app/infra';
import { AppRequestStoreService } from '@app/integrations';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ClientRepository } from '../../db/repositories/client.repository';
import { ProjectRepository } from '../../db/repositories/project.repository';
import { ProjectPostDto } from '../dtos/projects.dto';

@Injectable()
export class ProjectsMutationService {
  constructor(
    private readonly clientRepo: ClientRepository,
    private readonly projectRepo: ProjectRepository,
    private readonly requestStore: AppRequestStoreService,
    private readonly changeLogRepo: EntityChangeLogRepository,
    private readonly dbService: DbService,
  ) {}

  async addProject(reqBody: ProjectPostDto) {
    await this.validateProjectBody(reqBody);

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

    const projectLog = this.changeLogRepo.instance({
      entityName: ChangeLogEntityName.PROJECTS,
      entityId: project.id,
      changeType: ProjectChangeType.ADDED,
      userId: this.requestStore.getUserId(),
      organizationId: this.requestStore.getOrganizationId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      details: {
        changedFields: [],
        changeMessages: [`Project "${project.name}" added by {{user.fullName}}`],
        customDetails: {
          project: project,
        },
      },
    });

    await this.dbService.transaction({
      execute: async () => {
        await this.projectRepo.create(project);
        await this.changeLogRepo.insertLogs([projectLog]);
      },
    });

    return {
      projectId: project.id,
      message: `Project "${project.name}" added successfully`,
    };
  }

  async updateProject(reqBody: ProjectPostDto, id: string) {
    const project = await this.projectRepo.findById({
      id,
      organizationId: this.requestStore.getOrganizationId(),
    });
    if (!project) {
      throw new BadRequestException('Project not found or is not part of the organization');
    }

    const { client } = await this.validateProjectBody(reqBody, id);

    const changedFields: EntityChangeLogChangedField[] = [];
    const changeMessages: string[] = [];

    if (project.name !== reqBody.name) {
      changedFields.push({
        fieldName: 'name',
        oldValue: project.name,
        newValue: reqBody.name,
      });
      changeMessages.push(`Project Name changed from "${project.name}" to "${reqBody.name}"`);
      project.name = reqBody.name;
    }

    if (project.displayName !== reqBody.displayName) {
      changedFields.push({
        fieldName: 'displayName',
        oldValue: project.displayName,
        newValue: reqBody.displayName,
      });
      changeMessages.push(
        `Project Display Name changed from "${project.displayName}" to "${reqBody.displayName}"`,
      );
      project.displayName = reqBody.displayName;
    }

    if (project.code !== reqBody.code) {
      changedFields.push({
        fieldName: 'code',
        oldValue: project.code,
        newValue: reqBody.code,
      });
      changeMessages.push(`Project Code changed from "${project.code}" to "${reqBody.code}"`);
      project.code = reqBody.code;
    }

    if (project.description !== reqBody.description) {
      changedFields.push({
        fieldName: 'description',
        oldValue: project.description,
        newValue: reqBody.description,
      });
      changeMessages.push(
        `Project Description changed from "${project.description ?? ''}" to "${
          reqBody.description ?? ''
        }"`,
      );
      project.description = reqBody.description ?? null;
    }

    if (project.clientId !== reqBody.clientId) {
      changedFields.push({
        fieldName: 'clientId',
        oldValue: project.clientId,
        newValue: reqBody.clientId,
      });
      if (reqBody.clientId) {
        changeMessages.push(`Client '${client?.name}' is assigned to the project`);
      } else {
        changeMessages.push(`Client is removed from the project`);
      }
      project.clientId = reqBody.clientId ?? null;
    }

    if (project.isActive !== reqBody.isActive) {
      changedFields.push({
        fieldName: 'isActive',
        oldValue: project.isActive,
        newValue: reqBody.isActive,
      });
      changeMessages.push(
        `Project is marked as ${reqBody.isActive ? 'Active' : 'Inactive'} by {{user.fullName}}`,
      );
      project.isActive = reqBody.isActive;
    }

    if (changedFields.length === 0) {
      return {
        projectId: project.id,
        message: 'No changes detected',
      };
    }

    project.updatedAt = new Date().toISOString();

    const projectLog = this.changeLogRepo.instance({
      entityName: ChangeLogEntityName.PROJECTS,
      entityId: project.id,
      changeType: ProjectChangeType.UPDATED,
      userId: this.requestStore.getUserId(),
      organizationId: this.requestStore.getOrganizationId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      details: {
        changedFields,
        changeMessages,
      },
    });

    await this.dbService.transaction({
      execute: async () => {
        await this.projectRepo.update(project);
        await this.changeLogRepo.insertLogs([projectLog]);
      },
    });

    return {
      projectId: project.id,
      message: `Project "${project.name}" updated successfully`,
    };
  }

  private async validateProjectBody(reqBody: ProjectPostDto, id?: string) {
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

    let client: Client | null = null;
    if (reqBody.clientId) {
      client = await this.clientRepo.findById({
        id: reqBody.clientId,
        organizationId: this.requestStore.getOrganizationId(),
      });
      if (!client) {
        throw new BadRequestException('Client not found or is not part of the organization');
      }
    } else {
      reqBody.clientId = null;
    }

    if (!reqBody.description) reqBody.description = null;

    return { client };
  }
}
