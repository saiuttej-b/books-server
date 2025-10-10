import { AppRequestStoreService } from '@app/integrations';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientRepository } from '../../db/repositories/client.repository';
import { GetClientsDto } from '../dtos/clients.dto';

@Injectable()
export class ClientsService {
  constructor(
    private readonly clientRepo: ClientRepository,
    private readonly requestStore: AppRequestStoreService,
  ) {}

  getClients(query: GetClientsDto) {
    return this.clientRepo.find({
      organizationId: this.requestStore.getOrganizationId(),
      ...query,
    });
  }

  async getClientDetails(clientId: string) {
    const client = await this.clientRepo.findDetailsById({
      id: clientId,
      organizationId: this.requestStore.getOrganizationId(),
    });
    if (!client) {
      throw new NotFoundException('Client not found or is not part of your organization');
    }

    return { client };
  }
}
