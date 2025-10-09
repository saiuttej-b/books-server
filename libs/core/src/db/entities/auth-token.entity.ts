import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

export const AuthTokenTypes = {
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
};

@Entity({ name: 'auth_tokens' })
@Index('auth_tokens_token_type_user_id_idx', ['tokenType', 'userId'])
export class AuthToken {
  @PrimaryColumn({ type: 'char', length: 26 })
  id: string;

  @Column({ type: 'citext', nullable: false })
  tokenType: string;

  @Column({ type: 'timestamptz', nullable: false })
  expiresAt: string;

  @Column({ type: 'char', length: 26, nullable: true })
  userId?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown> | null;

  @Column({ type: 'timestamptz', nullable: false })
  createdAt: string;

  @Column({ type: 'timestamptz', nullable: false })
  updatedAt: string;
}
