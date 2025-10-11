import {
  AdvanceTaxSubTypeOptions,
  AdvanceTaxTypeOptions,
  ClientContactPerson,
  InvoiceItemTaxRates,
  InvoiceItemTaxRateType,
  isValidateDateString,
  isValidCode,
  isValidDecimal,
  isValidInteger,
} from '@app/core';
import { DbService } from '@app/infra';
import { AppRequestStoreService } from '@app/integrations';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { round } from 'lodash';
import { ClientRepository } from '../../db/repositories/client.repository';
import { InvoiceRepository } from '../../db/repositories/invoice.repository';
import { ProjectRepository } from '../../db/repositories/project.repository';
import { InvoicePostDto } from '../dtos/invoice-mutations.dto';

@Injectable()
export class InvoicesMutationService {
  constructor(
    private readonly invoiceRepo: InvoiceRepository,
    private readonly clientRepo: ClientRepository,
    private readonly projectRepo: ProjectRepository,
    private readonly requestStore: AppRequestStoreService,
    private readonly dbService: DbService,
  ) {}

  async addInvoice(reqBody: InvoicePostDto) {
    const { contactPersons } = await this.validateInvoiceBody(reqBody);

    const invoice = this.invoiceRepo.instance({
      organizationId: this.requestStore.getOrganizationId(),
      clientId: reqBody.clientId,
      projectId: reqBody.projectId ?? null,
      invoiceNo: reqBody.invoiceNo,
      invoiceDate: reqBody.invoiceDate,
      dueDate: reqBody.dueDate,
      advanceTaxType: reqBody.advanceTaxType ?? null,
      advanceTaxSubType: reqBody.advanceTaxSubType ?? null,
      advanceTaxRate: reqBody.advanceTaxRate,
      advanceTaxAmount: reqBody.advanceTaxAmount,
      subTotal: reqBody.subTotal,
      totalAmount: reqBody.totalAmount,
      termsAndConditions: reqBody.termsAndConditions ?? null,
      otherDetails: {
        contactPersons,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const invoiceItems = reqBody.items.map((item, index) => {
      return this.invoiceRepo.itemInstance({
        invoiceId: invoice.id,
        lineNo: index + 1,
        name: item.name,
        sacNo: item.sacNo || '',
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
        await this.invoiceRepo.create(invoice);
        await this.invoiceRepo.addInvoiceItems(invoiceItems);
      },
    });

    return {
      invoiceId: invoice.id,
      message: `Invoice "${invoice.invoiceNo}" added successfully`,
    };
  }

  async updateInvoice(reqBody: InvoicePostDto, id: string) {
    const invoice = await this.invoiceRepo.findById({
      id,
      organizationId: this.requestStore.getOrganizationId(),
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found or is not part of the organization');
    }

    const { contactPersons } = await this.validateInvoiceBody(reqBody, id);

    invoice.clientId = reqBody.clientId;
    invoice.projectId = reqBody.projectId ?? null;
    invoice.invoiceNo = reqBody.invoiceNo;
    invoice.invoiceDate = reqBody.invoiceDate;
    invoice.dueDate = reqBody.dueDate;
    invoice.advanceTaxType = reqBody.advanceTaxType ?? null;
    invoice.advanceTaxSubType = reqBody.advanceTaxSubType ?? null;
    invoice.advanceTaxRate = reqBody.advanceTaxRate;
    invoice.advanceTaxAmount = reqBody.advanceTaxAmount;
    invoice.subTotal = reqBody.subTotal;
    invoice.totalAmount = reqBody.totalAmount;
    invoice.termsAndConditions = reqBody.termsAndConditions ?? null;
    invoice.otherDetails = {
      contactPersons,
    };
    invoice.updatedAt = new Date().toISOString();

    const invoiceItems = reqBody.items.map((item, index) => {
      return this.invoiceRepo.itemInstance({
        invoiceId: invoice.id,
        lineNo: index + 1,
        name: item.name,
        sacNo: item.sacNo || '',
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
        await this.invoiceRepo.update(invoice);
        await this.invoiceRepo.deleteItemsByInvoiceId(invoice.id);
        await this.invoiceRepo.addInvoiceItems(invoiceItems);
      },
    });

    return {
      invoiceId: invoice.id,
      message: `Invoice "${invoice.invoiceNo}" updated successfully`,
    };
  }

  private async validateInvoiceBody(reqBody: InvoicePostDto, excludeId?: string) {
    const validInvoiceNo = isValidCode(reqBody.invoiceNo);
    if (!validInvoiceNo.isValid) {
      throw new BadRequestException(
        `Invoice number is not valid: ${validInvoiceNo.errors.join(', ')}`,
      );
    }

    const validInvoiceDate = isValidateDateString(reqBody.invoiceDate);
    if (!validInvoiceDate.isValid) {
      throw new BadRequestException(
        `Invoice date is not valid: ${validInvoiceDate.errors.join(', ')}`,
      );
    }

    const validDueDate = isValidateDateString(reqBody.dueDate);
    if (!validDueDate.isValid) {
      throw new BadRequestException(`Due date is not valid: ${validDueDate.errors.join(', ')}`);
    }

    if (new Date(reqBody.invoiceDate) > new Date(reqBody.dueDate)) {
      throw new BadRequestException('Due date should be after invoice date');
    }

    const duplicateItemNames = reqBody.items
      .map((i) => i.name.toLowerCase())
      .filter((name, index, arr) => arr.indexOf(name) !== index);
    if (duplicateItemNames.length > 0) {
      const name = [...new Set(duplicateItemNames)].join(', ');
      throw new BadRequestException(`There are multiple items with the same name: ${name}`);
    }

    reqBody.items.forEach((item, index) => {
      if (!item.sacNo) item.sacNo = '';

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

      if (item.taxRateValue !== taxRateItem.rate) {
        throw new BadRequestException(
          `Item ${index + 1}: Tax rate value should be ${taxRateItem.rate} for ${item.taxRate}`,
        );
      }

      const expectedTaxAmount = round((item.price * item.taxRateValue) / 100, 2);
      if (item.taxAmount !== expectedTaxAmount) {
        throw new BadRequestException(
          `Item ${index + 1}: Tax amount should be ${expectedTaxAmount} for price ${item.price} and tax rate ${item.taxRateValue}%`,
        );
      }

      const expectedTotalAmount = round(item.price + item.taxAmount, 2);
      if (item.totalAmount !== expectedTotalAmount) {
        throw new BadRequestException(
          `Item ${index + 1}: Total amount should be ${expectedTotalAmount}`,
        );
      }
    });

    const itemsTotalPrice = round(
      reqBody.items.reduce((sum, item) => sum + item.price, 0),
      2,
    );
    if (itemsTotalPrice !== reqBody.subTotal) {
      throw new BadRequestException(
        `Subtotal should be equal to sum of item prices = ${itemsTotalPrice}`,
      );
    }

    if (reqBody.advanceTaxType) {
      if (!Object.values(AdvanceTaxTypeOptions).includes(reqBody.advanceTaxType)) {
        throw new BadRequestException(
          `Advance tax type is not valid, supported values are: ${Object.values(
            AdvanceTaxTypeOptions,
          ).join(', ')}`,
        );
      }

      const allSubTypes = AdvanceTaxSubTypeOptions.filter((t) => t.type === reqBody.advanceTaxType);
      if (allSubTypes.length === 0) {
        throw new BadRequestException(
          `No ${reqBody.advanceTaxType} subtypes found for the selected tax type`,
        );
      }

      if (!reqBody.advanceTaxSubType) {
        throw new BadRequestException(`Advance Tax subtype is required when tax type is provided`);
      }
      const subType = allSubTypes.find((t) => t.key === reqBody.advanceTaxSubType);
      if (!subType) {
        throw new BadRequestException(
          `Advance Tax subtype is not valid, supported values for selected tax type ${reqBody.advanceTaxType} are: ${allSubTypes
            .map((t) => t.name)
            .join(', ')}`,
        );
      }

      if (reqBody.advanceTaxRate !== subType.rate) {
        throw new BadRequestException(
          `Tax subtype rate should be equal to selected tax subtype ${subType.name} = ${subType.rate}`,
        );
      }

      const originalTaxAmount = round(
        round(reqBody.subTotal * (reqBody.advanceTaxRate / 100), 2),
        2,
      );
      if (originalTaxAmount !== reqBody.advanceTaxAmount) {
        throw new BadRequestException(
          `Tax amount should be equal to subtotal x tax rate / 100 = ${reqBody.subTotal} x ${reqBody.advanceTaxRate} / 100 = ${originalTaxAmount}`,
        );
      }
    } else {
      if (reqBody.advanceTaxRate !== 0) {
        throw new BadRequestException(`Tax rate should be 0 when tax type is not provided`);
      }

      if (reqBody.advanceTaxAmount !== 0) {
        throw new BadRequestException(`Tax amount should be 0 when tax type is not provided`);
      }
    }

    const originalTotalAmount = round(
      reqBody.items.reduce((sum, item) => sum + item.totalAmount, 0) +
        (reqBody.advanceTaxType === AdvanceTaxTypeOptions.TCS ? 1 : -1) * reqBody.advanceTaxAmount,
      2,
    );
    if (originalTotalAmount !== reqBody.totalAmount) {
      throw new BadRequestException(
        `Total amount should be equal to sum of item total amounts ${reqBody.items
          .reduce((sum, item) => sum + item.totalAmount, 0)
          .toFixed(2)} ${
          reqBody.advanceTaxType === AdvanceTaxTypeOptions.TCS ? '+' : '-'
        } advance tax amount ${reqBody.advanceTaxAmount.toFixed(2)} = ${originalTotalAmount}`,
      );
    }

    if (!reqBody.termsAndConditions) reqBody.termsAndConditions = null;

    const invoiceExists = await this.invoiceRepo.existsByInvoiceNo({
      organizationId: this.requestStore.getOrganizationId(),
      invoiceNo: reqBody.invoiceNo,
      excludeId,
    });
    if (invoiceExists) {
      throw new BadRequestException('Invoice number already exists');
    }

    const client = await this.clientRepo.findById({
      id: reqBody.clientId,
      organizationId: this.requestStore.getOrganizationId(),
    });
    if (!client) {
      throw new BadRequestException('Client not found or is not part of the organization');
    }

    if (reqBody.projectId) {
      const project = await this.projectRepo.findById({
        id: reqBody.projectId,
        organizationId: this.requestStore.getOrganizationId(),
      });
      if (!project) {
        throw new BadRequestException('Project not found or is not part of the organization');
      }
      if (project.clientId !== reqBody.clientId) {
        throw new BadRequestException('Project does not belong to the specified client');
      }
    }

    let contactPersons: ClientContactPerson[] = [];
    if (reqBody.contactPersonIds.length > 0) {
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

    return { contactPersons };
  }
}
