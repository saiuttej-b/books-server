import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'expense_types' })
@Index('expense_type_org_name_idx', ['organizationId', 'name'], { unique: true })
export class ExpenseType {
  @PrimaryColumn({ type: 'char', length: 26 })
  id: string;

  @Column({ type: 'citext', nullable: false })
  name: string;

  @Column({ type: 'char', length: 26, nullable: false })
  organizationId: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  isSystemDefined: boolean;

  @Column({ type: 'boolean', nullable: false, default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: false })
  updatedAt: string;

  @Column({ type: 'timestamptz', nullable: false })
  createdAt: string;
}
