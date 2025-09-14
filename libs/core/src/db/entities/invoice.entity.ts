import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { convertToNumber } from '../../utils';
import { Customer, CustomerContactPerson } from './customer.entity';
import { MediaFile } from './media-file.entity';
import { Organization } from './organization.entity';

export type InvoiceOtherDetailsType = {
  contactPersons?: CustomerContactPerson[] | null;
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
  customerId: string;

  @ManyToOne(() => Customer, (customer) => customer.id)
  customer?: Customer | null;

  @Column({ type: 'citext', nullable: false })
  invoiceNo: string;

  @Column({ type: 'date', nullable: false })
  invoiceDate: string;

  @Column({ type: 'varchar', length: 31, nullable: false })
  dueTerm: string;

  @Column({ type: 'date', nullable: false })
  dueDate: string;

  @Column({ type: 'varchar', length: 5, nullable: false })
  taxType: string;

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
  taxRate: number;

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

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  generatedPdf?: MediaFile | null;

  docs?: MediaFile[] | null;
}

@Entity({ name: 'invoice_items' })
@Index('invoice_items_invoice_id_line_no_idx', ['invoiceId', 'lineNo'], { unique: true })
@Index('invoice_items_invoice_id_details_idx', ['invoiceId', 'details'], { unique: true })
export class InvoiceItem {
  @PrimaryColumn({ type: 'char', length: 26 })
  invoiceId: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.id)
  invoice?: Invoice | null;

  @PrimaryColumn({ type: 'int' })
  lineNo: number;

  @Column({ type: 'citext', nullable: false })
  details: string;

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
