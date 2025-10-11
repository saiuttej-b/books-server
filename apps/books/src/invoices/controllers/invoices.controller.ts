import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InvoicePostDto } from '../dtos/invoice-mutations.dto';
import { InvoicesGetDto } from '../dtos/invoice.dto';
import { InvoicesMutationService } from '../services/invoices-mutation.service';
import { InvoicesService } from '../services/invoices.service';

@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly mutationService: InvoicesMutationService,
    private readonly service: InvoicesService,
  ) {}

  @Post()
  addInvoice(@Body() body: InvoicePostDto) {
    return this.mutationService.addInvoice(body);
  }

  @Put(':id')
  updateInvoice(@Body() body: InvoicePostDto, @Param('id') id: string) {
    return this.mutationService.updateInvoice(body, id);
  }

  @Get()
  getInvoices(@Query() query: InvoicesGetDto) {
    return this.service.getInvoices(query);
  }

  @Get(':id')
  getInvoiceDetails(@Param('id') id: string) {
    return this.service.getInvoiceDetails(id);
  }
}
