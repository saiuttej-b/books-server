import { AuthToken, generateId } from '@app/core';
import { Injectable } from '@nestjs/common';
import { AuthTokenRepository } from '../repositories/auth-token.repository';
import { DbService } from '../services/db.service';

@Injectable()
export class PostgresAuthTokenRepository implements AuthTokenRepository {
  constructor(private readonly dbService: DbService) {}

  async create(token: Partial<AuthToken>): Promise<AuthToken> {
    const record = this.dbService
      .getManager()
      .getRepository(AuthToken)
      .create(token || {});
    if (!record.id) record.id = generateId();
    const result = await this.dbService.getWriteManager().save(record);
    return result;
  }

  async deleteById(id: string): Promise<void> {
    await this.dbService.getManager().delete(AuthToken, { id });
  }

  findById(id: string): Promise<AuthToken | null> {
    return this.dbService.getManager().findOne(AuthToken, { where: { id } });
  }
}
