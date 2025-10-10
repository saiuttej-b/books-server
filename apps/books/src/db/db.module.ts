import { Global, Module, Provider } from '@nestjs/common';
import { PostgresClientRepository } from './postgres-repositories/postgres-client.repository';
import { PostgresOrganizationRepository } from './postgres-repositories/postgres-organization.repository';
import { PostgresProjectRepository } from './postgres-repositories/postgres-project.repository';
import { PostgresUserRepository } from './postgres-repositories/postgres-user.repository';
import { ClientRepository } from './repositories/client.repository';
import { OrganizationRepository } from './repositories/organization.repository';
import { ProjectRepository } from './repositories/project.repository';
import { UserRepository } from './repositories/user.repository';

const repos: Provider[] = [
  {
    provide: ClientRepository,
    useClass: PostgresClientRepository,
  },
  {
    provide: OrganizationRepository,
    useClass: PostgresOrganizationRepository,
  },
  {
    provide: ProjectRepository,
    useClass: PostgresProjectRepository,
  },
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
