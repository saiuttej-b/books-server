import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Address } from './address.entity';
import { MediaFile } from './media-file.entity';
import { Organization } from './organization.entity';

@Entity({ name: 'vendors' })
@Index('vendor_org_name_idx', ['organizationId', 'name'], { unique: true })
export class Vendor {
  @PrimaryColumn({ type: 'char', length: 26 })
  id: string;

  @Column({ type: 'char', length: 26, nullable: false })
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.id)
  organization?: Organization | null;

  @Column({ type: 'varchar', length: 15, nullable: false })
  customerType: string;

  @Column({ type: 'citext', nullable: false })
  name: string;

  @Column({ type: 'citext', nullable: false })
  displayName: string;

  @Column({ type: 'citext', nullable: true })
  email?: string | null;

  @Column({ type: 'citext', nullable: true })
  mobileCountryCode?: string | null;

  @Column({ type: 'citext', nullable: true })
  mobile?: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  /**
   * Vendor GST Related Fields
   */

  @Column({ type: 'citext', nullable: false })
  treatmentOption: string;

  @Column({ type: 'citext', nullable: true })
  gstin?: string | null;

  @Column({ type: 'citext', nullable: true })
  pan?: string | null;

  @Column({ type: 'citext', nullable: true })
  placeOfSupply?: string | null;

  @Column({ type: 'citext', nullable: true })
  businessLegalName?: string | null;

  @Column({ type: 'citext', nullable: true })
  businessTradeName?: string | null;

  /**
   * Custom Address fields
   */

  @Column(() => Address)
  billingAddress?: Address | null;

  @Column(() => Address)
  shippingAddress?: Address | null;

  @Column({ type: 'citext', nullable: true })
  remarks?: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;

  docs?: MediaFile[] | null;
}

@Entity({ name: 'vendor_contact_persons' })
export class VendorContactPerson {
  @PrimaryColumn({ type: 'char', length: 26 })
  id: string;

  @Column({ type: 'char', length: 26, nullable: false })
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.id)
  organization?: Organization | null;

  @PrimaryColumn({ type: 'char', length: 26 })
  vendorId: string;

  @ManyToOne(() => Vendor, (vendor) => vendor.id)
  vendor?: Vendor | null;

  @Column({ type: 'char', length: 5, nullable: false })
  salutation: string;

  @Column({ type: 'citext', nullable: false })
  firstName: string;

  @Column({ type: 'citext', nullable: true })
  lastName?: string | null;

  @Column({ type: 'citext', nullable: true })
  email?: string | null;

  @Column({ type: 'citext', length: 5, nullable: true })
  mobileCountryCode?: string | null;

  @Column({ type: 'citext', length: 20, nullable: true })
  mobile?: string | null;

  @Column({ type: 'citext', length: 5, nullable: true })
  workPhoneCountryCode?: string | null;

  @Column({ type: 'citext', length: 20, nullable: true })
  workPhone?: string | null;

  @Column({ type: 'boolean', default: false })
  isPrimaryContact: boolean;

  @Column({ type: 'citext', length: 127, nullable: true })
  designation?: string | null;

  @Column({ type: 'citext', length: 127, nullable: true })
  department?: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;
}
