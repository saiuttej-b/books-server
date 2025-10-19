import { AppRequestStoreService } from '@app/integrations';
import { Injectable } from '@nestjs/common';
import { ExpenseTypeRepository } from '../../db/repositories/expense-type.repository';

@Injectable()
export class ExpenseTypesService {
  constructor(
    private readonly expenseTypeRepo: ExpenseTypeRepository,
    private readonly requestStore: AppRequestStoreService,
  ) {}

  async getExpenseTypes() {
    const expenseTypes = await this.expenseTypeRepo.findByOrganizationId(
      this.requestStore.getOrganizationId(),
    );
    return { expenseTypes };
  }
}
