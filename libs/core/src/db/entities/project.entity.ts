import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { MediaFile } from './media-file.entity';
import { Organization } from './organization.entity';

@Entity({ name: 'projects' })
@Index('projects_org_code_idx', ['organizationId', 'code'], { unique: true })
export class Project {
  @PrimaryColumn({ type: 'char', length: 26 })
  id: string;

  @Column({ type: 'char', length: 26, nullable: false })
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.id)
  organization?: Organization | null;

  @Column({ type: 'citext', nullable: false })
  name: string;

  @Column({ type: 'citext', nullable: false })
  code: string;

  @Column({ type: 'citext', nullable: true })
  description: string | null;

  @Column({ type: 'char', length: 26, nullable: true })
  customerId?: string | null;

  @ManyToOne(() => Customer, (customer) => customer.id)
  customer?: Customer | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  docs?: MediaFile[] | null;
}
