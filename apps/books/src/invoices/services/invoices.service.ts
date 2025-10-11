import { AppRequestStoreService } from '@app/integrations';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceRepository } from '../../db/repositories/invoice.repository';
import { InvoicesGetDto } from '../dtos/invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly invoiceRepo: InvoiceRepository,
    private readonly requestStore: AppRequestStoreService,
  ) {}

  getInvoices(query: InvoicesGetDto) {
    return this.invoiceRepo.find({
      organizationId: this.requestStore.getOrganizationId(),
      ...query,
    });
  }

  async getInvoiceDetails(id: string) {
    const invoice = await this.invoiceRepo.findById({
      id,
      organizationId: this.requestStore.getOrganizationId(),
      loadItem: true,
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return { invoice };
  }
}
