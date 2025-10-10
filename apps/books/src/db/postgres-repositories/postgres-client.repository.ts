import { Client, ClientContactPerson, generateId } from '@app/core';
import { DbService } from '@app/infra';
import { Injectable } from '@nestjs/common';
import { In, Not } from 'typeorm';
import { ClientRepository } from '../repositories/client.repository';

@Injectable()
export class PostgresClientRepository implements ClientRepository {
  constructor(private readonly dbService: DbService) {}

  instance(data?: Partial<Client>): Client {
    const record = this.dbService
      .getManager()
      .getRepository(Client)
      .create(data || {});
    if (!record.id) record.id = generateId();
    return record;
  }

  contactInstance(data?: Partial<ClientContactPerson>): ClientContactPerson {
    const record = this.dbService
      .getManager()
      .getRepository(ClientContactPerson)
      .create(data || {});
    if (!record.id) record.id = generateId();
    return record;
  }

  async create(client: Client): Promise<void> {
    await this.dbService.getWriteManager().getRepository(Client).insert(client);
  }

  async addContacts(contactPersons: ClientContactPerson[]): Promise<void> {
    if (!contactPersons.length) return;

    await this.dbService
      .getWriteManager()
      .createQueryBuilder()
      .insert()
      .into(ClientContactPerson)
      .values(contactPersons)
      .updateEntity(false)
      .execute();
  }

  async update(client: Client): Promise<void> {
    await this.dbService.getWriteManager().getRepository(Client).save(client, { reload: false });
  }

  async updateContacts(contactPersons: ClientContactPerson[]): Promise<void> {
    if (!contactPersons.length) return;

    await this.dbService.getWriteManager().getRepository(ClientContactPerson).save(contactPersons, {
      reload: false,
    });
  }

  async deleteContactsByIds(contactPersonIds: string[]): Promise<void> {
    if (!contactPersonIds.length) return;

    await this.dbService
      .getWriteManager()
      .getRepository(ClientContactPerson)
      .delete(contactPersonIds);
  }

  async existsByName(props: {
    organizationId: string;
    name: string;
    neId?: string;
  }): Promise<boolean> {
    const count = await this.dbService.getManager().count(Client, {
      where: {
        organizationId: props.organizationId,
        name: props.name,
        ...(props.neId ? { id: Not(props.neId) } : {}),
      },
    });
    return count > 0;
  }

  async existingContactIdsByContactIds(props: {
    clientContactPersonIds: string[];
    neClientId?: string;
  }): Promise<string[]> {
    if (!props.clientContactPersonIds.length) return [];

    const values = await this.dbService.getManager().find(ClientContactPerson, {
      where: {
        id: In(props.clientContactPersonIds),
        ...(props.neClientId ? { clientId: Not(props.neClientId) } : {}),
      },
      select: {
        id: true,
      },
    });
    return values.map((v) => v.id);
  }

  findById(props: { id: string; organizationId?: string }): Promise<Client | null> {
    return this.dbService.getManager().findOne(Client, {
      where: {
        id: props.id,
        ...(props.organizationId ? { organizationId: props.organizationId } : {}),
      },
    });
  }

  findContactsByClientId(clientId: string): Promise<ClientContactPerson[]> {
    return this.dbService.getManager().find(ClientContactPerson, {
      where: {
        clientId,
      },
    });
  }

  async find(props: {
    search?: string | null;
    organizationId: string;
    limit?: number | null;
    skip?: number | null;
  }): Promise<{ count: number; clients: Client[] }> {
    const builder = this.dbService
      .getManager()
      .getRepository(Client)
      .createQueryBuilder('client')
      .where('client.organizationId = :organizationId', { organizationId: props.organizationId });

    if (props.search) {
      builder.andWhere('client.name ILIKE :name', { name: `%${props.search}%` });
    }

    const countBuilder = builder.clone();

    if (props.limit) {
      builder.take(props.limit);
    }
    if (props.skip) {
      builder.skip(props.skip);
      if (!props.limit) {
        builder.take(Number.MAX_SAFE_INTEGER);
      }
    }

    const [clients, count] = await Promise.all([
      builder.orderBy('client.name', 'ASC').getMany(),
      countBuilder.getCount(),
    ]);

    return { count, clients };
  }

  findDetailsById(props: { id: string; organizationId: string }): Promise<Client | null> {
    return this.dbService.getManager().findOne(Client, {
      where: {
        id: props.id,
        organizationId: props.organizationId,
      },
      relations: {
        contactPersons: true,
      },
    });
  }
}
