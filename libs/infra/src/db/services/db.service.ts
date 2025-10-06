import { Injectable } from '@nestjs/common';
import { RequestStoreService } from '@saiuttej/nestjs-request-store';
import { DataSource, EntityManager } from 'typeorm';

const DATASOURCE_MANAGER_KEY = Symbol.for('DATASOURCE_MANAGER_KEY');

@Injectable()
export class DbService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly requestStore: RequestStoreService,
  ) {}

  getWriteManager() {
    return (
      this.requestStore.getValue<EntityManager>(DATASOURCE_MANAGER_KEY.toString()) ||
      this.dataSource.manager
    );
  }

  getManager() {
    return (
      this.requestStore.getValue<EntityManager>(DATASOURCE_MANAGER_KEY.toString()) ||
      this.dataSource.manager
    );
  }

  async transaction<T>(props: { execute: () => Promise<T> | T }) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      const result = await this.requestStore.session({
        inherit: true,
        execute: async () => {
          this.requestStore.setValue(DATASOURCE_MANAGER_KEY.toString(), queryRunner.manager);
          return await props.execute();
        },
      });
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
