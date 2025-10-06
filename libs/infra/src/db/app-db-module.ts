import { AppEnvType } from '@app/core';
import { Global, Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { resolve } from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
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
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService<AppEnvType>) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        namingStrategy: new SnakeNamingStrategy(),
        synchronize: false,
        logging: true,
        entities: [resolve('**', 'entities', '*.entity.{ts,js}')],
        ...(configService.get('POSTGRES_SSL') !== 'false' && {
          ssl: true,
          extra: { ssl: { rejectUnauthorized: false } },
        }),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [DbService, ...repos],
  exports: [DbService, ...repos],
})
export class AppDbModule {}
