import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { MediaFile } from './media-file.entity';

export const Genders = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
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

  @Column({ type: 'timestamptz', nullable: false })
  updatedAt: string;

  @Column({ type: 'timestamptz', nullable: false })
  createdAt: string;

  profilePicture?: MediaFile;
}
