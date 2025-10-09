import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { resolve } from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AppEnvType } from '../env';

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
        entities: [resolve(__dirname, 'entities', '*.entity.{ts,js}')],
        ...(configService.get('POSTGRES_SSL') !== 'false' && {
          ssl: true,
          extra: { ssl: { rejectUnauthorized: false } },
        }),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DbConfigModule {}
