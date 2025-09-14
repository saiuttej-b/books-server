import { CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'expense_types' })
@Index('expense_type_org_name_idx', ['organizationId', 'name'], { unique: true })
export class ExpenseType {
  @PrimaryColumn({ type: 'char', length: 26 })
  id: string;

  @PrimaryColumn({ type: 'citext', nullable: false })
  name: string;

  @PrimaryColumn({ type: 'char', length: 26, nullable: false })
  organizationId: string;

  @PrimaryColumn({ type: 'boolean', nullable: false, default: false })
  isSystemDefined: boolean;

  @PrimaryColumn({ type: 'boolean', nullable: false, default: true })
  isActive: boolean;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;
}
