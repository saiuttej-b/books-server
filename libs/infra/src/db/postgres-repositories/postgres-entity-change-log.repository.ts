import { EntityChangeLog, generateId } from '@app/core';
import { Injectable } from '@nestjs/common';
import { EntityChangeLogRepository } from '../repositories/entity-change-log.repository';
import { DbService } from '../services/db.service';

@Injectable()
export class PostgresEntityChangeLogRepository implements EntityChangeLogRepository {
  constructor(private readonly dbService: DbService) {}

  instance(data?: Partial<EntityChangeLog>): EntityChangeLog {
    const record = this.dbService
      .getManager()
      .getRepository(EntityChangeLog)
      .create(data || {});
    if (!record.id) record.id = generateId();
    return record;
  }

  async insertLogs(logs: EntityChangeLog[]): Promise<void> {
    if (!logs.length) return;
    await this.dbService
      .getWriteManager()
      .createQueryBuilder()
      .insert()
      .into(EntityChangeLog)
      .values(logs)
      .updateEntity(false)
      .execute();
  }
}
