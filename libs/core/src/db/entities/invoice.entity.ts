import { Column, Entity, Index, ManyToOne, PrimaryColumn } from 'typeorm';
import { convertToNumber } from '../../utils';
import { Client, ClientContactPerson } from './client.entity';
import { MediaFile } from './media-file.entity';
import { Organization } from './organization.entity';
import { Project } from './project.entity';

export type InvoiceOtherDetailsType = {
  contactPersons?: ClientContactPerson[] | null;
};

@Entity({ name: 'invoices' })
@Index('invoices_org_invoice_no_idx', ['organizationId', 'invoiceNo'], { unique: true })
export class Invoice {
  @PrimaryColumn({ type: 'char', length: 26 })
  id: string;

  @Column({ type: 'char', length: 26, nullable: false })
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.id)
  organization?: Organization | null;

  @Column({ type: 'char', length: 26, nullable: false })
  clientId: string;

  @ManyToOne(() => Client, (client) => client.id)
  client?: Client | null;

  @Column({ type: 'char', length: 26, nullable: true })
  projectId?: string | null;

  @ManyToOne(() => Project, (project) => project.id)
  project?: Project | null;

  @Column({ type: 'citext', nullable: false })
  invoiceNo: string;

  @Column({ type: 'date', nullable: false })
  invoiceDate: string;

  @Column({ type: 'varchar', length: 31, nullable: false })
  dueTerm: string;

  @Column({ type: 'date', nullable: false })
  dueDate: string;

  @Column({ type: 'citext', nullable: true })
  advanceTaxType?: string | null;

  @Column({ type: 'citext', nullable: true })
  advanceTaxSubType?: string | null;

  @Column({
    type: 'decimal',
    precision: 25,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value) => value,
      from: (value) => convertToNumber(value),
    },
  })
  advanceTaxRate: number;

  @Column({
    type: 'decimal',
    precision: 25,
    scale: 2,
    nullable: false,
    transformer: {
      to: (value) => value,
      from: (value) => convertToNumber(value),
    },
  })
  advanceTaxAmount: number;

  @Column({
    type: 'decimal',
    precision: 25,
    scale: 2,
    nullable: false,
    transformer: {
      to: (value) => value,
      from: (value) => convertToNumber(value),
    },
  })
  subTotal: number;

  @Column({
    type: 'decimal',
    precision: 25,
    scale: 2,
    nullable: false,
    transformer: {
      to: (value) => value,
      from: (value) => convertToNumber(value),
    },
  })
  totalAmount: number;

  @Column({ type: 'text', nullable: true })
  termsAndConditions?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  otherDetails?: InvoiceOtherDetailsType | null;

  @Column({ type: 'timestamptz', nullable: false })
  updatedAt: string;

  @Column({ type: 'timestamptz', nullable: false })
  createdAt: string;

  generatedPdf?: MediaFile | null;

  docs?: MediaFile[] | null;
}

@Entity({ name: 'invoice_items' })
@Index('invoice_items_invoice_id_name_idx', ['invoiceId', 'name'], { unique: true })
export class InvoiceItem {
  @PrimaryColumn({ type: 'char', length: 26, nullable: false })
  invoiceId: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.id)
  invoice?: Invoice | null;

  @PrimaryColumn({ type: 'int', nullable: false })
  lineNo: number;

  @Column({ type: 'citext', nullable: false })
  name: string;

  @Column({ type: 'char', length: 10, nullable: false })
  sacNo: string;

  @Column({ type: 'int', nullable: false })
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 25,
    scale: 2,
    nullable: false,
    transformer: {
      to: (value) => value,
      from: (value) => convertToNumber(value),
    },
  })
  unitPrice: number;

  @Column({
    type: 'decimal',
    precision: 25,
    scale: 2,
    nullable: false,
    transformer: {
      to: (value) => value,
      from: (value) => convertToNumber(value),
    },
  })
  price: number;

  @Column({ type: 'varchar', length: 15, nullable: false })
  taxRate: string;

  @Column({
    type: 'decimal',
    precision: 25,
    scale: 2,
    nullable: false,
    transformer: {
      to: (value) => value,
      from: (value) => convertToNumber(value),
    },
  })
  taxRateValue: number;

  @Column({
    type: 'decimal',
    precision: 25,
    scale: 2,
    nullable: false,
    transformer: {
      to: (value) => value,
      from: (value) => convertToNumber(value),
    },
  })
  taxAmount: number;

  @Column({
    type: 'decimal',
    precision: 25,
    scale: 2,
    nullable: false,
    transformer: {
      to: (value) => value,
      from: (value) => convertToNumber(value),
    },
  })
  totalAmount: number;
}
