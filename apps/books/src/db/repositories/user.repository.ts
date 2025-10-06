import { User } from '@app/core';

export abstract class UserRepository {
  abstract findByLoginId(loginId: string): Promise<User | null>;

  abstract findById(id: string): Promise<User | null>;
}
