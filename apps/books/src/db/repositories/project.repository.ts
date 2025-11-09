import { Project } from '@app/core';

export abstract class ProjectRepository {
  abstract instance(data?: Partial<Project>): Project;

  abstract create(project: Project): Promise<void>;

  abstract update(project: Project): Promise<void>;

  abstract existsByName(props: {
    name: string;
    organizationId: string;
    excludeId?: string | null;
  }): Promise<boolean>;

  abstract existsByCode(props: {
    code: string;
    organizationId: string;
    excludeId?: string | null;
  }): Promise<boolean>;

  abstract findById(props: {
    id: string;
    organizationId: string;
    loadClient?: boolean;
  }): Promise<Project | null>;

  abstract find(props: {
    search?: string | null;
    organizationId: string;
    isActive?: boolean | null;
    clientId?: string | null;
    limit?: number | null;
    skip?: number | null;
  }): Promise<{ count: number; projects: Project[] }>;
}
