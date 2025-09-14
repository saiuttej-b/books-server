import {
  AfterLoad,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'media_files' })
@Index('media_files_key', ['key'], { unique: true })
export class MediaFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  key: string;

  @Column({ type: 'varchar', length: 127, nullable: false })
  type: string;

  @Column({ type: 'char', length: 26, nullable: true })
  typeId?: string | null;

  @Column({ type: 'varchar', length: 511, nullable: false })
  originalFileName: string;

  @Column({ type: 'bigint', nullable: false })
  fileSize: number;

  @Column({ type: 'char', length: 26, nullable: true })
  uploadedById?: string | null;

  @Column({ type: 'citext', nullable: false })
  mimetype: string;

  @Column({ type: 'jsonb', nullable: true, select: false })
  uploadResponseData?: any;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  url?: string;

  @AfterLoad()
  setUrl() {
    this.url = `${process.env.AWS_S3_FILE_BASE_URL}/${this.key}`;
  }
}
