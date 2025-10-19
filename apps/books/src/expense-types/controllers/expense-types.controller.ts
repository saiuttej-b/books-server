import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ExpenseTypePostDto } from '../dtos/expense-type.dto';
import { ExpenseTypesMutationService } from '../services/expense-types-mutation.service';
import { ExpenseTypesService } from '../services/expense-types.service';

@Controller('expense-types')
export class ExpenseTypesController {
  constructor(
    private readonly expenseTypeMutationService: ExpenseTypesMutationService,
    private readonly expenseTypeService: ExpenseTypesService,
  ) {}

  @Post()
  createExpenseType(@Body() body: ExpenseTypePostDto) {
    return this.expenseTypeMutationService.createExpenseType(body);
  }

  @Put(':id')
  updateExpenseType(@Body() body: ExpenseTypePostDto, @Param('id') id: string) {
    return this.expenseTypeMutationService.updateExpenseType(body, id);
  }

  @Delete(':id')
  deleteExpenseType(@Param('id') id: string) {
    return this.expenseTypeMutationService.deleteExpenseType(id);
  }

  @Get()
  getExpenseTypes() {
    return this.expenseTypeService.getExpenseTypes();
  }
}
