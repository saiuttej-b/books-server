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
import { Organization } from './organization.entity';

export const BankNames = {
  HDFC: 'HDFC',
  YES_BANK: 'YES_BANK',
};

@Entity({ name: 'banks' })
@Index('banks_organization_id_account_number_idx', ['organizationId', 'accountNumber'], {
  unique: true,
})
export class Bank {
  @PrimaryColumn({ type: 'char', length: 26 })
  id: string;

  @Column({ type: 'char', length: 26, nullable: false })
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.id)
  organization?: Organization | null;

  @Column({ type: 'citext', nullable: false })
  name: string;

  @Column({ type: 'citext', nullable: false })
  accountNumber: string;

  @Column({ type: 'citext', nullable: false })
  ifsc: string;

  @Column({ type: 'citext', nullable: true })
  branch?: string | null;

  @Column({ type: 'citext', nullable: true })
  address?: string | null;

  @Column({ type: 'citext', nullable: true })
  city?: string | null;

  @Column({ type: 'citext', nullable: true })
  state?: string | null;

  @Column({ type: 'citext', nullable: true })
  country?: string | null;

  @Column({ type: 'citext', nullable: true })
  pinCode?: string | null;

  @Column({ type: 'citext', nullable: true })
  accountHolderName?: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;

  docs?: MediaFile[] | null;
}
