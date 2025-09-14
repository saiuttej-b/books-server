import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { MediaFile } from './media-file.entity';

export const Genders = {
  Male: 'Male',
  Female: 'Female',
  Other: 'Other',
};

@Entity({ name: 'users' })
@Index('user_email_idx', ['email'], { unique: true })
export class User {
  @PrimaryColumn({ type: 'char', length: 26 })
  id: string;

  @Column({ type: 'citext', nullable: false })
  email: string;

  @Column({ type: 'citext', nullable: false })
  fullName: string;

  @Column({ type: 'text', nullable: true })
  password?: string | null;

  @Column({ type: 'citext', nullable: true })
  gender?: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  profilePicture?: MediaFile;
}
