import { Invoice, InvoiceItem } from '@app/core';

export abstract class InvoiceRepository {
  abstract instance(data?: Partial<Invoice>): Invoice;

  abstract itemInstance(data?: Partial<InvoiceItem>): InvoiceItem;

  abstract create(invoice: Invoice): Promise<void>;

  abstract addInvoiceItems(items: InvoiceItem[]): Promise<void>;

  abstract update(invoice: Invoice): Promise<void>;

  abstract deleteItemsByInvoiceId(invoiceId: string): Promise<void>;

  abstract delete(invoiceId: string): Promise<void>;

  abstract existsByInvoiceNo(props: {
    organizationId: string;
    invoiceNo: string;
    excludeId?: string;
  }): Promise<boolean>;

  abstract findItemsByInvoiceId(invoiceId: string): Promise<InvoiceItem[]>;

  abstract findById(props: {
    id: string;
    organizationId?: string;
    loadItem?: boolean;
  }): Promise<Invoice | null>;

  abstract find(props: {
    organizationId: string;
    clientId?: string | null;
    projectId?: string | null;
    skip?: number | null;
    limit?: number | null;
  }): Promise<{ count: number; invoices: Invoice[] }>;
}
