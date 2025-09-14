import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MediaFile } from './media-file.entity';
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

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  docs?: MediaFile[] | null;
}
