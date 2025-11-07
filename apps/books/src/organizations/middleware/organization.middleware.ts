import { AppRequestStoreService } from '@app/integrations';
import { Injectable, NestMiddleware, UnprocessableEntityException } from '@nestjs/common';
import { Request } from 'express';
import { OrganizationRepository } from '../../db/repositories/organization.repository';

const orgCheckEnabledRoutes = ['/organizations/current-org'];

@Injectable()
export class OrganizationMiddleware implements NestMiddleware {
  constructor(
    private readonly requestStore: AppRequestStoreService,
    private readonly orgRepo: OrganizationRepository,
  ) {}

  async use(req: Request, _: Response, next: (error?: any) => void) {
    let route = req.originalUrl.split('?')[0];
    if (route.startsWith('/api')) route = route.slice(4);
    if (route.startsWith('/auth')) return next();
    if (route.startsWith('/organizations') && !orgCheckEnabledRoutes.includes(route)) return next();

    const orgSubdomain = req.headers['x-org-subdomain'] as string;
    if (!orgSubdomain) {
      throw new UnprocessableEntityException('Organization subdomain is required in the request.');
    }

    const orgUser = await this.orgRepo.findUserByUserIdAndSubdomainWithOrg({
      userId: this.requestStore.getUserId(),
      subdomain: orgSubdomain,
    });
    if (!orgUser) {
      throw new UnprocessableEntityException(
        'You do not have permission to access this organization. You are not part of this organization.',
      );
    }
    const org = orgUser.organization;
    if (!org) {
      throw new UnprocessableEntityException(
        'Unable to find your organization details. Please contact support.',
      );
    }

    this.requestStore.setOrganization(org);
    this.requestStore.setOrganizationUser(orgUser);

    next();
  }
}
