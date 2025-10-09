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

  @Column({ type: 'jsonb', nullable: true })
  details?: EntityChangeLogDetails | null;

  @Column({ type: 'char', length: 26, nullable: false })
  userId: string;

  @ManyToOne(() => User, (user) => user.id)
  user?: User | null;

  @Column({ type: 'timestamptz', nullable: false })
  updatedAt: string;

  @Column({ type: 'timestamptz', nullable: false })
  createdAt: string;
}
