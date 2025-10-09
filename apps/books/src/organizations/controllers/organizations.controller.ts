import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { OrganizationPostDto } from '../dtos/organization.dto';
import { OrganizationsMutationService } from '../services/organizations-mutation.service';
import { OrganizationsService } from '../services/organizations.service';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly orgMutationService: OrganizationsMutationService,
    private readonly orgService: OrganizationsService,
  ) {}

  @Post()
  createOrganization(@Body() body: OrganizationPostDto) {
    return this.orgMutationService.createOrganization(body);
  }

  @Put(':id')
  updateOrganization(@Body() body: OrganizationPostDto, @Param('id') id: string) {
    return this.orgMutationService.updateOrganization(body, id);
  }

  @Get('my-orgs')
  getMyOrganizations() {
    return this.orgService.getMyOrganizations();
  }

  @Get('current-org')
  getCurrentOrganization() {
    return this.orgService.getCurrentOrganization();
  }
}
