import {
  ChangeLogEntityName,
  Client,
  ClientChangeType,
  ClientContactPerson,
  ClientContactPersonChangeType,
  EntityChangeLog,
  EntityChangeLogChangedField,
  GSTTreatmentOptions,
  isValidEmailId,
  isValidGSTNumber,
  isValidMobileNumber,
  isValidPanNumber,
  personFullName,
} from '@app/core';
import { DbService, EntityChangeLogRepository } from '@app/infra';
import { AppRequestStoreService } from '@app/integrations';
import { BadRequestException, Injectable } from '@nestjs/common';
import { keyBy } from 'lodash';
import { ClientRepository } from '../../db/repositories/client.repository';
import { ClientPostDto } from '../dtos/clients.dto';

@Injectable()
export class ClientsMutationService {
  constructor(
    private readonly clientRepo: ClientRepository,
    private readonly requestStore: AppRequestStoreService,
    private readonly changeLogRepo: EntityChangeLogRepository,
    private readonly dbService: DbService,
  ) {}

  async addClient(reqBody: ClientPostDto) {
    await this.validateClientBody(reqBody);

    const client = this.clientRepo.instance({
      organizationId: this.requestStore.getOrganizationId(),
      customerType: reqBody.customerType,
      name: reqBody.name,
      displayName: reqBody.displayName,
      email: reqBody.email ?? null,
      mobileCountryCode: reqBody.mobileCountryCode ?? null,
      mobile: reqBody.mobile ?? null,
      isActive: reqBody.isActive ?? true,
      treatmentOption: reqBody.treatmentOption,
      gstin: reqBody.gstin ?? null,
      pan: reqBody.pan ?? null,
      placeOfSupply: reqBody.placeOfSupply ?? null,
      businessLegalName: reqBody.businessLegalName ?? null,
      businessTradeName: reqBody.businessTradeName ?? null,
      billingAddress: reqBody.billingAddress,
      shippingAddress: reqBody.shippingAddress,
      remarks: reqBody.remarks ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const contactPersons = reqBody.contactPersons.map((cp) =>
      this.clientRepo.contactInstance({
        organizationId: this.requestStore.getOrganizationId(),
        clientId: client.id,
        salutation: cp.salutation,
        firstName: cp.firstName,
        lastName: cp.lastName ?? null,
        email: cp.email ?? null,
        mobileCountryCode: cp.mobileCountryCode ?? null,
        mobile: cp.mobile ?? null,
        workPhoneCountryCode: cp.workPhoneCountryCode ?? null,
        workPhone: cp.workPhone ?? null,
        isPrimaryContact: cp.isPrimaryContact ?? false,
        designation: cp.designation ?? null,
        department: cp.department ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    );

    const clientLog = this.changeLogRepo.instance({
      entityName: ChangeLogEntityName.CLIENTS,
      entityId: client.id,
      changeType: ClientChangeType.ADDED,
      userId: this.requestStore.getUserId(),
      organizationId: this.requestStore.getOrganizationId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      details: {
        changedFields: [],
        changeMessages: [`Client "${client.name}" added by {{user.fullName}}`],
        customDetails: {
          client,
        },
      },
    });
    const contactLogs = contactPersons.map((cp) => {
      const name = personFullName({
        salutation: cp.salutation,
        firstName: cp.firstName,
        lastName: cp.lastName,
      });
      return this.changeLogRepo.instance({
        entityName: ChangeLogEntityName.CLIENT_CONTACT_PERSONS,
        entityId: `${client.id}::${cp.id}`,
        changeType: ClientContactPersonChangeType.ADDED,
        userId: this.requestStore.getUserId(),
        organizationId: this.requestStore.getOrganizationId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        details: {
          changedFields: [],
          changeMessages: [
            `Contact person "${name}" added to client "{{client.name}}" by {{user.fullName}}`,
          ],
          customDetails: {
            contactPerson: cp,
          },
        },
      });
    });

    await this.dbService.transaction({
      execute: async () => {
        await this.clientRepo.create(client);
        await this.clientRepo.addContacts(contactPersons);
        await this.changeLogRepo.insertLogs([clientLog, ...contactLogs]);
      },
    });

    return {
      clientId: client.id,
      message: `Client "${client.name}" added successfully.`,
    };
  }

  async updateClient(reqBody: ClientPostDto, id: string) {
    const client = await this.clientRepo.findById({
      id,
      organizationId: this.requestStore.getOrganizationId(),
    });
    if (!client) {
      throw new BadRequestException('Client not found or does not belong to the organization');
    }

    await this.validateClientBody(reqBody, id);

    const { changedFields, changeMessages } = this.listAndUpdateClientChanges(reqBody, client);

    const contactsChanges = await this.listAndUpdateContactPersonsChanges(reqBody, client);

    if (changedFields.length === 0 && contactsChanges.changeLogs.length === 0) {
      return {
        clientId: client.id,
        message: 'No changes found to update.',
      };
    }

    const clientLog = !changedFields.length
      ? null
      : this.changeLogRepo.instance({
          entityName: ChangeLogEntityName.CLIENTS,
          entityId: client.id,
          changeType: ClientChangeType.UPDATED,
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
        if (contactsChanges.changeLogs.length) {
          await this.clientRepo.updateContacts(contactsChanges.updatedContacts);
          await this.clientRepo.addContacts(contactsChanges.newContacts);
          await this.clientRepo.deleteContactsByIds(
            contactsChanges.removedContacts.map((c) => c.id),
          );
          await this.changeLogRepo.insertLogs(contactsChanges.changeLogs);
        }

        if (clientLog) {
          client.updatedAt = new Date().toISOString();
          await this.clientRepo.update(client);
          await this.changeLogRepo.insertLogs([clientLog]);
        }
      },
    });

    return {
      clientId: client.id,
      message: `Client "${client.name}" updated successfully.`,
    };
  }

  /**
   * Validations for client request body
   *
   * @param reqBody - request body
   * @param id - client id in case of update
   */
  private async validateClientBody(reqBody: ClientPostDto, id?: string) {
    /**
     * Check if there is already a client with same name in the organization
     */
    const nameExists = await this.clientRepo.existsByName({
      name: reqBody.name,
      organizationId: this.requestStore.getOrganizationId(),
      neId: id,
    });
    if (nameExists) {
      throw new BadRequestException(`There is already a client with same name '${reqBody.name}'`);
    }

    /** Validate email if provided */
    if (reqBody.email) {
      const emailValid = isValidEmailId(reqBody.email);
      if (!emailValid.isValid) {
        throw new BadRequestException(`Email is not valid: ${emailValid.errors.join(', ')}`);
      }
    } else {
      reqBody.email = null;
    }

    /** Validate mobile number if provided */
    if (reqBody.mobileCountryCode && reqBody.mobile) {
      const validMobile = isValidMobileNumber({
        mobileCountryCode: reqBody.mobileCountryCode,
        mobileNumber: reqBody.mobile,
      });
      if (!validMobile.isValid) {
        throw new BadRequestException(
          `Mobile number is not valid: ${validMobile.errors.join(', ')}`,
        );
      }

      reqBody.mobileCountryCode = validMobile.value.mobileCountryCode;
      reqBody.mobile = validMobile.value.mobileNationalNumber;
    } else {
      reqBody.mobileCountryCode = null;
      reqBody.mobile = null;
    }

    /**
     * GSTIN is mandatory if treatment option is registered business
     */
    if (
      reqBody.treatmentOption === GSTTreatmentOptions.REGISTERED_BUSINESS_REGULAR.key ||
      reqBody.treatmentOption === GSTTreatmentOptions.REGISTERED_BUSINESS_COMPOSITION.key
    ) {
      const validGstin = isValidGSTNumber(reqBody.gstin);
      if (!validGstin.isValid) {
        throw new BadRequestException(`GSTIN is not valid: ${validGstin.errors.join(', ')}`);
      }
    } else {
      reqBody.gstin = null;
    }

    /**
     * Place of supply is mandatory if treatment option is not overseas
     */
    if (reqBody.treatmentOption !== GSTTreatmentOptions.OVERSEAS.key) {
      if (!reqBody.placeOfSupply) {
        throw new BadRequestException(
          'Place of supply is required for the selected treatment option',
        );
      }
    } else {
      reqBody.placeOfSupply = null;
    }

    /** Validate PAN if provided */
    if (reqBody.pan) {
      const validPan = isValidPanNumber(reqBody.pan);
      if (!validPan.isValid) {
        throw new BadRequestException(`PAN Number is not valid: ${validPan.errors.join(', ')}`);
      }
    } else {
      reqBody.pan = null;
    }

    /** Validate contact persons */
    reqBody.contactPersons.forEach((cp, index) => {
      if (!cp.lastName) cp.lastName = null;

      /** Validate contact email if provided */
      if (cp.email) {
        const emailValid = isValidEmailId(cp.email);
        if (!emailValid.isValid) {
          throw new BadRequestException(
            `Email is not valid for contact person ${index + 1}: ${emailValid.errors.join(', ')}`,
          );
        }
      } else {
        cp.email = null;
      }

      /** Validate contact mobile number if provided */
      if (cp.mobileCountryCode && cp.mobile) {
        const validMobile = isValidMobileNumber({
          mobileCountryCode: cp.mobileCountryCode,
          mobileNumber: cp.mobile,
        });
        if (!validMobile.isValid) {
          throw new BadRequestException(
            `Mobile number is not valid for contact person ${index + 1}: ${validMobile.errors.join(
              ', ',
            )}`,
          );
        }

        cp.mobileCountryCode = validMobile.value.mobileCountryCode;
        cp.mobile = validMobile.value.mobileNationalNumber;
      } else {
        cp.mobileCountryCode = null;
        cp.mobile = null;
      }

      /** Validate contact work phone number if provided */
      if (cp.workPhoneCountryCode && cp.workPhone) {
        const validWorkPhone = isValidMobileNumber({
          mobileCountryCode: cp.workPhoneCountryCode,
          mobileNumber: cp.workPhone,
        });
        if (!validWorkPhone.isValid) {
          throw new BadRequestException(
            `Work phone number is not valid for contact person ${index + 1}: ${validWorkPhone.errors.join(
              ', ',
            )}`,
          );
        }

        cp.workPhoneCountryCode = validWorkPhone.value.mobileCountryCode;
        cp.workPhone = validWorkPhone.value.mobileNationalNumber;
      } else {
        cp.workPhoneCountryCode = null;
        cp.workPhone = null;
      }

      if (!cp.id) cp.id = null;
      if (!cp.designation) cp.designation = null;
      if (!cp.department) cp.department = null;
    });

    /** Check for duplicate contact person IDs */
    const contactIds = reqBody.contactPersons.map((cp) => cp.id).filter((id) => id != null);
    if (contactIds.length !== new Set(contactIds).size) {
      throw new BadRequestException('Contact person IDs must be unique');
    }

    /** Check if contact person IDs already exist */
    if (contactIds.length) {
      const existingContactIds = await this.clientRepo.existingContactIdsByContactIds({
        clientContactPersonIds: contactIds,
        neClientId: id,
      });
      if (existingContactIds.length) {
        throw new BadRequestException(
          `Contact person IDs already exist: ${existingContactIds.join(', ')}`,
        );
      }
    }

    if (!reqBody.remarks) reqBody.remarks = null;

    if (!reqBody.billingAddress.attention) reqBody.billingAddress.attention = null;
    if (!reqBody.billingAddress.street1) reqBody.billingAddress.street1 = null;
    if (!reqBody.billingAddress.street2) reqBody.billingAddress.street2 = null;
    if (!reqBody.billingAddress.city) reqBody.billingAddress.city = null;
    if (!reqBody.billingAddress.state) reqBody.billingAddress.state = null;
    if (!reqBody.billingAddress.country) reqBody.billingAddress.country = null;
    if (!reqBody.billingAddress.pinCode) reqBody.billingAddress.pinCode = null;
    if (!reqBody.billingAddress.faxNumber) reqBody.billingAddress.faxNumber = null;

    if (!reqBody.shippingAddress.attention) reqBody.shippingAddress.attention = null;
    if (!reqBody.shippingAddress.street1) reqBody.shippingAddress.street1 = null;
    if (!reqBody.shippingAddress.street2) reqBody.shippingAddress.street2 = null;
    if (!reqBody.shippingAddress.city) reqBody.shippingAddress.city = null;
    if (!reqBody.shippingAddress.state) reqBody.shippingAddress.state = null;
    if (!reqBody.shippingAddress.country) reqBody.shippingAddress.country = null;
    if (!reqBody.shippingAddress.pinCode) reqBody.shippingAddress.pinCode = null;
    if (!reqBody.shippingAddress.faxNumber) reqBody.shippingAddress.faxNumber = null;
  }

  /**
   * List changes between existing client and request body and update the client instance
   *
   * @param reqBody - request body
   * @param client - existing client instance
   */
  private listAndUpdateClientChanges(reqBody: ClientPostDto, client: Client) {
    /**
     * Track changes and prepare change log details
     */
    const changedFields: EntityChangeLogChangedField[] = [];
    const changeMessages: string[] = [];

    if (client.customerType !== reqBody.customerType) {
      changedFields.push({
        fieldName: 'customerType',
        oldValue: client.customerType,
        newValue: reqBody.customerType,
      });
      changeMessages.push(
        `Customer type changed from "${client.customerType}" to "${reqBody.customerType}"`,
      );
      client.customerType = reqBody.customerType;
    }

    if (client.name !== reqBody.name) {
      changedFields.push({
        fieldName: 'name',
        oldValue: client.name,
        newValue: reqBody.name,
      });
      changeMessages.push(`Client name changed from "${client.name}" to "${reqBody.name}"`);
      client.name = reqBody.name;
    }

    if (client.displayName !== reqBody.displayName) {
      changedFields.push({
        fieldName: 'displayName',
        oldValue: client.displayName,
        newValue: reqBody.displayName,
      });
      changeMessages.push(
        `Client display name changed from "${client.displayName}" to "${reqBody.displayName}"`,
      );
      client.displayName = reqBody.displayName;
    }

    if (client.email !== reqBody.email) {
      changedFields.push({
        fieldName: 'email',
        oldValue: client.email,
        newValue: reqBody.email ?? null,
      });
      changeMessages.push(
        `Client email changed from "${client.email ?? 'N/A'}" to "${reqBody.email ?? 'N/A'}"`,
      );
      client.email = reqBody.email ?? null;
    }

    if (client.mobileCountryCode !== reqBody.mobileCountryCode) {
      changedFields.push({
        fieldName: 'mobileCountryCode',
        oldValue: client.mobileCountryCode,
        newValue: reqBody.mobileCountryCode ?? null,
      });
      changeMessages.push(
        `Client mobile country code changed from "${
          client.mobileCountryCode ?? 'N/A'
        }" to "${reqBody.mobileCountryCode ?? 'N/A'}"`,
      );
      client.mobileCountryCode = reqBody.mobileCountryCode ?? null;
    }

    if (client.mobile !== reqBody.mobile) {
      changedFields.push({
        fieldName: 'mobile',
        oldValue: client.mobile,
        newValue: reqBody.mobile ?? null,
      });
      changeMessages.push(
        `Client mobile number changed from "${client.mobile ?? 'N/A'}" to "${
          reqBody.mobile ?? 'N/A'
        }"`,
      );
      client.mobile = reqBody.mobile ?? null;
    }

    if (client.isActive !== reqBody.isActive) {
      changedFields.push({
        fieldName: 'isActive',
        oldValue: client.isActive,
        newValue: reqBody.isActive,
      });
      changeMessages.push(
        `Client isActive status changed from "${client.isActive}" to "${reqBody.isActive}"`,
      );
      client.isActive = reqBody.isActive;
    }

    if (client.treatmentOption !== reqBody.treatmentOption) {
      changedFields.push({
        fieldName: 'treatmentOption',
        oldValue: client.treatmentOption,
        newValue: reqBody.treatmentOption,
      });
      changeMessages.push(
        `Client treatment option changed from "${client.treatmentOption}" to "${reqBody.treatmentOption}"`,
      );
      client.treatmentOption = reqBody.treatmentOption;
    }

    if (client.gstin !== reqBody.gstin) {
      changedFields.push({
        fieldName: 'gstin',
        oldValue: client.gstin,
        newValue: reqBody.gstin ?? null,
      });
      changeMessages.push(
        `Client GSTIN changed from "${client.gstin ?? 'N/A'}" to "${reqBody.gstin ?? 'N/A'}"`,
      );
      client.gstin = reqBody.gstin ?? null;
    }

    if (client.pan !== reqBody.pan) {
      changedFields.push({
        fieldName: 'pan',
        oldValue: client.pan,
        newValue: reqBody.pan ?? null,
      });
      changeMessages.push(
        `Client PAN changed from "${client.pan ?? 'N/A'}" to "${reqBody.pan ?? 'N/A'}"`,
      );
      client.pan = reqBody.pan ?? null;
    }

    if (client.placeOfSupply !== reqBody.placeOfSupply) {
      changedFields.push({
        fieldName: 'placeOfSupply',
        oldValue: client.placeOfSupply,
        newValue: reqBody.placeOfSupply ?? null,
      });
      changeMessages.push(
        `Client place of supply changed from "${client.placeOfSupply ?? 'N/A'}" to "${
          reqBody.placeOfSupply ?? 'N/A'
        }"`,
      );
      client.placeOfSupply = reqBody.placeOfSupply ?? null;
    }

    if (client.businessLegalName !== reqBody.businessLegalName) {
      changedFields.push({
        fieldName: 'businessLegalName',
        oldValue: client.businessLegalName,
        newValue: reqBody.businessLegalName ?? null,
      });
      changeMessages.push(
        `Client business legal name changed from "${
          client.businessLegalName ?? 'N/A'
        }" to "${reqBody.businessLegalName ?? 'N/A'}"`,
      );
      client.businessLegalName = reqBody.businessLegalName ?? null;
    }

    if (client.businessTradeName !== reqBody.businessTradeName) {
      changedFields.push({
        fieldName: 'businessTradeName',
        oldValue: client.businessTradeName,
        newValue: reqBody.businessTradeName ?? null,
      });
      changeMessages.push(
        `Client business trade name changed from "${
          client.businessTradeName ?? 'N/A'
        }" to "${reqBody.businessTradeName ?? 'N/A'}"`,
      );
      client.businessTradeName = reqBody.businessTradeName ?? null;
    }

    if (client.remarks !== reqBody.remarks) {
      changedFields.push({
        fieldName: 'remarks',
        oldValue: client.remarks,
        newValue: reqBody.remarks ?? null,
      });
      changeMessages.push(
        `Client remarks changed from "${client.remarks ?? 'N/A'}" to "${reqBody.remarks ?? 'N/A'}"`,
      );
      client.remarks = reqBody.remarks ?? null;
    }

    if (client.billingAddress.attention !== reqBody.billingAddress.attention) {
      changedFields.push({
        fieldName: 'billingAddress.attention',
        oldValue: client.billingAddress.attention ?? null,
        newValue: reqBody.billingAddress.attention ?? null,
      });
      changeMessages.push(
        `Client billing address attention changed from "${
          client.billingAddress.attention ?? 'N/A'
        }" to "${reqBody.billingAddress.attention ?? 'N/A'}"`,
      );
      client.billingAddress.attention = reqBody.billingAddress.attention ?? null;
    }

    if (client.billingAddress.street1 !== reqBody.billingAddress.street1) {
      changedFields.push({
        fieldName: 'billingAddress.street1',
        oldValue: client.billingAddress.street1 ?? null,
        newValue: reqBody.billingAddress.street1 ?? null,
      });
      changeMessages.push(
        `Client billing address street1 changed from "${
          client.billingAddress.street1 ?? 'N/A'
        }" to "${reqBody.billingAddress.street1 ?? 'N/A'}"`,
      );
      client.billingAddress.street1 = reqBody.billingAddress.street1 ?? null;
    }

    if (client.billingAddress.street2 !== reqBody.billingAddress.street2) {
      changedFields.push({
        fieldName: 'billingAddress.street2',
        oldValue: client.billingAddress.street2 ?? null,
        newValue: reqBody.billingAddress.street2 ?? null,
      });
      changeMessages.push(
        `Client billing address street2 changed from "${
          client.billingAddress.street2 ?? 'N/A'
        }" to "${reqBody.billingAddress.street2 ?? 'N/A'}"`,
      );
      client.billingAddress.street2 = reqBody.billingAddress.street2 ?? null;
    }

    if (client.billingAddress.city !== reqBody.billingAddress.city) {
      changedFields.push({
        fieldName: 'billingAddress.city',
        oldValue: client.billingAddress.city ?? null,
        newValue: reqBody.billingAddress.city ?? null,
      });
      changeMessages.push(
        `Client billing address city changed from "${
          client.billingAddress.city ?? 'N/A'
        }" to "${reqBody.billingAddress.city ?? 'N/A'}"`,
      );
      client.billingAddress.city = reqBody.billingAddress.city ?? null;
    }

    if (client.billingAddress.state !== reqBody.billingAddress.state) {
      changedFields.push({
        fieldName: 'billingAddress.state',
        oldValue: client.billingAddress.state ?? null,
        newValue: reqBody.billingAddress.state ?? null,
      });
      changeMessages.push(
        `Client billing address state changed from "${
          client.billingAddress.state ?? 'N/A'
        }" to "${reqBody.billingAddress.state ?? 'N/A'}"`,
      );
      client.billingAddress.state = reqBody.billingAddress.state ?? null;
    }

    if (client.billingAddress.country !== reqBody.billingAddress.country) {
      changedFields.push({
        fieldName: 'billingAddress.country',
        oldValue: client.billingAddress.country ?? null,
        newValue: reqBody.billingAddress.country ?? null,
      });
      changeMessages.push(
        `Client billing address country changed from "${
          client.billingAddress.country ?? 'N/A'
        }" to "${reqBody.billingAddress.country ?? 'N/A'}"`,
      );
      client.billingAddress.country = reqBody.billingAddress.country ?? null;
    }

    if (client.billingAddress.pinCode !== reqBody.billingAddress.pinCode) {
      changedFields.push({
        fieldName: 'billingAddress.pinCode',
        oldValue: client.billingAddress.pinCode ?? null,
        newValue: reqBody.billingAddress.pinCode ?? null,
      });
      changeMessages.push(
        `Client billing address pin code changed from "${
          client.billingAddress.pinCode ?? 'N/A'
        }" to "${reqBody.billingAddress.pinCode ?? 'N/A'}"`,
      );
      client.billingAddress.pinCode = reqBody.billingAddress.pinCode ?? null;
    }

    if (client.billingAddress.faxNumber !== reqBody.billingAddress.faxNumber) {
      changedFields.push({
        fieldName: 'billingAddress.faxNumber',
        oldValue: client.billingAddress.faxNumber ?? null,
        newValue: reqBody.billingAddress.faxNumber ?? null,
      });
      changeMessages.push(
        `Client billing address fax number changed from "${
          client.billingAddress.faxNumber ?? 'N/A'
        }" to "${reqBody.billingAddress.faxNumber ?? 'N/A'}"`,
      );
      client.billingAddress.faxNumber = reqBody.billingAddress.faxNumber ?? null;
    }

    if (client.shippingAddress.attention !== reqBody.shippingAddress.attention) {
      changedFields.push({
        fieldName: 'shippingAddress.attention',
        oldValue: client.shippingAddress.attention ?? null,
        newValue: reqBody.shippingAddress.attention ?? null,
      });
      changeMessages.push(
        `Client shipping address attention changed from "${
          client.shippingAddress.attention ?? 'N/A'
        }" to "${reqBody.shippingAddress.attention ?? 'N/A'}"`,
      );
      client.shippingAddress.attention = reqBody.shippingAddress.attention ?? null;
    }

    if (client.shippingAddress.street1 !== reqBody.shippingAddress.street1) {
      changedFields.push({
        fieldName: 'shippingAddress.street1',
        oldValue: client.shippingAddress.street1 ?? null,
        newValue: reqBody.shippingAddress.street1 ?? null,
      });
      changeMessages.push(
        `Client shipping address street1 changed from "${
          client.shippingAddress.street1 ?? 'N/A'
        }" to "${reqBody.shippingAddress.street1 ?? 'N/A'}"`,
      );
      client.shippingAddress.street1 = reqBody.shippingAddress.street1 ?? null;
    }

    if (client.shippingAddress.street2 !== reqBody.shippingAddress.street2) {
      changedFields.push({
        fieldName: 'shippingAddress.street2',
        oldValue: client.shippingAddress.street2 ?? null,
        newValue: reqBody.shippingAddress.street2 ?? null,
      });
      changeMessages.push(
        `Client shipping address street2 changed from "${
          client.shippingAddress.street2 ?? 'N/A'
        }" to "${reqBody.shippingAddress.street2 ?? 'N/A'}"`,
      );
      client.shippingAddress.street2 = reqBody.shippingAddress.street2 ?? null;
    }

    if (client.shippingAddress.city !== reqBody.shippingAddress.city) {
      changedFields.push({
        fieldName: 'shippingAddress.city',
        oldValue: client.shippingAddress.city ?? null,
        newValue: reqBody.shippingAddress.city ?? null,
      });
      changeMessages.push(
        `Client shipping address city changed from "${
          client.shippingAddress.city ?? 'N/A'
        }" to "${reqBody.shippingAddress.city ?? 'N/A'}"`,
      );
      client.shippingAddress.city = reqBody.shippingAddress.city ?? null;
    }

    if (client.shippingAddress.state !== reqBody.shippingAddress.state) {
      changedFields.push({
        fieldName: 'shippingAddress.state',
        oldValue: client.shippingAddress.state ?? null,
        newValue: reqBody.shippingAddress.state ?? null,
      });
      changeMessages.push(
        `Client shipping address state changed from "${
          client.shippingAddress.state ?? 'N/A'
        }" to "${reqBody.shippingAddress.state ?? 'N/A'}"`,
      );
      client.shippingAddress.state = reqBody.shippingAddress.state ?? null;
    }

    if (client.shippingAddress.country !== reqBody.shippingAddress.country) {
      changedFields.push({
        fieldName: 'shippingAddress.country',
        oldValue: client.shippingAddress.country ?? null,
        newValue: reqBody.shippingAddress.country ?? null,
      });
      changeMessages.push(
        `Client shipping address country changed from "${
          client.shippingAddress.country ?? 'N/A'
        }" to "${reqBody.shippingAddress.country ?? 'N/A'}"`,
      );
      client.shippingAddress.country = reqBody.shippingAddress.country ?? null;
    }

    if (client.shippingAddress.pinCode !== reqBody.shippingAddress.pinCode) {
      changedFields.push({
        fieldName: 'shippingAddress.pinCode',
        oldValue: client.shippingAddress.pinCode ?? null,
        newValue: reqBody.shippingAddress.pinCode ?? null,
      });
      changeMessages.push(
        `Client shipping address pin code changed from "${
          client.shippingAddress.pinCode ?? 'N/A'
        }" to "${reqBody.shippingAddress.pinCode ?? 'N/A'}"`,
      );
      client.shippingAddress.pinCode = reqBody.shippingAddress.pinCode ?? null;
    }

    if (client.shippingAddress.faxNumber !== reqBody.shippingAddress.faxNumber) {
      changedFields.push({
        fieldName: 'shippingAddress.faxNumber',
        oldValue: client.shippingAddress.faxNumber ?? null,
        newValue: reqBody.shippingAddress.faxNumber ?? null,
      });
      changeMessages.push(
        `Client shipping address fax number changed from "${
          client.shippingAddress.faxNumber ?? 'N/A'
        }" to "${reqBody.shippingAddress.faxNumber ?? 'N/A'}"`,
      );
      client.shippingAddress.faxNumber = reqBody.shippingAddress.faxNumber ?? null;
    }

    return { changedFields, changeMessages };
  }

  /**
   * List changes between existing contact persons and request body and update the contact person instances
   *
   * @param reqBody - request body
   * @param client - existing client instance
   */
  private async listAndUpdateContactPersonsChanges(reqBody: ClientPostDto, client: Client) {
    const current = await this.clientRepo.findContactsByClientId(client.id);
    const currentMap = keyBy(current, (cp) => cp.id);

    const newContacts: ClientContactPerson[] = [];
    const updatedContacts: ClientContactPerson[] = [];
    const logs: EntityChangeLog[] = [];

    reqBody.contactPersons.forEach((cp) => {
      if (!cp.id) {
        newContacts.push(
          this.clientRepo.contactInstance({
            organizationId: this.requestStore.getOrganizationId(),
            clientId: client.id,
            salutation: cp.salutation,
            firstName: cp.firstName,
            lastName: cp.lastName ?? null,
            email: cp.email ?? null,
            mobileCountryCode: cp.mobileCountryCode ?? null,
            mobile: cp.mobile ?? null,
            workPhoneCountryCode: cp.workPhoneCountryCode ?? null,
            workPhone: cp.workPhone ?? null,
            isPrimaryContact: cp.isPrimaryContact ?? false,
            designation: cp.designation ?? null,
            department: cp.department ?? null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        );
        const name = personFullName({
          salutation: cp.salutation,
          firstName: cp.firstName,
          lastName: cp.lastName,
        });
        logs.push(
          this.changeLogRepo.instance({
            entityName: ChangeLogEntityName.CLIENT_CONTACT_PERSONS,
            entityId: `${client.id}::${cp.id}`,
            changeType: ClientContactPersonChangeType.ADDED,
            userId: this.requestStore.getUserId(),
            organizationId: this.requestStore.getOrganizationId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            details: {
              changedFields: [],
              changeMessages: [
                `Contact person "${name}" added to client "{{client.name}}" by {{user.fullName}}`,
              ],
              customDetails: {
                contactPerson: cp,
              },
            },
          }),
        );

        return;
      }

      const existing = currentMap[cp.id];
      if (!existing) {
        throw new BadRequestException(`Invalid contact person ID, does not belong to the client`);
      }

      const changesFields: EntityChangeLogChangedField[] = [];
      const changeMessages: string[] = [];

      const name = personFullName({
        salutation: existing.salutation,
        firstName: existing.firstName,
        lastName: existing.lastName,
      });

      if (existing.salutation !== cp.salutation) {
        changesFields.push({
          fieldName: 'salutation',
          oldValue: existing.salutation,
          newValue: cp.salutation,
        });
        changeMessages.push(
          `Salutation changed from "${existing.salutation}" to "${cp.salutation}" for contact person "${name}"`,
        );
        existing.salutation = cp.salutation;
      }

      if (existing.firstName !== cp.firstName) {
        changesFields.push({
          fieldName: 'firstName',
          oldValue: existing.firstName,
          newValue: cp.firstName,
        });
        changeMessages.push(
          `First name changed from "${existing.firstName}" to "${cp.firstName}" for contact person "${name}"`,
        );
        existing.firstName = cp.firstName;
      }

      if (existing.lastName !== cp.lastName) {
        changesFields.push({
          fieldName: 'lastName',
          oldValue: existing.lastName,
          newValue: cp.lastName ?? null,
        });
        changeMessages.push(
          `Last name changed from "${existing.lastName ?? 'N/A'}" to "${
            cp.lastName ?? 'N/A'
          }" for contact person "${name}"`,
        );
        existing.lastName = cp.lastName ?? null;
      }

      if (existing.email !== cp.email) {
        changesFields.push({
          fieldName: 'email',
          oldValue: existing.email,
          newValue: cp.email ?? null,
        });
        changeMessages.push(
          `Email changed from "${existing.email ?? 'N/A'}" to "${
            cp.email ?? 'N/A'
          }" for contact person "${name}"`,
        );
        existing.email = cp.email ?? null;
      }

      if (existing.mobileCountryCode !== cp.mobileCountryCode) {
        changesFields.push({
          fieldName: 'mobileCountryCode',
          oldValue: existing.mobileCountryCode,
          newValue: cp.mobileCountryCode ?? null,
        });
        changeMessages.push(
          `Mobile country code changed from "${
            existing.mobileCountryCode ?? 'N/A'
          }" to "${cp.mobileCountryCode ?? 'N/A'}" for contact person "${name}"`,
        );
        existing.mobileCountryCode = cp.mobileCountryCode ?? null;
      }

      if (existing.mobile !== cp.mobile) {
        changesFields.push({
          fieldName: 'mobile',
          oldValue: existing.mobile,
          newValue: cp.mobile ?? null,
        });
        changeMessages.push(
          `Mobile number changed from "${existing.mobile ?? 'N/A'}" to "${
            cp.mobile ?? 'N/A'
          }" for contact person "${name}"`,
        );
        existing.mobile = cp.mobile ?? null;
      }

      if (existing.workPhoneCountryCode !== cp.workPhoneCountryCode) {
        changesFields.push({
          fieldName: 'workPhoneCountryCode',
          oldValue: existing.workPhoneCountryCode,
          newValue: cp.workPhoneCountryCode ?? null,
        });
        changeMessages.push(
          `Work phone country code changed from "${
            existing.workPhoneCountryCode ?? 'N/A'
          }" to "${cp.workPhoneCountryCode ?? 'N/A'}" for contact person "${name}"`,
        );
        existing.workPhoneCountryCode = cp.workPhoneCountryCode ?? null;
      }

      if (existing.workPhone !== cp.workPhone) {
        changesFields.push({
          fieldName: 'workPhone',
          oldValue: existing.workPhone,
          newValue: cp.workPhone ?? null,
        });
        changeMessages.push(
          `Work phone number changed from "${existing.workPhone ?? 'N/A'}" to "${
            cp.workPhone ?? 'N/A'
          }" for contact person "${name}"`,
        );
        existing.workPhone = cp.workPhone ?? null;
      }

      if (existing.isPrimaryContact !== cp.isPrimaryContact) {
        changesFields.push({
          fieldName: 'isPrimaryContact',
          oldValue: existing.isPrimaryContact,
          newValue: cp.isPrimaryContact ?? false,
        });
        changeMessages.push(
          `isPrimaryContact changed from "${existing.isPrimaryContact}" to "${
            cp.isPrimaryContact ?? false
          }" for contact person "${name}"`,
        );
        existing.isPrimaryContact = cp.isPrimaryContact ?? false;
      }

      if (existing.designation !== cp.designation) {
        changesFields.push({
          fieldName: 'designation',
          oldValue: existing.designation,
          newValue: cp.designation ?? null,
        });
        changeMessages.push(
          `Designation changed from "${
            existing.designation ?? 'N/A'
          }" to "${cp.designation ?? 'N/A'}" for contact person "${name}"`,
        );
        existing.designation = cp.designation ?? null;
      }

      if (existing.department !== cp.department) {
        changesFields.push({
          fieldName: 'department',
          oldValue: existing.department,
          newValue: cp.department ?? null,
        });
        changeMessages.push(
          `Department changed from "${
            existing.department ?? 'N/A'
          }" to "${cp.department ?? 'N/A'}" for contact person "${name}"`,
        );
        existing.department = cp.department ?? null;
      }

      if (!changesFields.length) return;

      existing.updatedAt = new Date().toISOString();
      updatedContacts.push(existing);
      logs.push(
        this.changeLogRepo.instance({
          entityName: ChangeLogEntityName.CLIENT_CONTACT_PERSONS,
          entityId: `${client.id}::${cp.id}`,
          changeType: ClientContactPersonChangeType.UPDATED,
          userId: this.requestStore.getUserId(),
          organizationId: this.requestStore.getOrganizationId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          details: {
            changedFields: changesFields,
            changeMessages: changeMessages,
          },
        }),
      );
    });

    const removedContacts = current.filter(
      (ccp) => !reqBody.contactPersons.find((rcp) => rcp.id === ccp.id),
    );
    removedContacts.forEach((rcp) => {
      const name = personFullName({
        salutation: rcp.salutation,
        firstName: rcp.firstName,
        lastName: rcp.lastName,
      });
      logs.push(
        this.changeLogRepo.instance({
          entityName: ChangeLogEntityName.CLIENT_CONTACT_PERSONS,
          entityId: `${client.id}::${rcp.id}`,
          changeType: ClientContactPersonChangeType.DELETED,
          userId: this.requestStore.getUserId(),
          organizationId: this.requestStore.getOrganizationId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          details: {
            changedFields: [],
            changeMessages: [
              `Contact person "${name}" removed from client "{{client.name}}" by {{user.fullName}}`,
            ],
            customDetails: {
              contactPerson: rcp,
            },
          },
        }),
      );
    });

    return { newContacts, updatedContacts, removedContacts, changeLogs: logs };
  }
}
