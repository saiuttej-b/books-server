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
import { Bank } from './bank.entity';
import { Organization } from './organization.entity';

export const TransactionTypes = {
  WITHDRAWAL: 'WITHDRAWAL',
  DEPOSIT: 'DEPOSIT',
};

@Entity({ name: 'bank_transactions' })
@Index(
  'bank_transactions_organization_id_transaction_id_idx',
  ['organizationId', 'transactionId'],
  {
    unique: true,
  },
)
export class BankTransaction {
  @PrimaryColumn({ type: 'char', length: 26 })
  id: string;

  @Column({ type: 'char', length: 26, nullable: false })
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.id)
  organization?: Organization | null;

  @Column({ type: 'char', length: 26, nullable: false })
  bankId: string;

  @ManyToOne(() => Bank, (bank) => bank.id)
  bank?: Bank | null;

  @Column({ type: 'citext', nullable: false })
  transactionId: string;

  @Column({ type: 'date', nullable: false })
  transactionDate: string;

  @Column({ type: 'citext', nullable: false })
  transactionType: string;

  @Column({ type: 'citext', nullable: true })
  description?: string | null;

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
  closingBalance: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;
}
