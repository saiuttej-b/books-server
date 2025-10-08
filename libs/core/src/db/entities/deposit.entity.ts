import { Column, Entity, Index, ManyToOne, PrimaryColumn } from 'typeorm';
import { convertToNumber } from '../../utils';
import { BankTransaction } from './bank-transaction.entity';
import { Client } from './client.entity';
import { Invoice } from './invoice.entity';
import { Organization } from './organization.entity';

export const TypeOfDeposits = {
  INVOICE_PAYMENT: 'INVOICE_PAYMENT',
  INVESTMENT: 'INVESTMENT',
  LOAN: 'LOAN',
};

export const PaymentMethods = {
  CASH: 'CASH',
  CHECK: 'CHECK',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CREDIT_CARD: 'CREDIT_CARD',
  UPI: 'UPI',
};

@Entity({ name: 'deposits' })
@Index('deposits_org_deposit_no_idx', ['organizationId', 'depositNo'], { unique: true })
export class Deposit {
  @PrimaryColumn({ type: 'char', length: 26 })
  id: string;

  @Column({ type: 'char', length: 26, nullable: false })
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.id)
  organization?: Organization | null;

  @Column({ type: 'citext', nullable: false })
  depositNo: string;

  @Column({ type: 'varchar', length: 63, nullable: false })
  paymentMethod: string;

  @Column({ type: 'date', nullable: false })
  depositDate: string;

  @Column({ type: 'citext', nullable: false })
  typeOfDeposit: string;

  @Column({ type: 'char', length: 26, nullable: true })
  bankTransactionId?: string | null;

  @ManyToOne(() => BankTransaction, (bt) => bt.id)
  bankTransaction?: BankTransaction | null;

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
  amount: number;

  @Column({ type: 'citext', nullable: true })
  reference?: string | null;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ type: 'char', length: 26, nullable: true })
  clientId?: string | null;

  @ManyToOne(() => Client, (client) => client.id)
  client?: Client | null;

  @Column({ type: 'timestamptz', nullable: false })
  updatedAt: string;

  @Column({ type: 'timestamptz', nullable: false })
  createdAt: string;
}

@Entity({ name: 'deposit_invoices' })
@Index('deposit_invoices_unique_idx', ['depositId', 'invoiceId'], { unique: true })
export class DepositInvoice {
  @PrimaryColumn({ type: 'char', length: 26, nullable: false })
  depositId: string;

  @ManyToOne(() => Deposit, (deposit) => deposit.id)
  deposit?: Deposit | null;

  @PrimaryColumn({ type: 'char', length: 26, nullable: false })
  invoiceId: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.id)
  invoice?: Invoice | null;

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
  amount: number;
}
