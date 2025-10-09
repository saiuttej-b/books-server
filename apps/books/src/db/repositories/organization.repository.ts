import { Organization, OrganizationUser } from '@app/core';

export abstract class OrganizationRepository {
  abstract instance(data?: Partial<Organization>): Organization;

  abstract userInstance(data?: Partial<OrganizationUser>): OrganizationUser;

  abstract create(props: { org: Organization; orgUser: OrganizationUser }): Promise<void>;

  abstract update(org: Organization): Promise<void>;

  abstract existsByName(props: { name: string; neId?: string }): Promise<boolean>;

  abstract existsBySubdomain(props: { subdomain: string; neId?: string }): Promise<boolean>;

  abstract findById(id: string): Promise<Organization | null>;

  abstract findUserByOrgIdAndUserId(props: {
    orgId: string;
    userId: string;
  }): Promise<OrganizationUser | null>;

  abstract findByUserId(userId: string): Promise<Organization[]>;

  abstract findUserByUserIdAndSubdomainWithOrg(props: {
    userId: string;
    subdomain: string;
  }): Promise<OrganizationUser | null>;
}
