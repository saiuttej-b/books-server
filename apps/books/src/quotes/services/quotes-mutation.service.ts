import {
  ClientContactPerson,
  InvoiceItemTaxRates,
  InvoiceItemTaxRateType,
  isValidateDateString,
  isValidCode,
  isValidDecimal,
  isValidInteger,
  TaxSubTypeOptions,
  TaxTypeOptions,
} from '@app/core';
import { DbService } from '@app/infra';
import { AppRequestStoreService } from '@app/integrations';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { round } from 'lodash';
import { ClientRepository } from '../../db/repositories/client.repository';
import { ProjectRepository } from '../../db/repositories/project.repository';
import { QuoteRepository } from '../../db/repositories/quote.repository';
import { QuotePostDto } from '../dtos/quote-mutations.dto';

@Injectable()
export class QuotesMutationService {
  constructor(
    private readonly quoteRepo: QuoteRepository,
    private readonly clientRepo: ClientRepository,
    private readonly projectRepo: ProjectRepository,
    private readonly requestStore: AppRequestStoreService,
    private readonly dbService: DbService,
  ) {}

  async addQuote(reqBody: QuotePostDto) {
    const { contactPersons } = await this.validateQuoteBody(reqBody);

    const quote = this.quoteRepo.instance({
      organizationId: this.requestStore.getOrganizationId(),
      projectId: reqBody.projectId,
      quoteNo: reqBody.quoteNo,
      issueDate: reqBody.issueDate,
      expiryDate: reqBody.expiryDate ?? null,
      taxType: reqBody.taxType ?? null,
      taxSubType: reqBody.taxSubType ?? null,
      taxRate: reqBody.taxRate,
      taxAmount: reqBody.taxAmount,
      totalAmount: reqBody.totalAmount,
      termsAndConditions: reqBody.termsAndConditions ?? null,
      otherDetails: {
        contactPersons,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const quoteItems = reqBody.items.map((item, index) => {
      return this.quoteRepo.itemInstance({
        quoteId: quote.id,
        lineNo: index + 1,
        name: item.name,
        sacNo: item.sacNo ?? null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        price: item.price,
        taxRate: item.taxRate,
        taxRateValue: item.taxRateValue,
        taxAmount: item.taxAmount,
        totalAmount: item.totalAmount,
      });
    });

    await this.dbService.transaction({
      execute: async () => {
        await this.quoteRepo.create(quote);
        await this.quoteRepo.addQuoteItems(quoteItems);
      },
    });

    return {
      quoteId: quote.id,
      message: `Quote "${quote.quoteNo}" added successfully`,
    };
  }

  async updateQuote(reqBody: QuotePostDto, id: string) {
    const quote = await this.quoteRepo.findById({
      id,
      organizationId: this.requestStore.getOrganizationId(),
    });
    if (!quote) {
      throw new NotFoundException('Quote not found or is not part of the organization');
    }

    const { contactPersons } = await this.validateQuoteBody(reqBody, id);

    quote.projectId = reqBody.projectId;
    quote.quoteNo = reqBody.quoteNo;
    quote.issueDate = reqBody.issueDate;
    quote.expiryDate = reqBody.expiryDate ?? null;
    quote.taxType = reqBody.taxType ?? null;
    quote.taxSubType = reqBody.taxSubType ?? null;
    quote.taxRate = reqBody.taxRate;
    quote.taxAmount = reqBody.taxAmount;
    quote.totalAmount = reqBody.totalAmount;
    quote.termsAndConditions = reqBody.termsAndConditions ?? null;
    quote.otherDetails = {
      contactPersons,
    };
    quote.updatedAt = new Date().toISOString();

    const quoteItems = reqBody.items.map((item, index) => {
      return this.quoteRepo.itemInstance({
        quoteId: quote.id,
        lineNo: index + 1,
        name: item.name,
        sacNo: item.sacNo ?? null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        price: item.price,
        taxRate: item.taxRate,
        taxRateValue: item.taxRateValue,
        taxAmount: item.taxAmount,
        totalAmount: item.totalAmount,
      });
    });

    await this.dbService.transaction({
      execute: async () => {
        await this.quoteRepo.update(quote);
        await this.quoteRepo.deleteItemsByQuoteId(quote.id);
        await this.quoteRepo.addQuoteItems(quoteItems);
      },
    });

    return {
      quoteId: quote.id,
      message: `Quote "${quote.quoteNo}" updated successfully`,
    };
  }

  private async validateQuoteBody(reqBody: QuotePostDto, excludeId?: string) {
    const validQuoteNo = isValidCode(reqBody.quoteNo);
    if (!validQuoteNo.isValid) {
      throw new BadRequestException(`Quote number is not valid: ${validQuoteNo.errors.join(', ')}`);
    }

    const validIssueDate = isValidateDateString(reqBody.issueDate);
    if (!validIssueDate.isValid) {
      throw new BadRequestException(`Issue date is not valid: ${validIssueDate.errors.join(', ')}`);
    }

    if (reqBody.expiryDate) {
      const validExpiryDate = isValidateDateString(reqBody.expiryDate);
      if (!validExpiryDate.isValid) {
        throw new BadRequestException(
          `Expiry date is not valid: ${validExpiryDate.errors.join(', ')}`,
        );
      }
      if (new Date(reqBody.issueDate) > new Date(reqBody.expiryDate)) {
        throw new BadRequestException('Expiry date should be after issue date');
      }
    } else {
      reqBody.expiryDate = null;
    }

    const duplicateItemNames = reqBody.items
      .map((i) => i.name.toLowerCase())
      .filter((name, index, arr) => arr.indexOf(name) !== index);
    if (duplicateItemNames.length > 0) {
      const name = [...new Set(duplicateItemNames)].join(', ');
      throw new BadRequestException(`There are multiple items with the same name: ${name}`);
    }

    reqBody.items.forEach((item, index) => {
      if (!item.sacNo) item.sacNo = null;

      const validQuantity = isValidInteger(item.quantity, { min: 1 });
      if (!validQuantity.isValid) {
        throw new BadRequestException(
          `Item ${index + 1}: Quantity is not valid: ${validQuantity.errors.join(', ')}`,
        );
      }

      const validUnitPrice = isValidDecimal(item.unitPrice, { min: 0, maxDecimalPlaces: 2 });
      if (!validUnitPrice.isValid) {
        throw new BadRequestException(
          `Item ${index + 1}: Unit price is not valid: ${validUnitPrice.errors.join(', ')}`,
        );
      }

      const originalPrice = round(item.quantity * item.unitPrice, 2);
      if (originalPrice !== item.price) {
        throw new BadRequestException(
          `Item ${index + 1}: Price should be equal to quantity x unit price = ${item.quantity} x ${item.unitPrice} = ${originalPrice}`,
        );
      }

      const taxRateItem: InvoiceItemTaxRateType | undefined = InvoiceItemTaxRates[item.taxRate];
      if (!taxRateItem) {
        throw new BadRequestException(
          `Item ${index + 1}: Tax rate is not valid, supported values are: ${Object.keys(
            InvoiceItemTaxRates,
          ).join(', ')}`,
        );
      }

      if (taxRateItem.rate !== item.taxRateValue) {
        throw new BadRequestException(
          `Item ${index + 1}: Tax rate value should be equal to selected tax rate ${taxRateItem.name} = ${taxRateItem.rate}`,
        );
      }

      const originalTaxAmount = round((item.price * item.taxRateValue) / 100, 2);
      if (originalTaxAmount !== item.taxAmount) {
        throw new BadRequestException(
          `Item ${index + 1}: Tax amount should be equal to price x tax rate value / 100 = ${item.price} x ${item.taxRateValue} / 100 = ${originalTaxAmount}`,
        );
      }

      const originalTotalAmount = round(item.price + item.taxAmount, 2);
      if (originalTotalAmount !== item.totalAmount) {
        throw new BadRequestException(
          `Item ${index + 1}: Total amount should be equal to price + tax amount = ${item.price} + ${item.taxAmount} = ${originalTotalAmount}`,
        );
      }
    });

    if (reqBody.taxType) {
      if (!Object.values(TaxTypeOptions).includes(reqBody.taxType)) {
        throw new BadRequestException(
          `Tax type is not valid, supported values are: ${Object.values(TaxTypeOptions).join(', ')}`,
        );
      }

      const allSubTypes = TaxSubTypeOptions.filter((t) => t.type === reqBody.taxType);
      if (allSubTypes.length === 0) {
        throw new BadRequestException(`No tax subtypes found for the selected tax type`);
      }

      if (!reqBody.taxSubType) {
        throw new BadRequestException(`Tax subtype is required when tax type is provided`);
      }
      const subType = allSubTypes.find((t) => t.key === reqBody.taxSubType);
      if (!subType) {
        throw new BadRequestException(
          `Tax subtype is not valid, supported values for selected tax type ${reqBody.taxType} are: ${allSubTypes
            .map((t) => t.name)
            .join(', ')}`,
        );
      }

      if (reqBody.taxRate !== subType.rate) {
        throw new BadRequestException(
          `Tax subtype rate should be equal to selected tax subtype ${subType.name} = ${subType.rate}`,
        );
      }
    } else {
      if (reqBody.taxRate !== 0) {
        throw new BadRequestException(`Tax rate should be 0 when tax type is not provided`);
      }
    }

    const itemsTotalPrice = round(
      reqBody.items.reduce((sum, item) => sum + item.price, 0),
      2,
    );
    const originalTaxAmount = round(itemsTotalPrice * (reqBody.taxRate / 100), 2);
    if (originalTaxAmount !== reqBody.taxAmount) {
      throw new BadRequestException(
        `Tax amount should be equal to sum of item prices x tax rate / 100 = ${itemsTotalPrice} x ${reqBody.taxRate} / 100 = ${originalTaxAmount}`,
      );
    }

    const originalTotalAmount = round(
      reqBody.items.reduce((sum, item) => sum + item.totalAmount, 0) + reqBody.taxAmount,
      2,
    );
    if (originalTotalAmount !== reqBody.totalAmount) {
      throw new BadRequestException(
        `Total amount should be equal to sum of item total amounts (with GST) + tax amount = ${reqBody.items.reduce(
          (sum, item) => sum + item.totalAmount,
          0,
        )} + ${reqBody.taxAmount} = ${originalTotalAmount}`,
      );
    }

    if (!reqBody.termsAndConditions) reqBody.termsAndConditions = null;

    const quoteNoExists = await this.quoteRepo.existsByQuoteNo({
      organizationId: this.requestStore.getOrganizationId(),
      quoteNo: reqBody.quoteNo,
      excludeId,
    });
    if (quoteNoExists) {
      throw new BadRequestException(
        `There is already a quote with the same quote number '${reqBody.quoteNo}'`,
      );
    }

    const project = await this.projectRepo.findById({
      id: reqBody.projectId,
      organizationId: this.requestStore.getOrganizationId(),
    });
    if (!project) {
      throw new BadRequestException('Project not found or is not part of the organization');
    }

    const client = await this.clientRepo.findById({
      id: project.clientId,
      organizationId: this.requestStore.getOrganizationId(),
    });
    if (!client) {
      throw new BadRequestException('Client not found or is not part of the organization');
    }

    let contactPersons: ClientContactPerson[] = [];
    if (reqBody.contactPersonIds.length) {
      reqBody.contactPersonIds = [...new Set(reqBody.contactPersonIds)];

      const contacts = await this.clientRepo.findContactsByClientId(client.id);
      contactPersons = contacts.filter((c) => reqBody.contactPersonIds.includes(c.id));

      const invalidContactIds = reqBody.contactPersonIds.filter(
        (id) => !contactPersons.find((c) => c.id === id),
      );
      if (invalidContactIds.length > 0) {
        throw new BadRequestException('Invalid contact person Ids');
      }
    }

    return { project, client, contactPersons };
  }
}
