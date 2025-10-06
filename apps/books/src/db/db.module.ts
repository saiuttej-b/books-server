import { Global, Module, Provider } from '@nestjs/common';
import { PostgresUserRepository } from './postgres-repositories/postgres-user.repository';
import { UserRepository } from './repositories/user.repository';

const repos: Provider[] = [
  {
    provide: UserRepository,
    useClass: PostgresUserRepository,
  },
];

@Global()
@Module({
  imports: [],
  providers: [...repos],
  exports: [...repos],
})
export class BooksDbModule {}
