import { DbConfigModule } from '@app/core';
import { Global, Module, Provider } from '@nestjs/common';
import { PostgresAuthTokenRepository } from './postgres-repositories/postgres-auth-token.repository';
import { PostgresEntityChangeLogRepository } from './postgres-repositories/postgres-entity-change-log.repository';
import { AuthTokenRepository } from './repositories/auth-token.repository';
import { EntityChangeLogRepository } from './repositories/entity-change-log.repository';
import { DbService } from './services/db.service';

const repos: Provider[] = [
  {
    provide: AuthTokenRepository,
    useClass: PostgresAuthTokenRepository,
  },
  {
    provide: EntityChangeLogRepository,
    useClass: PostgresEntityChangeLogRepository,
  },
];

@Global()
@Module({
  imports: [DbConfigModule],
  providers: [DbService, ...repos],
  exports: [DbService, ...repos],
})
export class AppDbModule {}
