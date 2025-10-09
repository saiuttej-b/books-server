import { Organization, OrganizationUser, User } from '@app/core';
import { Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { RequestStoreService } from '@saiuttej/nestjs-request-store';
import { Request } from 'express';

/** Symbol for the express request */
const EXPRESS_REQUEST = Symbol.for('EXPRESS_REQUEST');

/** Symbol for the current user */
const CURRENT_USER = Symbol.for('CURRENT_USER');

/** Symbols for organization related values */
const CURRENT_ORGANIZATION = Symbol.for('CURRENT_ORGANIZATION');
const CURRENT_ORGANIZATION_USER = Symbol.for('CURRENT_ORGANIZATION_USER');

@Injectable()
export class AppRequestStoreService {
  constructor(private readonly service: RequestStoreService) {}

  setExpressRequest(req: Request): void {
    this.service.setValue(EXPRESS_REQUEST.toString(), req);
  }

  getExpressRequest(): Request | undefined {
    return this.service.getValue<Request>(EXPRESS_REQUEST.toString());
  }

  setUser(data: User): void {
    this.service.setValue(CURRENT_USER.toString(), data);
  }

  getUserOrNull(): User | null {
    return this.service.getValue(CURRENT_USER.toString()) || null;
  }

  getUser(): User {
    const user = this.getUserOrNull();
    if (!user) {
      throw new UnauthorizedException('Unable to get current user details');
    }
    return user;
  }

  getUserId(): string {
    const user = this.getUser();
    if (!user) {
      throw new UnauthorizedException('Unable to get current user ID');
    }
    return user.id;
  }

  setOrganization(data: Organization): void {
    this.service.setValue(CURRENT_ORGANIZATION.toString(), data);
  }

  setOrganizationUser(data: OrganizationUser): void {
    this.service.setValue(CURRENT_ORGANIZATION_USER.toString(), data);
  }

  getOrganizationOrNull(): Organization | null {
    return this.service.getValue<Organization>(CURRENT_ORGANIZATION.toString()) || null;
  }

  getOrganization(): Organization {
    const org = this.getOrganizationOrNull();
    if (!org) {
      throw new UnprocessableEntityException('Unable to get current organization details');
    }
    return org;
  }

  getOrganizationId(): string {
    const org = this.getOrganization();
    return org.id;
  }

  getOrganizationUser(): OrganizationUser {
    const orgUser = this.service.getValue<OrganizationUser>(CURRENT_ORGANIZATION_USER.toString());
    if (!orgUser) {
      throw new UnprocessableEntityException('Unable to get current organization user details');
    }
    return orgUser;
  }
}
