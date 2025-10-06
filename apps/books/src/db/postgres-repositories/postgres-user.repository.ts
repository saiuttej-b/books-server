import { User } from '@app/core';
import { DbService } from '@app/infra';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class PostgresUserRepository implements UserRepository {
  constructor(private readonly dbService: DbService) {}

  findByLoginId(loginId: string): Promise<User | null> {
    return this.dbService.getManager().findOne(User, { where: { email: loginId } });
  }

  findById(id: string): Promise<User | null> {
    return this.dbService.getManager().findOne(User, { where: { id } });
  }
}
