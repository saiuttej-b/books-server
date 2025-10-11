import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { convertToNumber } from '../../utils';
import { ClientContactPerson } from './client.entity';
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
  projectId: string;

  @ManyToOne(() => Project, (project) => project.id)
  project?: Project | null;

  @Column({ type: 'citext', nullable: false })
  quoteNo: string;

  @Column({ type: 'date', nullable: false })
  issueDate: string;

  @Column({ type: 'date', nullable: true })
  expiryDate?: string | null;

  @Column({ type: 'citext', nullable: true })
  taxType?: string | null;

  @Column({ type: 'citext', nullable: true })
  taxSubType?: string | null;

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
  totalAmount: number;

  @Column({ type: 'citext', nullable: true })
  termsAndConditions?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  otherDetails?: QuoteOtherDetailsType | null;

  @Column({ type: 'timestamptz', nullable: false })
  updatedAt: string;

  @Column({ type: 'timestamptz', nullable: false })
  createdAt: string;

  @OneToMany(() => QuoteItem, (item) => item.quote)
  items?: QuoteItem[] | null;

  docs?: MediaFile[] | null;
}

@Entity({ name: 'quote_items' })
@Index('quote_items_quote_id_name_idx', ['quoteId', 'name'], { unique: true })
export class QuoteItem {
  @PrimaryColumn({ type: 'char', length: 26, nullable: false })
  quoteId: string;

  @ManyToOne(() => Quote, (quote) => quote.id)
  quote?: Quote | null;

  @PrimaryColumn({ type: 'int', nullable: false })
  lineNo: number;

  @Column({ type: 'citext', nullable: false })
  name: string;

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
