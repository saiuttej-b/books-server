import { AppRequestStoreService } from '@app/integrations';
import { Injectable } from '@nestjs/common';
import { OrganizationRepository } from '../../db/repositories/organization.repository';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly orgRepo: OrganizationRepository,
    private readonly requestStore: AppRequestStoreService,
  ) {}

  async getMyOrganizations() {
    const orgs = await this.orgRepo.findByUserId(this.requestStore.getUserId());
    return { organizations: orgs };
  }

  getCurrentOrganization() {
    const org = this.requestStore.getOrganization();
    return { organization: org };
  }
}
