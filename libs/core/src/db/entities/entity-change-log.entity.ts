import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

export type EntityChangeLogChangedField = {
  fieldName: string;
  oldValue: any;
  newValue: any;
};

export type EntityChangeLogDetails = {
  changedFields: EntityChangeLogChangedField[];
  changeMessages: string[];
  customDetails?: Record<string, any>;
};

export const ChangeLogEntityName = Object.freeze({
  ORGANIZATIONS: 'ORGANIZATIONS',
  ORGANIZATION_USERS: 'ORGANIZATION_USERS',
  CLIENTS: 'CLIENTS',
  CLIENT_CONTACT_PERSONS: 'CLIENT_CONTACT_PERSONS',
  PROJECTS: 'PROJECTS',
  QUOTES: 'QUOTES',
  INVOICES: 'INVOICES',
});

@Entity({ name: 'entity_change_logs' })
export class EntityChangeLog {
  @PrimaryColumn({ type: 'char', length: 26 })
  id: string;

  @Column({ type: 'citext', nullable: false })
  entityName: string;

  @Column({ type: 'char', length: 26, nullable: false })
  entityId: string;

  @Column({ type: 'citext', nullable: false })
  changeType: string;

  @Column({ type: 'char', length: 26, nullable: false })
  userId: string;

  @Column({ type: 'char', length: 26, nullable: true })
  organizationId?: string | null;

  @ManyToOne(() => User, (user) => user.id)
  user?: User | null;

  @Column({ type: 'timestamptz', nullable: false })
  updatedAt: string;

  @Column({ type: 'timestamptz', nullable: false })
  createdAt: string;

  @Column({ type: 'jsonb', nullable: false })
  details: EntityChangeLogDetails;
}
