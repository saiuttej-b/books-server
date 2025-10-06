import { DbConfigModule } from '@app/core';
import { Global, Module, Provider } from '@nestjs/common';
import { PostgresAuthTokenRepository } from './postgres-repositories/postgres-auth-token.repository';
import { AuthTokenRepository } from './repositories/auth-token.repository';
import { DbService } from './services/db.service';

const repos: Provider[] = [
  {
    provide: AuthTokenRepository,
    useClass: PostgresAuthTokenRepository,
  },
];

@Global()
@Module({
  imports: [DbConfigModule],
  providers: [DbService, ...repos],
  exports: [DbService, ...repos],
})
export class AppDbModule {}
