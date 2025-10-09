import { EntityChangeLog } from '@app/core';

export abstract class EntityChangeLogRepository {
  abstract instance(data?: Partial<EntityChangeLog>): EntityChangeLog;

  abstract insertLogs(logs: EntityChangeLog[]): Promise<void>;
}
