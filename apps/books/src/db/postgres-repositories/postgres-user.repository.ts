import { generateId, User } from '@app/core';
import { DbService } from '@app/infra';
import { Injectable } from '@nestjs/common';
import { Not } from 'typeorm';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class PostgresUserRepository implements UserRepository {
  constructor(private readonly dbService: DbService) {}

  instance(data?: Partial<User>): User {
    const record = this.dbService
      .getManager()
      .getRepository(User)
      .create(data || {});
    if (!record.id) record.id = generateId();
    return record;
  }

  async create(user: User): Promise<void> {
    await this.dbService.getWriteManager().insert(User, user);
  }

  findByLoginId(loginId: string): Promise<User | null> {
    return this.dbService.getManager().findOne(User, { where: { email: loginId } });
  }

  findById(id: string): Promise<User | null> {
    return this.dbService.getManager().findOne(User, { where: { id } });
  }

  async existsByEmail(props: { email: string; neId?: string }): Promise<boolean> {
    const count = await this.dbService.getManager().count(User, {
      where: { email: props.email, ...(props.neId && { id: Not(props.neId) }) },
    });
    return count > 0;
  }
}
