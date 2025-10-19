import { ExpenseType, generateId } from '@app/core';
import { DbService } from '@app/infra';
import { Injectable } from '@nestjs/common';
import { Not } from 'typeorm';
import { ExpenseTypeRepository } from '../repositories/expense-type.repository';

@Injectable()
export class PostgresExpenseTypeRepository implements ExpenseTypeRepository {
  constructor(private readonly dbService: DbService) {}

  instance(data?: Partial<ExpenseType>): ExpenseType {
    const record = this.dbService
      .getManager()
      .getRepository(ExpenseType)
      .create(data || {});
    if (!record.id) record.id = generateId();
    return record;
  }

  async create(expenseType: ExpenseType): Promise<void> {
    await this.dbService.getWriteManager().getRepository(ExpenseType).insert(expenseType);
  }

  async update(expenseType: ExpenseType): Promise<void> {
    await this.dbService
      .getWriteManager()
      .getRepository(ExpenseType)
      .save(expenseType, { reload: false });
  }

  async delete(id: string): Promise<void> {
    await this.dbService.getWriteManager().getRepository(ExpenseType).delete(id);
  }

  async existsByNameAndOrganizationId(props: {
    name: string;
    organizationId: string;
    neId?: string;
  }): Promise<boolean> {
    const count = await this.dbService.getManager().count(ExpenseType, {
      where: {
        organizationId: props.organizationId,
        name: props.name,
        ...(props.neId ? { id: Not(props.neId) } : {}),
      },
    });
    return count > 0;
  }

  async findByIdAndOrganizationId(props: {
    id: string;
    organizationId: string;
  }): Promise<ExpenseType | null> {
    return this.dbService.getManager().findOne(ExpenseType, {
      where: {
        id: props.id,
        organizationId: props.organizationId,
      },
    });
  }

  async findByOrganizationId(organizationId: string): Promise<ExpenseType[]> {
    return this.dbService.getManager().find(ExpenseType, {
      where: {
        organizationId,
      },
      order: {
        name: 'ASC',
      },
    });
  }
}
