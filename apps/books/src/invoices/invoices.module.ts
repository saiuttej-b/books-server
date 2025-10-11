import { Module } from '@nestjs/common';
import { InvoicesController } from './controllers/invoices.controller';
import { InvoicesMutationService } from './services/invoices-mutation.service';
import { InvoicesService } from './services/invoices.service';

@Module({
  controllers: [InvoicesController],
  providers: [InvoicesService, InvoicesMutationService],
})
export class InvoicesModule {}
