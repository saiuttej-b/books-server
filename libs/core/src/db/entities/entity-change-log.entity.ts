import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

export type EntityChangeLogDetails = {
  changedFields: {
    fieldName: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
  changeMessages: string[];
} & Record<string, unknown>;

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
