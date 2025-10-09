import { User } from '@app/core';

export abstract class UserRepository {
  abstract instance(data?: Partial<User>): User;

  abstract create(user: User): Promise<void>;

  abstract findByLoginId(loginId: string): Promise<User | null>;

  abstract findById(id: string): Promise<User | null>;

  abstract existsByEmail(props: { email: string; neId?: string }): Promise<boolean>;
}
