import { DbService } from '@app/infra';
import { AppRequestStoreService } from '@app/integrations';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ExpenseTypeRepository } from '../../db/repositories/expense-type.repository';
import { ExpenseTypePostDto } from '../dtos/expense-type.dto';

/** Service for handling expense type mutations */
@Injectable()
export class ExpenseTypesMutationService {
  constructor(
    private readonly expenseTypeRepo: ExpenseTypeRepository,
    private readonly requestStore: AppRequestStoreService,
    private readonly dbService: DbService,
  ) {}

  /**
   * Method to create a new expense type.
   *
   * @param reqBody - The request body containing expense type details.
   */
  async createExpenseType(reqBody: ExpenseTypePostDto) {
    /** Validate the request body */
    await this.validateExpenseTypePostBody(reqBody, this.requestStore.getOrganizationId());

    /** Create expense type instance */
    const expenseType = this.expenseTypeRepo.instance({
      name: reqBody.name,
      organizationId: this.requestStore.getOrganizationId(),
      isActive: reqBody.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    /** Use transaction to create expense type */
    await this.dbService.transaction({
      execute: async () => {
        await this.expenseTypeRepo.create(expenseType);
      },
    });

    return {
      expenseTypeId: expenseType.id,
      name: expenseType.name,
      message: `Expense type "${expenseType.name}" created successfully.`,
    };
  }

  /**
   * Method to update an existing expense type.
   *
   * @param reqBody - The request body containing updated expense type details.
   * @param id - The ID of the expense type to be updated.
   */
  async updateExpenseType(reqBody: ExpenseTypePostDto, id: string) {
    /** Fetch the expense type and check if it exists */
    const expenseType = await this.expenseTypeRepo.findByIdAndOrganizationId({
      id,
      organizationId: this.requestStore.getOrganizationId(),
    });
    if (!expenseType) {
      throw new BadRequestException('Expense type not found to update.');
    }

    /** Check if expense type is system defined */
    if (expenseType.isSystemDefined) {
      throw new BadRequestException('Cannot update system defined expense type.');
    }

    /** Validate the request body */
    await this.validateExpenseTypePostBody(reqBody, id);

    expenseType.name = reqBody.name;
    expenseType.isActive = reqBody.isActive ?? expenseType.isActive;
    expenseType.updatedAt = new Date().toISOString();

    /** Use database transaction to update the expense type */
    await this.dbService.transaction({
      execute: async () => {
        await this.expenseTypeRepo.update(expenseType);
      },
    });

    return {
      id: expenseType.id,
      name: expenseType.name,
      message: `Expense type "${expenseType.name}" updated successfully.`,
    };
  }

  /**
   * Method to delete an expense type.
   *
   * @param id - The ID of the expense type to be deleted.
   */
  async deleteExpenseType(id: string) {
    /** Fetch the expense type and check if it exists */
    const expenseType = await this.expenseTypeRepo.findByIdAndOrganizationId({
      id,
      organizationId: this.requestStore.getOrganizationId(),
    });
    if (!expenseType) {
      throw new BadRequestException('Expense type not found to delete.');
    }

    /** Check if expense type is system defined */
    if (expenseType.isSystemDefined) {
      throw new BadRequestException('Cannot delete system defined expense type.');
    }

    /** Use database transaction to delete the expense type */
    await this.dbService.transaction({
      execute: async () => {
        await this.expenseTypeRepo.delete(id);
      },
    });

    return {
      id: expenseType.id,
      name: expenseType.name,
      message: `Expense type "${expenseType.name}" deleted successfully.`,
    };
  }

  /**
   * Method to validate the expense type post body.
   *
   * @param reqBody - The request body containing expense type details.
   * @param organizationId - The organization ID.
   * @param id - The ID of the expense type being created.
   */
  private async validateExpenseTypePostBody(reqBody: ExpenseTypePostDto, id: string) {
    /** Check for uniqueness of expense type name within organization */
    const nameExists = await this.expenseTypeRepo.existsByNameAndOrganizationId({
      name: reqBody.name,
      organizationId: this.requestStore.getOrganizationId(),
      neId: id,
    });
    if (nameExists) {
      throw new BadRequestException(
        `Expense type name "${reqBody.name}" already exists in this organization.`,
      );
    }
  }
}
