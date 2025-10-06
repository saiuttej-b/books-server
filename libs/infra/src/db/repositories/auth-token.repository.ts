import { AuthToken } from '@app/core';

export abstract class AuthTokenRepository {
  abstract create(token: Partial<AuthToken>): Promise<AuthToken>;

  abstract deleteById(id: string): Promise<void>;

  abstract findById(id: string): Promise<AuthToken | null>;
}
