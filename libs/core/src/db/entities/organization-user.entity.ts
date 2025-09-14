import { Column, Entity, Index, ManyToOne, PrimaryColumn } from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';

export const OrganizationUserRoles = {
  Owner: 'Owner',
  Admin: 'Admin',
  Member: 'Member',
};

@Entity({ name: 'organization_users' })
@Index('organization_user_org_user_idx', ['organizationId', 'userId'], { unique: true })
export class OrganizationUser {
  @PrimaryColumn({ type: 'char', length: 26 })
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.id)
  organization?: Organization | null;

  @PrimaryColumn({ type: 'char', length: 26 })
  userId: string;

  @ManyToOne(() => User, (user) => user.id)
  user?: User | null;

  @Column({ type: 'varchar', length: 31, nullable: false })
  role: string;
}
