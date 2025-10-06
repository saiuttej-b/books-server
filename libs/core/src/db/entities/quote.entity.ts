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
import { Client, ClientContactPerson } from './client.entity';
import { MediaFile } from './media-file.entity';
import { Organization } from './organization.entity';
import { Project } from './project.entity';

export type QuoteOtherDetailsType = {
  contactPersons?: ClientContactPerson[] | null;
};

@Entity({ name: 'quotes' })
@Index('quotes_org_quote_number_idx', ['organizationId', 'quoteNo'], { unique: true })
export class Quote {
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

  @Column({ type: 'char', length: 26, nullable: false })
  projectId: string;

  @ManyToOne(() => Project, (project) => project.id)
  project?: Project | null;

  @Column({ type: 'citext', nullable: false })
  quoteNo: string;

  @Column({ type: 'date', nullable: false })
  issueDate: string;

  @Column({ type: 'date', nullable: true })
  expiryDate?: string | null;

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

  @Column({ type: 'citext', nullable: true })
  termsAndConditions?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  otherDetails?: QuoteOtherDetailsType | null;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  docs?: MediaFile[] | null;
}

@Entity({ name: 'quote_items' })
@Index('quote_items_quote_id_line_no_idx', ['quoteId', 'lineNo'], { unique: true })
@Index('quote_items_quote_id_details_idx', ['quoteId', 'details'], { unique: true })
export class QuoteItem {
  @PrimaryColumn({ type: 'char', length: 26 })
  quoteId: string;

  @ManyToOne(() => Quote, (quote) => quote.id)
  quote?: Quote | null;

  @PrimaryColumn({ type: 'int' })
  lineNo: number;

  @Column({ type: 'citext', nullable: false })
  details: string;

  @Column({ type: 'char', length: 10, nullable: true })
  sacNo?: string | null;

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
