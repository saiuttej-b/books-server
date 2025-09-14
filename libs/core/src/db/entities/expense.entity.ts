import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { convertToNumber } from '../../utils';
import { Client } from './client.entity';
import { ExpenseType } from './expense-type.entity';
import { MediaFile } from './media-file.entity';
import { Organization } from './organization.entity';

@Entity({ name: 'expenses' })
export class Expense {
  @PrimaryColumn({ type: 'char', length: 26 })
  id: string;

  @Column({ type: 'char', length: 26, nullable: false })
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.id)
  organization?: Organization | null;

  @Column({ type: 'char', length: 26, nullable: false })
  expenseTypeId: string;

  @ManyToOne(() => ExpenseType, (expenseType) => expenseType.id)
  expenseType?: ExpenseType | null;

  @Column({ type: 'date', nullable: false })
  transactionDate: string;

  @Column({ type: 'citext', nullable: false })
  expenseAccount: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    transformer: {
      to: (value) => value,
      from: (value) => convertToNumber(value),
    },
  })
  amount: number;

  @Column({ type: 'citext', nullable: true })
  invoiceReferenceNumber?: string | null;

  @Column({ type: 'citext', nullable: true })
  notes?: string | null;

  @Column({ type: 'char', length: 26, nullable: true })
  clientId?: string | null;

  @ManyToOne(() => Client, (client) => client.id)
  client?: Client | null;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  docs?: MediaFile[] | null;
}
