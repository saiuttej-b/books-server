import { ExpenseType } from '@app/core';

export abstract class ExpenseTypeRepository {
  abstract instance(data?: Partial<ExpenseType>): ExpenseType;

  abstract create(expenseType: ExpenseType): Promise<void>;

  abstract update(expenseType: ExpenseType): Promise<void>;

  abstract delete(id: string): Promise<void>;

  abstract existsByNameAndOrganizationId(props: {
    name: string;
    organizationId: string;
    neId?: string;
  }): Promise<boolean>;

  abstract findByIdAndOrganizationId(props: {
    id: string;
    organizationId: string;
  }): Promise<ExpenseType | null>;

  abstract findByOrganizationId(organizationId: string): Promise<ExpenseType[]>;
}
