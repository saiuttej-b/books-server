import { Column, Entity, Index, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'organizations' })
@Index('organization_subdomain_idx', ['subdomain'], { unique: true })
@Index('organization_name_idx', ['name'], { unique: true })
export class Organization {
  @PrimaryColumn({ type: 'char', length: 26 })
  id: string;

  @Column({ type: 'citext', nullable: false })
  subdomain: string;

  @Column({ type: 'citext', nullable: false })
  name: string;

  @Column({ type: 'char', length: 26, nullable: false })
  createdById: string;

  @ManyToOne(() => User, (user) => user.id)
  createdBy?: User | null;

  @Column({ type: 'timestamptz', nullable: false })
  updatedAt: string;

  @Column({ type: 'timestamptz', nullable: false })
  createdAt: string;
}

export const OrganizationChangeType = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
};
