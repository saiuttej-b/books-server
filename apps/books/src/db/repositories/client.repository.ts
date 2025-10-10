import { Client, ClientContactPerson } from '@app/core';

export abstract class ClientRepository {
  abstract instance(data?: Partial<Client>): Client;

  abstract contactInstance(data?: Partial<ClientContactPerson>): ClientContactPerson;

  abstract create(client: Client): Promise<void>;

  abstract addContacts(contactPersons: ClientContactPerson[]): Promise<void>;

  abstract update(client: Client): Promise<void>;

  abstract updateContacts(contactPersons: ClientContactPerson[]): Promise<void>;

  abstract deleteContactsByIds(contactPersonIds: string[]): Promise<void>;

  abstract existsByName(props: {
    organizationId: string;
    name: string;
    neId?: string;
  }): Promise<boolean>;

  abstract existingContactIdsByContactIds(props: {
    clientContactPersonIds: string[];
    neClientId?: string;
  }): Promise<string[]>;

  abstract findById(props: { id: string; organizationId?: string }): Promise<Client | null>;

  abstract findContactsByClientId(clientId: string): Promise<ClientContactPerson[]>;

  abstract find(props: {
    search?: string | null;
    organizationId: string;
    limit?: number | null;
    skip?: number | null;
  }): Promise<{ count: number; clients: Client[] }>;

  abstract findDetailsById(props: { id: string; organizationId: string }): Promise<Client | null>;
}
