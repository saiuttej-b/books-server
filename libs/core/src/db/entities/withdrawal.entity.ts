import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BankTransaction } from './bank-transaction.entity';
import { Expense } from './expense.entity';
import { MediaFile } from './media-file.entity';
import { Organization } from './organization.entity';

export const TypeOfWithdrawals = {
  EXPENSE: 'EXPENSE',
  OWNER_WITHDRAWAL: 'OWNER_WITHDRAWAL',
  LOAN_PAYMENT: 'LOAN_PAYMENT',
};

@Entity({ name: 'withdrawals' })
export class Withdrawal {
  @PrimaryColumn({ type: 'char', length: 26 })
  id: string;

  @Column({ type: 'char', length: 26, nullable: false })
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.id)
  organization?: Organization | null;

  @Column({ type: 'citext', nullable: false })
  withdrawalNo: string;

  @Column({ type: 'varchar', length: 63, nullable: false })
  paymentMethod: string;

  @Column({ type: 'date', nullable: false })
  withdrawalDate: string;

  @Column({ type: 'citext', nullable: false })
  typeOfWithdrawal: string;

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
      from: (value) => Number(value),
    },
  })
  amount: number;

  @Column({ type: 'citext', nullable: true })
  reference?: string | null;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  docs?: MediaFile[] | null;
}

@Entity({ name: 'withdrawal_expenses' })
@Index('withdrawal_expenses_unique_idx', ['withdrawalId', 'expenseId'], { unique: true })
export class WithdrawalExpense {
  @PrimaryColumn({ type: 'char', length: 26 })
  withdrawalId: string;

  @ManyToOne(() => Withdrawal, (withdrawal) => withdrawal.id)
  withdrawal?: Withdrawal | null;

  @PrimaryColumn({ type: 'char', length: 26 })
  expenseId: string;

  @ManyToOne(() => Expense, (expense) => expense.id)
  expense?: Expense | null;

  @Column({
    type: 'decimal',
    precision: 25,
    scale: 2,
    nullable: false,
    transformer: {
      to: (value) => value,
      from: (value) => Number(value),
    },
  })
  amount: number;
}
