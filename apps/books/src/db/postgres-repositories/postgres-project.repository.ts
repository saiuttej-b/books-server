import { generateId, Project } from '@app/core';
import { DbService } from '@app/infra';
import { Injectable } from '@nestjs/common';
import { Not } from 'typeorm';
import { ProjectRepository } from '../repositories/project.repository';

@Injectable()
export class PostgresProjectRepository implements ProjectRepository {
  constructor(private readonly dbService: DbService) {}

  instance(data?: Partial<Project>): Project {
    const record = this.dbService
      .getManager()
      .getRepository(Project)
      .create(data || {});
    if (!record.id) record.id = generateId();
    return record;
  }

  async create(project: Project): Promise<void> {
    await this.dbService.getWriteManager().insert(Project, project);
  }

  async update(project: Project): Promise<void> {
    await this.dbService.getWriteManager().update(Project, project.id, project);
  }

  async existsByName(props: {
    name: string;
    organizationId: string;
    excludeId?: string | null;
  }): Promise<boolean> {
    const count = await this.dbService.getManager().count(Project, {
      where: {
        name: props.name,
        organizationId: props.organizationId,
        ...(props.excludeId ? { id: Not(props.excludeId) } : {}),
      },
    });
    return count > 0;
  }

  async existsByCode(props: {
    code: string;
    organizationId: string;
    excludeId?: string | null;
  }): Promise<boolean> {
    const count = await this.dbService.getManager().count(Project, {
      where: {
        code: props.code,
        organizationId: props.organizationId,
        ...(props.excludeId ? { id: Not(props.excludeId) } : {}),
      },
    });
    return count > 0;
  }

  findById(props: {
    id: string;
    organizationId: string;
    loadClient?: boolean;
  }): Promise<Project | null> {
    const builder = this.dbService
      .getManager()
      .createQueryBuilder(Project, 'project')
      .where('project.id = :id', { id: props.id })
      .andWhere('project.organizationId = :organizationId', {
        organizationId: props.organizationId,
      });
    if (props.loadClient) {
      builder
        .leftJoin('project.client', 'client')
        .addSelect(['client.id', 'client.name', 'client.displayName']);
    }
    return builder.getOne();
  }

  async find(props: {
    search?: string | null;
    organizationId: string;
    isActive?: boolean | null;
    clientId?: string | null;
    limit?: number | null;
    skip?: number | null;
  }): Promise<{ count: number; projects: Project[] }> {
    const builder = this.dbService
      .getManager()
      .createQueryBuilder(Project, 'project')
      .leftJoin('project.client', 'client')
      .addSelect(['client.id', 'client.name', 'client.displayName'])
      .where('project.organizationId = :organizationId', { organizationId: props.organizationId });

    if (props.search) {
      builder.andWhere(
        '(project.name ILIKE :search OR project.displayName ILIKE :search OR project.code ILIKE :search)',
        { search: `%${props.search}%` },
      );
    }
    if (props.isActive !== undefined && props.isActive !== null) {
      builder.andWhere(`project.isActive = ${props.isActive ? 'true' : 'false'}`);
    }
    if (props.clientId) {
      builder.andWhere('project.clientId = :clientId', { clientId: props.clientId });
    }

    const countBuilder = builder.clone();

    if (props.limit) {
      builder.take(props.limit);
    }
    if (props.skip) {
      builder.skip(props.skip);
      if (!props.limit) {
        builder.take(Number.MAX_SAFE_INTEGER);
      }
    }

    const [projects, count] = await Promise.all([
      builder.orderBy('project.code', 'ASC').getMany(),
      countBuilder.getCount(),
    ]);

    return { count, projects };
  }
}
