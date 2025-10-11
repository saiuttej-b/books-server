import {
  Client,
  ClientContactPerson,
  GSTTreatmentOptions,
  isValidEmailId,
  isValidGSTNumber,
  isValidMobileNumber,
  isValidPanNumber,
} from '@app/core';
import { DbService } from '@app/infra';
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

    await this.dbService.transaction({
      execute: async () => {
        await this.clientRepo.create(client);
        await this.clientRepo.addContacts(contactPersons);
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

    const contactsChanges = await this.contactPersonsChanges(reqBody, client);

    client.customerType = reqBody.customerType;
    client.name = reqBody.name;
    client.displayName = reqBody.displayName;
    client.email = reqBody.email ?? null;
    client.mobileCountryCode = reqBody.mobileCountryCode ?? null;
    client.mobile = reqBody.mobile ?? null;
    client.isActive = reqBody.isActive;
    client.treatmentOption = reqBody.treatmentOption;
    client.gstin = reqBody.gstin ?? null;
    client.pan = reqBody.pan ?? null;
    client.placeOfSupply = reqBody.placeOfSupply ?? null;
    client.businessLegalName = reqBody.businessLegalName ?? null;
    client.businessTradeName = reqBody.businessTradeName ?? null;
    client.remarks = reqBody.remarks ?? null;
    client.billingAddress = reqBody.billingAddress;
    client.shippingAddress = reqBody.shippingAddress;
    client.updatedAt = new Date().toISOString();

    await this.dbService.transaction({
      execute: async () => {
        await this.clientRepo.updateContacts(contactsChanges.updatedContacts);
        await this.clientRepo.addContacts(contactsChanges.newContacts);
        await this.clientRepo.deleteContactsByIds(contactsChanges.removedContacts.map((c) => c.id));
        await this.clientRepo.update(client);
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
   * List changes between existing contact persons and request body and update the contact person instances
   *
   * @param reqBody - request body
   * @param client - existing client instance
   */
  private async contactPersonsChanges(reqBody: ClientPostDto, client: Client) {
    const current = await this.clientRepo.findContactsByClientId(client.id);
    const currentMap = keyBy(current, (cp) => cp.id);

    const newContacts: ClientContactPerson[] = [];
    const updatedContacts: ClientContactPerson[] = [];

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
        return;
      }

      const existing = currentMap[cp.id];
      if (!existing) {
        throw new BadRequestException(`Invalid contact person ID, does not belong to the client`);
      }

      Object.assign(existing, cp);
      existing.updatedAt = new Date().toISOString();
      updatedContacts.push(existing);
    });

    const removedContacts = current.filter(
      (ccp) => !reqBody.contactPersons.find((rcp) => rcp.id === ccp.id),
    );

    return { newContacts, updatedContacts, removedContacts };
  }
}
