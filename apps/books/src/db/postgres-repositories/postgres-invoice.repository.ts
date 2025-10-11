import { generateId, Invoice, InvoiceItem } from '@app/core';
import { DbService } from '@app/infra';
import { Injectable } from '@nestjs/common';
import { Not } from 'typeorm';
import { InvoiceRepository } from '../repositories/invoice.repository';

@Injectable()
export class PostgresInvoiceRepository implements InvoiceRepository {
  constructor(private readonly dbService: DbService) {}

  instance(data?: Partial<Invoice>): Invoice {
    const record = this.dbService
      .getManager()
      .getRepository(Invoice)
      .create(data || {});
    if (!record.id) record.id = generateId();
    return record;
  }

  itemInstance(data?: Partial<InvoiceItem>): InvoiceItem {
    const record = this.dbService
      .getManager()
      .getRepository(InvoiceItem)
      .create(data || {});
    return record;
  }

  async create(invoice: Invoice): Promise<void> {
    await this.dbService.getWriteManager().insert(Invoice, invoice);
  }

  async addInvoiceItems(items: InvoiceItem[]): Promise<void> {
    if (items.length === 0) return;

    await this.dbService.getWriteManager().insert(InvoiceItem, items);
  }

  async update(invoice: Invoice): Promise<void> {
    await this.dbService.getWriteManager().update(Invoice, invoice.id, invoice);
  }

  async deleteItemsByInvoiceId(invoiceId: string): Promise<void> {
    await this.dbService.getWriteManager().delete(InvoiceItem, { invoiceId });
  }

  async delete(invoiceId: string): Promise<void> {
    await this.dbService.getWriteManager().delete(Invoice, { id: invoiceId });
  }

  async existsByInvoiceNo(props: {
    organizationId: string;
    invoiceNo: string;
    excludeId?: string;
  }): Promise<boolean> {
    const count = await this.dbService.getManager().count(Invoice, {
      where: {
        organizationId: props.organizationId,
        invoiceNo: props.invoiceNo,
        id: props.excludeId ? Not(props.excludeId) : undefined,
      },
    });
    return count > 0;
  }

  findItemsByInvoiceId(invoiceId: string): Promise<InvoiceItem[]> {
    return this.dbService.getManager().find(InvoiceItem, { where: { invoiceId } });
  }

  findById(props: {
    id: string;
    organizationId?: string;
    loadItem?: boolean;
  }): Promise<Invoice | null> {
    return this.dbService.getManager().findOne(Invoice, {
      where: {
        id: props.id,
        ...(props.organizationId ? { organizationId: props.organizationId } : {}),
      },
      relations: props.loadItem ? { items: true } : undefined,
    });
  }

  async find(props: {
    organizationId: string;
    clientId?: string | null;
    projectId?: string | null;
    skip?: number | null;
    limit?: number | null;
  }): Promise<{ count: number; invoices: Invoice[] }> {
    const builder = this.dbService
      .getManager()
      .createQueryBuilder(Invoice, 'invoice')
      .leftJoin('invoice.client', 'client')
      .addSelect(['client.id', 'client.name', 'client.displayName'])
      .leftJoin('invoice.project', 'project')
      .addSelect(['project.id', 'project.name', 'project.code', 'project.displayName'])
      .where('invoice.organizationId = :organizationId', { organizationId: props.organizationId });

    if (props.clientId) {
      builder.andWhere('invoice.clientId = :clientId', { clientId: props.clientId });
    }
    if (props.projectId) {
      builder.andWhere('invoice.projectId = :projectId', { projectId: props.projectId });
    }

    const countBuilder = builder.clone();

    if (props.limit) {
      builder.take(props.limit);
    }
    if (props.skip) {
      builder.skip(props.skip);
      if (!props.limit) {
        builder.take(Number.MAX_SAFE_INTEGER);
      }
    }

    const [invoices, count] = await Promise.all([
      builder.orderBy('invoice.createdAt', 'DESC').getMany(),
      countBuilder.getCount(),
    ]);

    return { count, invoices };
  }
}
