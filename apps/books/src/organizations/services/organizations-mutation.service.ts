import {
  ChangeLogEntityName,
  EntityChangeLogChangedField,
  isValidSlug,
  OrganizationChangeType,
  OrganizationUserChangeType,
  OrganizationUserRoles,
} from '@app/core';
import { DbService, EntityChangeLogRepository } from '@app/infra';
import { AppRequestStoreService } from '@app/integrations';
import { BadRequestException, Injectable } from '@nestjs/common';
import { OrganizationRepository } from '../../db/repositories/organization.repository';
import { OrganizationPostDto } from '../dtos/organization.dto';

/** Service for handling organization mutations */
@Injectable()
export class OrganizationsMutationService {
  constructor(
    private readonly orgRepo: OrganizationRepository,
    private readonly requestStore: AppRequestStoreService,
    private readonly changeLogRepo: EntityChangeLogRepository,
    private readonly dbService: DbService,
  ) {}

  /**
   * Method to create a new organization.
   *
   * @param reqBody - The request body containing organization details.
   */
  async createOrganization(reqBody: OrganizationPostDto) {
    /** Validate the request body */
    await this.validateOrgPostBody(reqBody);

    /** Create organization and organization user instances */
    const org = this.orgRepo.instance({
      name: reqBody.name,
      subdomain: reqBody.subdomain,
      createdById: this.requestStore.getUserId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const orgUser = this.orgRepo.userInstance({
      organizationId: org.id,
      userId: this.requestStore.getUserId(),
      role: OrganizationUserRoles.OWNER,
    });

    /** Create change log instance for organization and organization user */
    const orgLog = this.changeLogRepo.instance({
      entityName: ChangeLogEntityName.ORGANIZATIONS,
      entityId: org.id,
      userId: this.requestStore.getUserId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      changeType: OrganizationChangeType.CREATE,
      details: {
        changedFields: [],
        changeMessages: [`Organization "${org.name}" created by {{user.fullName}}`],
        customDetails: {
          organization: org,
        },
      },
    });
    const orgUserLog = this.changeLogRepo.instance({
      entityName: ChangeLogEntityName.ORGANIZATION_USERS,
      entityId: orgUser.organizationId + '::' + orgUser.userId,
      userId: this.requestStore.getUserId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      changeType: OrganizationUserChangeType.OWNER,
      details: {
        changedFields: [],
        changeMessages: [`{{user.fullName}} added as OWNER to organization "${org.name}"`],
      },
    });

    /** Use transaction to create organization, organization user and change logs */
    await this.dbService.transaction({
      execute: async () => {
        await this.orgRepo.create({ org: org, orgUser });
        await this.changeLogRepo.insertLogs([orgLog, orgUserLog]);
      },
    });

    return {
      id: org.id,
      subdomain: org.subdomain,
      message: `Organization "${org.name}" created successfully.`,
    };
  }

  /**
   * Method to update an existing organization.
   *
   * @param reqBody - The request body containing updated organization details.
   * @param id - The ID of the organization to be updated.
   */
  async updateOrganization(reqBody: OrganizationPostDto, id: string) {
    /** Fetch the organization and check if it exists */
    const org = await this.orgRepo.findById(id);
    if (!org) {
      throw new BadRequestException('Organization not found to update.');
    }

    /** Fetch the organization user and check if the user is the owner or not */
    const orgUser = await this.orgRepo.findUserByOrgIdAndUserId({
      orgId: id,
      userId: this.requestStore.getUserId(),
    });
    if (!orgUser) {
      throw new BadRequestException(
        'You do not have permission to update this organization. You must be a member of the organization.',
      );
    }
    if (orgUser.role !== OrganizationUserRoles.OWNER) {
      throw new BadRequestException(
        'You do not have permission to update this organization. You must be an owner of the organization to update org details.',
      );
    }

    /** Validate the request body */
    await this.validateOrgPostBody(reqBody, id);

    /**
     * Track changes and prepare change log details
     */
    const changedFields: EntityChangeLogChangedField[] = [];
    const changeMessages: string[] = [];

    if (org.name !== reqBody.name) {
      changedFields.push({
        fieldName: 'name',
        oldValue: org.name,
        newValue: reqBody.name,
      });
      changeMessages.push(
        `Organization name changed from "${org.name}" to "${reqBody.name}" by {{user.fullName}}`,
      );
      org.name = reqBody.name;
    }
    if (org.subdomain !== reqBody.subdomain) {
      changedFields.push({
        fieldName: 'subdomain',
        oldValue: org.subdomain,
        newValue: reqBody.subdomain,
      });
      changeMessages.push(
        `Organization subdomain changed from "${org.subdomain}" to "${reqBody.subdomain}" by {{user.fullName}}`,
      );
      org.subdomain = reqBody.subdomain;
    }

    /**
     * If no fields have changed, return early with a message
     * indicating that no changes were detected.
     */
    if (changedFields.length === 0) {
      return {
        id: org.id,
        subdomain: org.subdomain,
        message: `No changes detected for organization "${org.name}".`,
      };
    }

    /** Create change log instance for the organization update */
    const orgLog = this.changeLogRepo.instance({
      entityName: ChangeLogEntityName.ORGANIZATIONS,
      entityId: org.id,
      userId: this.requestStore.getUserId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      changeType: OrganizationChangeType.UPDATE,
      details: {
        changedFields,
        changeMessages,
      },
    });

    /** Update the organization's updatedAt timestamp */
    org.updatedAt = new Date().toISOString();

    /** Use database transaction to update the organization and adding the change log */
    await this.dbService.transaction({
      execute: async () => {
        await this.orgRepo.update(org);
        await this.changeLogRepo.insertLogs([orgLog]);
      },
    });

    return {
      id: org.id,
      subdomain: org.subdomain,
      message: `Organization "${org.name}" updated successfully.`,
    };
  }

  /**
   * Method to validate the organization post body.
   *
   * @param reqBody - The request body containing organization details.
   * @param id - Optional ID of the organization (for updates).
   */
  private async validateOrgPostBody(reqBody: OrganizationPostDto, id?: string) {
    /** Validate subdomain */
    const validSlug = isValidSlug(reqBody.subdomain);
    if (!validSlug.isValid) {
      throw new BadRequestException(`Invalid subdomain: ${validSlug.errors.join(' ')}`);
    }

    /** Check for uniqueness of subdomain */
    const subdomainExists = await this.orgRepo.existsBySubdomain({
      subdomain: reqBody.subdomain,
      neId: id,
    });
    if (subdomainExists) {
      throw new BadRequestException(`Subdomain "${reqBody.subdomain}" is already taken.`);
    }

    /** Check for uniqueness of organization name */
    const nameExists = await this.orgRepo.existsByName({ name: reqBody.name, neId: id });
    if (nameExists) {
      throw new BadRequestException(`Organization name "${reqBody.name}" is already taken.`);
    }
  }
}
