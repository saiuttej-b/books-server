import { Module } from '@nestjs/common';
import { ExpenseTypesController } from './controllers/expense-types.controller';
import { ExpenseTypesMutationService } from './services/expense-types-mutation.service';
import { ExpenseTypesService } from './services/expense-types.service';

@Module({
  controllers: [ExpenseTypesController],
  providers: [ExpenseTypesMutationService, ExpenseTypesService],
})
export class ExpenseTypesModule {}
