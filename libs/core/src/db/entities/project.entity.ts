import { Column, Entity, Index, ManyToOne, PrimaryColumn } from 'typeorm';
import { Client } from './client.entity';
import { MediaFile } from './media-file.entity';
import { Organization } from './organization.entity';

@Entity({ name: 'projects' })
@Index('projects_org_code_idx', ['organizationId', 'code'], { unique: true })
@Index('projects_org_name_idx', ['organizationId', 'name'], { unique: true })
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
  displayName: string;

  @Column({ type: 'citext', nullable: false })
  code: string;

  @Column({ type: 'citext', nullable: true })
  description: string | null;

  @Column({ type: 'char', length: 26, nullable: true })
  clientId?: string | null;

  @ManyToOne(() => Client, (client) => client.id)
  client?: Client | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: false })
  updatedAt: string;

  @Column({ type: 'timestamptz', nullable: false })
  createdAt: string;

  docs?: MediaFile[] | null;
}

export const ProjectChangeType = {
  ADDED: 'ADDED',
  UPDATED: 'UPDATED',
};
