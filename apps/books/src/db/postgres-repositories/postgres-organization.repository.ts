import { generateId, Organization, OrganizationUser } from '@app/core';
import { DbService } from '@app/infra';
import { Injectable } from '@nestjs/common';
import { Not } from 'typeorm';
import { OrganizationRepository } from '../repositories/organization.repository';

@Injectable()
export class PostgresOrganizationRepository implements OrganizationRepository {
  constructor(private readonly dbService: DbService) {}

  instance(data?: Partial<Organization>): Organization {
    const record = this.dbService
      .getManager()
      .getRepository(Organization)
      .create(data || {});
    if (!record.id) record.id = generateId();
    return record;
  }

  userInstance(data?: Partial<OrganizationUser>): OrganizationUser {
    const record = this.dbService
      .getManager()
      .getRepository(OrganizationUser)
      .create(data || {});
    return record;
  }

  async create(props: { org: Organization; orgUser: OrganizationUser }): Promise<void> {
    await this.dbService.getWriteManager().insert(Organization, props.org);
    await this.dbService.getWriteManager().insert(OrganizationUser, props.orgUser);
  }

  async update(org: Organization): Promise<void> {
    await this.dbService.getWriteManager().update(Organization, org.id, org);
  }

  async existsByName(props: { name: string; neId?: string }): Promise<boolean> {
    const count = await this.dbService.getManager().count(Organization, {
      where: {
        name: props.name,
        ...(props.neId ? { id: Not(props.neId) } : {}),
      },
    });
    return count > 0;
  }

  async existsBySubdomain(props: { subdomain: string; neId?: string }): Promise<boolean> {
    const count = await this.dbService.getManager().count(Organization, {
      where: {
        subdomain: props.subdomain,
        ...(props.neId ? { id: Not(props.neId) } : {}),
      },
    });
    return count > 0;
  }

  findById(id: string): Promise<Organization | null> {
    return this.dbService.getManager().findOne(Organization, { where: { id } });
  }

  findUserByOrgIdAndUserId(props: {
    orgId: string;
    userId: string;
  }): Promise<OrganizationUser | null> {
    return this.dbService.getManager().findOne(OrganizationUser, {
      where: { organizationId: props.orgId, userId: props.userId },
    });
  }

  findByUserId(userId: string): Promise<Organization[]> {
    return this.dbService
      .getManager()
      .createQueryBuilder(Organization, 'org')
      .innerJoin(OrganizationUser, 'orgUser', 'org.id = orgUser.organizationId')
      .where('orgUser.userId = :userId', { userId })
      .getMany();
  }

  findUserByUserIdAndSubdomainWithOrg(props: {
    userId: string;
    subdomain: string;
  }): Promise<OrganizationUser | null> {
    return this.dbService.getManager().findOne(OrganizationUser, {
      where: { userId: props.userId, organization: { subdomain: props.subdomain } },
      relations: { organization: true },
    });
  }
}
